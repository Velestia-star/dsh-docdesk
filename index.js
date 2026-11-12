/**
 * Host half of dsh-docdesk.
 *
 * Serves the read-only endpoints used by the client panel:
 *   GET  /api/dsh-docdesk/list?refresh=1
 *   GET  /api/dsh-docdesk/read?path=<absolute path>
 *   GET  /api/dsh-docdesk/file?path=<absolute path>[&download=1]   (bytes, Range)
 *   GET  /api/dsh-docdesk/site/<base64url(root.id)>/<relative path> (HTML siblings)
 *
 * The scan covers every registered workspace, the profile's default working
 * directory, and the working directories of live agents, so materials an agent
 * writes anywhere the user works show up in the 资料区 panel.
 *
 * Only formats a browser can render inline are listed and served: Markdown,
 * plain text and source code, HTML, images, PDF, audio, and video. Office
 * documents, archives, fonts, and unknown binaries stay out of the library —
 * the user's rule is "可以加进去的就加进去，无法兼容的就不用加".
 *
 * Every endpoint sits behind the same loopback / paired-device trust fence used
 * by the bundled management pages: a request must arrive on a loopback socket
 * with a loopback Host header and same-origin browser markers (or carry a live
 * paired-device cookie). Reads are additionally confined to the scanned roots,
 * hidden paths under a root are never served, and only whitelisted extensions
 * leave the Host.
 */

import { spawn } from 'node:child_process'
import { createReadStream, promises as fs, readFileSync } from 'node:fs'
import path from 'node:path'

const LIST_ROUTE = '/api/dsh-docdesk/list'
const READ_ROUTE = '/api/dsh-docdesk/read'
const RESOLVE_ROUTE = '/api/dsh-docdesk/resolve'
const MERMAID_ROUTE = '/api/dsh-docdesk/mermaid.js'
const FILE_ROUTE = '/api/dsh-docdesk/file'
const SITE_ROUTE = '/api/dsh-docdesk/site'
const REVEAL_ROUTE = '/api/dsh-docdesk/reveal'

const MAX_FILES = 3000
const MAX_ASSET_FILES = 1200
const MAX_DIRS_PER_ROOT = 4000
const MAX_DIRS_TOTAL = 16000
const MAX_DEPTH = 6
const MAX_READ_BYTES = 2 * 1024 * 1024
const CACHE_MS = 4000

/** Directories that never contain materials worth listing. */
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.hg',
  '.svn',
  '.pnpm',
  '.cache',
  '.next',
  '.nuxt',
  '.output',
  '.turbo',
  '.parcel-cache',
  '.venv',
  'venv',
  '__pycache__',
  'dist',
  'build',
  'out',
  'target',
  'vendor',
  'coverage',
  'release',
  'releases',
])

/* ------------------------------------------------------------------ kinds */

/**
 * Extensions (lowercase, no dot) per previewable kind: the single source of
 * truth for what the library lists, reads, and serves.
 */
const EXTENSIONS_BY_KIND = {
  markdown: ['md', 'markdown', 'mdx', 'mdown', 'mkd'],
  html: ['html', 'htm', 'xhtml'],
  image: ['png', 'jpg', 'jpeg', 'jfif', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif', 'apng'],
  pdf: ['pdf'],
  audio: ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'weba'],
  video: ['mp4', 'webm', 'ogv', 'mov', 'm4v'],
  text: [
    'txt', 'log', 'csv', 'tsv', 'json', 'jsonc', 'jsonl', 'ndjson', 'yaml', 'yml', 'toml', 'ini',
    'cfg', 'conf', 'properties', 'xml', 'sql', 'graphql', 'gql', 'rst', 'tex', 'srt', 'vtt', 'js',
    'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'css', 'scss', 'sass', 'less', 'vue', 'svelte', 'astro', 'py',
    'pyi', 'rb', 'php', 'java', 'kt', 'kts', 'c', 'h', 'cc', 'cpp', 'cxx', 'hpp', 'hh', 'cs', 'go',
    'rs', 'swift', 'm', 'mm', 'scala', 'clj', 'cljs', 'lua', 'pl', 'pm', 'r', 'jl', 'dart', 'ex',
    'exs', 'erl', 'hrl', 'fs', 'fsx', 'vb', 'pas', 'asm', 's', 'sh', 'bash', 'zsh', 'fish', 'ps1',
    'psm1', 'bat', 'cmd', 'ipynb',
  ],
}

