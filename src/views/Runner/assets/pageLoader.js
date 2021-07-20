import { getConfig } from '../settings'
import { THREE } from '../utils'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { FILE_TYPE, getFileList, addFinishFile } from './types'

const config = getConfig()

const pageAssets = {
  [config.MAIN_PAGE]: {
    // id: config.MAIN_PAGE,
    ids: ['logo', 'startButton'],
  },
  [config.GAME_VIEW_PAGE]: {
    ids: ['runner', 'font', 'fish', 'barrier', 'restartButton'],
    pre_ids: [], // 预加载列表
  },
}

function loadFile(file) {
  switch (file.type) {
    case FILE_TYPE.image:
      return loadImage(file)
    case FILE_TYPE.gltf:
      return loadGltf(file)
    case FILE_TYPE.font:
      return loadFont(file)
    case FILE_TYPE.fbx:
      return loadFbx(file)
    default:
      return Promise.reject(new Error('错误的文件类型:' + file.type))
  }
}

function loadFont(file) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FontLoader()
    loader.load(
      file.path,
      font => {
        resolve(font)
      },
      undefined,
      err => {
        reject(err)
      },
    )
  })
}

function loadFbx(file) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader()
    loader.load(
      file.path,
      object => {
        resolve(object)
      },
      undefined,
      err => {
        reject(err)
      },
    )
  })
}

function loadGltf(file) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()

    loader.load(
      file.path,
      gltf => {
        resolve(gltf)
      },
      undefined,
      err => {
        reject(err)
      },
    )
  })
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.ImageLoader()
    loader.load(
      file.path,
      image => {
        resolve(image)
      },
      undefined,
      err => {
        reject(err)
      },
    )
  })
}

export function isCacheFile(pageId) {
  const page = pageAssets[pageId]
  if (!page) {
    console.error('未配置页面id:' + pageId, pageAssets)
    return {
      cached: false,
    }
  }
  const ids = page.ids
  const info = getFileList(ids)
  if (info.total === info.cacheTotal) {
    return {
      cached: true,
      list: info.list,
      total: info.list.length,
    }
  } else {
    return {
      cached: false,
    }
  }
}

export function getLoadFilesByPageId(pageId, callback, onProgress, onError) {
  const page = pageAssets[pageId]
  if (!page) {
    console.error('未配置页面id:' + pageId, pageAssets)
    return
    // onError(new Error('当前页面id未找到id=' + pageId))
  }
  const ids = page.ids
  const info = getFileList(ids)
  let isError = false

  if (info.total === info.cacheTotal) {
    return callback({
      list: info.list,
    })
  }
  const list = []
  const func = () => {
    if (isError) return
    if (list.length < info.total) {
      typeof onProgress === 'function' &&
        onProgress({
          total: info.total,
          count: list.length,
        })
    } else {
      callback({
        list,
        total: info.total,
      })
    }
  }

  for (let i = 0; i < info.list.length; i++) {
    const file = info.list[i]

    if (file.object) {
      list.push({ ...file })
      func()
    } else {
      loadFile(file)
        .then(obj => {
          const data = { ...file, object: obj }
          addFinishFile(data)
          list.push({ ...data })
          func()
        })
        .catch(err => {
          isError = true
          typeof onError === 'function' && onError(err)
        })
    }
  }
}
