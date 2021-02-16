import Vue from "vue";
import Router from "vue-router";
Vue.use(Router);

const routeJson = require("../routes.json");
let routes = [];
for (const r of routeJson) {
  routes.push({
    path: "/" + r.name.toLowerCase(),
    name: r.name,
    component: Vue.component(r.name, () => import("./" + r.file)),
  });
}
export default new Router({
  routes: routes,
});
