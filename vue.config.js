module.exports = {
  chainWebpack: config => {
    config.module
      .rule('file-loader')
      .test(/\.(glb|gltf|font)$/)
      .use('file-loader')
      .loader('file-loader')
      .end()
  },
}
