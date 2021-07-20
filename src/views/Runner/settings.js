// 照相机参数
const CAMERA_CONFIG = {
  // backgroundColor: 0xffffff,
  fov: 60,
  near: 1,
  far: 10000,
  resetPosition: [0, 10, -10],
}

// 游戏事件
const GAME_EVENT_TYPE = {
  SCENE_RENDER: 'scene_render',
  PAGE_CHANGE: 'page change',
}

const PAGE_NAME = {
  MAIN_PAGE: 'main-menu',
  GAME_VIEW_PAGE: 'game-view',
}

let config = {
  width: window.innerWidth,
  height: window.innerHeight,
  dom: null,
}

const setConfig = opts => {
  config = {
    ...config,
    ...opts,
  }
}

const getConfig = () => {
  return {
    ...CAMERA_CONFIG,
    ...GAME_EVENT_TYPE,
    ...PAGE_NAME,
    ...config,
  }
}

export { getConfig, setConfig, PAGE_NAME, GAME_EVENT_TYPE }
