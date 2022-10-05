import Vue from 'vue';
import App from './components/App.vue';
import babelPolyfill from 'babel-polyfill';
import Multiselect from 'vue-multiselect';
import VueTagsInput from '@johmun/vue-tags-input';
import VueSwal from 'vue-swal';
import VueCookies from 'vue-cookies';

Vue.component('multiselect', Multiselect);
Vue.use(VueTagsInput);
Vue.use(VueSwal);
Vue.use(VueCookies);

new Vue({
  el: '#app',
  render: (h) => h(App),
});
