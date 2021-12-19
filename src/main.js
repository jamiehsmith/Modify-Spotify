import Vue from 'vue';
import App from './App.vue';
import babelPolyfill from 'babel-polyfill';
import Multiselect from 'vue-multiselect';
import VueTagsInput from '@johmun/vue-tags-input';
import VueSwal from 'vue-swal';

Vue.component('multiselect', Multiselect);
Vue.use(VueTagsInput);
Vue.use(VueSwal);

new Vue({
  el: '#app',
  render: (h) => h(App),
});
