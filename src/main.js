import Vue from "vue";
import App from "./App.vue";
Vue.config.productionTip = false;
import "prismjs/themes/prism-tomorrow.css";
import "vue-prism-editor/dist/VuePrismEditor.css";
import VueCookies from "vue-cookies";
Vue.use(VueCookies);
new Vue({
  render: (h) => h(App),
}).$mount("#app");
