<template>
  <div id="app">
    <tabs>
      <tab title="Color Schemes">
        <div class="container">
          <div class="colorContainer" style="grid-area: a1">
            <div class="text">Sidebar Background</div>
            <color-picker
              v-bind:color="sidebarBg"
              @change="
                (input) => {
                  sidebarBg = input.hex;
                }
              "
            ></color-picker>
            
          </div>
          <div class="colorContainer" style="grid-area: a2">
            <div class="text">Sidebar Text</div>
            <color-picker
              v-bind:color="sidebarTxt"
              @change="
                (input) => {
                  sidebarTxt = input.hex;
                }
              "
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area: a3">
            <div class="text">Sidebar Active Button</div>
            <color-picker
              v-bind:color="sidebarActive"
              @change="
                (input) => {
                  sidebarActive = input.hex;
                }
              "
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area: a4">
            <div class="text">Sidebar Active Text</div>
            <color-picker
              v-bind:color="sidebarActiveText"
              @change="
                (input) => {
                  sidebarActiveText = input.hex;
                }
              "
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area: b1">
            <div class="text">Sidebar Hover Button</div>
            <color-picker
              v-bind:color="sidebarHover"
              @change="
                (input) => {
                  sidebarHover = input.hex;
                }
              "
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area: b2">
            <div class="text">Sidebar Hover Text</div>
            <color-picker
              v-bind:color="sidebarHoverText"
              @change="
                (input) => {
                  sidebarHoverText = input.hex;
                }
              "
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area: b3">
            <div class="text">Background</div>
            <color-picker
              v-bind:color="body"
              @change="
                (input) => {
                  body = input.hex;
                }
              "
            ></color-picker>
          </div>
          <div style="grid-area: c3">
            <button @click="saveColor">Save</button>
          </div>
        </div>
      </tab>
      <tab title="Page Sort">
        <draggable
          v-model="navObj.child"
          group="people"
          @start="drag = true"
          @end="drag = false"
        >
          <div v-for="n in navObj.child" :key="n.attr.id">
            <div>{{ n.attr.id }}</div>
          </div>
        </draggable>
        <br />
        <br />
        <button @click="saveSort">Save</button>
      </tab>
      <tab title="Page Document Editor">
        <button @click="reset">New</button>
        <select v-model="pageToLoad" @input="loadContent">
          <option disabled value>Select Page To Load</option>
          <option v-for="n in nav">{{ n }}</option>
        </select>
        <input type="text" v-model="name" placeholder="name" />
        <button @click="deleteContent">Delete</button>
        <br />
        <vue-editor v-model="content"></vue-editor>
        <br />
        <button @click="saveContent">Save</button>
      </tab>
      <tab title="Page Code Editor">
        <button @click="reset">New</button>
        <select v-model="pageToLoad" @input="loadContent">
          <option disabled value>Select Page To Load</option>
          <option v-for="n in nav">{{ n }}</option>
        </select>
        <input type="text" v-model="name" placeholder="name" />
        <button @click="deleteContent">Delete</button>
        <br />
        <prism-editor
          v-model="content"
          language="html"
          :highlight="HTMLhighlighter"
          line-numbers
        ></prism-editor>
        <br />
        <button @click="saveContent">Save</button>
      </tab>
      <tab title="REST API Editor">
        <select v-model="pluginToLoad" @input="loadPlugin">
          <option disabled value>Select Plugin To Load</option>
          <option v-for="p in serverPlugins">{{ p }}</option>
        </select>
        <input type="text" v-model="pluginName" placeholder="plugin name" />
        <input type="text" v-model="callName" placeholder="call name" />
        <br />
        <prism-editor
          v-model="RESTContent"
          language="js"
          :highlight="JShighlighter" 
          line-numbers
        ></prism-editor>
        <br />
        <button @click="saveRest">Save</button>
      </tab>
      <tab title="Logo Selector">
        <div class="file-upload">
          <input
            type="file"
            name="fileToUpload"
            id="fileToUpload"
            @change="getLogo"
          />
        </div>
      </tab>
      <tab title="Backup/Restore">
        <div class="file-upload">
          <input
            type="file"
            name="fileToUpload"
            id="fileToRestore"
            @change="restore"
          />
        </div>
        <div>
          <button @click="backup">Backup</button>
        </div>
      </tab>
      <tab title="Upload Vue Component">
        <div class="file-upload">
          <input
            type="file"
            name="vuetoUpload"
            id="vuetoUpload"
            @change="vueupload"
          />
        </div>
      </tab>
    </tabs>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor";
