<template>
  <div class="app">
    <Editor v-model="state" :formData="formData"></Editor>
  </div>
</template>
<script>
import { provide, ref } from 'vue';
import data from './data.json';
import Editor from './packages/editor'
import { registerConfig as config } from './utils/editor-config'
export default {
  components: {
    Editor
  },
  setup() {
    const state = ref(data);

    provide('config', config);

    const formData = ref({
      username: 'root',
      password: 123,
      start: 0,
      end: 100
    })

    return {
      state,
      formData
    }
  }
}
</script>
<style>
.app {
  position: fixed;
  top: 20px;
  bottom: 20px;
  left: 20px;
  right: 20px;
}
</style>