const KIND_BY_EXT = new Map()
for (const [kind, extensions] of Object.entries(EXTENSIONS_BY_KIND)) {
  for (const extension of extensions) KIND_BY_EXT.set(extension, kind)
}

/** Extensionless basenames that read as plain text. */
const EXTENSIONLESS_TEXT = new Set([
  'readme', 'license', 'licence', 'notice', 'authors', 'contributing', 'changelog', 'makefile',
  'dockerfile', 'gemfile', 'procfile', 'rakefile', 'justfile',
])

/** Kinds that count against MAX_ASSET_FILES instead of displacing documents. */
const ASSET_KINDS = new Set(['image', 'pdf', 'audio', 'video'])

const MIME_BY_EXT = new Map([
  ['html', 'text/html; charset=utf-8'],
  ['htm', 'text/html; charset=utf-8'],
  ['xhtml', 'text/html; charset=utf-8'],
  ['svg', 'image/svg+xml'],
  ['json', 'application/json; charset=utf-8'],
  ['css', 'text/css; charset=utf-8'],
  ['js', 'text/javascript; charset=utf-8'],
  ['mjs', 'text/javascript; charset=utf-8'],
  ['cjs', 'text/javascript; charset=utf-8'],
  ['xml', 'application/xml; charset=utf-8'],
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['jfif', 'image/jpeg'],
  ['gif', 'image/gif'],
  ['webp', 'image/webp'],
  ['bmp', 'image/bmp'],
  ['ico', 'image/x-icon'],
  ['avif', 'image/avif'],
  ['apng', 'image/apng'],
  ['pdf', 'application/pdf'],
  ['mp3', 'audio/mpeg'],
  ['wav', 'audio/wav'],
  ['ogg', 'audio/ogg'],
  ['oga', 'audio/ogg'],
  ['m4a', 'audio/mp4'],
  ['aac', 'audio/aac'],
  ['flac', 'audio/flac'],
  ['opus', 'audio/opus'],
  ['weba', 'audio/webm'],
  ['mp4', 'video/mp4'],
  ['webm', 'video/webm'],
  ['ogv', 'video/ogg'],
  ['mov', 'video/quicktime'],
  ['m4v', 'video/x-m4v'],
])

/** Extension of a file name, lowercase and without the dot; '' when there is none. */
function extensionOf(name) {
  const base = path.basename(name)
  const dot = base.lastIndexOf('.')
  return dot > 0 && dot < base.length - 1 ? base.slice(dot + 1).toLowerCase() : ''
}

/** Previewable kind of a file name, or null when the browser cannot render it. */
function kindOfFile(name) {
  const base = path.basename(name)
  const dot = base.lastIndexOf('.')
  if (dot > 0 && dot < base.length - 1) return KIND_BY_EXT.get(base.slice(dot + 1).toLowerCase()) ?? null
  if (dot === 0) return null
  return EXTENSIONLESS_TEXT.has(base.toLowerCase()) ? 'text' : null
}

function isTextualKind(kind) {
  return kind === 'markdown' || kind === 'text'
}

function mimeOfFile(kind, extension) {
  const explicit = MIME_BY_EXT.get(extension)
  if (explicit !== undefined) return explicit
  return isTextualKind(kind) ? 'text/plain; charset=utf-8' : 'application/octet-stream'
}

/**
 * Header that keeps a served document in an opaque origin: it may run its own
 * scripts, but it cannot reach the Host's API, submit forms, or load plugins.
 */
const CSP_SANDBOX =
  "sandbox allow-scripts allow-popups allow-modals allow-downloads; default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'none'"

/* ------------------------------------------------------------------ trust */

