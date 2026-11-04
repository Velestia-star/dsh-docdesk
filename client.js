window.__ModuleLoader__.load({
  id: 'dsh-docdesk',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const PANEL_ID = 'materials'
    const NS = 'dsh-docdesk'
    const API_LIST = '/api/dsh-docdesk/list'
    const API_READ = '/api/dsh-docdesk/read'
    const API_RESOLVE = '/api/dsh-docdesk/resolve'
    const MERMAID_URL = '/api/dsh-docdesk/mermaid.js'
    const STORAGE_KEY = 'dsh-docdesk.library.v2'
    const BOOKMARK_KEY = 'dsh-docdesk.bookmarks.v1'
    const ICON_W = 88
    const ICON_H = 104
    const ICON_CENTER_Y = 44
    const CELL_W = 96
    const CELL_H = 104
    const PAD = 10

    /* ------------------------------------------------------------- locale */

    const ZH = {
      'panel.title': '资料区',
      'tab.home': '资料区',
      'action.add': '添加文件',
      'action.addShort': '添加',
      'action.newFolder': '新建文件夹',
      'action.open': '打开',
      'action.rename': '重命名',
      'action.copyPath': '复制路径',
      'action.remove': '从资料区移除',
      'action.deleteFolder': '删除文件夹',
      'action.moveTo': '移动到文件夹',
      'action.back': '返回上一级',
      'action.close': '关闭',
      'action.cancel': '取消',
      'action.retry': '重试',
      'action.selectAll': '全选',
      'action.clearSelection': '清空',
      'action.addSelected': '加入所选',
      'action.refresh': '刷新',
      'action.refreshContent': '重新读取',
      'empty.title': '资料区还是空的',
      'empty.hint': '点右上角「添加文件」从工作区选择 Markdown 文档；以后生成的文件也可以在文件卡片上右键，选择「放入资料区」。',
      'empty.folderTitle': '这个文件夹还是空的',
      'empty.folderHint': '把文档拖到文件夹图标上，或右键文件选择「移动到文件夹」。',
      'folder.defaultName': '新建文件夹',
      'folder.root': '资料区',
      'folder.count': '{count} 项',
      'picker.title': '添加文件',
      'picker.subtitle': '从工作区选择要放进资料区的 Markdown',
      'picker.search': '搜索文件',
      'picker.empty': '没有可添加的 Markdown 文件',
      'picker.loading': '正在扫描工作区…',
      'picker.failed': '扫描失败：{reason}',
      'picker.added': '已加入',
      'picker.selected': '已选 {count} 个',
      'picker.roots': '{count} 个目录',
      'picker.partial': '部分目录未扫描完',
      'tab.close': '关闭标签页',
      'doc.loading': '正在读取…',
      'doc.failed': '读取失败：{reason}',
      'doc.empty': '这个文件是空的',
      'doc.truncated': '文件较大，仅显示前 2 MB',
      'immersive.enter': '沉浸阅读 (F)',
      'immersive.exit': '退出沉浸阅读 (Esc)',
      'immersive.exitLabel': '退出沉浸',
      'immersive.short': '沉浸',
      'bookmarks.title': '书签',
      'bookmarks.open': '书签（B）',
      'bookmarks.lastRead': '上次阅读',
      'bookmarks.resume': '继续阅读',
      'bookmarks.clear': '清除位置',
      'bookmarks.addHere': '在当前位置添加书签',
      'bookmarks.added': '已添加书签',
      'bookmarks.empty': '还没有书签。按 B 或点上方按钮添加。',
      'bookmarks.noLast': '还没有阅读记录',
      'bookmarks.noLabel': '当前阅读位置',
      'bookmarks.positionLabel': '阅读位置 {percent}%',
      'bookmarks.lastReadAt': '{percent}% · {time}',
      'bookmarks.count': '{count} 个书签',
      'bookmarks.edit': '编辑',
      'bookmarks.delete': '删除',
      'bookmarks.deleted': '已删除书签',
      'bookmarks.cleared': '已清除阅读位置',
      'bookmarks.updated': '书签已更新',
      'bookmarks.label': '书签标题',
      'bookmarks.note': '备注（可选）',
      'bookmarks.save': '保存',
      'bookmarks.cancel': '取消',
      'bookmarks.dismiss': '隐藏上次阅读提示',
      'chart.invalid': '图表数据无法解析，已显示原始代码。',
      'chart.source': '查看数据',
      'chart.empty': '图表没有可显示的数据',
      'chart.aria': '图表',
      'chart.other': '其他',
      'mermaid.loading': '正在渲染 Mermaid 图…',
      'mermaid.error': 'Mermaid 图渲染失败，已显示原始代码。',
      'mermaid.source': '查看 Mermaid 源码',
      'mermaid.scrollHint': '时间轴较长，可横向滚动查看完整甘特图',
      'selection.count': '已选 {count} 项',
      'action.removeSelected': '从资料区移除 {count} 项',
      'action.deselect': '取消选择',
      'toast.noRoom': '附近没有足够的连续空位',
      'confirm.removeTitle': '从资料区移除？',
      'confirm.removeMany': '选中的 {count} 项会从资料区移除，磁盘上的文件不会被删除；文件夹里的文档会移回上一级。',
      'confirm.remove': '移除',
      'status.count': '{count} 个文档',
      'toast.added': '已加入 {count} 个文档',
      'toast.already': '这些文档已经在资料区了',
      'toast.removed': '已从资料区移除',
      'toast.copied': '路径已复制',
      'toast.copyFailed': '复制失败，请手动选择路径',
      'toast.folderCreated': '已新建文件夹',
      'toast.folderDeleted': '已删除文件夹',
      'toast.moved': '已移动',
      'toast.movedMany': '已移动 {count} 项',
      'toast.noMove': '没有可移动的项',
      'context.addToLibrary': '放入资料区',
      'context.resolving': '正在加入…',
      'context.added': '已在资料区',
      'context.failed': '加入失败',
      'context.notMarkdown': '仅支持 Markdown 文件',
      'menu.moveHint': '当前没有其他文件夹',
      'menu.root': '资料区（根目录）',
      'menu.separator': '移动到',
      'menu.moveSelected': '把 {count} 项放入文件夹',
      'confirm.deleteTitle': '删除文件夹？',
      'confirm.deleteWithFiles': '文件夹里的 {count} 个文档会移回上一级，磁盘上的文件不会被删除。',
      'confirm.deleteEmpty': '这个文件夹是空的，删除后无法恢复。',
      'confirm.delete': '删除',
      'confirm.cancel': '取消',
      'error.load': '扫描失败：{reason}',
      'error.read': '读取失败：{reason}',
      'error.forbidden': '无法访问（仅本机可用）',
      'error.outside': '文件不在可访问的目录内',
      'error.notFound': '文件不存在',
      'error.notMarkdown': '不是 Markdown 文件',
      'sidebar.toggle': '隐藏 / 显示侧边栏',
    }

    const EN = {
      'panel.title': 'Materials',
      'tab.home': 'Materials',
      'action.add': 'Add files',
      'action.addShort': 'Add',
      'action.newFolder': 'New folder',
      'action.open': 'Open',
      'action.rename': 'Rename',
      'action.copyPath': 'Copy path',
      'action.remove': 'Remove from library',
      'action.deleteFolder': 'Delete folder',
      'action.moveTo': 'Move to folder',
      'action.back': 'Back',
      'action.close': 'Close',
      'action.cancel': 'Cancel',
      'action.retry': 'Retry',
      'action.selectAll': 'Select all',
      'action.clearSelection': 'Clear',
      'action.addSelected': 'Add selected',
      'action.refresh': 'Refresh',
      'action.refreshContent': 'Reload',
      'empty.title': 'Your library is empty',
      'empty.hint': 'Use “Add files” in the top-right to pick Markdown documents from your workspaces. Generated files can also be right-clicked on their file card and added with “Add to library”.',
      'empty.folderTitle': 'This folder is empty',
      'empty.folderHint': 'Drag a document onto a folder icon, or right-click it and choose “Move to folder”.',
      'folder.defaultName': 'New folder',
      'folder.root': 'Materials',
      'folder.count': '{count} items',
      'picker.title': 'Add files',
      'picker.subtitle': 'Pick Markdown documents from your workspaces',
      'picker.search': 'Search files',
      'picker.empty': 'No Markdown files to add',
      'picker.loading': 'Scanning workspaces…',
      'picker.failed': 'Scan failed: {reason}',
      'picker.added': 'Added',
      'picker.selected': '{count} selected',
      'picker.roots': '{count} directories',
      'picker.partial': 'Some directories were not scanned',
      'tab.close': 'Close tab',
      'doc.loading': 'Reading…',
      'doc.failed': 'Read failed: {reason}',
      'doc.empty': 'This file is empty',
      'doc.truncated': 'Large file: showing the first 2 MB',
      'immersive.enter': 'Immersive reading (F)',
      'immersive.exit': 'Exit immersive reading (Esc)',
      'immersive.exitLabel': 'Exit immersive',
      'immersive.short': 'Immersive',
      'bookmarks.title': 'Bookmarks',
      'bookmarks.open': 'Bookmarks (B)',
      'bookmarks.lastRead': 'Last read',
      'bookmarks.resume': 'Resume reading',
      'bookmarks.clear': 'Clear position',
      'bookmarks.addHere': 'Add bookmark here',
      'bookmarks.added': 'Bookmark added',
      'bookmarks.empty': 'No bookmarks yet. Press B or use the button above.',
      'bookmarks.noLast': 'No reading position yet',
      'bookmarks.noLabel': 'Current reading position',
      'bookmarks.positionLabel': 'Reading position {percent}%',
      'bookmarks.lastReadAt': '{percent}% · {time}',
      'bookmarks.count': '{count} bookmarks',
      'bookmarks.edit': 'Edit',
      'bookmarks.delete': 'Delete',
      'bookmarks.deleted': 'Bookmark removed',
      'bookmarks.cleared': 'Reading position cleared',
      'bookmarks.updated': 'Bookmark updated',
      'bookmarks.label': 'Bookmark title',
      'bookmarks.note': 'Note (optional)',
      'bookmarks.save': 'Save',
      'bookmarks.cancel': 'Cancel',
      'bookmarks.dismiss': 'Hide last-read prompt',
      'chart.invalid': 'Chart data could not be parsed; the raw code is shown below.',
      'chart.source': 'View data',
      'chart.empty': 'The chart has no data to show',
      'chart.aria': 'Chart',
      'chart.other': 'Other',
      'mermaid.loading': 'Rendering Mermaid diagram…',
      'mermaid.error': 'The Mermaid diagram could not be rendered; the raw code is shown below.',
      'mermaid.source': 'View Mermaid source',
      'mermaid.scrollHint': 'The timeline is wide; scroll horizontally to see the full Gantt chart',
      'selection.count': '{count} selected',
      'action.removeSelected': 'Remove {count} from library',
      'action.deselect': 'Deselect',
      'toast.noRoom': 'There is no free block of slots nearby',
      'confirm.removeTitle': 'Remove from library?',
      'confirm.removeMany': 'The selected {count} item(s) will be removed from the library. Files on disk are not deleted; documents inside removed folders return to the parent.',
      'confirm.remove': 'Remove',
      'status.count': '{count} documents',
      'toast.added': '{count} documents added',
      'toast.already': 'Those documents are already in the library',
      'toast.removed': 'Removed from the library',
      'toast.copied': 'Path copied',
      'toast.copyFailed': 'Copy failed; select the path manually',
      'toast.folderCreated': 'Folder created',
      'toast.folderDeleted': 'Folder deleted',
      'toast.moved': 'Moved',
      'toast.movedMany': 'Moved {count} items',
      'toast.noMove': 'Nothing could be moved',
      'context.addToLibrary': 'Add to library',
      'context.resolving': 'Adding…',
      'context.added': 'In the library',
      'context.failed': 'Could not add',
      'context.notMarkdown': 'Only Markdown files are supported',
      'menu.moveHint': 'No other folders yet',
      'menu.root': 'Materials (root)',
      'menu.separator': 'Move to',
      'menu.moveSelected': 'Put {count} items into',
      'confirm.deleteTitle': 'Delete folder?',
      'confirm.deleteWithFiles': '{count} document(s) move back to the parent folder. Files on disk are not deleted.',
      'confirm.deleteEmpty': 'This folder is empty. Deleting it cannot be undone.',
      'confirm.delete': 'Delete',
      'confirm.cancel': 'Cancel',
      'error.load': 'Scan failed: {reason}',
      'error.read': 'Read failed: {reason}',
      'error.forbidden': 'Access denied (loopback only)',
      'error.outside': 'The file is outside the readable folders',
      'error.notFound': 'File not found',
      'error.notMarkdown': 'Not a Markdown file',
      'sidebar.toggle': 'Hide / show sidebar',
    }

    let translate
    function detectZh() {
      try {
        return (document.documentElement.lang || navigator.language || '').toLowerCase().startsWith('zh')
      } catch {
        return false
      }
    }
    function t(key, values) {
      if (typeof translate === 'function') {
        try {
          const text = translate(key, values)
          if (typeof text === 'string') return text
        } catch {
          /* fall back to the built-in dictionary */
        }
      }
      let text = (detectZh() ? ZH : EN)[key] ?? EN[key] ?? key
      if (values) for (const [name, value] of Object.entries(values)) text = text.split(`{${name}}`).join(String(value))
      return text
    }

    /* -------------------------------------------------------------- store */

    function basename(value) {
      if (typeof value !== 'string') return ''
      const parts = value.split(/[\\/]/u)
      return parts[parts.length - 1] || value
    }

    function emptyLibrary() {
      return { version: 2, folders: {}, items: {}, openTabs: [], activeTab: 'home' }
    }

    function loadLibrary() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return emptyLibrary()
        const parsed = JSON.parse(raw)
        if (!parsed || parsed.version !== 2) return emptyLibrary()
        const folders = {}
        for (const [id, value] of Object.entries(parsed.folders || {})) {
          if (typeof id !== 'string' || !value || typeof value.name !== 'string') continue
          folders[id] = {
            id,
            name: value.name.trim().slice(0, 80) || t('folder.defaultName'),
            parentId: null,
            x: Number.isFinite(value.x) ? value.x : null,
            y: Number.isFinite(value.y) ? value.y : null,
          }
        }
        for (const [id, value] of Object.entries(parsed.folders || {})) {
          const parent = value && typeof value.parentId === 'string' ? value.parentId : null
          if (parent && parent !== id && folders[parent]) folders[id].parentId = parent
        }
        const items = {}
        for (const [path, value] of Object.entries(parsed.items || {})) {
          if (typeof path !== 'string' || !value || typeof value.path !== 'string') continue
          if (path !== value.path) continue
          items[path] = {
            path,
            name: typeof value.name === 'string' && value.name.trim() !== '' ? value.name.trim().slice(0, 80) : basename(path),
            folderId: typeof value.folderId === 'string' && folders[value.folderId] ? value.folderId : null,
            x: Number.isFinite(value.x) ? value.x : null,
            y: Number.isFinite(value.y) ? value.y : null,
            addedAt: Number.isFinite(value.addedAt) ? value.addedAt : Date.now(),
          }
        }
        const seen = new Set()
        const openTabs = []
        for (const path of Array.isArray(parsed.openTabs) ? parsed.openTabs : []) {
          if (typeof path !== 'string' || !items[path] || seen.has(path)) continue
          seen.add(path)
          openTabs.push(path)
        }
        let activeTab = parsed.activeTab
        if (activeTab !== 'home' && (!items[activeTab] || !seen.has(activeTab))) activeTab = openTabs[0] || 'home'
        return { version: 2, folders, items, openTabs, activeTab }
      } catch {
        return emptyLibrary()
      }
    }

    function createLibraryStore() {
      let state = loadLibrary()
      const listeners = new Set()
      const save = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch {
          /* storage may be unavailable */
        }
      }
      const emit = () => {
        for (const listener of [...listeners]) {
          try {
            listener()
          } catch {
            /* a bad subscriber must not break the store */
          }
        }
      }
      const set = (next) => {
        state = next
        save()
        emit()
        return state
      }
      const update = (mutator) => {
        const next = mutator(state)
        return next && next !== state ? set(next) : state
      }
      return {
        getState: () => state,
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        addFiles(files, folderId = null) {
          const candidates = (Array.isArray(files) ? files : []).filter((file) => file && typeof file.path === 'string' && !state.items[file.path])
          if (candidates.length === 0) return 0
          update((previous) => {
            const items = { ...previous.items }
            for (const file of candidates) {
              items[file.path] = {
                path: file.path,
                name: String(file.name || basename(file.path)).trim().slice(0, 80) || basename(file.path),
                folderId: folderId ?? null,
                x: null,
                y: null,
                addedAt: Date.now(),
              }
            }
            return { ...previous, items }
          })
          return candidates.length
        },
        removeItem(path) {
          update((previous) => {
            if (!previous.items[path]) return previous
            const items = { ...previous.items }
            delete items[path]
            const openTabs = previous.openTabs.filter((entry) => entry !== path)
            const activeTab = previous.activeTab === path ? openTabs[openTabs.length - 1] || 'home' : previous.activeTab
            return { ...previous, items, openTabs, activeTab }
          })
        },
        addFolder(name, parentId = null) {
          const id = `f_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`
          update((previous) => ({
            ...previous,
            folders: {
              ...previous.folders,
              [id]: { id, name: String(name || t('folder.defaultName')).trim().slice(0, 80), parentId: parentId ?? null, x: null, y: null },
            },
          }))
          return id
        },
        removeFolder(id) {
          let parentId = null
          update((previous) => {
            const folder = previous.folders[id]
            if (!folder) return previous
            parentId = folder.parentId ?? null
            const scope = descendantFolders(previous.folders, id)
            const folders = { ...previous.folders }
            for (const folderId of scope) delete folders[folderId]
            const items = { ...previous.items }
            for (const [path, item] of Object.entries(items)) {
              if (item.folderId && scope.has(item.folderId)) items[path] = { ...item, folderId: parentId, x: null, y: null }
            }
            return { ...previous, folders, items }
          })
          return parentId
        },
        rename(kind, id, name) {
          const text = String(name || '').trim().slice(0, 80)
          if (!text) return
          update((previous) => {
            if (kind === 'folder') {
              const folder = previous.folders[id]
              if (!folder) return previous
              return { ...previous, folders: { ...previous.folders, [id]: { ...folder, name: text } } }
            }
            const item = previous.items[id]
            if (!item) return previous
            return { ...previous, items: { ...previous.items, [id]: { ...item, name: text } } }
          })
        },
        move(kind, id, targetFolderId) {
          update((previous) => {
            if (kind === 'folder') {
              const folder = previous.folders[id]
              if (!folder) return previous
              if (targetFolderId === id) return previous
              if (descendantFolders(previous.folders, id).has(targetFolderId)) return previous
              return { ...previous, folders: { ...previous.folders, [id]: { ...folder, parentId: targetFolderId ?? null, x: null, y: null } } }
            }
            const item = previous.items[id]
            if (!item) return previous
            return { ...previous, items: { ...previous.items, [id]: { ...item, folderId: targetFolderId ?? null, x: null, y: null } } }
          })
        },
        setPositions(updates) {
          if (!Array.isArray(updates) || updates.length === 0) return
          update((previous) => {
            const items = { ...previous.items }
            const folders = { ...previous.folders }
            for (const updateItem of updates) {
              if (!updateItem) continue
              if (updateItem.kind === 'folder' && folders[updateItem.id]) folders[updateItem.id] = { ...folders[updateItem.id], x: updateItem.x, y: updateItem.y }
              if (updateItem.kind === 'file' && items[updateItem.id]) items[updateItem.id] = { ...items[updateItem.id], x: updateItem.x, y: updateItem.y }
            }
            return { ...previous, items, folders }
          })
        },
        openDoc(path) {
          update((previous) => {
            if (!previous.items[path]) return previous
            const openTabs = previous.openTabs.includes(path) ? previous.openTabs : [...previous.openTabs, path]
            return { ...previous, openTabs, activeTab: path }
          })
        },
        setActive(tab) {
          update((previous) => {
            if (tab === 'home') return previous.activeTab === 'home' ? previous : { ...previous, activeTab: 'home' }
            if (!previous.items[tab] || !previous.openTabs.includes(tab)) return previous
            return previous.activeTab === tab ? previous : { ...previous, activeTab: tab }
          })
        },
        closeTab(path) {
          update((previous) => {
            const index = previous.openTabs.indexOf(path)
            if (index < 0) return previous
            const openTabs = previous.openTabs.filter((entry) => entry !== path)
            let activeTab = previous.activeTab
            if (previous.activeTab === path) activeTab = openTabs[Math.max(0, index - 1)] || openTabs[0] || 'home'
            return { ...previous, openTabs, activeTab }
          })
        },
      }
    }

    const store = createLibraryStore()

    function useLibrary() {
      const [snapshot, setSnapshot] = useState(store.getState())
      useEffect(() => store.subscribe(() => setSnapshot(store.getState())), [])
      return snapshot
    }

    /* ----------------------------------------------------------- bookmarks */

    function emptyBookmarks() {
      return { version: 1, positions: {}, bookmarks: {} }
    }

    function loadBookmarks() {
      try {
        const raw = localStorage.getItem(BOOKMARK_KEY)
        if (!raw) return emptyBookmarks()
        const parsed = JSON.parse(raw)
        if (!parsed || parsed.version !== 1) return emptyBookmarks()
        const positions = {}
        for (const [path, value] of Object.entries(parsed.positions || {})) {
          if (typeof path !== 'string' || !value || !Number.isFinite(value.ratio)) continue
          positions[path] = {
            ratio: clamp(value.ratio, 0, 1),
            blockIndex: Number.isFinite(value.blockIndex) ? Math.max(0, Math.floor(value.blockIndex)) : 0,
            label: typeof value.label === 'string' ? value.label.slice(0, 120) : '',
            updatedAt: Number.isFinite(value.updatedAt) ? value.updatedAt : Date.now(),
          }
        }
        const bookmarks = {}
        for (const [path, list] of Object.entries(parsed.bookmarks || {})) {
          if (typeof path !== 'string' || !Array.isArray(list)) continue
          const entries = []
          for (const value of list) {
            if (!value || typeof value.id !== 'string' || !Number.isFinite(value.ratio)) continue
            entries.push({
              id: value.id,
              ratio: clamp(value.ratio, 0, 1),
              blockIndex: Number.isFinite(value.blockIndex) ? Math.max(0, Math.floor(value.blockIndex)) : 0,
              label: typeof value.label === 'string' ? value.label.slice(0, 120) : '',
              note: typeof value.note === 'string' ? value.note.slice(0, 300) : '',
              createdAt: Number.isFinite(value.createdAt) ? value.createdAt : Date.now(),
            })
          }
          if (entries.length > 0) bookmarks[path] = entries.slice(0, 200)
        }
        return { version: 1, positions, bookmarks }
      } catch {
        return emptyBookmarks()
      }
    }

    function createBookmarkStore() {
      let state = loadBookmarks()
      const listeners = new Set()
      const save = () => {
        try {
          localStorage.setItem(BOOKMARK_KEY, JSON.stringify(state))
        } catch {
          /* storage may be unavailable */
        }
      }
      const emit = () => {
        for (const listener of [...listeners]) {
          try {
            listener()
          } catch {
            /* a bad subscriber must not break the store */
          }
        }
      }
      const update = (mutator) => {
        const next = mutator(state)
        if (!next || next === state) return state
        state = next
        save()
        emit()
        return state
      }
      return {
        getState: () => state,
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        // Reading positions are saved silently; scrolling should not re-render the document.
        savePosition(path, position) {
          if (typeof path !== 'string' || !position) return
          state = {
            ...state,
            positions: {
              ...state.positions,
              [path]: {
                ratio: clamp(Number(position.ratio) || 0, 0, 1),
                blockIndex: Number.isFinite(position.blockIndex) ? Math.max(0, Math.floor(position.blockIndex)) : 0,
                label: typeof position.label === 'string' ? position.label.slice(0, 120) : '',
                updatedAt: Date.now(),
              },
            },
          }
          save()
        },
        addBookmark(path, position) {
          if (typeof path !== 'string' || !position) return null
          const entry = {
            id: `b_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
            ratio: clamp(Number(position.ratio) || 0, 0, 1),
            blockIndex: Number.isFinite(position.blockIndex) ? Math.max(0, Math.floor(position.blockIndex)) : 0,
            label: typeof position.label === 'string' ? position.label.slice(0, 120) : '',
            note: '',
            createdAt: Date.now(),
          }
          update((previous) => ({
            ...previous,
            bookmarks: {
              ...previous.bookmarks,
              [path]: [entry, ...(previous.bookmarks[path] || [])].slice(0, 200),
            },
          }))
          return entry
        },
        updateBookmark(path, id, patch) {
          update((previous) => {
            const list = previous.bookmarks[path]
            if (!list) return previous
            const next = list.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    label: typeof patch?.label === 'string' ? patch.label.slice(0, 120) : entry.label,
                    note: typeof patch?.note === 'string' ? patch.note.slice(0, 300) : entry.note,
                  }
                : entry,
            )
            return { ...previous, bookmarks: { ...previous.bookmarks, [path]: next } }
          })
        },
        removeBookmark(path, id) {
          update((previous) => {
            const list = previous.bookmarks[path]
            if (!list) return previous
            const next = list.filter((entry) => entry.id !== id)
            const bookmarks = { ...previous.bookmarks }
            if (next.length > 0) bookmarks[path] = next
            else delete bookmarks[path]
            return { ...previous, bookmarks }
          })
        },
        clearPosition(path) {
          update((previous) => {
            if (!previous.positions[path]) return previous
            const positions = { ...previous.positions }
            delete positions[path]
            return { ...previous, positions }
          })
        },
      }
    }

    const bookmarkStore = createBookmarkStore()

    function useBookmarks() {
      const [snapshot, setSnapshot] = useState(bookmarkStore.getState())
      useEffect(() => bookmarkStore.subscribe(() => setSnapshot(bookmarkStore.getState())), [])
      return snapshot
    }

    /* ------------------------------------------------------------ helpers */

    function formatTime(value) {
      if (!value) return ''
      try {
        return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
      } catch {
        return new Date(value).toLocaleString()
      }
    }

    function formatSize(bytes) {
      if (!Number.isFinite(bytes)) return ''
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), Math.max(min, max))
    }

    function descendantFolders(folders, id) {
      const result = new Set([id])
      let changed = true
      while (changed) {
        changed = false
        for (const [folderId, folder] of Object.entries(folders)) {
          if (!result.has(folderId) && folder.parentId && result.has(folder.parentId)) {
            result.add(folderId)
            changed = true
          }
        }
      }
      return result
    }

    function folderChain(folders, id) {
      const chain = []
      let cursor = id
      const seen = new Set()
      while (cursor && folders[cursor] && !seen.has(cursor)) {
        seen.add(cursor)
        chain.unshift(folders[cursor])
        cursor = folders[cursor].parentId ?? null
      }
      return chain
    }

    function countChildren(library, folderId) {
      let count = 0
      for (const folder of Object.values(library.folders)) if ((folder.parentId ?? null) === folderId) count += 1
      for (const item of Object.values(library.items)) if ((item.folderId ?? null) === folderId) count += 1
      return count
    }

    function countFilesIn(folders, items, folderId) {
      const scope = descendantFolders(folders, folderId)
      let count = 0
      for (const item of Object.values(items)) if (item.folderId && scope.has(item.folderId)) count += 1
      return count
    }

    function uniqueFolderName(folders, parentId, base) {
      const siblings = new Set(
        Object.values(folders)
          .filter((folder) => (folder.parentId ?? null) === parentId)
          .map((folder) => folder.name),
      )
      if (!siblings.has(base)) return base
      for (let index = 2; index < 200; index += 1) {
        const candidate = `${base} ${index}`
        if (!siblings.has(candidate)) return candidate
      }
      return `${base} ${Date.now().toString(36)}`
    }

    function gridColumns(width) {
      return Math.max(1, Math.floor((width - PAD * 2) / CELL_W))
    }

    function slotPosition(index, columns) {
      const col = index % columns
      const row = Math.floor(index / columns)
      return { index, col, row, x: PAD + col * CELL_W, y: PAD + row * CELL_H }
    }

    function positionSlot(x, y, columns) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null
      const col = Math.round((x - PAD) / CELL_W)
      const row = Math.round((y - PAD) / CELL_H)
      if (col < 0 || col >= columns || row < 0) return null
      const snappedX = PAD + col * CELL_W
      const snappedY = PAD + row * CELL_H
      if (Math.abs(x - snappedX) > 0.6 || Math.abs(y - snappedY) > 0.6) return null
      return { index: row * columns + col, col, row, x: snappedX, y: snappedY }
    }

    function nearestSlot(x, y, columns, rows) {
      const col = clamp(Math.round((x - PAD) / CELL_W), 0, columns - 1)
      const row = clamp(Math.round((y - PAD) / CELL_H), 0, Math.max(0, rows - 1))
      return slotPosition(row * columns + col, columns)
    }

    function clampToCanvas(x, y, width, height) {
      return {
        x: clamp(Number.isFinite(x) ? x : PAD, PAD, Math.max(PAD, width - ICON_W - PAD)),
        y: clamp(Number.isFinite(y) ? y : PAD, PAD, Math.max(PAD, height - ICON_H - PAD)),
      }
    }

    function entryKey(entry) {
      return `${entry.kind}:${entry.id}`
    }

    function rectsIntersect(left, right) {
      return left.left < right.right && left.right > right.left && left.top < right.bottom && left.bottom > right.top
    }

    function findGroupPlacement(group, desiredDc, desiredDr, columns, occupied) {
      for (let radius = 0; radius <= 6; radius += 1) {
        for (let ddc = -radius; ddc <= radius; ddc += 1) {
          const remaining = radius - Math.abs(ddc)
          const rowOffsets = remaining === 0 ? [0] : [remaining, -remaining]
          for (const ddr of rowOffsets) {
            const updates = []
            const used = new Set()
            let valid = true
            for (const item of group) {
              const origin = positionSlot(item.originX, item.originY, columns)
              if (!origin) {
                valid = false
                break
              }
              const col = origin.col + desiredDc + ddc
              const row = origin.row + desiredDr + ddr
              if (col < 0 || col >= columns || row < 0) {
                valid = false
                break
              }
              const index = row * columns + col
              if (used.has(index) || occupied.has(index)) {
                valid = false
                break
              }
              used.add(index)
              updates.push({ kind: item.kind, id: item.id, x: PAD + col * CELL_W, y: PAD + row * CELL_H })
            }
            if (valid) return updates
          }
        }
      }
      return null
    }

    /* --------------------------------------------------------------- icons */

    function icon(name, size) {
      const s = size || 16
      const base = {
        width: s,
        height: s,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
      }
      const paths = (list) => h('svg', base, list.map((d, index) => h('path', { key: index, d })))
      switch (name) {
        case 'plus':
          return paths(['M12 5v14', 'M5 12h14'])
        case 'refresh':
          return paths(['M20 11a8 8 0 1 0-2.34 6.34', 'M20 4.8v6.2h-6.2'])
        case 'search':
          return h('svg', base, [h('circle', { key: 'c', cx: 11, cy: 11, r: 6.4 }), h('path', { key: 'l', d: 'M16 16l4.2 4.2' })])
        case 'back':
          return paths(['M14.5 5.5L8 12l6.5 6.5'])
        case 'forward':
          return paths(['M9.5 5.5L16 12l-6.5 6.5'])
        case 'close':
          return paths(['M6 6l12 12', 'M18 6L6 18'])
        case 'copy':
          return h('svg', base, [
            h('rect', { key: 'r1', x: 8.6, y: 8.6, width: 11, height: 11, rx: 2 }),
            h('path', { key: 'p1', d: 'M15.4 8.6V6.4a1.8 1.8 0 0 0-1.8-1.8H6.4a1.8 1.8 0 0 0-1.8 1.8v7.2a1.8 1.8 0 0 0 1.8 1.8h2.2' }),
          ])
        case 'trash':
          return paths(['M4 7h16', 'M9.5 7V4.6h5V7', 'M6.5 7l1 13h9l1-13', 'M10 11v5.5', 'M14 11v5.5'])
        case 'folder-plus':
          return paths(['M3.2 6.6a1.6 1.6 0 0 1 1.6-1.6h4.1l1.8 2.1H19.2a1.6 1.6 0 0 1 1.6 1.6v9.1a1.6 1.6 0 0 1-1.6 1.6H4.8a1.6 1.6 0 0 1-1.6-1.6z', 'M12 11v5', 'M9.5 13.5h5'])
        case 'doc':
          return paths(['M6.2 3.2h7.2l4.4 4.4v13.2H6.2z', 'M13.2 3.4v4.4h4.4', 'M9 12.4h6', 'M9 15.4h6', 'M9 9.4h2.4'])
        case 'folder':
          return paths(['M3.2 6.4a1.6 1.6 0 0 1 1.6-1.6h4.1l1.8 2.2H19.2a1.6 1.6 0 0 1 1.6 1.6v9.2a1.6 1.6 0 0 1-1.6 1.6H4.8a1.6 1.6 0 0 1-1.6-1.6z'])
        case 'home':
          return paths(['M3.6 11.2L12 4l8.4 7.2', 'M6.2 9.6V20h11.6V9.6', 'M10 20v-5.4h4V20'])
        case 'panel':
          return h('svg', base, [
            h('rect', { key: 'r', x: 3.2, y: 4.2, width: 17.6, height: 15.6, rx: 2 }),
            h('path', { key: 'l', d: 'M9.2 4.4v15.2' }),
            h('path', { key: 'c', d: 'M6.2 9.6l1.4 2.4-1.4 2.4' }),
          ])
        case 'check':
          return paths(['M5 12.5l4.3 4.3L19 7.2'])
        case 'file-plus':
          return h('svg', base, [
            h('path', { key: 'a', d: 'M6.2 3.2h7.2l4.4 4.4v13.2H6.2z' }),
            h('path', { key: 'b', d: 'M13.2 3.4v4.4h4.4' }),
            h('path', { key: 'c', d: 'M9.4 14.2h5.2' }),
            h('path', { key: 'd', d: 'M12 11.6v5.2' }),
          ])
        case 'expand':
          return paths(['M9 4H4v5', 'M15 4h5v5', 'M20 15v5h-5', 'M9 20H4v-5'])
        case 'collapse':
          return paths(['M9 4v5H4', 'M15 4v5h5', 'M20 15h-5v5', 'M4 15h5v5'])
        case 'bookmark':
          return paths(['M6.5 4h11v17l-5.5-3.8L6.5 21z'])
        default:
          return paths(['M12 5v14', 'M5 12h14'])
      }
    }

    function PanelIcon({ size }) {
      const s = typeof size === 'number' && size > 0 ? size : 16
      return h(
        'svg',
        {
          width: s,
          height: s,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          'data-dsh-panel-entry': PANEL_ID,
        },
        h('path', { d: 'M1.9 3.6h4.2l1.2 1.5h6.8v8.2a1 1 0 0 1-1 1H2.9a1 1 0 0 1-1-1z' }),
        h('path', { d: 'M5 7.3h6M5 9.5h4.2' }),
      )
    }

    /* ----------------------------------------------------------- markdown */

    function renderInline(text, keyPrefix) {
      const nodes = []
      const pattern = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\s]+\))/g
      let cursor = 0
      let counter = 0
      let match
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > cursor) nodes.push(text.slice(cursor, match.index))
        const token = match[0]
        const key = `${keyPrefix}-${counter++}`
        if (token.startsWith('`')) nodes.push(h('code', { key, className: 'dsd-md-inline-code' }, token.slice(1, -1)))
        else if (token.startsWith('**')) nodes.push(h('strong', { key }, token.slice(2, -2)))
        else if (token.startsWith('*')) nodes.push(h('em', { key }, token.slice(1, -1)))
        else {
          const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
          const href = link ? link[2] : ''
          if (link && /^(https?:\/\/|mailto:|#)/i.test(href)) nodes.push(h('a', { key, href, target: '_blank', rel: 'noreferrer noopener' }, link[1]))
          else nodes.push(link ? link[1] : token)
        }
        cursor = match.index + token.length
      }
      if (cursor < text.length) nodes.push(text.slice(cursor))
      return nodes
    }

    function splitTableRow(text) {
      return String(text)
        .trim()
        .replace(/^\|/u, '')
        .replace(/\|$/u, '')
        .split('|')
        .map((cell) => cell.trim())
    }

    function isTableSeparator(text) {
      if (!String(text).includes('|')) return false
      const cells = splitTableRow(text)
      return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/u.test(cell))
    }

    function tableAlignments(text) {
      return splitTableRow(text).map((cell) => {
        const left = cell.startsWith(':')
        const right = cell.endsWith(':')
        if (left && right) return 'center'
        if (right) return 'right'
        if (left) return 'left'
        return undefined
      })
    }

    function renderMarkdown(source, baseKey) {
      const lines = String(source ?? '').replace(/^\uFEFF/u, '').replace(/\r\n?/g, '\n').split('\n')
      const blocks = []
      let index = 0
      let key = 0
      let paragraph = []
      const prefix = baseKey || 'md'
      const flush = () => {
        if (paragraph.length === 0) return
        const text = paragraph.join(' ')
        blocks.push(h('p', { key: `${prefix}-p${key++}`, className: 'dsd-md-p' }, renderInline(text, `${prefix}-p${key}`)))
        paragraph = []
      }
      while (index < lines.length) {
        const line = lines[index]
        const fence = /^```([\w+#.:-]*)\s*$/.exec(line)
        if (fence) {
          flush()
          const code = []
          index += 1
          while (index < lines.length && !/^```\s*$/.test(lines[index])) {
            code.push(lines[index])
            index += 1
          }
          if (index < lines.length) index += 1
          const codeText = code.join('\n')
          const language = String(fence[1] || '').toLowerCase()
          if (language === 'mermaid') {
            blocks.push(h(MermaidBlock, { key: `${prefix}-mermaid${key++}`, source: codeText }))
          } else {
            const chart = parseChartBlock(fence[1], codeText)
            if (chart) {
              blocks.push(h(ChartBlock, { key: `${prefix}-chart${key++}`, spec: chart }))
            } else {
              blocks.push(h('pre', { key: `${prefix}-pre${key++}`, className: 'dsd-md-pre' }, h('code', null, codeText)))
            }
          }
          continue
        }
        if (/^\s*$/.test(line)) {
          flush()
          index += 1
          continue
        }
        const heading = /^(#{1,6})\s+(.*)$/.exec(line)
        if (heading) {
          flush()
          const level = Math.min(6, heading[1].length)
          blocks.push(h(`h${level}`, { key: `${prefix}-h${key++}`, className: 'dsd-md-heading' }, renderInline(heading[2], `${prefix}-h${key}`)))
          index += 1
          continue
        }
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
          flush()
          blocks.push(h('hr', { key: `${prefix}-hr${key++}`, className: 'dsd-md-hr' }))
          index += 1
          continue
        }
        if (line.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
          flush()
          const header = splitTableRow(line)
          const alignments = tableAlignments(lines[index + 1])
          const rows = []
          index += 2
          while (index < lines.length && lines[index].trim() !== '' && lines[index].includes('|')) {
            rows.push(splitTableRow(lines[index]))
            index += 1
          }
          blocks.push(
            h(
              'div',
              { key: `${prefix}-table${key++}`, className: 'dsd-md-table-wrap' },
              h(
                'table',
                { className: 'dsd-md-table' },
                h(
                  'thead',
                  null,
                  h(
                    'tr',
                    null,
                    header.map((cell, column) =>
                      h(
                        'th',
                        { key: `${prefix}-th${column}`, style: alignments[column] ? { textAlign: alignments[column] } : undefined },
                        renderInline(cell, `${prefix}-th${column}`),
                      ),
                    ),
                  ),
                ),
                h(
                  'tbody',
                  null,
                  rows.map((row, rowIndex) =>
                    h(
                      'tr',
                      { key: `${prefix}-tr${rowIndex}` },
                      header.map((_, column) =>
                        h(
                          'td',
                          { key: `${prefix}-td${rowIndex}-${column}`, style: alignments[column] ? { textAlign: alignments[column] } : undefined },
                          renderInline(row[column] ?? '', `${prefix}-td${rowIndex}-${column}`),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          )
          continue
        }
        if (/^>\s?/.test(line)) {
          flush()
          const quote = []
          while (index < lines.length && /^>\s?/.test(lines[index])) {
            quote.push(lines[index].replace(/^>\s?/, ''))
            index += 1
          }
          blocks.push(h('blockquote', { key: `${prefix}-q${key++}`, className: 'dsd-md-quote' }, renderInline(quote.join(' '), `${prefix}-q${key}`)))
          continue
        }
        if (/^[-*+]\s+/.test(line)) {
          flush()
          const items = []
          while (index < lines.length && /^[-*+]\s+/.test(lines[index])) {
            items.push(h('li', { key: `${prefix}-li${key++}` }, renderInline(lines[index].replace(/^[-*+]\s+/, ''), `${prefix}-li${key}`)))
            index += 1
          }
          blocks.push(h('ul', { key: `${prefix}-ul${key++}`, className: 'dsd-md-list' }, items))
          continue
        }
        if (/^\d+[.)]\s+/.test(line)) {
          flush()
          const items = []
          while (index < lines.length && /^\d+[.)]\s+/.test(lines[index])) {
            items.push(h('li', { key: `${prefix}-li${key++}` }, renderInline(lines[index].replace(/^\d+[.)]\s+/, ''), `${prefix}-li${key}`)))
            index += 1
          }
          blocks.push(h('ol', { key: `${prefix}-ol${key++}`, className: 'dsd-md-list' }, items))
          continue
        }
        paragraph.push(line.trim())
        index += 1
      }
      flush()
      return blocks
    }

    /* -------------------------------------------------------------- charts */

    const CHART_PALETTE = ['#7aaaff', '#4fd1c5', '#f6ad55', '#f687b3', '#9f7aea', '#f6e05e', '#68d391', '#fc8181']
    const CHART_TYPES = new Set(['bar', 'line', 'area', 'pie', 'donut'])
    let mermaidLoader = null
    let mermaidRenderQueue = Promise.resolve()
    let mermaidSequence = 0

    function parseChartBlock(language, source) {
      const lower = String(language || '').toLowerCase()
      if (lower !== 'chart' && !lower.startsWith('chart:')) return null
      const requested = lower.startsWith('chart:') ? lower.slice(6) : ''
      let raw = null
      try {
        const parsed = JSON.parse(source)
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) raw = parsed
      } catch {
        /* not JSON; try the simple CSV shape below */
      }
      if (!raw) {
        const data = []
        for (const line of String(source).split(/\r?\n/u)) {
          const text = line.trim()
          if (!text || text.startsWith('#')) continue
          const parts = text.split(/[,\t;]/u).map((part) => part.trim())
          if (parts.length < 2) continue
          const value = Number(parts[1])
          if (!Number.isFinite(value)) continue
          data.push({ label: parts[0], value })
        }
        if (data.length > 0) raw = { data }
      }
      if (!raw) return { invalid: true, source, type: 'bar', data: [] }
      const typeCandidate = (requested || raw.type || 'bar').toLowerCase()
      const type = CHART_TYPES.has(typeCandidate) ? typeCandidate : 'bar'
      const data = (raw.data || [])
        .map((item, index) => {
          if (Array.isArray(item)) return { label: String(item[0] ?? index + 1).slice(0, 40), value: Number(item[1]) }
          return { label: String(item?.label ?? item?.name ?? index + 1).slice(0, 40), value: Number(item?.value ?? item?.count) }
        })
        .filter((item) => Number.isFinite(item.value))
        .slice(0, 60)
      if (data.length === 0) return { invalid: true, source, type, data: [] }
      return {
        invalid: false,
        type,
        data,
        title: typeof raw.title === 'string' ? raw.title : '',
        unit: typeof raw.unit === 'string' ? raw.unit : '',
        source,
      }
    }

    function formatChartNumber(value) {
      if (!Number.isFinite(value)) return ''
      const abs = Math.abs(value)
      if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}M`
      if (abs >= 1000) return `${(value / 1000).toFixed(1)}K`
      if (Number.isInteger(value)) return String(value)
      return value.toFixed(1)
    }

    function chartValueLabel(value, unit) {
      return `${formatChartNumber(value)}${unit ? ` ${unit}` : ''}`
    }

    function loadMermaid() {
      if (typeof window !== 'undefined' && window.mermaid) return Promise.resolve(window.mermaid)
      if (mermaidLoader) return mermaidLoader
      mermaidLoader = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = MERMAID_URL
        script.async = true
        script.dataset.dsdMermaid = 'true'
        script.onload = () => {
          if (window.mermaid) resolve(window.mermaid)
          else reject(new Error('Mermaid global missing'))
        }
        script.onerror = () => reject(new Error('Mermaid script failed to load'))
        document.head.appendChild(script)
      }).catch((error) => {
        mermaidLoader = null
        throw error
      })
      return mermaidLoader
    }

    function mermaidThemeName() {
      try {
        const parts = getComputedStyle(document.body).backgroundColor.match(/\d+(?:\.\d+)?/gu)
        if (parts && parts.length >= 3) {
          const [red, green, blue] = parts.map(Number)
          return (red * 299 + green * 587 + blue * 114) / 1000 < 128 ? 'dark' : 'default'
        }
      } catch {
        /* fall through */
      }
      return 'dark'
    }

    function initializeMermaid(mermaid) {
      if (mermaid.__dsdInitialized) return
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: mermaidThemeName(),
        fontFamily: 'inherit',
        gantt: {
          useMaxWidth: false,
          barHeight: 22,
          barGap: 6,
          topPadding: 50,
          leftPadding: 90,
          rightPadding: 40,
          gridLineStartPadding: 35,
          fontSize: 11,
          sectionFontSize: 11,
        },
        xyChart: { useMaxWidth: true },
      })
      mermaid.__dsdInitialized = true
    }

    function renderMermaidDiagram(mermaid, source) {
      const id = `dsd-mermaid-${Date.now().toString(36)}-${(mermaidSequence += 1)}`
      const task = mermaidRenderQueue.then(() => Promise.resolve(mermaid.render(id, source)))
      mermaidRenderQueue = task.then(
        () => undefined,
        () => undefined,
      )
      return task
    }

    function MermaidBlock({ source }) {
      const hostRef = useRef(null)
      const [state, setState] = useState({ status: 'loading' })
      const kind = String(source).trim().split(/\s+/u)[0].toLowerCase()
      useEffect(() => {
        let cancelled = false
        const host = hostRef.current
        if (!host) return undefined
        host.innerHTML = ''
        setState({ status: 'loading' })
        loadMermaid()
          .then((mermaid) => {
            initializeMermaid(mermaid)
            return renderMermaidDiagram(mermaid, source)
          })
          .then((result) => {
            if (cancelled) return
            const svg = typeof result === 'string' ? result : result && result.svg
            if (!svg) throw new Error('Mermaid returned no SVG')
            host.innerHTML = svg
            if (result && typeof result.bindFunctions === 'function') result.bindFunctions(host)
            setState({ status: 'ready' })
          })
          .catch((error) => {
            if (!cancelled) setState({ status: 'error', message: error && error.message ? error.message : String(error) })
          })
        return () => {
          cancelled = true
          if (host) host.innerHTML = ''
        }
      }, [source])
      return h(
        'figure',
        { className: 'dsd-mermaid', 'data-status': state.status, 'data-kind': kind },
        state.status === 'loading' ? h('div', { className: 'dsd-mermaid-loading' }, t('mermaid.loading')) : null,
        state.status === 'error' ? h('div', { className: 'dsd-mermaid-error' }, t('mermaid.error')) : null,
        kind === 'gantt' ? h('div', { className: 'dsd-mermaid-hint' }, t('mermaid.scrollHint')) : null,
        h('div', { className: 'dsd-mermaid-svg', ref: hostRef }),
        state.status === 'error'
          ? h('details', { className: 'dsd-chart-source' }, h('summary', null, t('mermaid.source')), h('pre', null, source))
          : null,
      )
    }

    function ChartSource({ source }) {
      if (!source) return null
      return h('details', { className: 'dsd-chart-source' }, h('summary', null, t('chart.source')), h('pre', null, source))
    }

    function ChartBlock({ spec }) {
      if (!spec) return null
      if (spec.invalid) {
        return h(
          'figure',
          { className: 'dsd-chart dsd-chart-invalid' },
          h('div', { className: 'dsd-chart-error' }, t('chart.invalid')),
          h(ChartSource, { source: spec.source }),
        )
      }
      if (spec.type === 'pie' || spec.type === 'donut') return h(PieChart, { spec })
      return h(AxisChart, { spec })
    }

    function AxisChart({ spec }) {
      const data = spec.data
      const width = 640
      const height = 300
      const margin = { left: 48, right: 18, top: 18, bottom: 50 }
      const plotW = width - margin.left - margin.right
      const plotH = height - margin.top - margin.bottom
      const values = data.map((item) => item.value)
      const rawMin = Math.min(0, ...values)
      const rawMax = Math.max(0, ...values)
      const domainSpan = rawMax - rawMin || 1
      const tickCount = 4
      const roughStep = domainSpan / tickCount
      const magnitude = 10 ** Math.floor(Math.log10(roughStep))
      const normalized = roughStep / magnitude
      const stepMultiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
      const step = stepMultiplier * magnitude
      const axisMin = Math.floor(rawMin / step) * step
      const axisMax = Math.ceil(rawMax / step) * step
      const span = axisMax - axisMin || 1
      const yOf = (value) => margin.top + plotH - ((value - axisMin) / span) * plotH
      const baseline = yOf(0)
      const ticks = Math.max(1, Math.round(span / step))
      const tickValues = Array.from({ length: ticks + 1 }, (_, index) => axisMin + step * index)
      const slot = plotW / Math.max(1, data.length)
      const labelEvery = Math.max(1, Math.ceil(data.length / 12))
      const isLine = spec.type === 'line' || spec.type === 'area'
      const color = CHART_PALETTE[0]
      const points = data.map((item, index) => ({ ...item, x: margin.left + slot * index + slot / 2, y: yOf(item.value) }))
      const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ')
      const areaPath =
        points.length > 0
          ? `${linePath} L${points[points.length - 1].x.toFixed(2)},${baseline.toFixed(2)} L${points[0].x.toFixed(2)},${baseline.toFixed(2)} Z`
          : ''
      const elements = []
      tickValues.forEach((value, index) => {
        const py = yOf(value)
        elements.push(h('line', { key: `grid-${index}`, x1: margin.left, x2: width - margin.right, y1: py, y2: py, stroke: 'var(--dsw-alias-border-l1,#e4e4ea)', strokeWidth: 1 }))
        elements.push(
          h('text', { key: `tick-${index}`, x: margin.left - 8, y: py + 4, textAnchor: 'end', fontSize: 10, fill: 'var(--dsw-alias-label-secondary,#6b6b76)' }, formatChartNumber(value)),
        )
      })
      elements.push(h('line', { key: 'zero', x1: margin.left, x2: width - margin.right, y1: baseline, y2: baseline, stroke: 'var(--dsw-alias-border-l2,#d0d0d8)', strokeWidth: 1 }))
      if (isLine) {
        if (spec.type === 'area' && points.length > 0) elements.push(h('path', { key: 'area', d: areaPath, fill: color, fillOpacity: 0.16, stroke: 'none' }))
        if (points.length > 0) elements.push(h('path', { key: 'line', d: linePath, fill: 'none', stroke: color, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' }))
        points.forEach((point, index) => {
          elements.push(
            h('circle', { key: `point-${index}`, cx: point.x, cy: point.y, r: 3.2, fill: color, stroke: 'var(--dsw-alias-bg-layer-1,#fff)', strokeWidth: 1.5 }, h('title', null, `${point.label}: ${chartValueLabel(point.value, spec.unit)}`)),
          )
        })
      } else {
        const barWidth = Math.max(4, Math.min(44, slot * 0.55))
        points.forEach((point, index) => {
          const top = point.value >= 0 ? point.y : baseline
          const barHeight = Math.max(0.8, Math.abs(baseline - point.y))
          elements.push(
            h('rect', { key: `bar-${index}`, x: point.x - barWidth / 2, y: top, width: barWidth, height: barHeight, rx: Math.min(4, barWidth / 2), fill: color, fillOpacity: 0.86 }, h('title', null, `${point.label}: ${chartValueLabel(point.value, spec.unit)}`)),
          )
          if (data.length <= 16) {
            elements.push(h('text', { key: `value-${index}`, x: point.x, y: top - 5, textAnchor: 'middle', fontSize: 10, fill: 'var(--dsw-alias-label-secondary,#6b6b76)' }, formatChartNumber(point.value)))
          }
        })
      }
      points.forEach((point, index) => {
        if (index % labelEvery !== 0) return
        const label = point.label.length > 10 ? `${point.label.slice(0, 9)}…` : point.label
        elements.push(h('text', { key: `label-${index}`, x: point.x, y: height - margin.bottom + 18, textAnchor: 'middle', fontSize: 10, fill: 'var(--dsw-alias-label-secondary,#6b6b76)' }, label))
      })
      return h(
        'figure',
        { className: 'dsd-chart' },
        spec.title ? h('figcaption', { className: 'dsd-chart-title' }, spec.title) : null,
        h('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': spec.title || t('chart.aria') }, elements),
        h(ChartSource, { source: spec.source }),
      )
    }

    function PieChart({ spec }) {
      const positive = spec.data.filter((item) => item.value > 0)
      if (positive.length === 0) {
        return h('figure', { className: 'dsd-chart' }, h('div', { className: 'dsd-chart-empty' }, t('chart.empty')), h(ChartSource, { source: spec.source }))
      }
      const limited =
        positive.length > 12
          ? [...positive.slice(0, 11), { label: t('chart.other'), value: positive.slice(11).reduce((sum, item) => sum + item.value, 0) }]
          : positive
      const total = limited.reduce((sum, item) => sum + item.value, 0)
      const cx = 190
      const cy = 150
      const outer = 108
      const inner = spec.type === 'donut' ? 62 : 0
      const donutRadius = (outer + inner) / 2
      const circumference = 2 * Math.PI * donutRadius
      let angle = -Math.PI / 2
      const elements = []
      limited.forEach((item, index) => {
        const sweep = (item.value / total) * Math.PI * 2
        const color = CHART_PALETTE[index % CHART_PALETTE.length]
        const percent = ((item.value / total) * 100).toFixed(1)
        if (spec.type === 'donut') {
          const length = (item.value / total) * circumference
          elements.push(
            h('circle', {
              key: `donut-${index}`,
              cx,
              cy,
              r: donutRadius,
              fill: 'none',
              stroke: color,
              strokeWidth: outer - inner,
              strokeDasharray: `${length} ${circumference - length}`,
              strokeDashoffset: -((angle + Math.PI / 2) / (Math.PI * 2)) * circumference,
              transform: `rotate(-90 ${cx} ${cy})`,
            }, h('title', null, `${item.label}: ${chartValueLabel(item.value, spec.unit)} (${percent}%)`)),
          )
        } else if (sweep >= Math.PI * 2 - 0.0001) {
          elements.push(h('circle', { key: `pie-${index}`, cx, cy, r: outer, fill: color }, h('title', null, `${item.label}: ${chartValueLabel(item.value, spec.unit)} (${percent}%)`)))
        } else {
          const startX = cx + outer * Math.cos(angle)
          const startY = cy + outer * Math.sin(angle)
          const endX = cx + outer * Math.cos(angle + sweep)
          const endY = cy + outer * Math.sin(angle + sweep)
          const large = sweep > Math.PI ? 1 : 0
          const d = `M${cx},${cy} L${startX.toFixed(2)},${startY.toFixed(2)} A${outer},${outer} 0 ${large} 1 ${endX.toFixed(2)},${endY.toFixed(2)} Z`
          elements.push(h('path', { key: `pie-${index}`, d, fill: color }, h('title', null, `${item.label}: ${chartValueLabel(item.value, spec.unit)} (${percent}%)`)))
        }
        angle += sweep
        const rowY = 42 + index * 19
        elements.push(h('rect', { key: `legend-${index}`, x: 352, y: rowY - 8, width: 10, height: 10, rx: 2, fill: color }))
        const label = item.label.length > 14 ? `${item.label.slice(0, 13)}…` : item.label
        elements.push(h('text', { key: `legend-label-${index}`, x: 370, y: rowY, fontSize: 11, fill: 'var(--dsw-alias-label-primary,#1b1b1f)' }, label))
        elements.push(h('text', { key: `legend-value-${index}`, x: 616, y: rowY, textAnchor: 'end', fontSize: 10.5, fill: 'var(--dsw-alias-label-secondary,#6b6b76)' }, `${chartValueLabel(item.value, spec.unit)} · ${percent}%`))
      })
      return h(
        'figure',
        { className: 'dsd-chart' },
        spec.title ? h('figcaption', { className: 'dsd-chart-title' }, spec.title) : null,
        h('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': spec.title || t('chart.aria') }, elements),
        h(ChartSource, { source: spec.source }),
      )
    }

    /* ---------------------------------------------------------------- css */

    const CSS = `
.dsd-panel { position:relative; display:flex; flex-direction:column; height:100%; min-height:0; background:var(--dsw-alias-bg-base,#fff); color:var(--dsw-alias-label-primary,#1b1b1f); font-family:inherit; }
.dsd-panel[data-immersive="true"] { position:fixed; inset:0; width:100vw; height:100vh; max-width:none; min-width:0; margin:0; z-index:9999; border-radius:0; box-shadow:none; }
.dsd-panel[data-immersive="true"] .dsd-doc-inner { max-width:980px; }
body.dsd-immersive { overflow:hidden !important; }
.dsd-tabbar { flex:none; display:flex; align-items:flex-end; gap:4px; height:38px; padding:4px 8px 0; background:var(--dsw-alias-bg-layer-1,#f6f6f8); border-bottom:1px solid var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-tabs { display:flex; align-items:flex-end; gap:2px; flex:1; min-width:0; overflow-x:auto; overflow-y:hidden; scrollbar-width:thin; }
.dsd-tab { display:inline-flex; align-items:center; gap:6px; height:30px; max-width:210px; padding:0 6px 0 9px; border:1px solid transparent; border-bottom:none; border-radius:8px 8px 0 0; background:transparent; color:var(--dsw-alias-label-secondary,#6b6b76); font:inherit; font-size:12px; cursor:pointer; white-space:nowrap; flex:none; }
.dsd-tab:hover { color:var(--dsw-alias-label-primary,#1b1b1f); background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); }
.dsd-tab[data-active=true] { color:var(--dsw-alias-label-primary,#1b1b1f); background:var(--dsw-alias-bg-base,#fff); border-color:var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-tab-label { overflow:hidden; text-overflow:ellipsis; }
.dsd-tab-close { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border:none; border-radius:4px; background:transparent; color:inherit; cursor:pointer; padding:0; }
.dsd-tab-close:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 10%, transparent); }
.dsd-tabbar-actions { flex:none; display:flex; align-items:center; gap:6px; padding-bottom:4px; }
.dsd-btn { display:inline-flex; align-items:center; justify-content:center; gap:5px; height:28px; min-width:28px; padding:0 9px; border-radius:8px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:12px; cursor:pointer; white-space:nowrap; }
.dsd-btn:hover:not(:disabled) { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); }
.dsd-btn:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:1px; }
.dsd-btn:disabled { opacity:.5; cursor:default; }
.dsd-btn[data-primary] { background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#f9fafb)); border-color:transparent; color:var(--dsw-alias-label-primary-foreground,#0f1115); font-weight:600; }
.dsd-btn[data-primary]:hover:not(:disabled) { filter:brightness(1.04); background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#f9fafb)); }
.dsd-btn[data-quiet] { border-color:transparent; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-btn[data-quiet]:hover:not(:disabled) { color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-btn[data-active="true"] { color:var(--dsw-alias-state-business-primary,#2f6fed); border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 38%, transparent); background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 10%, transparent); }
.dsd-btn[data-danger] { background:var(--dsw-alias-state-error-primary,#c62f45); border-color:transparent; color:#fff; font-weight:600; }
.dsd-btn[data-danger]:hover:not(:disabled) { background:var(--dsw-alias-state-error-primary,#c62f45); filter:brightness(1.06); }
.dsd-home { flex:1; min-height:0; display:flex; flex-direction:column; }
.dsd-toolbar { flex:none; display:flex; align-items:center; gap:7px; padding:7px 12px 6px; flex-wrap:wrap; }
.dsd-crumb { display:flex; align-items:center; gap:3px; min-width:0; font-size:12px; color:var(--dsw-alias-label-secondary,#6b6b76); flex-wrap:wrap; }
.dsd-crumb-btn { border:none; background:transparent; color:inherit; font:inherit; font-size:12px; padding:2px 5px; border-radius:5px; cursor:pointer; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-crumb-btn:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-crumb-current { padding:2px 5px; color:var(--dsw-alias-label-primary,#1b1b1f); font-weight:600; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-crumb-sep { opacity:.55; }
.dsd-crumb-back { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; margin-right:1px; border:none; border-radius:6px; background:transparent; color:inherit; cursor:pointer; padding:0; }
.dsd-crumb-back:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
.dsd-toolbar-spacer { flex:1; min-width:4px; }
.dsd-count { font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); white-space:nowrap; }
.dsd-search { position:relative; display:flex; align-items:center; }
.dsd-search svg { position:absolute; left:8px; color:var(--dsw-alias-label-secondary,#6b6b76); pointer-events:none; }
.dsd-search input { width:156px; height:28px; padding:0 8px 0 27px; border-radius:8px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); background:var(--dsw-specific-input-major,var(--dsw-alias-bg-base,#fff)); color:inherit; font:inherit; font-size:12px; outline:none; }
.dsd-search input:focus { border-color:var(--dsw-alias-state-business-primary,#2f6fed); }
.dsd-search input::placeholder { color:var(--dsw-alias-label-secondary,#6b6b76); opacity:.8; }
.dsd-desktop-wrap { flex:1; min-height:0; display:flex; padding:0 10px 10px; }
.dsd-desktop { position:relative; flex:1; min-height:0; overflow:auto; border-radius:12px; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); scrollbar-width:thin; scrollbar-gutter:stable; }
.dsd-desktop-canvas { position:relative; width:100%; min-height:100%; background-color:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#f6f6f8) 62%, transparent); background-image:radial-gradient(circle, color-mix(in srgb, var(--dsw-alias-border-l2,#d0d0d8) 72%, transparent) 1px, transparent 1px); background-size:22px 22px; background-position:7px 7px; }
.dsd-slot-ghost { position:absolute; width:88px; height:104px; border-radius:10px; border:1px dashed var(--dsw-alias-state-business-primary,#2f6fed); background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 9%, transparent); pointer-events:none; z-index:1; }
.dsd-marquee { position:absolute; border:1px solid var(--dsw-alias-state-business-primary,#2f6fed); background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 12%, transparent); border-radius:4px; pointer-events:none; z-index:20; }
.dsd-selection-pill { display:inline-flex; align-items:center; gap:4px; height:24px; padding:0 8px; border-radius:999px; border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 40%, transparent); background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 12%, transparent); color:var(--dsw-alias-state-business-primary,#2f6fed); font:inherit; font-size:11px; cursor:pointer; white-space:nowrap; }
.dsd-selection-pill:hover { background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 20%, transparent); }
.dsd-item { position:absolute; width:88px; box-sizing:border-box; padding:5px 3px 6px; border-radius:10px; border:1px solid transparent; display:flex; flex-direction:column; align-items:center; gap:5px; cursor:default; user-select:none; touch-action:none; }
.dsd-item[data-pending=true] { opacity:0; }
.dsd-item:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 6%, transparent); }
.dsd-item:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:1px; }
.dsd-item[data-selected=true] { background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 13%, transparent); border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 42%, transparent); }
.dsd-item[data-dragging=true] { z-index:9; cursor:grabbing; opacity:.94; background:var(--dsw-alias-bg-layer-1,#fff); box-shadow:0 12px 26px rgba(0,0,0,.18); }
.dsd-item[data-drop=true] .dsd-glyph { outline:3px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:2px; }
.dsd-glyph { position:relative; display:flex; align-items:center; justify-content:center; width:54px; height:54px; border-radius:14px; flex:none; }
.dsd-glyph[data-kind=file] { background:var(--dsw-alias-bg-layer-1,#f6f6f8); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-glyph[data-kind=folder] { background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 15%, var(--dsw-alias-bg-layer-1,#f6f6f8)); border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 30%, transparent); color:var(--dsw-alias-state-business-primary,#2f6fed); }
.dsd-badge { position:absolute; right:-5px; bottom:-5px; min-width:17px; height:17px; padding:0 4px; border-radius:9px; background:var(--dsw-alias-state-business-primary,#2f6fed); color:var(--dsw-alias-label-primary-foreground,#0f1115); font-size:10px; line-height:17px; font-weight:700; text-align:center; }
.dsd-label { font-size:11.5px; line-height:1.3; text-align:center; max-width:84px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; word-break:break-word; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-rename-input { width:82px; height:23px; padding:1px 3px; border-radius:6px; border:1px solid var(--dsw-alias-state-business-primary,#2f6fed); background:var(--dsw-alias-bg-base,#fff); color:inherit; font:inherit; font-size:11.5px; text-align:center; outline:none; }
.dsd-empty { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:28px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-empty-icon { display:flex; align-items:center; justify-content:center; width:64px; height:64px; margin-bottom:2px; border-radius:18px; background:var(--dsw-alias-bg-layer-2,#f0f0f4); color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-empty-title { margin:0; font-size:14px; font-weight:600; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-empty-hint { margin:0; max-width:420px; font-size:12px; line-height:1.65; }
.dsd-no-match { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsd-doc { flex:1; min-height:0; display:flex; flex-direction:column; position:relative; }
.dsd-doc-scroll { flex:1; min-height:0; overflow:auto; scrollbar-width:thin; }
.dsd-doc-inner { max-width:880px; margin:0 auto; padding:18px 30px 64px; }
.dsd-doc-pathbar { display:flex; align-items:center; gap:8px; margin-bottom:16px; padding-bottom:10px; border-bottom:1px solid var(--dsw-alias-border-l1,#e4e4ea); color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-doc-pathbar > svg { flex:none; }
.dsd-bookmark-count { min-width:15px; height:15px; padding:0 4px; border-radius:999px; background:var(--dsw-alias-state-business-primary,#2f6fed); color:var(--dsw-alias-label-primary-foreground,#0f1115); font-size:9.5px; line-height:15px; font-weight:700; text-align:center; }
.dsd-resume { display:flex; align-items:flex-start; gap:10px; margin:0 0 16px; padding:10px 12px; border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 28%, var(--dsw-alias-border-l1,#e4e4ea)); border-radius:10px; background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 8%, transparent); color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-resume > svg { flex:none; margin-top:2px; color:var(--dsw-alias-state-business-primary,#2f6fed); }
.dsd-resume-main { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.dsd-resume-meta { font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-resume-label { font-size:11.5px; color:var(--dsw-alias-label-secondary,#6b6b76); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-resume-actions { flex:none; display:flex; align-items:center; gap:4px; }
.dsd-bookmarks-popover { position:absolute; top:48px; right:12px; z-index:70; width:min(340px, calc(100% - 24px)); max-height:min(72vh, 560px); overflow:auto; padding:10px; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); border-radius:12px; background:var(--dsw-alias-bg-layer-2,#fff); color:var(--dsw-alias-label-primary,#1b1b1f); box-shadow:0 16px 40px rgba(0,0,0,.22); }
.dsd-bookmarks-head { display:flex; align-items:center; gap:8px; padding:2px 2px 8px; }
.dsd-bookmarks-head strong { font-size:13px; }
.dsd-bookmarks-head-count { flex:1; min-width:0; font-size:10.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-bookmarks-last { padding:9px 10px; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); border-radius:9px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#f6f6f8) 58%, transparent); }
.dsd-bookmarks-section-title { margin-bottom:5px; font-size:10.5px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-bookmarks-last-meta { font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-bookmarks-last-label { margin:4px 0 7px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-bookmarks-last-actions { display:flex; flex-wrap:wrap; gap:5px; }
.dsd-bookmarks-hint { font-size:11.5px; color:var(--dsw-alias-label-secondary,#6b6b76); line-height:1.5; }
.dsd-bookmarks-add { display:flex; align-items:center; gap:8px; margin:10px 0; }
.dsd-bookmarks-add .dsd-btn { flex:1; justify-content:flex-start; }
.dsd-bookmark-kbd { flex:none; padding:1px 5px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); border-radius:4px; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:10px; line-height:1.4; }
.dsd-bookmarks-list { display:flex; flex-direction:column; gap:6px; }
.dsd-bookmarks-empty { padding:12px 4px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:11.5px; line-height:1.5; }
.dsd-bookmark-item { display:flex; align-items:flex-start; gap:8px; padding:7px 0; border-top:1px solid var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-bookmark-main { flex:1; min-width:0; padding:0; border:none; background:transparent; color:inherit; font:inherit; text-align:left; cursor:pointer; }
.dsd-bookmark-label { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-bookmark-note { margin-top:2px; font-size:11px; line-height:1.5; color:var(--dsw-alias-label-secondary,#6b6b76); white-space:normal; }
.dsd-bookmark-meta { margin-top:3px; font-size:10.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-bookmark-actions { flex:none; display:flex; gap:2px; }
.dsd-bookmark-action { padding:3px 4px; border:none; border-radius:4px; background:transparent; color:var(--dsw-alias-label-secondary,#6b6b76); font:inherit; font-size:10.5px; cursor:pointer; }
.dsd-bookmark-action:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-bookmark-action[data-danger] { color:var(--dsw-alias-state-error-primary,#c62f45); }
.dsd-bookmark-editor { display:flex; flex-direction:column; gap:6px; margin:4px 0 8px; padding:8px; border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 35%, var(--dsw-alias-border-l1,#e4e4ea)); border-radius:8px; background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 5%, transparent); }
.dsd-bookmark-editor-title { font-size:10.5px; font-weight:700; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-bookmark-editor input, .dsd-bookmark-editor textarea { width:100%; box-sizing:border-box; padding:6px 7px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); border-radius:6px; background:var(--dsw-specific-input-major,var(--dsw-alias-bg-base,#fff)); color:inherit; font:inherit; font-size:12px; outline:none; }
.dsd-bookmark-editor textarea { min-height:44px; resize:vertical; }
.dsd-bookmark-editor input:focus, .dsd-bookmark-editor textarea:focus { border-color:var(--dsw-alias-state-business-primary,#2f6fed); }
.dsd-bookmark-editor-actions { display:flex; justify-content:flex-end; gap:6px; }
.dsd-doc-path { flex:1; min-width:0; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:10.5px; line-height:1.5; word-break:break-all; }
.dsd-doc-body { font-size:13.5px; line-height:1.75; }
.dsd-doc-note { margin-bottom:14px; padding:7px 10px; border-radius:8px; border:1px dashed var(--dsw-alias-border-l2,#d0d0d8); font-size:11.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-doc-loading { padding:36px 8px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsd-doc-error { margin:18px 0; padding:16px; border-radius:10px; border:1px solid var(--dsw-alias-state-error-primary,#c62f45); color:var(--dsw-alias-state-error-primary,#c62f45); font-size:12.5px; line-height:1.6; display:flex; flex-direction:column; align-items:flex-start; gap:10px; }
.dsd-doc-empty { padding:36px 8px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsd-md-heading { margin:1.5em 0 .6em; line-height:1.3; font-weight:700; }
.dsd-md-heading:first-child { margin-top:0; }
.dsd-md-p { margin:.72em 0; }
.dsd-md-list { margin:.6em 0; padding-left:1.5em; }
.dsd-md-list li { margin:.22em 0; }
.dsd-md-pre { margin:.9em 0; padding:11px 13px; border-radius:8px; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); background:var(--dsw-alias-bg-layer-2,#f0f0f4); overflow:auto; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:12px; line-height:1.58; tab-size:2; }
.dsd-md-inline-code { padding:1px 5px; border-radius:5px; background:var(--dsw-alias-bg-layer-2,#f0f0f4); font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:.9em; }
.dsd-md-quote { margin:.8em 0; padding:2px 0 2px 12px; border-left:3px solid var(--dsw-alias-border-l2,#d0d0d8); color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-md-hr { height:1px; margin:1.3em 0; border:none; background:var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-chart { margin:1.2em 0 1.5em; padding:12px 14px 8px; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); border-radius:12px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#f6f6f8) 55%, transparent); }
.dsd-chart-title { margin:0 0 4px; font-size:13px; font-weight:650; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-chart svg { display:block; width:100%; height:auto; overflow:visible; }
.dsd-chart-source { margin-top:5px; font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-chart-source summary { cursor:pointer; }
.dsd-chart-source pre { margin:6px 0 0; padding:8px 10px; border-radius:6px; background:var(--dsw-alias-bg-layer-2,#f0f0f4); overflow:auto; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:11px; line-height:1.5; }
.dsd-chart-error { padding:10px 12px; border-radius:8px; border:1px dashed var(--dsw-alias-state-warn-primary,#b06a00); color:var(--dsw-alias-state-warn-primary,#b06a00); font-size:12px; line-height:1.6; }
.dsd-chart-empty { padding:22px 10px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsd-mermaid { margin:1.2em 0 1.5em; padding:8px 10px; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); border-radius:12px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#f6f6f8) 44%, transparent); overflow:hidden; }
.dsd-mermaid-svg { overflow:auto; }
.dsd-mermaid[data-kind="gantt"] .dsd-mermaid-svg { max-height:72vh; }
.dsd-mermaid-hint { padding:2px 4px 6px; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:11px; line-height:1.5; }
.dsd-mermaid svg { display:block; max-width:none !important; height:auto; }
.dsd-mermaid-loading { padding:18px 10px; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsd-mermaid-error { margin:6px 0 8px; padding:10px 12px; border-radius:8px; border:1px dashed var(--dsw-alias-state-error-primary,#c62f45); color:var(--dsw-alias-state-error-primary,#c62f45); font-size:12px; line-height:1.6; }
.dsd-md-table-wrap { margin:1.1em 0 1.4em; overflow:auto; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); border-radius:10px; }
.dsd-md-table { width:100%; border-collapse:collapse; font-size:12.5px; line-height:1.6; }
.dsd-md-table th, .dsd-md-table td { padding:8px 10px; border-bottom:1px solid var(--dsw-alias-border-l1,#e4e4ea); border-right:1px solid var(--dsw-alias-border-l1,#e4e4ea); vertical-align:top; text-align:left; }
.dsd-md-table th:last-child, .dsd-md-table td:last-child { border-right:none; }
.dsd-md-table tbody tr:last-child td { border-bottom:none; }
.dsd-md-table th { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); font-weight:650; white-space:nowrap; }
.dsd-md-table tbody tr:nth-child(even) td { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 3%, transparent); }
.dsd-doc-body a { color:var(--dsw-alias-state-business-primary,#2f6fed); text-decoration:none; }
.dsd-doc-body a:hover { text-decoration:underline; }
.dsd-menu { position:fixed; z-index:2000; min-width:196px; max-width:264px; max-height:min(72vh,420px); overflow:auto; padding:5px; border-radius:10px; background:var(--dsw-alias-bg-layer-2,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 14px 36px rgba(0,0,0,.2); animation:dsd-pop .12s ease-out; }
.dsd-menu-title { padding:6px 9px 4px; font-size:11px; font-weight:700; color:var(--dsw-alias-label-secondary,#6b6b76); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-menu-item { display:flex; align-items:center; gap:8px; width:100%; padding:7px 9px; border:none; border-radius:7px; background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:12.5px; text-align:left; cursor:pointer; }
.dsd-menu-item:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
.dsd-menu-item svg { flex:none; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-menu-item[data-danger] { color:var(--dsw-alias-state-error-primary,#c62f45); }
.dsd-menu-item[data-danger] svg { color:currentColor; }
.dsd-menu-sep { height:1px; margin:5px 4px; background:var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-menu-heading { padding:7px 9px 3px; font-size:10px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-menu-hint { padding:5px 9px 7px; font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); line-height:1.5; }
.dsd-picker { position:absolute; inset:0; z-index:80; display:flex; align-items:center; justify-content:center; padding:22px; background:rgba(9,13,22,.42); animation:dsd-fade .12s ease-out; }
.dsd-picker-card { display:flex; flex-direction:column; width:min(760px,100%); height:min(650px,100%); overflow:hidden; border-radius:14px; background:var(--dsw-alias-bg-layer-1,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 20px 54px rgba(0,0,0,.28); }
.dsd-picker-head { flex:none; display:flex; align-items:flex-start; gap:10px; padding:14px 16px 10px; border-bottom:1px solid var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-picker-heading { flex:1; min-width:0; }
.dsd-picker-title { margin:0; font-size:15px; font-weight:700; }
.dsd-picker-sub { margin-top:2px; font-size:11.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-picker-tools { flex:none; display:flex; align-items:center; gap:8px; padding:10px 16px 6px; }
.dsd-picker-list { flex:1; min-height:0; overflow:auto; padding:0 10px 10px; scrollbar-width:thin; }
.dsd-picker-row { display:flex; align-items:center; gap:10px; width:100%; padding:8px 10px; border:none; border-radius:8px; background:transparent; color:inherit; font:inherit; text-align:left; cursor:pointer; }
.dsd-picker-row:hover:not(:disabled) { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); }
.dsd-picker-row:disabled { opacity:.55; cursor:default; }
.dsd-picker-check { display:flex; align-items:center; justify-content:center; width:17px; height:17px; flex:none; border-radius:5px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); color:transparent; }
.dsd-picker-row[aria-checked=true] .dsd-picker-check { background:var(--dsw-alias-state-business-primary,#2f6fed); border-color:transparent; color:var(--dsw-alias-label-primary-foreground,#0f1115); }
.dsd-picker-text { min-width:0; display:flex; flex-direction:column; gap:1px; flex:1; }
.dsd-picker-name { font-size:12.5px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-picker-path { font-size:10.5px; color:var(--dsw-alias-label-secondary,#6b6b76); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-picker-meta { flex:none; margin-left:8px; font-size:10.5px; color:var(--dsw-alias-label-secondary,#6b6b76); white-space:nowrap; }
.dsd-picker-added { flex:none; margin-left:8px; font-size:10.5px; color:var(--dsw-alias-state-success-primary,#2e9e6b); }
.dsd-picker-status { padding:26px 12px; text-align:center; font-size:12.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-picker-foot { flex:none; display:flex; align-items:center; gap:10px; padding:10px 16px; border-top:1px solid var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-picker-foot-meta { flex:1; min-width:0; font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-modal { position:absolute; inset:0; z-index:90; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(9,13,22,.36); animation:dsd-fade .12s ease-out; }
.dsd-modal-card { width:min(390px,100%); padding:18px; border-radius:14px; background:var(--dsw-alias-bg-layer-1,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 20px 50px rgba(0,0,0,.24); }
.dsd-modal-title { margin:0 0 8px; font-size:14.5px; font-weight:700; }
.dsd-modal-text { margin:0; font-size:12.5px; line-height:1.65; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }
.dsd-toast { position:absolute; left:50%; bottom:18px; z-index:100; transform:translateX(-50%); max-width:calc(100% - 40px); padding:7px 14px; border-radius:999px; background:rgba(18,23,33,.9); color:#fff; font-size:12px; line-height:1.4; text-align:center; pointer-events:none; animation:dsd-fade .15s ease-out; }
.dsd-sidebar-toggle { position:fixed; left:0; top:50%; transform:translateY(-50%); z-index:1200; display:flex; align-items:center; justify-content:center; width:15px; height:62px; padding:0; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); border-left:none; border-radius:0 9px 9px 0; background:var(--dsw-alias-bg-layer-2,#fff); color:var(--dsw-alias-label-secondary,#6b6b76); cursor:pointer; pointer-events:auto; opacity:.72; transition:width .15s ease, opacity .15s ease; }
.dsd-sidebar-toggle:hover { width:22px; opacity:1; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-sidebar-toggle:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:1px; }
.dsd-immersive-exit { position:fixed; top:12px; right:108px; z-index:60; display:inline-flex; align-items:center; gap:6px; height:30px; padding:0 10px; border-radius:999px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); background:var(--dsw-alias-bg-layer-2,#fff); color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:11.5px; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,.18); }
.dsd-immersive-exit:hover { background:var(--dsw-alias-bg-layer-1,#f6f6f8); border-color:var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-immersive-exit:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:1px; }
.dsd-file-action { display:inline-flex; align-items:center; gap:4px; height:24px; padding:0 8px; border-radius:6px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:11.5px; cursor:pointer; white-space:nowrap; }
.dsd-file-action:hover:not(:disabled) { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
.dsd-file-action:disabled { opacity:.55; cursor:default; }
.dsd-file-menu { position:fixed; z-index:2200; min-width:168px; padding:5px; border-radius:9px; background:var(--dsw-alias-bg-layer-2,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 14px 34px rgba(0,0,0,.24); animation:dsd-pop .12s ease-out; }
.dsd-file-menu button { display:flex; align-items:center; gap:8px; width:100%; padding:7px 9px; border:none; border-radius:6px; background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:12.5px; text-align:left; cursor:pointer; }
.dsd-file-menu button:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
@keyframes dsd-fade { from { opacity:0; } to { opacity:1; } }
@keyframes dsd-pop { from { opacity:0; transform:translateY(-4px) scale(.985); } to { opacity:1; transform:none; } }
@media (max-width: 720px) {
  .dsd-count { display:none; }
  .dsd-search input { width:112px; }
  .dsd-toolbar { padding:6px 10px 5px; }
  .dsd-doc-inner { padding:14px 16px 48px; }
  .dsd-picker { padding:8px; }
}
`

    /* ------------------------------------------------------------ components */

    function SidebarToggle({ toggleSidebar }) {
      return h(
        'button',
        {
          className: 'dsd-sidebar-toggle',
          type: 'button',
          title: t('sidebar.toggle'),
          'aria-label': t('sidebar.toggle'),
          onClick: () => toggleSidebar?.(),
        },
        icon('panel', 13),
      )
    }

    function FileAction({ actionUrl }) {
      const [status, setStatus] = useState('idle')
      const [menu, setMenu] = useState(null)
      const ref = useRef(null)
      const coords = useMemo(() => {
        try {
          const url = new URL(String(actionUrl || ''), window.location.href)
          const sessionId = url.searchParams.get('sessionId')
          const seq = url.searchParams.get('seq')
          const index = url.searchParams.get('index')
          if (!sessionId || !seq || !index) return null
          return { sessionId, seq, index }
        } catch {
          return null
        }
      }, [actionUrl])

      const add = useCallback(async () => {
        setMenu(null)
        if (!coords) {
          setStatus('failed')
          return
        }
        setStatus('resolving')
        try {
          const query = new URLSearchParams(coords).toString()
          const response = await fetch(`${API_RESOLVE}?${query}`, { credentials: 'same-origin' })
          const body = await response.json().catch(() => null)
          if (!response.ok || !body || typeof body.path !== 'string') throw new Error('resolve')
          if (!/\.(md|markdown|mdx)$/iu.test(body.path)) {
            setStatus('not-markdown')
            return
          }
          const added = store.addFiles([{ path: body.path, name: body.name || basename(body.path) }], null)
          setStatus(added > 0 ? 'added' : 'already')
        } catch {
          setStatus('failed')
        }
      }, [coords])

      useEffect(() => {
        const card = ref.current && ref.current.closest ? ref.current.closest('[data-presented-file]') : null
        if (!card) return undefined
        const onContext = (event) => {
          event.preventDefault()
          const width = 188
          const height = 54
          setMenu({
            x: Math.max(8, Math.min(event.clientX, window.innerWidth - width - 8)),
            y: Math.max(8, Math.min(event.clientY, window.innerHeight - height - 8)),
          })
        }
        card.addEventListener('contextmenu', onContext)
        return () => card.removeEventListener('contextmenu', onContext)
      }, [])

      useEffect(() => {
        if (!menu) return undefined
        const onDown = (event) => {
          const target = event.target
          if (target && target.closest && target.closest('.dsd-file-menu')) return
          setMenu(null)
        }
        const onKey = (event) => {
          if (event.key === 'Escape') setMenu(null)
        }
        document.addEventListener('pointerdown', onDown, true)
        document.addEventListener('keydown', onKey)
        return () => {
          document.removeEventListener('pointerdown', onDown, true)
          document.removeEventListener('keydown', onKey)
        }
      }, [menu])

      const label =
        status === 'resolving'
          ? t('context.resolving')
          : status === 'added' || status === 'already'
            ? t('context.added')
            : status === 'failed'
              ? t('context.failed')
              : status === 'not-markdown'
                ? t('context.notMarkdown')
                : t('context.addToLibrary')

      return h(
        React.Fragment,
        null,
        h(
          'button',
          {
            ref,
            className: 'dsd-file-action',
            type: 'button',
            onClick: add,
            disabled: status === 'resolving' || status === 'added' || status === 'already',
            title: label,
          },
          icon('file-plus', 12),
          h('span', null, label),
        ),
        menu
          ? h(
              'div',
              { className: 'dsd-file-menu', style: { left: `${menu.x}px`, top: `${menu.y}px` }, role: 'menu' },
              h('button', { type: 'button', role: 'menuitem', onClick: add }, icon('file-plus', 13), h('span', null, t('context.addToLibrary'))),
            )
          : null,
      )
    }

    function PanelPage({ toggleHostSidebar }) {
      const library = useLibrary()
      const bookmarks = useBookmarks()
      const [currentFolder, setCurrentFolder] = useState(null)
      const [viewport, setViewport] = useState({ width: 0, height: 0 })
      const [selected, setSelected] = useState(() => new Set())
      const [immersive, setImmersive] = useState(false)
      const [bookmarksOpen, setBookmarksOpen] = useState(false)
      const [bookmarkEdit, setBookmarkEdit] = useState(null)
      const [resumeDismissedPath, setResumeDismissedPath] = useState(null)
      const [menu, setMenu] = useState(null)
      const [renaming, setRenaming] = useState(null)
      const [drag, setDrag] = useState(null)
      const [marquee, setMarquee] = useState(null)
      const [dropFolder, setDropFolder] = useState(null)
      const [dropSlot, setDropSlot] = useState(null)
      const [picker, setPicker] = useState({ open: false, status: 'idle', files: [], roots: [], truncated: false, partial: false, error: null, query: '', selected: new Set() })
      const [doc, setDoc] = useState({ status: 'idle' })
      const [docReload, setDocReload] = useState(0)
      const [search, setSearch] = useState('')
      const [toast, setToast] = useState(null)
      const [confirmState, setConfirmState] = useState(null)

      const panelRef = useRef(null)
      const desktopRef = useRef(null)
      const docScrollRef = useRef(null)
      const docScrollSaveTimer = useRef(0)
      const readingReadyRef = useRef(false)
      const positionSaveBlockedUntil = useRef(0)
      const dragRef = useRef(null)
      const marqueeRef = useRef(null)
      const selectedRef = useRef(selected)
      selectedRef.current = selected
      const immersiveRef = useRef(false)
      immersiveRef.current = immersive
      const scrollLockRef = useRef(null)
      const sidebarToggledRef = useRef(false)
      const renameRef = useRef(null)
      const toastTimer = useRef(0)
      const pickerToken = useRef(0)
      const docCache = useRef(new Map())
      const docAbort = useRef(null)
      const prevColumns = useRef(0)

      const showToast = useCallback((text) => {
        window.clearTimeout(toastTimer.current)
        setToast(text)
        toastTimer.current = window.setTimeout(() => setToast(null), 2300)
      }, [])

      useEffect(() => () => {
        window.clearTimeout(toastTimer.current)
        window.clearTimeout(docScrollSaveTimer.current)
        try {
          docAbort.current?.abort()
        } catch {
          /* ignore */
        }
      }, [])

      useEffect(() => {
        if (currentFolder && !library.folders[currentFolder]) setCurrentFolder(null)
      }, [library.folders, currentFolder])

      useEffect(() => {
        const element = desktopRef.current
        if (!element) return undefined
        const measure = () => {
          const width = element.clientWidth
          const height = element.clientHeight
          if (width > 0 && height > 0) setViewport((previous) => (previous.width === width && previous.height === height ? previous : { width, height }))
        }
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(element)
        return () => observer.disconnect()
      }, [library.activeTab])

      useEffect(() => {
        if (desktopRef.current) desktopRef.current.scrollTop = 0
      }, [currentFolder])

      const allEntries = useMemo(() => {
        const folders = Object.values(library.folders)
          .filter((folder) => (folder.parentId ?? null) === currentFolder)
          .map((folder) => ({ kind: 'folder', key: folder.id, id: folder.id, name: folder.name, x: folder.x, y: folder.y, count: countChildren(library, folder.id), addedAt: 0 }))
        const files = Object.values(library.items)
          .filter((item) => (item.folderId ?? null) === currentFolder)
          .map((item) => ({ kind: 'file', key: item.path, id: item.path, name: item.name || basename(item.path), path: item.path, x: item.x, y: item.y, addedAt: item.addedAt || 0 }))
        return [...folders, ...files]
      }, [library, currentFolder])

      const columns = Math.max(1, gridColumns(viewport.width))
      const maxRow = allEntries.reduce((max, entry) => {
        const slot = positionSlot(entry.x, entry.y, columns)
        return slot ? Math.max(max, slot.row) : max
      }, 0)
      const rowCount = Math.max(1, Math.ceil(allEntries.length / columns), maxRow + 1)
      const visibleRows = Math.max(1, Math.floor((viewport.height - PAD * 2) / CELL_H))
      const targetRows = Math.max(rowCount, visibleRows)
      const canvasHeight = Math.max(viewport.height, PAD * 2 + rowCount * CELL_H)

      const entries = useMemo(() => {
        const query = search.trim().toLowerCase()
        const filtered = query
          ? allEntries.filter((entry) => entry.name.toLowerCase().includes(query) || (entry.kind === 'file' && entry.path.toLowerCase().includes(query)))
          : allEntries
        return filtered.slice().sort((left, right) => (left.y ?? 0) - (right.y ?? 0) || (left.x ?? 0) - (right.x ?? 0))
      }, [allEntries, search])

      const selectedEntries = useMemo(() => allEntries.filter((entry) => selected.has(entryKey(entry))), [allEntries, selected])

      useEffect(() => {
        const visible = new Set(entries.map(entryKey))
        setSelected((previous) => {
          if (previous.size === 0) return previous
          const next = new Set([...previous].filter((key) => visible.has(key)))
          return next.size === previous.size ? previous : next
        })
      }, [entries])

      useEffect(() => {
        if (viewport.width < ICON_W + PAD * 2) return
        const gridColumnsNow = Math.max(1, gridColumns(viewport.width))
        const reflowAll = prevColumns.current !== gridColumnsNow
        prevColumns.current = gridColumnsNow
        const ordered = allEntries.slice().sort((left, right) => {
          const leftSlot = positionSlot(left.x, left.y, gridColumnsNow)
          const rightSlot = positionSlot(right.x, right.y, gridColumnsNow)
          const leftIndex = leftSlot ? leftSlot.index : Number.MAX_SAFE_INTEGER
          const rightIndex = rightSlot ? rightSlot.index : Number.MAX_SAFE_INTEGER
          return leftIndex - rightIndex || (left.addedAt ?? 0) - (right.addedAt ?? 0) || left.name.localeCompare(right.name)
        })
        const used = new Set()
        const targets = new Map()
        if (!reflowAll) {
          for (const entry of ordered) {
            const slot = positionSlot(entry.x, entry.y, gridColumnsNow)
            if (!slot || used.has(slot.index)) continue
            used.add(slot.index)
            targets.set(entry.key, slot)
          }
        }
        let cursor = 0
        for (const entry of ordered) {
          if (targets.has(entry.key)) continue
          while (used.has(cursor)) cursor += 1
          const slot = slotPosition(cursor, gridColumnsNow)
          used.add(cursor)
          targets.set(entry.key, slot)
          cursor += 1
        }
        const updates = []
        for (const entry of allEntries) {
          const target = targets.get(entry.key)
          if (!target) continue
          if (entry.x !== target.x || entry.y !== target.y) updates.push({ kind: entry.kind, id: entry.id, x: target.x, y: target.y })
        }
        if (updates.length > 0) store.setPositions(updates)
      }, [viewport, allEntries, currentFolder])

      const activePath = library.activeTab === 'home' ? null : library.activeTab
      const activeItem = activePath ? library.items[activePath] : null
      const lastPosition = activePath ? bookmarkStore.getState().positions[activePath] || null : null
      const activeBookmarks = useMemo(() => {
        if (!activePath) return []
        return [...(bookmarks.bookmarks[activePath] || [])].sort((left, right) => left.ratio - right.ratio || left.createdAt - right.createdAt)
      }, [bookmarks, activePath])

      const captureDocPosition = useCallback(() => {
        const scroll = docScrollRef.current
        if (!scroll) return null
        const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight)
        const ratio = max > 0 ? clamp(scroll.scrollTop / max, 0, 1) : 0
        let blockIndex = 0
        let label = ''
        const body = scroll.querySelector('.dsd-doc-body')
        if (body) {
          const children = Array.from(body.children)
          const viewportTop = scroll.getBoundingClientRect().top
          let headingLabel = ''
          for (const heading of body.querySelectorAll('h1,h2,h3,h4')) {
            if (heading.getBoundingClientRect().top - viewportTop <= 8) {
              headingLabel = (heading.innerText || heading.textContent || '').replace(/\s+/gu, ' ').trim()
            } else {
              break
            }
          }
          let best = 0
          for (let index = 0; index < children.length; index += 1) {
            const rect = children[index].getBoundingClientRect()
            if (rect.top - viewportTop <= 28) best = index
            else break
          }
          const block = children[best]
          blockIndex = best
          const blockLabel = (block?.innerText || block?.textContent || '').replace(/\s+/gu, ' ').trim()
          if (headingLabel) label = headingLabel
          else if (blockLabel) label = blockLabel.replace(/`{2,}[A-Za-z0-9_-]*/gu, ' ').replace(/\s+/gu, ' ').trim()
        }
        if (!label) label = t('bookmarks.positionLabel', { percent: Math.round(ratio * 100) })
        return { ratio, blockIndex, label: label.slice(0, 80), updatedAt: Date.now() }
      }, [])

      const jumpToPosition = useCallback((position) => {
        const scroll = docScrollRef.current
        if (!scroll || !position) return
        const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight)
        const top = clamp(Number(position.ratio) || 0, 0, 1) * max
        try {
          scroll.scrollTo({ top, behavior: 'smooth' })
        } catch {
          scroll.scrollTop = top
        }
        setBookmarksOpen(false)
        setBookmarkEdit(null)
      }, [])

      const addBookmark = useCallback(() => {
        if (!activePath || doc.status !== 'ready') return
        const position = captureDocPosition()
        if (!position) return
        bookmarkStore.addBookmark(activePath, position)
        showToast(t('bookmarks.added'))
      }, [activePath, doc.status, captureDocPosition, showToast])

      const handleDocScroll = useCallback(() => {
        if (!activePath || !readingReadyRef.current || Date.now() < positionSaveBlockedUntil.current) return
        window.clearTimeout(docScrollSaveTimer.current)
        docScrollSaveTimer.current = window.setTimeout(() => {
          if (!activePath || !readingReadyRef.current || Date.now() < positionSaveBlockedUntil.current) return
          const position = captureDocPosition()
          if (position) bookmarkStore.savePosition(activePath, position)
        }, 250)
      }, [activePath, captureDocPosition])

      useEffect(() => {
        readingReadyRef.current = false
        window.clearTimeout(docScrollSaveTimer.current)
        if (!activePath || doc.status !== 'ready') return undefined
        const timer = window.setTimeout(() => {
          readingReadyRef.current = true
        }, 500)
        return () => {
          window.clearTimeout(timer)
          readingReadyRef.current = false
        }
      }, [activePath, doc.status])

      useEffect(() => {
        setBookmarksOpen(false)
        setBookmarkEdit(null)
        if (docScrollRef.current) docScrollRef.current.scrollTop = 0
      }, [activePath])

      useEffect(() => {
        if (!bookmarksOpen) return undefined
        const onDown = (event) => {
          const target = event.target
          if (target && target.closest && (target.closest('.dsd-bookmarks-popover') || target.closest('[data-dsd-bookmark-toggle]'))) return
          setBookmarksOpen(false)
          setBookmarkEdit(null)
        }
        document.addEventListener('pointerdown', onDown, true)
        return () => document.removeEventListener('pointerdown', onDown, true)
      }, [bookmarksOpen])

      const restoreImmersive = useCallback(() => {
        const saved = scrollLockRef.current
        if (saved) {
          document.body.style.overflow = saved.body
          document.documentElement.style.overflow = saved.html
          scrollLockRef.current = null
        }
        document.body.classList.remove('dsd-immersive')
      }, [])

      const restoreSidebar = useCallback(() => {
        if (!sidebarToggledRef.current) return
        sidebarToggledRef.current = false
        const invoke = () => {
          try {
            toggleHostSidebar?.()
          } catch {
            /* layout may be gone */
          }
        }
        window.setTimeout(invoke, 50)
      }, [toggleHostSidebar])

      const exitImmersive = useCallback(() => {
        if (!immersiveRef.current) return
        immersiveRef.current = false
        setImmersive(false)
        restoreImmersive()
        if (document.fullscreenElement === panelRef.current) {
          try {
            const promise = document.exitFullscreen?.()
            if (promise && typeof promise.then === 'function') promise.then(restoreSidebar, restoreSidebar)
            else restoreSidebar()
          } catch {
            restoreSidebar()
          }
        } else {
          restoreSidebar()
        }
      }, [restoreImmersive, restoreSidebar])

      const enterImmersive = useCallback(() => {
        if (immersiveRef.current) return
        const element = panelRef.current
        if (!element || element.getClientRects().length === 0) return
        immersiveRef.current = true
        setImmersive(true)
        if (!scrollLockRef.current) {
          scrollLockRef.current = {
            body: document.body.style.overflow,
            html: document.documentElement.style.overflow,
          }
        }
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'
        document.body.classList.add('dsd-immersive')
        if (typeof toggleHostSidebar === 'function') {
          sidebarToggledRef.current = true
          try {
            toggleHostSidebar()
          } catch {
            /* layout may be unmounted */
          }
        }
        if (element && !document.fullscreenElement && typeof element.requestFullscreen === 'function' && document.fullscreenEnabled !== false) {
          try {
            const promise = element.requestFullscreen({ navigationUI: 'hide' })
            if (promise && typeof promise.catch === 'function') promise.catch(() => {})
          } catch {
            /* CSS immersive mode is the fallback */
          }
        }
      }, [toggleHostSidebar])

      const toggleImmersive = useCallback(() => {
        if (immersiveRef.current) exitImmersive()
        else enterImmersive()
      }, [enterImmersive, exitImmersive])

      useEffect(() => {
        const onChange = () => {
          if (!document.fullscreenElement && immersiveRef.current) exitImmersive()
        }
        document.addEventListener('fullscreenchange', onChange)
        return () => document.removeEventListener('fullscreenchange', onChange)
      }, [exitImmersive])

      useEffect(
        () => () => {
          restoreImmersive()
          const finish = () => restoreSidebar()
          if (document.fullscreenElement === panelRef.current) {
            try {
              const promise = document.exitFullscreen?.()
              if (promise && typeof promise.then === 'function') promise.then(finish, finish)
              else finish()
            } catch {
              finish()
            }
          } else {
            finish()
          }
        },
        [restoreImmersive, restoreSidebar],
      )

      useEffect(() => {
        if (!activePath) {
          setDoc({ status: 'idle' })
          return undefined
        }
        const cached = docCache.current.get(activePath)
        if (cached) {
          setDoc(cached)
          return undefined
        }
        const controller = new AbortController()
        docAbort.current = controller
        setDoc({ status: 'loading', path: activePath })
        fetch(`${API_READ}?path=${encodeURIComponent(activePath)}`, { signal: controller.signal, credentials: 'same-origin' })
          .then(async (response) => {
            const body = await response.json().catch(() => null)
            if (!response.ok) throw new Error(body && body.error ? body.error : `HTTP ${response.status}`)
            const next = {
              status: 'ready',
              path: body.path || activePath,
              name: body.name || basename(activePath),
              content: body.content || '',
              truncated: Boolean(body.truncated),
              size: body.size,
              mtime: body.mtime,
            }
            docCache.current.set(activePath, next)
            setDoc(next)
          })
          .catch((error) => {
            if (error && error.name === 'AbortError') return
            setDoc({ status: 'error', path: activePath, error: error && error.message ? error.message : String(error) })
          })
        return () => controller.abort()
      }, [activePath, docReload])

      const reloadDoc = useCallback(() => {
        if (!activePath) return
        docCache.current.delete(activePath)
        setDocReload((value) => value + 1)
      }, [activePath])

      const copyText = useCallback(
        (text) => {
          const done = () => showToast(t('toast.copied'))
          const failed = () => showToast(t('toast.copyFailed'))
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(done).catch(failed)
              return
            }
          } catch {
            /* fall through */
          }
          failed()
        },
        [showToast],
      )

      const openPicker = useCallback(async () => {
        const token = (pickerToken.current += 1)
        setPicker({ open: true, status: 'loading', files: [], roots: [], truncated: false, partial: false, error: null, query: '', selected: new Set() })
        try {
          const response = await fetch(`${API_LIST}?refresh=1`, { credentials: 'same-origin' })
          const body = await response.json().catch(() => null)
          if (!response.ok) throw new Error(body && body.error ? body.error : `HTTP ${response.status}`)
          if (token !== pickerToken.current) return
          setPicker((previous) => ({
            ...previous,
            status: 'ready',
            files: Array.isArray(body.files) ? body.files : [],
            roots: Array.isArray(body.roots) ? body.roots : [],
            truncated: Boolean(body.truncated),
            partial: Boolean(body.partial),
            error: null,
          }))
        } catch (error) {
          if (token !== pickerToken.current) return
          setPicker((previous) => ({ ...previous, status: 'error', error: error && error.message ? error.message : String(error) }))
        }
      }, [])

      const closePicker = useCallback(() => {
        pickerToken.current += 1
        setPicker((previous) => ({ ...previous, open: false }))
      }, [])

      const addSelected = useCallback(() => {
        const chosen = picker.files.filter((file) => picker.selected.has(file.path))
        if (chosen.length === 0) return
        const added = store.addFiles(chosen.map((file) => ({ path: file.path, name: file.name })), currentFolder)
        closePicker()
        showToast(added > 0 ? t('toast.added', { count: added }) : t('toast.already'))
      }, [picker.files, picker.selected, currentFolder, closePicker, showToast])

      const createFolder = useCallback(() => {
        const name = uniqueFolderName(library.folders, currentFolder, t('folder.defaultName'))
        const id = store.addFolder(name, currentFolder)
        renameRef.current = { kind: 'folder', key: id }
        setRenaming({ kind: 'folder', key: id })
        showToast(t('toast.folderCreated'))
      }, [library.folders, currentFolder, showToast])

      const commitRename = useCallback((raw) => {
        const pending = renameRef.current
        renameRef.current = null
        setRenaming(null)
        if (!pending) return
        const text = String(raw ?? '').trim().slice(0, 80)
        if (!text) return
        store.rename(pending.kind, pending.key, text)
      }, [])

      const startRename = useCallback((entry) => {
        const pending = { kind: entry.kind, key: entry.id }
        renameRef.current = pending
        setRenaming(pending)
        setMenu(null)
      }, [])

      const openEntry = useCallback((entry) => {
        if (entry.kind === 'folder') {
          setCurrentFolder(entry.id)
          setSelected(new Set())
          setMenu(null)
          return
        }
        store.openDoc(entry.path)
        setMenu(null)
      }, [])

      const removeItem = useCallback(
        (path) => {
          store.removeItem(path)
          setMenu(null)
          setSelected((previous) => {
            if (!previous.has(`file:${path}`)) return previous
            const next = new Set(previous)
            next.delete(`file:${path}`)
            return next
          })
          showToast(t('toast.removed'))
        },
        [showToast],
      )

      const moveEntry = useCallback(
        (entry, targetFolderId) => {
          store.move(entry.kind, entry.id, targetFolderId)
          setMenu(null)
          showToast(t('toast.moved'))
        },
        [showToast],
      )

      const requestDeleteFolder = useCallback(
        (folder) => {
          const count = countFilesIn(library.folders, library.items, folder.id)
          setMenu(null)
          setConfirmState({
            title: t('confirm.deleteTitle'),
            message: count > 0 ? t('confirm.deleteWithFiles', { count }) : t('confirm.deleteEmpty'),
            onConfirm: () => {
              const parent = store.removeFolder(folder.id)
              if (currentFolder && descendantFolders(library.folders, folder.id).has(currentFolder)) setCurrentFolder(parent)
              setSelected(new Set())
              setConfirmState(null)
              showToast(t('toast.folderDeleted'))
            },
          })
        },
        [library.folders, library.items, currentFolder, showToast],
      )

      const deleteSelection = useCallback(() => {
        const chosen = allEntries.filter((entry) => selectedRef.current.has(entryKey(entry)))
        if (chosen.length === 0) return
        if (chosen.length === 1 && chosen[0].kind === 'file') {
          store.removeItem(chosen[0].id)
          setSelected(new Set())
          setMenu(null)
          showToast(t('toast.removed'))
          return
        }
        setMenu(null)
        setConfirmState({
          title: t('confirm.removeTitle'),
          message: t('confirm.removeMany', { count: chosen.length }),
          confirmLabel: t('confirm.remove'),
          onConfirm: () => {
            for (const entry of chosen) {
              if (entry.kind === 'file') store.removeItem(entry.id)
              else store.removeFolder(entry.id)
            }
            setSelected(new Set())
            setConfirmState(null)
            showToast(t('toast.removed'))
          },
        })
      }, [allEntries, showToast])

      const moveSelection = useCallback(
        (targetFolderId) => {
          const chosen = allEntries.filter((entry) => selectedRef.current.has(entryKey(entry)))
          if (chosen.length === 0) return 0
          let moved = 0
          for (const entry of chosen) {
            if (entry.kind === 'folder') {
              if (targetFolderId === entry.id) continue
              if (targetFolderId && descendantFolders(library.folders, entry.id).has(targetFolderId)) continue
            }
            store.move(entry.kind, entry.id, targetFolderId)
            moved += 1
          }
          setSelected(new Set())
          setMenu(null)
          showToast(moved > 0 ? t('toast.movedMany', { count: moved }) : t('toast.noMove'))
          return moved
        },
        [allEntries, library.folders, showToast],
      )

      const onPointerDown = useCallback(
        (event, entry) => {
          if (event.button !== 0 && event.pointerType === 'mouse') return
          if (renameRef.current) return
          try {
            event.currentTarget.setPointerCapture(event.pointerId)
          } catch {
            /* ignore */
          }
          const key = entryKey(entry)
          const currentSelected = selectedRef.current
          const groupEntries =
            currentSelected.has(key) && currentSelected.size > 1
              ? entries.filter((candidate) => currentSelected.has(entryKey(candidate)))
              : [entry]
          if (!currentSelected.has(key) || currentSelected.size === 1) setSelected(new Set([key]))
          const frame = desktopRef.current
          let startCanvasX = event.clientX
          let startCanvasY = event.clientY
          if (frame) {
            const rect = frame.getBoundingClientRect()
            startCanvasX = event.clientX - rect.left + frame.scrollLeft
            startCanvasY = event.clientY - rect.top + frame.scrollTop
          }
          dragRef.current = {
            anchorKey: key,
            group: groupEntries.map((candidate) => ({
              kind: candidate.kind,
              id: candidate.id,
              key: entryKey(candidate),
              originX: Number.isFinite(candidate.x) ? candidate.x : PAD,
              originY: Number.isFinite(candidate.y) ? candidate.y : PAD,
            })),
            startCanvasX,
            startCanvasY,
            moved: false,
          }
          setDropSlot(null)
          setMenu(null)
        },
        [entries],
      )

      const onDesktopPointerDown = useCallback((event) => {
        if (event.button !== 2) return
        const target = event.target
        if (target && target.closest && target.closest('.dsd-item')) return
        const frame = desktopRef.current
        if (!frame) return
        event.preventDefault()
        const rect = frame.getBoundingClientRect()
        const x = event.clientX - rect.left + frame.scrollLeft
        const y = event.clientY - rect.top + frame.scrollTop
        marqueeRef.current = {
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
          initial: new Set(selectedRef.current),
          additive: event.ctrlKey || event.metaKey,
          moved: false,
        }
        setMarquee({ left: x, top: y, width: 0, height: 0 })
        setMenu(null)
        try {
          frame.setPointerCapture(event.pointerId)
        } catch {
          /* ignore */
        }
      }, [])

      const onPointerMove = useCallback(
        (event) => {
          if (marqueeRef.current) {
            const frame = desktopRef.current
            if (!frame) return
            const current = marqueeRef.current
            const rect = frame.getBoundingClientRect()
            const x = event.clientX - rect.left + frame.scrollLeft
            const y = event.clientY - rect.top + frame.scrollTop
            current.currentX = x
            current.currentY = y
            if (Math.abs(x - current.startX) > 3 || Math.abs(y - current.startY) > 3) current.moved = true
            const left = Math.min(current.startX, x)
            const top = Math.min(current.startY, y)
            const width = Math.abs(x - current.startX)
            const height = Math.abs(y - current.startY)
            setMarquee({ left, top, width, height })
            const selectionRect = { left, top, right: left + width, bottom: top + height }
            const keys = entries
              .filter(
                (entry) =>
                  Number.isFinite(entry.x) &&
                  Number.isFinite(entry.y) &&
                  rectsIntersect({ left: entry.x, top: entry.y, right: entry.x + ICON_W, bottom: entry.y + ICON_H }, selectionRect),
              )
              .map(entryKey)
            setSelected(current.additive ? new Set([...current.initial, ...keys]) : new Set(keys))
            return
          }
          const current = dragRef.current
          const frame = desktopRef.current
          if (!current || !frame) return
          const rect = frame.getBoundingClientRect()
          const canvasX = event.clientX - rect.left + frame.scrollLeft
          const canvasY = event.clientY - rect.top + frame.scrollTop
          const dx = canvasX - current.startCanvasX
          const dy = canvasY - current.startCanvasY
          if (!current.moved && Math.hypot(dx, dy) < 4) return
          current.moved = true
          const group = current.group
          const minX = Math.min(...group.map((item) => item.originX))
          const maxX = Math.max(...group.map((item) => item.originX + ICON_W))
          const minY = Math.min(...group.map((item) => item.originY))
          const maxY = Math.max(...group.map((item) => item.originY + ICON_H))
          const minDx = PAD - minX
          const maxDx = frame.clientWidth - PAD - maxX
          const minDy = PAD - minY
          const maxDy = canvasHeight - PAD - maxY
          const clampedDx = maxDx >= minDx ? clamp(dx, minDx, maxDx) : 0
          const clampedDy = maxDy >= minDy ? clamp(dy, minDy, maxDy) : 0
          const items = {}
          for (const item of group) items[item.key] = { x: item.originX + clampedDx, y: item.originY + clampedDy }
          setDrag({ items, anchorKey: current.anchorKey })
          const anchor = group.find((item) => item.key === current.anchorKey) || group[0]
          const anchorPos = items[anchor.key]
          setDropSlot(nearestSlot(anchorPos.x + ICON_W / 2, anchorPos.y + ICON_CENTER_Y, columns, targetRows))
          const selectedFolderIds = new Set(group.filter((item) => item.kind === 'folder').map((item) => item.id))
          let folderId = null
          try {
            for (const holder of document.querySelectorAll('[data-dsd-folder-id]')) {
              const holderId = holder.getAttribute('data-dsd-folder-id')
              if (!holderId || selectedFolderIds.has(holderId)) continue
              const rectOfFolder = holder.getBoundingClientRect()
              if (event.clientX >= rectOfFolder.left && event.clientX <= rectOfFolder.right && event.clientY >= rectOfFolder.top && event.clientY <= rectOfFolder.bottom) {
                folderId = holderId
                break
              }
            }
          } catch {
            folderId = null
          }
          if (folderId !== dropFolder) setDropFolder(folderId)
        },
        [canvasHeight, columns, targetRows, dropFolder, entries],
      )

      const onPointerUp = useCallback(
        (event) => {
          if (marqueeRef.current) {
            const frame = desktopRef.current
            const current = marqueeRef.current
            marqueeRef.current = null
            setMarquee(null)
            if (!current.moved) setSelected(new Set())
            try {
              frame?.releasePointerCapture(event.pointerId)
            } catch {
              /* ignore */
            }
            return
          }
          const current = dragRef.current
          const frame = desktopRef.current
          dragRef.current = null
          setDropSlot(null)
          if (!current || !frame) {
            setDrag(null)
            setDropFolder(null)
            return
          }
          if (current.moved) {
            const rect = frame.getBoundingClientRect()
            const canvasX = event.clientX - rect.left + frame.scrollLeft
            const canvasY = event.clientY - rect.top + frame.scrollTop
            const dx = canvasX - current.startCanvasX
            const dy = canvasY - current.startCanvasY
            const group = current.group
            const minX = Math.min(...group.map((item) => item.originX))
            const maxX = Math.max(...group.map((item) => item.originX + ICON_W))
            const minY = Math.min(...group.map((item) => item.originY))
            const maxY = Math.max(...group.map((item) => item.originY + ICON_H))
            const minDx = PAD - minX
            const maxDx = frame.clientWidth - PAD - maxX
            const minDy = PAD - minY
            const maxDy = canvasHeight - PAD - maxY
            const clampedDx = maxDx >= minDx ? clamp(dx, minDx, maxDx) : 0
            const clampedDy = maxDy >= minDy ? clamp(dy, minDy, maxDy) : 0
            if (group.length === 1) {
              const anchor = group[0]
              const position = clampToCanvas(anchor.originX + clampedDx, anchor.originY + clampedDy, frame.clientWidth, canvasHeight)
              const target = nearestSlot(position.x + ICON_W / 2, position.y + ICON_CENTER_Y, columns, targetRows)
              const forbiddenFolder = anchor.kind === 'folder' && dropFolder && descendantFolders(library.folders, anchor.id).has(dropFolder)
              if (dropFolder && !forbiddenFolder) {
                store.move(anchor.kind, anchor.id, dropFolder)
                showToast(t('toast.moved'))
              } else if (!forbiddenFolder && target) {
                const occupant = allEntries.find((entry) => {
                  if (entry.kind === anchor.kind && entry.id === anchor.id) return false
                  const slot = positionSlot(entry.x, entry.y, columns)
                  return Boolean(slot && slot.index === target.index)
                })
                if (occupant) {
                  store.setPositions([
                    { kind: anchor.kind, id: anchor.id, x: target.x, y: target.y },
                    { kind: occupant.kind, id: occupant.id, x: anchor.originX, y: anchor.originY },
                  ])
                  showToast(t('toast.moved'))
                } else if (anchor.originX !== target.x || anchor.originY !== target.y) {
                  store.setPositions([{ kind: anchor.kind, id: anchor.id, x: target.x, y: target.y }])
                  showToast(t('toast.moved'))
                }
              }
            } else if (
              dropFolder &&
              !group.some((item) => item.kind === 'folder' && (item.id === dropFolder || descendantFolders(library.folders, item.id).has(dropFolder)))
            ) {
              moveSelection(dropFolder)
            } else {
              const anchor = group.find((item) => item.key === current.anchorKey) || group[0]
              const anchorPos = { x: anchor.originX + clampedDx, y: anchor.originY + clampedDy }
              const target = nearestSlot(anchorPos.x + ICON_W / 2, anchorPos.y + ICON_CENTER_Y, columns, targetRows)
              const anchorOrigin = positionSlot(anchor.originX, anchor.originY, columns)
              if (anchorOrigin && target) {
                const groupKeys = new Set(group.map((item) => item.key))
                const occupied = new Set()
                for (const entry of allEntries) {
                  if (groupKeys.has(entryKey(entry))) continue
                  const slot = positionSlot(entry.x, entry.y, columns)
                  if (slot) occupied.add(slot.index)
                }
                const updates = findGroupPlacement(group, target.col - anchorOrigin.col, target.row - anchorOrigin.row, columns, occupied)
                if (updates) {
                  store.setPositions(updates)
                  showToast(t('toast.moved'))
                } else {
                  showToast(t('toast.noRoom'))
                }
              } else {
                showToast(t('toast.noRoom'))
              }
            }
          }
          setDrag(null)
          setDropFolder(null)
        },
        [allEntries, canvasHeight, columns, dropFolder, library.folders, targetRows, showToast, moveSelection],
      )

      useEffect(() => {
        if (!menu) return undefined
        const onDown = (event) => {
          const target = event.target
          if (target && target.closest && target.closest('.dsd-menu')) return
          setMenu(null)
        }
        document.addEventListener('pointerdown', onDown, true)
        return () => document.removeEventListener('pointerdown', onDown, true)
      }, [menu])

      useEffect(() => {
        const onKey = (event) => {
          const target = event.target
          const editing = Boolean(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable))
          const panel = panelRef.current
          const panelVisible = Boolean(panel && panel.isConnected && panel.getClientRects().length > 0)
          if ((event.key === 'f' || event.key === 'F') && !event.repeat && !editing && panelVisible && !picker.open && !renaming && !confirmState && !menu && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault()
            toggleImmersive()
            return
          }
          if ((event.key === 'b' || event.key === 'B') && !event.repeat && !editing && panelVisible && activePath && doc.status === 'ready' && !picker.open && !renaming && !confirmState && !menu && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault()
            addBookmark()
            return
          }
          if (event.key === 'Escape') {
            if (menu) return setMenu(null)
            if (renaming) {
              renameRef.current = null
              return setRenaming(null)
            }
            if (confirmState) return setConfirmState(null)
            if (picker.open) return closePicker()
            if (bookmarksOpen) {
              setBookmarksOpen(false)
              setBookmarkEdit(null)
              return
            }
            if (immersive) {
              event.preventDefault()
              return exitImmersive()
            }
            if (selected.size > 0) return setSelected(new Set())
            return
          }
          if ((event.key === 'Delete' || event.key === 'Backspace') && library.activeTab === 'home') {
            if (picker.open || renaming || confirmState) return
            if (editing) return
            if (selectedRef.current.size === 0) return
            event.preventDefault()
            deleteSelection()
          }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [menu, renaming, confirmState, picker.open, selected, library.activeTab, deleteSelection, closePicker, immersive, toggleImmersive, exitImmersive, bookmarksOpen, activePath, doc.status, addBookmark])

      const chain = useMemo(() => folderChain(library.folders, currentFolder), [library.folders, currentFolder])
      const contextEntry = useMemo(() => {
        if (!menu) return null
        return allEntries.find((entry) => entry.kind === menu.kind && entry.id === menu.key) || null
      }, [menu, allEntries])

      const menuBulk = Boolean(contextEntry && selectedEntries.length > 1 && selected.has(entryKey(contextEntry)))

      const menuFolders = useMemo(() => {
        if (!contextEntry) return []
        const blocked = contextEntry.kind === 'folder' ? descendantFolders(library.folders, contextEntry.id) : new Set()
        const result = []
        if (currentFolder) result.push({ id: null, name: t('menu.root') })
        for (const folder of Object.values(library.folders).sort((left, right) => left.name.localeCompare(right.name))) {
          if (folder.id === currentFolder) continue
          if (blocked.has(folder.id)) continue
          result.push({ id: folder.id, name: folder.name })
        }
        return result
      }, [contextEntry, library.folders, currentFolder])

      const bulkMoveFolders = useMemo(() => {
        if (!menuBulk) return []
        const blocked = new Set()
        for (const entry of selectedEntries) {
          if (entry.kind !== 'folder') continue
          blocked.add(entry.id)
          for (const descendant of descendantFolders(library.folders, entry.id)) blocked.add(descendant)
        }
        const result = []
        if (currentFolder) result.push({ id: null, name: t('menu.root') })
        for (const folder of Object.values(library.folders).sort((left, right) => left.name.localeCompare(right.name))) {
          if (folder.id === currentFolder) continue
          if (blocked.has(folder.id)) continue
          result.push({ id: folder.id, name: folder.name })
        }
        return result
      }, [menuBulk, selectedEntries, library.folders, currentFolder])

      const pickerRows = useMemo(() => {
        const query = picker.query.trim().toLowerCase()
        return picker.files.filter((file) => {
          if (!query) return true
          return file.name.toLowerCase().includes(query) || file.rel.toLowerCase().includes(query) || file.rootTitle.toLowerCase().includes(query)
        })
      }, [picker.files, picker.query])

      const togglePicked = useCallback(
        (path) => {
          setPicker((previous) => {
            if (library.items[path]) return previous
            const selectedSet = new Set(previous.selected)
            if (selectedSet.has(path)) selectedSet.delete(path)
            else selectedSet.add(path)
            return { ...previous, selected: selectedSet }
          })
        },
        [library.items],
      )

      const selectAllVisible = useCallback(() => {
        setPicker((previous) => {
          const selectedSet = new Set(previous.selected)
          const query = previous.query.trim().toLowerCase()
          for (const file of previous.files) {
            if (library.items[file.path]) continue
            if (query && !(file.name.toLowerCase().includes(query) || file.rel.toLowerCase().includes(query) || file.rootTitle.toLowerCase().includes(query))) continue
            selectedSet.add(file.path)
          }
          return { ...previous, selected: selectedSet }
        })
      }, [library.items])

      const renderTab = (tab) => {
        if (tab === 'home') {
          return h(
            'button',
            { key: 'home', className: 'dsd-tab', type: 'button', 'data-active': library.activeTab === 'home' ? 'true' : 'false', onClick: () => store.setActive('home') },
            icon('home', 13),
            h('span', { className: 'dsd-tab-label' }, t('tab.home')),
          )
        }
        const item = library.items[tab]
        if (!item) return null
        return h(
          'button',
          { key: tab, className: 'dsd-tab', type: 'button', 'data-active': library.activeTab === tab ? 'true' : 'false', title: tab, onClick: () => store.setActive(tab) },
          icon('doc', 13),
          h('span', { className: 'dsd-tab-label' }, item.name || basename(tab)),
          h(
            'span',
            {
              className: 'dsd-tab-close',
              role: 'button',
              tabIndex: -1,
              title: t('tab.close'),
              'aria-label': t('tab.close'),
              onClick: (event) => {
                event.stopPropagation()
                store.closeTab(tab)
              },
            },
            icon('close', 11),
          ),
        )
      }

      const renderEntry = (entry) => {
        const key = entryKey(entry)
        const dragPosition = drag && drag.items ? drag.items[key] : null
        const isDragging = Boolean(dragPosition)
        const x = dragPosition ? dragPosition.x : entry.x
        const y = dragPosition ? dragPosition.y : entry.y
        const isSelected = selected.has(key)
        const isDropTarget = entry.kind === 'folder' && dropFolder === entry.id
        const isRenaming = renaming && renaming.kind === entry.kind && renaming.key === entry.id
        const folderAttrs = entry.kind === 'folder' ? { 'data-dsd-folder-id': entry.id } : {}
        return h(
          'div',
          {
            key,
            className: 'dsd-item',
            role: 'button',
            tabIndex: 0,
            style: { left: `${Number.isFinite(x) ? x : -999}px`, top: `${Number.isFinite(y) ? y : -999}px` },
            title: entry.kind === 'file' ? entry.path : entry.name,
            'data-selected': isSelected ? 'true' : 'false',
            'data-dragging': isDragging ? 'true' : 'false',
            'data-drop': isDropTarget ? 'true' : 'false',
            'data-pending': !Number.isFinite(x) || !Number.isFinite(y) ? 'true' : 'false',
            ...folderAttrs,
            onPointerDown: (event) => onPointerDown(event, entry),
            onPointerMove,
            onPointerUp,
            onPointerCancel: onPointerUp,
            onDoubleClick: () => openEntry(entry),
            onContextMenu: (event) => {
              event.preventDefault()
              const currentSelected = selectedRef.current
              if (!currentSelected.has(key) || currentSelected.size === 1) setSelected(new Set([key]))
              setMenu({
                kind: entry.kind,
                key: entry.id,
                x: Math.max(8, Math.min(event.clientX, window.innerWidth - 258)),
                y: Math.max(8, Math.min(event.clientY, window.innerHeight - 340)),
              })
            },
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                openEntry(entry)
              } else if (event.key === 'F2') {
                event.preventDefault()
                startRename(entry)
              }
            },
          },
          h(
            'div',
            { className: 'dsd-glyph', 'data-kind': entry.kind },
            icon(entry.kind === 'folder' ? 'folder' : 'doc', 30),
            entry.kind === 'folder' && entry.count > 0 ? h('span', { className: 'dsd-badge' }, entry.count > 99 ? '99+' : String(entry.count)) : null,
          ),
          isRenaming
            ? h('input', {
                className: 'dsd-rename-input',
                defaultValue: entry.name,
                autoFocus: true,
                spellCheck: false,
                onFocus: (event) => event.currentTarget.select(),
                onPointerDown: (event) => event.stopPropagation(),
                onClick: (event) => event.stopPropagation(),
                onDoubleClick: (event) => event.stopPropagation(),
                onBlur: (event) => commitRename(event.currentTarget.value),
                onKeyDown: (event) => {
                  event.stopPropagation()
                  if (event.key === 'Enter') commitRename(event.currentTarget.value)
                  else if (event.key === 'Escape') {
                    renameRef.current = null
                    setRenaming(null)
                  }
                },
              })
            : h('div', { className: 'dsd-label' }, entry.name),
        )
      }

      const renderHome = () =>
        h(
          'div',
          { className: 'dsd-home' },
          h(
            'div',
            { className: 'dsd-toolbar' },
            currentFolder
              ? h(
                  'button',
                  {
                    className: 'dsd-crumb-back',
                    type: 'button',
                    title: t('action.back'),
                    'aria-label': t('action.back'),
                    onClick: () => {
                      const folder = library.folders[currentFolder]
                      setCurrentFolder(folder ? folder.parentId ?? null : null)
                      setSelected(new Set())
                    },
                  },
                  icon('back', 14),
                )
              : null,
            h(
              'div',
              { className: 'dsd-crumb' },
              h(
                'button',
                {
                  className: 'dsd-crumb-btn',
                  type: 'button',
                  onClick: () => {
                    setCurrentFolder(null)
                    setSelected(new Set())
                  },
                },
                t('folder.root'),
              ),
              chain.map((folder, index) =>
                h(
                  React.Fragment,
                  { key: folder.id },
                  h('span', { className: 'dsd-crumb-sep' }, '/'),
                  index === chain.length - 1
                    ? h('span', { className: 'dsd-crumb-current' }, folder.name)
                    : h(
                        'button',
                        {
                          className: 'dsd-crumb-btn',
                          type: 'button',
                          onClick: () => {
                            setCurrentFolder(folder.id)
                            setSelected(new Set())
                          },
                        },
                        folder.name,
                      ),
                ),
              ),
            ),
            h('span', { className: 'dsd-count' }, t('status.count', { count: Object.keys(library.items).length })),
            selectedEntries.length > 1
              ? h(
                  'button',
                  { className: 'dsd-selection-pill', type: 'button', onClick: () => deleteSelection(), title: t('action.removeSelected', { count: selectedEntries.length }) },
                  icon('trash', 12),
                  h('span', null, t('selection.count', { count: selectedEntries.length })),
                )
              : null,
            h('div', { className: 'dsd-toolbar-spacer' }),
            h(
              'div',
              { className: 'dsd-search' },
              icon('search', 13),
              h('input', {
                value: search,
                placeholder: t('picker.search'),
                'aria-label': t('picker.search'),
                spellCheck: false,
                onChange: (event) => setSearch(event.currentTarget.value),
              }),
            ),
            h(
              'button',
              { className: 'dsd-btn', type: 'button', onClick: createFolder, title: t('action.newFolder') },
              icon('folder-plus', 14),
              h('span', null, t('action.newFolder')),
            ),
            h(
              'button',
              {
                className: 'dsd-btn',
                type: 'button',
                'data-quiet': true,
                'data-active': immersive ? 'true' : 'false',
                title: immersive ? t('immersive.exit') : t('immersive.enter'),
                'aria-label': immersive ? t('immersive.exit') : t('immersive.enter'),
                'aria-pressed': immersive,
                onClick: toggleImmersive,
              },
              icon(immersive ? 'collapse' : 'expand', 14),
              h('span', null, t('immersive.short')),
            ),
          ),
          h(
            'div',
            { className: 'dsd-desktop-wrap' },
            h(
              'div',
              {
                className: 'dsd-desktop',
                ref: desktopRef,
                onPointerDown: onDesktopPointerDown,
                onPointerMove,
                onPointerUp,
                onPointerCancel: onPointerUp,
                onContextMenu: (event) => event.preventDefault(),
                onClick: (event) => {
                  const target = event.target
                  if (target === event.currentTarget || (target && target.classList && target.classList.contains('dsd-desktop-canvas'))) {
                    setSelected(new Set())
                    setMenu(null)
                  }
                },
              },
              h(
                'div',
                { className: 'dsd-desktop-canvas', style: { height: `${canvasHeight}px` } },
                marquee ? h('div', { className: 'dsd-marquee', style: { left: `${marquee.left}px`, top: `${marquee.top}px`, width: `${marquee.width}px`, height: `${marquee.height}px` } }) : null,
                drag && dropSlot ? h('div', { className: 'dsd-slot-ghost', style: { left: `${dropSlot.x}px`, top: `${dropSlot.y}px` } }) : null,
                entries.map(renderEntry),
                allEntries.length === 0
                  ? h(
                      'div',
                      { className: 'dsd-empty' },
                      h('div', { className: 'dsd-empty-icon' }, icon('folder', 30)),
                      h('p', { className: 'dsd-empty-title' }, currentFolder ? t('empty.folderTitle') : t('empty.title')),
                      h('p', { className: 'dsd-empty-hint' }, currentFolder ? t('empty.folderHint') : t('empty.hint')),
                      !currentFolder
                        ? h(
                            'button',
                            { className: 'dsd-btn', type: 'button', 'data-primary': true, onClick: openPicker },
                            icon('plus', 14),
                            h('span', null, t('action.add')),
                          )
                        : null,
                    )
                  : null,
                allEntries.length > 0 && entries.length === 0 ? h('div', { className: 'dsd-no-match' }, t('picker.empty')) : null,
              ),
            ),
          ),
        )

      const renderBookmarksPanel = () => {
        if (!activePath) return null
        const close = () => {
          setBookmarksOpen(false)
          setBookmarkEdit(null)
        }
        const saveEdit = () => {
          if (!bookmarkEdit) return
          bookmarkStore.updateBookmark(activePath, bookmarkEdit.id, { label: bookmarkEdit.label.trim(), note: bookmarkEdit.note.trim() })
          setBookmarkEdit(null)
          showToast(t('bookmarks.updated'))
        }
        const removeBookmark = (entry) => {
          bookmarkStore.removeBookmark(activePath, entry.id)
          if (bookmarkEdit?.id === entry.id) setBookmarkEdit(null)
          showToast(t('bookmarks.deleted'))
        }
        return h(
          'div',
          { className: 'dsd-bookmarks-popover', 'data-dsd-bookmarks': 'true' },
          h(
            'div',
            { className: 'dsd-bookmarks-head' },
            h('strong', null, t('bookmarks.title')),
            activeBookmarks.length > 0 ? h('span', { className: 'dsd-bookmarks-head-count' }, t('bookmarks.count', { count: activeBookmarks.length })) : null,
            h(
              'button',
              { className: 'dsd-btn', type: 'button', 'data-quiet': true, title: t('action.close'), 'aria-label': t('action.close'), onClick: close },
              icon('close', 14),
            ),
          ),
          h(
            'div',
            { className: 'dsd-bookmarks-last' },
            h('div', { className: 'dsd-bookmarks-section-title' }, t('bookmarks.lastRead')),
            lastPosition
              ? h(
                  'div',
                  { className: 'dsd-bookmarks-last-body' },
                  h('div', { className: 'dsd-bookmarks-last-meta' }, t('bookmarks.lastReadAt', { percent: Math.round(lastPosition.ratio * 100), time: formatTime(lastPosition.updatedAt) })),
                  h('div', { className: 'dsd-bookmarks-last-label' }, lastPosition.label || t('bookmarks.noLabel')),
                  h(
                    'div',
                    { className: 'dsd-bookmarks-last-actions' },
                    h(
                      'button',
                      { className: 'dsd-btn', type: 'button', 'data-primary': true, onClick: () => jumpToPosition(lastPosition) },
                      icon('bookmark', 13),
                      h('span', null, t('bookmarks.resume')),
                    ),
                    h(
                      'button',
                      {
                        className: 'dsd-btn',
                        type: 'button',
                        'data-quiet': true,
                        onClick: () => {
                          positionSaveBlockedUntil.current = Date.now() + 800
                          window.clearTimeout(docScrollSaveTimer.current)
                          bookmarkStore.clearPosition(activePath)
                          showToast(t('bookmarks.cleared'))
                        },
                      },
                      h('span', null, t('bookmarks.clear')),
                    ),
                  ),
                )
              : h('div', { className: 'dsd-bookmarks-hint' }, t('bookmarks.noLast')),
          ),
          h(
            'div',
            { className: 'dsd-bookmarks-add' },
            h(
              'button',
              { className: 'dsd-btn', type: 'button', 'data-primary': true, onClick: addBookmark },
              icon('bookmark', 14),
              h('span', null, t('bookmarks.addHere')),
            ),
            h('span', { className: 'dsd-bookmark-kbd' }, 'B'),
          ),
          bookmarkEdit
            ? h(
                'div',
                { className: 'dsd-bookmark-editor' },
                h('div', { className: 'dsd-bookmark-editor-title' }, t('bookmarks.edit')),
                h('input', {
                  value: bookmarkEdit.label,
                  placeholder: t('bookmarks.label'),
                  spellCheck: false,
                  onChange: (event) => {
                    const value = event.currentTarget.value
                    setBookmarkEdit((previous) => (previous ? { ...previous, label: value } : previous))
                  },
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      saveEdit()
                    } else if (event.key === 'Escape') {
                      event.preventDefault()
                      setBookmarkEdit(null)
                    }
                  },
                }),
                h('textarea', {
                  value: bookmarkEdit.note,
                  placeholder: t('bookmarks.note'),
                  rows: 2,
                  onChange: (event) => {
                    const value = event.currentTarget.value
                    setBookmarkEdit((previous) => (previous ? { ...previous, note: value } : previous))
                  },
                }),
                h(
                  'div',
                  { className: 'dsd-bookmark-editor-actions' },
                  h('button', { className: 'dsd-btn', type: 'button', 'data-primary': true, onClick: saveEdit }, h('span', null, t('bookmarks.save'))),
                  h('button', { className: 'dsd-btn', type: 'button', 'data-quiet': true, onClick: () => setBookmarkEdit(null) }, h('span', null, t('bookmarks.cancel'))),
                ),
              )
            : null,
          h(
            'div',
            { className: 'dsd-bookmarks-list' },
            activeBookmarks.length === 0
              ? h('div', { className: 'dsd-bookmarks-empty' }, t('bookmarks.empty'))
              : activeBookmarks.map((entry) =>
                  h(
                    'div',
                    { className: 'dsd-bookmark-item', key: entry.id },
                    h(
                      'button',
                      { className: 'dsd-bookmark-main', type: 'button', onClick: () => jumpToPosition(entry) },
                      h('div', { className: 'dsd-bookmark-label' }, entry.label || t('bookmarks.noLabel')),
                      entry.note ? h('div', { className: 'dsd-bookmark-note' }, entry.note) : null,
                      h('div', { className: 'dsd-bookmark-meta' }, t('bookmarks.lastReadAt', { percent: Math.round(entry.ratio * 100), time: formatTime(entry.createdAt) })),
                    ),
                    h(
                      'div',
                      { className: 'dsd-bookmark-actions' },
                      h(
                        'button',
                        { className: 'dsd-bookmark-action', type: 'button', onClick: () => setBookmarkEdit({ id: entry.id, label: entry.label, note: entry.note }) },
                        t('bookmarks.edit'),
                      ),
                      h('button', { className: 'dsd-bookmark-action', type: 'button', 'data-danger': true, onClick: () => removeBookmark(entry) }, t('bookmarks.delete')),
                    ),
                  ),
                ),
          ),
        )
      }

      const renderDoc = () => {
        if (!activeItem) return null
        return h(
          'div',
          { className: 'dsd-doc' },
          h(
            'div',
            { className: 'dsd-doc-scroll', ref: docScrollRef, onScroll: handleDocScroll },
            h(
              'div',
              { className: 'dsd-doc-inner' },
              h(
                'div',
                { className: 'dsd-doc-pathbar' },
                icon('doc', 14),
                h('span', { className: 'dsd-doc-path', title: activePath }, activePath),
                h(
                  'button',
                  {
                    className: 'dsd-btn',
                    type: 'button',
                    'data-quiet': true,
                    'data-dsd-bookmark-toggle': 'true',
                    'data-active': bookmarksOpen ? 'true' : 'false',
                    title: t('bookmarks.open'),
                    'aria-label': t('bookmarks.open'),
                    onClick: () => setBookmarksOpen((previous) => !previous),
                  },
                  icon('bookmark', 14),
                  activeBookmarks.length > 0 ? h('span', { className: 'dsd-bookmark-count' }, activeBookmarks.length > 99 ? '99+' : String(activeBookmarks.length)) : null,
                ),
                h(
                  'button',
                  { className: 'dsd-btn', type: 'button', 'data-quiet': true, title: t('action.copyPath'), 'aria-label': t('action.copyPath'), onClick: () => copyText(activePath) },
                  icon('copy', 14),
                ),
                h(
                  'button',
                  { className: 'dsd-btn', type: 'button', 'data-quiet': true, title: t('action.refreshContent'), 'aria-label': t('action.refreshContent'), onClick: reloadDoc },
                  icon('refresh', 14),
                ),
                h(
                  'button',
                  {
                    className: 'dsd-btn',
                    type: 'button',
                    'data-quiet': true,
                    'data-active': immersive ? 'true' : 'false',
                    title: immersive ? t('immersive.exit') : t('immersive.enter'),
                    'aria-label': immersive ? t('immersive.exit') : t('immersive.enter'),
                    'aria-pressed': immersive,
                    onClick: toggleImmersive,
                  },
                  icon(immersive ? 'collapse' : 'expand', 14),
                ),
              ),
              doc.status === 'ready' && lastPosition && lastPosition.ratio > 0.015 && resumeDismissedPath !== activePath
                ? h(
                    'div',
                    { className: 'dsd-resume' },
                    icon('bookmark', 15),
                    h(
                      'div',
                      { className: 'dsd-resume-main' },
                      h('strong', null, t('bookmarks.lastRead')),
                      h('span', { className: 'dsd-resume-meta' }, t('bookmarks.lastReadAt', { percent: Math.round(lastPosition.ratio * 100), time: formatTime(lastPosition.updatedAt) })),
                      lastPosition.label ? h('div', { className: 'dsd-resume-label' }, lastPosition.label) : null,
                    ),
                    h(
                      'div',
                      { className: 'dsd-resume-actions' },
                      h(
                        'button',
                        { className: 'dsd-btn', type: 'button', 'data-primary': true, onClick: () => jumpToPosition(lastPosition) },
                        h('span', null, t('bookmarks.resume')),
                      ),
                      h(
                        'button',
                        {
                          className: 'dsd-btn',
                          type: 'button',
                          'data-quiet': true,
                          title: t('bookmarks.dismiss'),
                          'aria-label': t('bookmarks.dismiss'),
                          onClick: () => setResumeDismissedPath(activePath),
                        },
                        icon('close', 12),
                      ),
                    ),
                  )
                : null,
              doc.status === 'loading' ? h('div', { className: 'dsd-doc-loading' }, t('doc.loading')) : null,
              doc.status === 'error'
                ? h(
                    'div',
                    { className: 'dsd-doc-error' },
                    h('span', null, t('doc.failed', { reason: doc.error || 'unknown' })),
                    h(
                      'button',
                      { className: 'dsd-btn', type: 'button', onClick: () => removeItem(activePath) },
                      icon('trash', 13),
                      h('span', null, t('action.remove')),
                    ),
                  )
                : null,
              doc.status === 'ready'
                ? h(
                    'div',
                    { className: 'dsd-doc-body' },
                    doc.truncated ? h('div', { className: 'dsd-doc-note' }, t('doc.truncated')) : null,
                    doc.content.trim() === '' ? h('div', { className: 'dsd-doc-empty' }, t('doc.empty')) : renderMarkdown(doc.content, 'doc'),
                  )
                : null,
            ),
          ),
          bookmarksOpen ? renderBookmarksPanel() : null,
        )
      }

      const renderPicker = () => {
        const selectedCount = picker.selected.size
        const visibleAddable = pickerRows.filter((file) => !library.items[file.path])
        const allVisibleSelected = visibleAddable.length > 0 && visibleAddable.every((file) => picker.selected.has(file.path))
        return h(
          'div',
          { className: 'dsd-picker', onPointerDown: (event) => { if (event.target === event.currentTarget) closePicker() } },
          h(
            'div',
            { className: 'dsd-picker-card', role: 'dialog', 'aria-modal': true, 'aria-label': t('picker.title') },
            h(
              'div',
              { className: 'dsd-picker-head' },
              h('div', { className: 'dsd-picker-heading' }, h('h2', { className: 'dsd-picker-title' }, t('picker.title')), h('div', { className: 'dsd-picker-sub' }, t('picker.subtitle'))),
              h(
                'button',
                { className: 'dsd-btn', type: 'button', 'data-quiet': true, onClick: openPicker, title: t('action.refresh'), 'aria-label': t('action.refresh') },
                icon('refresh', 14),
              ),
              h(
                'button',
                { className: 'dsd-btn', type: 'button', 'data-quiet': true, onClick: closePicker, title: t('action.close'), 'aria-label': t('action.close') },
                icon('close', 14),
              ),
            ),
            h(
              'div',
              { className: 'dsd-picker-tools' },
              h(
                'div',
                { className: 'dsd-search', style: { flex: '1 1 200px' } },
                icon('search', 13),
                h('input', {
                  value: picker.query,
                  placeholder: t('picker.search'),
                  'aria-label': t('picker.search'),
                  spellCheck: false,
                  onChange: (event) => {
                    const value = event.currentTarget.value
                    setPicker((previous) => ({ ...previous, query: value }))
                  },
                }),
              ),
              h(
                'button',
                { className: 'dsd-btn', type: 'button', onClick: allVisibleSelected ? () => setPicker((previous) => ({ ...previous, selected: new Set() })) : selectAllVisible },
                h('span', null, allVisibleSelected ? t('action.clearSelection') : t('action.selectAll')),
              ),
            ),
            h(
              'div',
              { className: 'dsd-picker-list' },
              picker.status === 'loading' ? h('div', { className: 'dsd-picker-status' }, t('picker.loading')) : null,
              picker.status === 'error'
                ? h(
                    'div',
                    { className: 'dsd-picker-status' },
                    h('div', null, t('picker.failed', { reason: picker.error || 'unknown' })),
                    h('button', { className: 'dsd-btn', type: 'button', onClick: openPicker, style: { marginTop: '10px' } }, h('span', null, t('action.retry'))),
                  )
                : null,
              picker.status === 'ready' && pickerRows.length === 0 ? h('div', { className: 'dsd-picker-status' }, t('picker.empty')) : null,
              picker.status === 'ready'
                ? pickerRows.map((file) => {
                    const inLibrary = Boolean(library.items[file.path])
                    const checked = picker.selected.has(file.path)
                    return h(
                      'button',
                      {
                        key: file.path,
                        className: 'dsd-picker-row',
                        type: 'button',
                        role: 'checkbox',
                        'aria-checked': checked ? 'true' : 'false',
                        disabled: inLibrary,
                        onClick: () => togglePicked(file.path),
                      },
                      h('span', { className: 'dsd-picker-check' }, checked ? icon('check', 12) : null),
                      h(
                        'span',
                        { className: 'dsd-picker-text' },
                        h('span', { className: 'dsd-picker-name' }, file.name),
                        h('span', { className: 'dsd-picker-path', title: file.path }, `${file.rootTitle} / ${file.rel}`),
                      ),
                      inLibrary ? h('span', { className: 'dsd-picker-added' }, t('picker.added')) : null,
                      h('span', { className: 'dsd-picker-meta' }, `${formatTime(file.mtime)} · ${formatSize(file.size)}`),
                    )
                  })
                : null,
            ),
            h(
              'div',
              { className: 'dsd-picker-foot' },
              h(
                'span',
                { className: 'dsd-picker-foot-meta' },
                t('picker.selected', { count: selectedCount }),
                picker.status === 'ready' ? ` · ${t('picker.roots', { count: picker.roots.length })}` : '',
                picker.partial ? ` · ${t('picker.partial')}` : '',
              ),
              h('button', { className: 'dsd-btn', type: 'button', onClick: closePicker }, h('span', null, t('action.cancel'))),
              h(
                'button',
                { className: 'dsd-btn', type: 'button', 'data-primary': true, disabled: selectedCount === 0, onClick: addSelected },
                icon('plus', 14),
                h('span', null, `${t('action.addSelected')}${selectedCount > 0 ? ` (${selectedCount})` : ''}`),
              ),
            ),
          ),
        )
      }

      return h(
        'div',
        { className: 'dsd-panel', ref: panelRef, 'data-immersive': immersive ? 'true' : 'false' },
        h(
          'div',
          { className: 'dsd-tabbar' },
          h('div', { className: 'dsd-tabs' }, [renderTab('home'), ...library.openTabs.map((path) => renderTab(path))]),
          h(
            'div',
            { className: 'dsd-tabbar-actions' },
            h(
              'button',
              { className: 'dsd-btn', type: 'button', 'data-primary': true, onClick: openPicker, title: t('action.add') },
              icon('plus', 14),
              h('span', null, t('action.add')),
            ),
          ),
        ),
        activePath && activeItem ? renderDoc() : renderHome(),
        immersive
          ? h(
              'button',
              {
                className: 'dsd-immersive-exit',
                type: 'button',
                title: t('immersive.exit'),
                'aria-label': t('immersive.exit'),
                onClick: exitImmersive,
              },
              icon('collapse', 14),
              h('span', null, t('immersive.exitLabel')),
            )
          : null,
        picker.open ? renderPicker() : null,
        menuBulk
          ? h(
              'div',
              { className: 'dsd-menu', style: { left: `${menu.x}px`, top: `${menu.y}px` }, role: 'menu' },
              h('div', { className: 'dsd-menu-title' }, t('selection.count', { count: selectedEntries.length })),
              h('div', { className: 'dsd-menu-heading' }, t('menu.moveSelected', { count: selectedEntries.length })),
              bulkMoveFolders.length === 0
                ? h('div', { className: 'dsd-menu-hint' }, t('menu.moveHint'))
                : bulkMoveFolders.map((folder) =>
                    h(
                      'button',
                      {
                        key: folder.id || 'root',
                        className: 'dsd-menu-item',
                        type: 'button',
                        role: 'menuitem',
                        onClick: () => moveSelection(folder.id),
                      },
                      icon('folder', 14),
                      h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, folder.name),
                    ),
                  ),
              h('div', { className: 'dsd-menu-sep' }),
              h(
                'button',
                { className: 'dsd-menu-item', type: 'button', role: 'menuitem', 'data-danger': true, onClick: () => deleteSelection() },
                icon('trash', 14),
                h('span', null, t('action.removeSelected', { count: selectedEntries.length })),
              ),
              h('div', { className: 'dsd-menu-sep' }),
              h(
                'button',
                {
                  className: 'dsd-menu-item',
                  type: 'button',
                  role: 'menuitem',
                  onClick: () => {
                    setSelected(new Set())
                    setMenu(null)
                  },
                },
                icon('close', 14),
                h('span', null, t('action.deselect')),
              ),
            )
          : menu && contextEntry
          ? h(
              'div',
              { className: 'dsd-menu', style: { left: `${menu.x}px`, top: `${menu.y}px` }, role: 'menu' },
              h('div', { className: 'dsd-menu-title', title: contextEntry.name }, contextEntry.name),
              h(
                'button',
                { className: 'dsd-menu-item', type: 'button', role: 'menuitem', onClick: () => openEntry(contextEntry) },
                icon(contextEntry.kind === 'folder' ? 'folder' : 'doc', 14),
                h('span', null, t('action.open')),
              ),
              h(
                'button',
                { className: 'dsd-menu-item', type: 'button', role: 'menuitem', onClick: () => startRename(contextEntry) },
                icon('file-plus', 14),
                h('span', null, t('action.rename')),
              ),
              contextEntry.kind === 'file'
                ? h(
                    'button',
                    { className: 'dsd-menu-item', type: 'button', role: 'menuitem', onClick: () => copyText(contextEntry.path) },
                    icon('copy', 14),
                    h('span', null, t('action.copyPath')),
                  )
                : null,
              h('div', { className: 'dsd-menu-sep' }),
              h('div', { className: 'dsd-menu-heading' }, t('menu.separator')),
              menuFolders.length === 0
                ? h('div', { className: 'dsd-menu-hint' }, t('menu.moveHint'))
                : menuFolders.map((folder) =>
                    h(
                      'button',
                      {
                        key: folder.id || 'root',
                        className: 'dsd-menu-item',
                        type: 'button',
                        role: 'menuitem',
                        onClick: () => moveEntry(contextEntry, folder.id),
                      },
                      icon('folder', 14),
                      h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, folder.name),
                    ),
                  ),
              h('div', { className: 'dsd-menu-sep' }),
              contextEntry.kind === 'file'
                ? h(
                    'button',
                    { className: 'dsd-menu-item', type: 'button', role: 'menuitem', 'data-danger': true, onClick: () => removeItem(contextEntry.path) },
                    icon('trash', 14),
                    h('span', null, t('action.remove')),
                  )
                : h(
                    'button',
                    { className: 'dsd-menu-item', type: 'button', role: 'menuitem', 'data-danger': true, onClick: () => requestDeleteFolder(contextEntry) },
                    icon('trash', 14),
                    h('span', null, t('action.deleteFolder')),
                  ),
            )
          : null,
        confirmState
          ? h(
              'div',
              { className: 'dsd-modal' },
              h(
                'div',
                { className: 'dsd-modal-card' },
                h('h3', { className: 'dsd-modal-title' }, confirmState.title),
                h('p', { className: 'dsd-modal-text' }, confirmState.message),
                h(
                  'div',
                  { className: 'dsd-modal-actions' },
                  h('button', { className: 'dsd-btn', type: 'button', onClick: () => setConfirmState(null) }, h('span', null, t('confirm.cancel'))),
                  h('button', { className: 'dsd-btn', type: 'button', 'data-danger': true, onClick: () => confirmState.onConfirm() }, h('span', null, confirmState.confirmLabel || t('confirm.delete'))),
                ),
              ),
            )
          : null,
        toast ? h('div', { className: 'dsd-toast' }, toast) : null,
      )
    }

    /* ---------------------------------------------------------------- apply */

    return {
      inject: ['slots'],
      apply(ctx) {
        const disposers = []
        const locale = (() => {
          try {
            return ctx.get('locale', false)
          } catch {
            return undefined
          }
        })()
        if (locale && typeof locale.register === 'function') {
          ctx.effect(() => {
            try {
              return locale.register(NS, { zh: ZH, en: EN })
            } catch {
              return () => {}
            }
          })
          try {
            const bound = locale.bind ? locale.bind(NS) : undefined
            if (typeof bound === 'function') translate = bound
          } catch {
            translate = undefined
          }
        }

        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-docdesk'
          style.textContent = CSS
          document.head.appendChild(style)
          return () => style.remove()
        })

        let layout
        try {
          layout = ctx.get('layout', false)
        } catch {
          layout = undefined
        }
        const toggleSidebar = () => {
          try {
            ;(layout || ctx.get('layout', false))?.toggleSidebar?.()
          } catch {
            /* layout may not be mounted in this composition */
          }
        }
        const SidebarToggleEntry = () => h(SidebarToggle, { toggleSidebar })
        const PanelPageEntry = () => h(PanelPage, { toggleHostSidebar: toggleSidebar })

        disposers.push(
          ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register(
              {
                name: 'sidebar.panellist',
                id: PANEL_ID,
                order: 5,
                label: () => t('panel.title'),
              },
              PanelIcon,
            ),
          ),
        )
        disposers.push(
          ctx.slots.inject('main', () =>
            ctx.slots.register(
              {
                name: 'main',
                key: PANEL_ID,
              },
              PanelPageEntry,
            ),
          ),
        )
        disposers.push(
          ctx.slots.inject('shell.overlay', () =>
            ctx.slots.register(
              {
                name: 'shell.overlay',
                id: 'docdesk-sidebar-toggle',
                order: 50,
              },
              SidebarToggleEntry,
            ),
          ),
        )
        disposers.push(
          ctx.slots.inject('deliverables.file.actions', () =>
            ctx.slots.register(
              {
                name: 'deliverables.file.actions',
                id: 'docdesk-add-to-library',
                order: 20,
              },
              FileAction,
            ),
          ),
        )

        ctx.effect(() => () => {
          for (const dispose of disposers.splice(0)) {
            try {
              dispose()
            } catch {
              /* ignore */
            }
          }
        })
      },
    }
  },
})
