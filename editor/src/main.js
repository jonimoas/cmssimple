import Vue from "vue";
import App from "./App.vue";
Vue.config.productionTip = false;
import "prismjs/themes/prism-tomorrow.css";
//vue-prism-editor dependency
import "vue-prism-editor/dist/VuePrismEditor.css";
new Vue({
  render: h => h(App)
}).$mount("#app");
