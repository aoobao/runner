export const FILE_TYPE = {
  image: 'image',
  gltf: 'GLTF',
  obj: 'OBJ',
  font: 'FONT',
  fbx: 'FBX',
}

export const FILE_LIST = [
  {
    id: 'logo',
    path: require('./image/Logo.png'),
    type: FILE_TYPE.image,
  },
  {
    id: 'startButton',
    path: require('./image/StartButton.png'),
    type: FILE_TYPE.image,
  },
  {
    id: 'runner',
    // path: require('./object/runner.glb'),
    path: require('./object/RobotExpressive.glb'),
    type: FILE_TYPE.gltf,
  },
  {
    id: 'font',
    path: require('./font/optimer_bold.typeface.font'),
    type: FILE_TYPE.font,
  },
  {
    id: 'fish',
    path: './object/Fishbone/Fishbone.fbx',
    type: FILE_TYPE.fbx,
  },
  {
    id: 'barrier',
    path: './object/RoadWorksBarrier01/RoadWorksBarrier01.fbx',
    type: FILE_TYPE.fbx,
  },
  {
    id: 'restartButton',
    path: require('./image/StartButton.png'),
    type: FILE_TYPE.image,
  },
]

// 已经下载完成的文件
const FINISH_FILE_LIST = []

export function addFinishFile(file) {
  const has = FINISH_FILE_LIST.find(t => t.id === file.id)
  if (!has) {
    FINISH_FILE_LIST.push({ ...file })
    return true
  }
  return false
}

export function getFileById(id) {
  const file = FINISH_FILE_LIST.find(t => t.id === id)
  return file
}

export function getFileList(ids) {
  let total = 0
  let cacheTotal = 0
  const list = ids.map(id => {
    total++
    // 先在缓存中找
    const cache = FINISH_FILE_LIST.find(t => t.id === id)
    if (cache) {
      cacheTotal++
      return cache
    }
    // 然后在FILE LIST列表中找
    const file = FILE_LIST.find(t => t.id === id)

    if (!file) {
      console.error('文件列表中未找到id:' + id, FILE_LIST)
      return {
        id,
      }
    }
    return file
  })

  return {
    total,
    cacheTotal,
    list,
  }
}
