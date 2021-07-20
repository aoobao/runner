<template>
  <div class="home">
    <Runner />
  </div>
</template>

<script>
// @ is an alias to /src
import Runner from './Runner/index.vue'
export default {
  name: 'Home',
  components: { Runner },
}
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  // background-color: red;
}
@media screen and (min-width: 800px) {
  .home {
    width: 800px;
  }
}
</style>
