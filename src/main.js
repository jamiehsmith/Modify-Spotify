import Vue from 'vue'
import App from './App.vue'
import babelPolyfill from 'babel-polyfill'
import Multiselect from 'vue-multiselect'
import VueTagsInput from '@johmun/vue-tags-input';

Vue.component('multiselect', Multiselect)
Vue.use(VueTagsInput)

new Vue({
  el: '#app',
  render: h => h(App)
})
