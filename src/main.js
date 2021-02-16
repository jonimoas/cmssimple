import Vue from "vue";
import App from "./App.vue";
import router from "./router";
Vue.config.productionTip = false;
import "prismjs/themes/prism-tomorrow.css";
import "vue-prism-editor/dist/prismeditor.min.css";
import VueCookies from "vue-cookies";
Vue.use(VueCookies);
new Vue({ router, render: (h) => h(App) }).$mount("#app");