import { Tabs, Tab } from "vue-slim-tabs";
import ColorPicker from "v-color";
import draggable from "vuedraggable";
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; 
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
export default {
  name: "app",
  components: {
    VueEditor,
    Tabs,
    Tab,
    ColorPicker,
    draggable,
    PrismEditor,
  },
  data() {
    return {
      pluginName: "",
      colorScheme: {},
      content: "",
      menu: "",
      submenu: "",
      name: "",
      nav: [],
      navObj: [],
      pageToLoad: "",
      sidebarBg: "#090",
      sidebarTxt: "#090",
      sidebarActive: "#090",
      sidebarHover: "#090",
      body: "#090",
      sidebarActiveText: "#090",
      sidebarHoverText: "#090",
      host: "",
      RESTContent: "",
      serverPlugins: [],
      pluginToLoad: "",
      callName: "",
    };
  },
  methods: {
    JShighlighter(code) {
        return Prism.highlight(code, Prism.languages.js, "js");
    },
    HTMLhighlighter(code) {
        return Prism.highlight(code, Prism.languages.js, "html");
    },
    backup:async function(){
      let password = prompt("Enter Admin Password");
      let response = await fetch (this.host + "/backup?password=" + password);
      response.blob().then((blob) => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "db.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    },
    restore:async function(input){
      const reader = new FileReader();
      reader.onload = async () => {
        const dataURL = reader.result;
        console.log(dataURL);
        let password = prompt("Enter Admin Password");
        let db = document.getElementById("fileToRestore").files[0];
        let formData = new FormData();
        formData.append("db", db);
        await fetch(this.host + "/restore?password=" + password,
          {method: "POST", body: formData});
      };
      reader.abort();
      reader.readAsDataURL(input.target.files[0]);
    },
    vueupload:async function(input){
      const reader = new FileReader();
      reader.onload = async () => {
        const dataURL = reader.result;
        console.log(dataURL);
        let password = prompt("Enter Admin Password");
        let vuefile = document.getElementById("vuetoUpload").files[0];
        let formData = new FormData();
        formData.append("vue", vuefile);
        await fetch(this.host + "/uploadVue?password=" + password,
          {method: "POST", body: formData});
      };
      reader.abort();
      reader.readAsDataURL(input.target.files[0]);
    },
    loadPlugin: async function () {
      let password = prompt("Enter Admin Password");
      setTimeout(async () => {
        console.log(this.pluginToLoad);
        let response = await (
          await fetch(
            this.host + "/plugin/" + this.pluginToLoad + "?password=" + password
          )
        ).json();
        console.log(response);
        this.callName = Object.keys(response)[0];
        this.RESTContent = response[this.callName][0];
        this.pluginName = this.pluginToLoad;
      });
    },
    saveRest: function () {
      let password = prompt("Enter Admin Password");
      let body = {};
      let stringarray = this.RESTContent.split("require(").slice(1);
      let libs = [];
      for (const s of stringarray) {
        libs.push(s.split('"').join("").split("'").join("").split(")")[0]);
      }
      body[this.callName] = [this.RESTContent, libs];
      console.log(JSON.stringify(body));
      fetch(
        this.host +
          "/installPlugin/" +
          this.pluginName +
          "?password=" +
          password,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify(body),
        }
      );
    },
    reset: function () {
      this.menu = "";
      this.submenu = "";
      this.name = "";
      this.content = "";
      this.pageToLoad = "";
    },
    saveSort: async function () {
      let password = prompt("Enter Admin Password");
      fetch(this.host + "/navJson?password=" + password, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ content: this.navObj }),
      });
    },
    refresh: function () {
      this.$forceUpdate();
    },
    loadContent: async function () {
      setTimeout(async () => {
        let strArr = this.pageToLoad.split("_");
        this.menu = strArr[0];
        this.submenu = strArr[1];
        this.name = strArr[2];
        this.content = await (
          await fetch(
            this.host +
              "/getPage/" +
              this.menu +
              "/" +
              this.submenu +
              "/" +
              this.name
          )
        ).text();
      }, 500);
    },
    deleteContent: function () {
      let password = prompt("Enter Admin Password");
      fetch(
        this.host +
          "/deletePage/" +
          this.menu +
          "/" +
          this.submenu +
          "/" +
          this.name +
          "?password=" +
          password
      );
    },
    saveContent: function () {
      let password = prompt("Enter Admin Password");
      fetch(
        this.host + "/addPage/cms/pages/" + this.name + "?password=" + password,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({ content: this.content }),
        }
      );
    },
    saveColor: function () {
      let password = prompt("Enter Admin Password");
      this.colorScheme.stylesheet.rules.find(
        (r) => r.selectors != undefined && r.selectors[0] == ".sidebar"
      ).declarations[0].value = this.sidebarBg;
      this.colorScheme.stylesheet.rules.find(
        (r) => r.selectors != undefined && r.selectors[0] == ".sidebar a"
      ).declarations[0].value = this.sidebarTxt;
      this.colorScheme.stylesheet.rules.find(
        (r) => r.selectors != undefined && r.selectors[0] == ".sidebar a.active"
      ).declarations[0].value = this.sidebarActive;
      this.colorScheme.stylesheet.rules.find(
        (r) => r.selectors != undefined && r.selectors[0] == ".sidebar a.active"
      ).declarations[1].value = this.sidebarActiveText;
      this.colorScheme.stylesheet.rules.find(
        (r) =>
          r.selectors != undefined &&
          r.selectors[0] == ".sidebar a:hover:not(.active)"
      ).declarations[0].value = this.sidebarHover;
      this.colorScheme.stylesheet.rules.find(
        (r) =>
          r.selectors != undefined &&
          r.selectors[0] == ".sidebar a:hover:not(.active)"
      ).declarations[1].value = this.sidebarHoverText;
      this.colorScheme.stylesheet.rules.find(
        (r) => r.selectors != undefined && r.selectors[0] == "body"
      ).declarations[0].value = this.body;
      fetch(this.host + "/colorScheme" + "?password=" + password, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ content: this.colorScheme }),
      });
    },
    getLogo(input) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result;
        const base64 = reader.result.split(",").pop();
        console.log(dataURL);
        let password = prompt("Enter Admin Password");
        fetch(this.host + "/logo" + "?password=" + password, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            content: dataURL,
          }),
        });
      };
      reader.abort();
      reader.readAsDataURL(input.target.files[0]);
    },
    getHost: async function () {
      if (this.$cookies.get("cmshost")) {
        this.host = this.$cookies.get("cmshost");
      } else {
        this.host = prompt("Enter Site Host");
        this.$cookies.set("cmshost",this.host);
      }
    },
  },
  async mounted() {
    await this.getHost();
    try {
      this.colorScheme = await (await fetch(this.host + "/colorScheme")).json();
    } catch (e) {
      window.alert(e);
      this.$cookies.remove("cmshost")
      await this.getHost();
      return;
    }
    try {
      this.navObj = await (await fetch(this.host + "/navJson")).json();
      this.nav = await (await fetch(this.host + "/navList")).json();
    } catch (e) {
      window.alert("Site is Fresh!");
    }
    console.log(this.colorScheme);
    this.sidebarBg = this.colorScheme.stylesheet.rules.find(
      (r) => r.selectors != undefined && r.selectors[0] == ".sidebar"
    ).declarations[0].value;
    this.sidebarTxt = this.colorScheme.stylesheet.rules.find(
      (r) => r.selectors != undefined && r.selectors[0] == ".sidebar a"
    ).declarations[0].value;
    this.sidebarActive = this.colorScheme.stylesheet.rules.find(
      (r) => r.selectors != undefined && r.selectors[0] == ".sidebar a.active"
    ).declarations[0].value;
    this.sidebarActiveText = this.colorScheme.stylesheet.rules.find(
      (r) => r.selectors != undefined && r.selectors[0] == ".sidebar a.active"
    ).declarations[1].value;
    this.sidebarHover = this.colorScheme.stylesheet.rules.find(
      (r) =>
        r.selectors != undefined &&
        r.selectors[0] == ".sidebar a:hover:not(.active)"
    ).declarations[0].value;
    this.sidebarHoverText = this.colorScheme.stylesheet.rules.find(
      (r) =>
        r.selectors != undefined &&
        r.selectors[0] == ".sidebar a:hover:not(.active)"
    ).declarations[1].value;
    this.body = this.colorScheme.stylesheet.rules.find(
      (r) => r.selectors != undefined && r.selectors[0] == "body"
    ).declarations[0].value;
    this.serverPlugins = await (
      await fetch(this.host + "/getPluginList")
    ).json();
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.colorContainer {
  margin: 20px;
  border: solid 2px;
  padding: 10px;
  border-radius: 5px;
}
.text {
  border: solid 2px;
  margin: 2px;
  border-radius: 5px;
}
.container {
  display: grid;
  grid-template-columns: 313px 313px 313px 313px;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "a1 a2 a3 a4"
    "b1 b2 b3 b4"
    "c1 c2 c3 c4";
}

@import "../node_modules/v-color/dist/index.css";
</style>
<style src="vue-slim-tabs/themes/default.css"></style>
