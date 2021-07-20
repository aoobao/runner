<template>
  <div class="runner-wrap" ref="container"></div>
</template>
<script>
import Main from './main'

import CameraControls from 'camera-controls'
import * as THREE from 'three'
CameraControls.install({ THREE: THREE })
export default {
  mounted() {
    this.main = new Main({
      dom: this.$refs.container,
    })
  },
  beforeDestroy() {
    // this.main.destroy()
  },
}
</script>
<style lang="scss" scoped>
.runner-wrap {
  width: 100%;
  height: 100%;
  -webkit-touch-callout: none;
}
</style>