function isIPv4Loopback(v4) {
  const parts = v4.split('.')
  return parts.length === 4 && parts[0] === '127' && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

function isLoopbackAddress(address) {
  if (address === undefined) return false
  const normalized = address.toLowerCase()
  if (normalized === '::1') return true
  if (normalized.startsWith('::ffff:')) return isIPv4Loopback(normalized.slice(7))
  return isIPv4Loopback(normalized)
}

function isLoopbackHostname(hostname) {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  return isIPv4Loopback(hostname)
}

function isProxiedRequest(request) {
  return request.headers['cf-connecting-ip'] !== undefined || request.headers['x-forwarded-for'] !== undefined
}

/** Loopback socket, no forwarding hop, loopback Host header, same-origin markers. */
function isLoopbackRequest(request) {
  if (!isLoopbackAddress(request.socket?.remoteAddress)) return false
  if (isProxiedRequest(request)) return false
  const host = request.headers.host
  if (typeof host !== 'string') return false
  let hostUrl
  try {
    hostUrl = new URL('http://' + host)
  } catch {
    return false
  }
  if (!isLoopbackHostname(hostUrl.hostname)) return false
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}

function lookupPairing(ctx) {
  try {
    if (typeof ctx.get === 'function') {
      const viaGet = ctx.get('remoteWebUiPairing', false)
      if (viaGet !== undefined) return viaGet ?? undefined
    }
  } catch {
    /* service not loaded in this composition */
  }
  try {
    return ctx.remoteWebUiPairing ?? undefined
  } catch {
    return undefined
  }
}

function isAllowed(ctx, request) {
  if (isLoopbackRequest(request)) return true
  try {
    return lookupPairing(ctx)?.isPairedDevice?.(request) === true
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ roots */

function canonicalKey(value) {
  const resolved = path.resolve(value)
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved
}

/** Every directory whose materials belong in the library. */
function collectRoots(ctx) {
  const roots = []
  const seen = new Set()

  const push = (value, title) => {
    if (typeof value !== 'string' || value.trim() === '') return
    let resolved
    try {
      resolved = path.resolve(value)
    } catch {
      return
    }
    const key = canonicalKey(resolved)
    if (seen.has(key)) return
    seen.add(key)
    roots.push({
      id: key,
      path: resolved,
      title: typeof title === 'string' && title.trim() !== '' ? title.trim() : path.basename(resolved) || resolved,
    })
  }

  let registry
  try {
    registry = ctx.get('workspaceRegistry', false)
  } catch {
    registry = undefined
  }
  if (registry && typeof registry.list === 'function') {
    try {
      for (const workspace of registry.list()) push(workspace.path, workspace.title)
    } catch {
      /* registry not ready yet */
    }
  }

  let workingDirectory
  try {
    workingDirectory = ctx.get('workingDirectory', false)
  } catch {
    workingDirectory = undefined
  }
  if (workingDirectory) {
    try {
      push(workingDirectory.defaultDirectory, '默认目录')
    } catch {
      /* absent in some compositions */
    }
    let agentService
    try {
      agentService = ctx.get('agents', false)
    } catch {
      agentService = undefined
    }
    if (workingDirectory.get && agentService && typeof agentService.list === 'function') {
      for (const agent of agentService.list()) {
        try {
          push(workingDirectory.get(agent.session), agent.session?.header?.title)
        } catch {
          /* a session may not have an effective directory yet */
        }
      }
    }
  }

  if (roots.length === 0) push(process.cwd(), '当前目录')
  return roots
}

/* ------------------------------------------------------------------- scan */

async function scanRoots(roots) {
  const files = []
  let visitedDirs = 0
  let truncated = false
  let partial = false
  let assetFiles = 0

  for (const root of roots) {
    if (files.length >= MAX_FILES || visitedDirs >= MAX_DIRS_TOTAL) {
      if (files.length >= MAX_FILES) truncated = true
      if (visitedDirs >= MAX_DIRS_TOTAL) partial = true
      break
    }
    const queue = [{ dir: root.path, depth: 0 }]
    let cursor = 0
    let rootDirs = 0
    while (cursor < queue.length) {
      if (files.length >= MAX_FILES) {
        truncated = true
        break
      }
      if (rootDirs >= MAX_DIRS_PER_ROOT || visitedDirs >= MAX_DIRS_TOTAL) {
        partial = true
        break
      }
      const current = queue[cursor++]
      visitedDirs += 1
      rootDirs += 1
      let entries
      try {
        entries = await fs.readdir(current.dir, { withFileTypes: true })
      } catch {
        continue
      }
      for (const entry of entries) {
        if (entry.isSymbolicLink()) continue
        if (entry.isDirectory()) {
          if (current.depth >= MAX_DEPTH) continue
          const name = entry.name.toLowerCase()
          if (SKIP_DIRS.has(name)) continue
          if (name.startsWith('.')) continue
          queue.push({ dir: path.join(current.dir, entry.name), depth: current.depth + 1 })
          continue
        }
        if (!entry.isFile()) continue
        const kind = kindOfFile(entry.name)
        if (kind === null) continue
        /* Assets never crowd documents out: past the cap the scan keeps walking
         * the tree so Markdown, text, and HTML further down still make it in. */
        const isAsset = ASSET_KINDS.has(kind)
        if (isAsset && assetFiles >= MAX_ASSET_FILES) continue
        const absolute = path.join(current.dir, entry.name)
        let stat
        try {
          stat = await fs.stat(absolute)
        } catch {
          continue
        }
        if (!stat.isFile()) continue
        if (isAsset) assetFiles += 1
        files.push({
          path: absolute,
          name: entry.name,
          ext: extensionOf(entry.name),
          kind,
          rel: path.relative(root.path, absolute).split(path.sep).join('/'),
          rootId: root.id,
          rootTitle: root.title,
          rootPath: root.path,
          size: stat.size,
          mtime: stat.mtimeMs,
        })
        if (files.length >= MAX_FILES) {
          truncated = true
          break
        }
      }
    }
  }

  files.sort((a, b) => b.mtime - a.mtime || a.path.localeCompare(b.path))
  return { files, truncated, partial, visitedDirs }
}

/* ------------------------------------------------------------------ cache */

let cache = { at: 0, signature: '', files: [], truncated: false, partial: false, visitedDirs: 0 }

async function listFiles(ctx, force) {
  const roots = collectRoots(ctx)
  const signature = roots.map((root) => root.id).join('\u0000')
  const now = Date.now()
  let result
  if (!force && cache.signature === signature && now - cache.at < CACHE_MS) {
    result = { files: cache.files, truncated: cache.truncated, partial: cache.partial, visitedDirs: cache.visitedDirs }
  } else {
    result = await scanRoots(roots)
    cache = { at: now, signature, files: result.files, truncated: result.truncated, partial: result.partial, visitedDirs: result.visitedDirs }
  }
  return { roots, ...result, scannedAt: Date.now() }
}

/* --------------------------------------------------------------- helpers */

function sendJson(response, status, body) {
  const payload = JSON.stringify(body)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, max-age=0',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
  })
  response.end(payload)
}

let mermaidAsset = null

function handleMermaid(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  if (request.method && request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { error: 'method-not-allowed' })
    return
  }
  try {
    if (!mermaidAsset) mermaidAsset = readFileSync(new URL('./vendor/mermaid.min.js', import.meta.url))
    response.writeHead(200, {
      'content-type': 'text/javascript; charset=utf-8',
      'content-length': mermaidAsset.length,
      'cache-control': 'public, max-age=31536000, immutable',
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
    })
    if (request.method === 'HEAD') {
      response.end()
    } else {
      response.end(mermaidAsset)
    }
  } catch {
    sendJson(response, 500, { error: 'mermaid-asset-unavailable' })
  }
}

function requestUrl(request) {
  try {
    return new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
  } catch {
    return null
  }
}

function isInside(root, target) {
  const relative = path.relative(root, target)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

/**
 * Confine a path to the scanned roots: the file and the owning root both go
 * through realpath, so no symlink can point the answer outside a root.
 */
async function locateInsideRoots(roots, target) {
  let realTarget
  try {
    realTarget = await fs.realpath(target)
  } catch {
    return undefined
  }
  for (const root of roots) {
    let realRoot
    try {
      realRoot = await fs.realpath(root.path)
    } catch {
      continue
    }
    if (isInside(realRoot, realTarget)) return { realTarget, realRoot, root }
  }
  return undefined
}

/** RFC 5987 value for content-disposition's filename*. */
function encodeFilename(name) {
  return encodeURIComponent(name).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
}

function fileUrl(target) {
  return `${FILE_ROUTE}?path=${encodeURIComponent(target)}`
}

function rootIdToken(root) {
  return Buffer.from(root.id, 'utf8').toString('base64url')
}

/** Sibling-asset URL an HTML report resolves its relative links against. */
function siteUrl(root, target) {
  const segments = path
    .relative(root.path, target)
    .split(path.sep)
    .filter((segment) => segment !== '')
    .map((segment) => encodeURIComponent(segment))
  return `${SITE_ROUTE}/${rootIdToken(root)}/${segments.join('/')}`
}

/**
 * One byte range from a Range header. Undefined means "ignore the header and
 * send everything" (absent, malformed, or multipart, which this Host does not
 * assemble); `{ unsatisfiable: true }` is a well-formed range no byte satisfies.
 */
function parseRange(header, size) {
  const match = /^bytes=(.*)$/i.exec(header.trim())
  if (!match) return undefined
  const spec = match[1].trim()
  if (spec === '' || spec.includes(',')) return undefined
  const parts = /^(\d{0,15})-(\d{0,15})$/.exec(spec)
  if (!parts) return undefined
  const [, rawStart, rawEnd] = parts
  if (rawStart === '' && rawEnd === '') return undefined
  if (rawStart === '') {
    const suffix = Number(rawEnd)
    if (suffix <= 0 || size === 0) return { unsatisfiable: true }
    return { start: Math.max(size - suffix, 0), end: size - 1 }
  }
  const start = Number(rawStart)
  if (start >= size) return { unsatisfiable: true }
  if (rawEnd === '') return { start, end: size - 1 }
  const end = Number(rawEnd)
  if (end < start) return undefined
  return { start, end: Math.min(end, size - 1) }
}

/** Stream one whitelisted file with Range support, CSP for executable types. */
function serveFile(request, response, { realTarget, stat, kind, extension, name, download }) {
  const headers = {
    'content-type': mimeOfFile(kind, extension),
    'cache-control': 'no-cache',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'content-disposition': `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeFilename(name)}`,
    'accept-ranges': 'bytes',
  }
  if (kind === 'html' || extension === 'svg') headers['content-security-policy'] = CSP_SANDBOX
  const range = typeof request.headers.range === 'string' ? parseRange(request.headers.range, stat.size) : undefined
  if (range !== undefined && range.unsatisfiable === true) {
    response.writeHead(416, {
      'content-range': `bytes */${stat.size}`,
      'accept-ranges': 'bytes',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    })
    response.end()
    return
  }
  let start = 0
  let end = stat.size - 1
  if (range !== undefined) {
    start = range.start
    end = range.end
    headers['content-range'] = `bytes ${start}-${end}/${stat.size}`
  }
  headers['content-length'] = String(end - start + 1)
  response.writeHead(range === undefined ? 200 : 206, headers)
  if (request.method === 'HEAD' || end < start) {
    response.end()
    return
  }
  const stream = createReadStream(realTarget, { start, end })
  response.on('close', () => stream.destroy())
  stream.on('error', () => response.destroy())
  stream.pipe(response)
}

/* --------------------------------------------------------------- handlers */

async function handleList(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' })
    response.end()
    return
  }
  const url = requestUrl(request)
  const force = url?.searchParams.get('refresh') === '1'
  const result = await listFiles(ctx, force)
  sendJson(response, 200, {
    roots: result.roots.map(({ id, title, path: rootPath }) => ({ id, title, path: rootPath })),
    files: result.files,
    truncated: result.truncated,
    partial: result.partial,
    scannedAt: result.scannedAt,
  })
}

async function handleRead(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' })
    response.end()
    return
  }
  const url = requestUrl(request)
  const raw = url?.searchParams.get('path')
  if (!raw) {
    sendJson(response, 400, { error: 'missing-path' })
    return
  }
  let target
  try {
    target = path.resolve(raw)
  } catch {
    sendJson(response, 400, { error: 'invalid-path' })
    return
  }
  const kind = kindOfFile(target)
  if (kind === null) {
    sendJson(response, 400, { error: 'unsupported-type' })
    return
  }
  const roots = collectRoots(ctx)
  const located = await locateInsideRoots(roots, target)
  if (!located) {
    sendJson(response, 403, { error: 'outside-workspace' })
    return
  }
  let stat
  try {
    stat = await fs.stat(located.realTarget)
  } catch {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  if (!stat.isFile()) {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  const name = path.basename(target)
  const extension = extensionOf(target)
  const body = {
    path: target,
    name,
    kind,
    ext: extension,
    mime: mimeOfFile(kind, extension),
    size: stat.size,
    mtime: stat.mtimeMs,
    truncated: false,
  }
  if (kind === 'html') {
    /* An HTML report is rendered in a sandboxed iframe from the /site route so
     * its relative assets resolve next to it; its text is never read here. */
    body.url = siteUrl(located.root, target)
    sendJson(response, 200, body)
    return
  }
  if (!isTextualKind(kind)) {
    body.url = fileUrl(target)
    sendJson(response, 200, body)
    return
  }
  let content = ''
  let truncated = false
  try {
    if (stat.size > MAX_READ_BYTES) {
      const handle = await fs.open(located.realTarget, 'r')
      try {
        const buffer = Buffer.alloc(MAX_READ_BYTES)
        const { bytesRead } = await handle.read(buffer, 0, MAX_READ_BYTES, 0)
        content = buffer.subarray(0, bytesRead).toString('utf8')
      } finally {
        await handle.close()
      }
      truncated = true
    } else {
      content = await fs.readFile(located.realTarget, 'utf8')
    }
  } catch {
    sendJson(response, 500, { error: 'read-failed' })
    return
  }
  body.truncated = truncated
  body.content = content
  body.url = fileUrl(target)
  sendJson(response, 200, body)
}

/** Byte server for one whitelisted file inside a scanned root. */
async function handleFile(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' })
    response.end()
    return
  }
  const url = requestUrl(request)
  const raw = url?.searchParams.get('path')
  if (!raw) {
    sendJson(response, 400, { error: 'missing-path' })
    return
  }
  let target
  try {
    target = path.resolve(raw)
  } catch {
    sendJson(response, 400, { error: 'invalid-path' })
    return
  }
  let realTarget
  try {
    realTarget = await fs.realpath(target)
  } catch {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  let stat
  try {
    stat = await fs.stat(realTarget)
  } catch {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  if (!stat.isFile()) {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  let root
  for (const candidate of collectRoots(ctx)) {
    let realRoot
    try {
      realRoot = await fs.realpath(candidate.path)
    } catch {
      continue
    }
    if (!isInside(realRoot, realTarget)) continue
    const segments = path.relative(realRoot, realTarget).split(path.sep)
    if (segments.some((segment) => segment.startsWith('.'))) {
      sendJson(response, 403, { error: 'hidden-path' })
      return
    }
    root = candidate
    break
  }
  if (!root) {
    sendJson(response, 403, { error: 'outside-workspace' })
    return
  }
  const kind = kindOfFile(realTarget)
  if (kind === null) {
    sendJson(response, 415, { error: 'unsupported-type' })
    return
  }
  serveFile(request, response, {
    realTarget,
    stat,
    kind,
    extension: extensionOf(realTarget),
    name: path.basename(realTarget),
    download: url?.searchParams.get('download') === '1',
  })
}

/**
 * Serve one whitelisted sibling of a listed file, addressed by root id and
 * relative segments, so an HTML report's `assets/style.css` and `assets/pic.png`
 * resolve the way they do on disk. Every segment is decoded and validated here;
 * the URL parser alone is never trusted with a path.
 */
async function handleSite(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' })
    response.end()
    return
  }
  const url = requestUrl(request)
  const pathname = url?.pathname ?? ''
  const prefix = SITE_ROUTE + '/'
  if (!pathname.startsWith(prefix)) {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  const rawSegments = pathname.slice(prefix.length).split('/')
  const rawRoot = rawSegments.shift() ?? ''
  if (rawRoot === '') {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  const rootId = Buffer.from(rawRoot, 'base64url').toString('utf8')
  if (rootId === '') {
    sendJson(response, 404, { error: 'unknown-root' })
    return
  }
  const root = collectRoots(ctx).find((candidate) => candidate.id === rootId)
  if (!root) {
    sendJson(response, 404, { error: 'unknown-root' })
    return
  }
  if (rawSegments.length === 0) {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  const segments = []
  for (const rawSegment of rawSegments) {
    let segment
    try {
      segment = decodeURIComponent(rawSegment)
    } catch {
      sendJson(response, 400, { error: 'invalid-path' })
      return
    }
    if (
      segment === '' ||
      segment === '.' ||
      segment === '..' ||
      segment.includes('/') ||
      segment.includes('\\') ||
      segment.includes('\u0000') ||
      segment.startsWith('.')
    ) {
      sendJson(response, 403, { error: 'forbidden-path' })
      return
    }
    segments.push(segment)
  }
  const resolvedRoot = path.resolve(root.path)
  const target = path.resolve(resolvedRoot, ...segments)
  if (!isInside(resolvedRoot, target)) {
    sendJson(response, 403, { error: 'outside-workspace' })
    return
  }
  let realTarget
  let realRoot
  try {
    realTarget = await fs.realpath(target)
    realRoot = await fs.realpath(resolvedRoot)
  } catch {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  if (!isInside(realRoot, realTarget)) {
    sendJson(response, 403, { error: 'outside-workspace' })
    return
  }
  let stat
  try {
    stat = await fs.stat(realTarget)
  } catch {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  if (!stat.isFile()) {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  const kind = kindOfFile(realTarget)
  if (kind === null) {
    sendJson(response, 404, { error: 'unsupported-type' })
    return
  }
  serveFile(request, response, {
    realTarget,
    stat,
    kind,
    extension: extensionOf(realTarget),
    name: path.basename(realTarget),
    download: false,
  })
}

/* --------------------------------------------------------------- reveal */

/**
 * Show one file in the desktop file manager. The Host's own openWorkspacePath
 * is the primary route (it applies DSH's Host-path mapping); when that service
 * is missing or rejects the path, fall back to the platform's native reveal
 * command, still without a shell.
 */
function revealInFileManager(target) {
  if (process.env.DSH_DOCDESK_REVEAL_DRY === '1') return true
  try {
    let child
    if (process.platform === 'win32') {
      child = spawn('explorer.exe', [`/select,${target}`], { detached: true, stdio: 'ignore', windowsHide: true })
    } else if (process.platform === 'darwin') {
      child = spawn('open', ['-R', target], { detached: true, stdio: 'ignore' })
    } else {
      child = spawn('xdg-open', [path.dirname(target)], { detached: true, stdio: 'ignore' })
    }
    child.on('error', () => {})
    child.unref()
    return true
  } catch {
    return false
  }
}

async function handleReveal(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  if (request.method && request.method !== 'GET' && request.method !== 'POST') {
    sendJson(response, 405, { error: 'method-not-allowed' })
    return
  }
  const url = requestUrl(request)
  const raw = url?.searchParams.get('path')
  if (!raw) {
    sendJson(response, 400, { error: 'missing-path' })
    return
  }
  let target
  try {
    target = path.resolve(raw)
  } catch {
    sendJson(response, 400, { error: 'invalid-path' })
    return
  }
  let stat
  try {
    stat = await fs.stat(target)
  } catch {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  if (!stat.isFile()) {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  let sessionController
  try {
    sessionController = ctx.get('sessionController', false)
  } catch {
    sessionController = undefined
  }
  if (sessionController && typeof sessionController.openWorkspacePath === 'function') {
    try {
      await sessionController.openWorkspacePath({ path: target, action: 'reveal' }, AbortSignal.timeout(8000))
      sendJson(response, 200, { ok: true, path: target, via: 'sessionController' })
      return
    } catch {
      /* fall through to the native reveal */
    }
  }
  if (!revealInFileManager(target)) {
    sendJson(response, 501, { ok: false, error: 'reveal-unavailable' })
    return
  }
  sendJson(response, 200, { ok: true, path: target, via: 'native' })
}

/* --------------------------------------------------------------- presented */

function coordinate(value) {
  return value !== null && /^\d+$/u.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : undefined
}

function isPresentedData(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const { turn, callId, files } = value
  return Number.isSafeInteger(turn) && turn >= 1 && typeof callId === 'string' && Array.isArray(files)
}

function isPresentedFile(value) {
  return typeof value === 'object' && value !== null && typeof value.path === 'string' && value.path.trim() !== ''
}

/**
 * Resolve a presented file's coordinate (sessionId, seq, index) to an absolute
 * path. The file action card receives only this coordinate, never the path, so
 * the browser asks the Host to read the durable event and map the path through
 * the same workspace filesystem used by the rest of the Host.
 */
async function handleResolve(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  const url = requestUrl(request)
  const sessionId = url?.searchParams.get('sessionId')
  const seq = coordinate(url?.searchParams.get('seq') ?? null)
  const index = coordinate(url?.searchParams.get('index') ?? null)
  if (!sessionId || seq === undefined || index === undefined) {
    sendJson(response, 400, { error: 'invalid-coordinates' })
    return
  }
  let sessionQuery
  try {
    sessionQuery = ctx.get('sessionQuery', false)
  } catch {
    sessionQuery = undefined
  }
  if (!sessionQuery || typeof sessionQuery.readEvent !== 'function') {
    sendJson(response, 503, { error: 'session-query-unavailable' })
    return
  }
  const signal = AbortSignal.timeout(8000)
  let window
  try {
    window = await sessionQuery.readEvent({ sessionId, seq, before: 0, after: 0 }, signal)
  } catch {
    sendJson(response, 404, { error: 'event-not-found' })
    return
  }
  const target = window?.target
  const file = target?.type === 'deliverables/presented' && isPresentedData(target.data) ? target.data.files[index] : undefined
  if (!isPresentedFile(file)) {
    sendJson(response, 404, { error: 'presented-file-not-found' })
    return
  }
  let workingDirectory
  try {
    workingDirectory = ctx.get('workingDirectory', false)
  } catch {
    workingDirectory = undefined
  }
  const root = window?.session?.cwd || workingDirectory?.defaultDirectory
  if (!root) {
    sendJson(response, 503, { error: 'workspace-unavailable' })
    return
  }
  let absolutePath
  try {
    let workspaceFiles
    try {
      workspaceFiles = ctx.get('workspaceFiles', false)
    } catch {
      workspaceFiles = undefined
    }
    if (workspaceFiles && typeof workspaceFiles.stat === 'function') {
      const stat = await workspaceFiles.stat({ sessionId, workspaceRoot: root }, file.path, signal)
      absolutePath = stat.absolutePath
    } else {
      absolutePath = path.isAbsolute(file.path) ? file.path : path.resolve(root, file.path)
    }
  } catch {
    sendJson(response, 404, { error: 'file-not-found' })
    return
  }
  sendJson(response, 200, { path: absolutePath, name: path.basename(absolutePath) })
}

/* ------------------------------------------------------------------ apply */

export const name = 'dsh-docdesk'
export const inject = ['webServer', 'workspaceRegistry', 'workingDirectory', 'agents', 'sessionQuery', 'workspaceFiles']

export function apply(ctx) {
  let webServer
  try {
    webServer = ctx.get('webServer', false)
  } catch {
    webServer = undefined
  }
  if (!webServer || typeof webServer.register !== 'function') {
    ctx.logger?.warn?.('dsh-docdesk: webServer is unavailable; the 资料区 panel will not load')
    return
  }

  ctx.effect(() => {
    const disposers = [
      webServer.register({
        kind: 'exact',
        path: LIST_ROUTE,
        handler: (request, response) => handleList(ctx, request, response),
      }),
      webServer.register({
        kind: 'exact',
        path: READ_ROUTE,
        handler: (request, response) => handleRead(ctx, request, response),
      }),
      webServer.register({
        kind: 'exact',
        path: FILE_ROUTE,
        handler: (request, response) => handleFile(ctx, request, response),
      }),
      webServer.register({
        kind: 'prefix',
        path: SITE_ROUTE,
        handler: (request, response) => handleSite(ctx, request, response),
      }),
      webServer.register({
        kind: 'exact',
        path: REVEAL_ROUTE,
        handler: (request, response) => handleReveal(ctx, request, response),
      }),
      webServer.register({
        kind: 'exact',
        path: RESOLVE_ROUTE,
        handler: (request, response) => handleResolve(ctx, request, response),
      }),
      webServer.register({
        kind: 'exact',
        path: MERMAID_ROUTE,
        handler: (request, response) => handleMermaid(ctx, request, response),
      }),
    ]
    return () => {
      for (const dispose of disposers.splice(0)) dispose()
    }
  })
}
