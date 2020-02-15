<template>
  <div id="app">
    <tabs>
      <tab title="Color Schemes">
        <div class="container">
          <div class="colorContainer" style="grid-area:a1;">
            <div class="text">Sidebar Background</div>
            <color-picker
              v-bind:color="sidebarBg"
              @change="function(input){sidebarBg = input.hex;}"
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area:a2;">
            <div class="text">Sidebar Text</div>
            <color-picker
              v-bind:color="sidebarTxt"
              @change="function(input){sidebarTxt = input.hex;}"
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area:a3;">
            <div class="text">Sidebar Active Button</div>
            <color-picker
              v-bind:color="sidebarActive"
              @change="function(input){sidebarActive = input.hex;}"
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area:a4;">
            <div class="text">Sidebar Active Text</div>
            <color-picker
              v-bind:color="sidebarActiveText"
              @change="function(input){sidebarActiveText = input.hex;}"
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area:b1;">
            <div class="text">Sidebar Hover Button</div>
            <color-picker
              v-bind:color="sidebarHover"
              @change="function(input){sidebarHover = input.hex;}"
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area:b2;">
            <div class="text">Sidebar Hover Text</div>
            <color-picker
              v-bind:color="sidebarHoverText"
              @change="function(input){sidebarHoverText = input.hex;}"
            ></color-picker>
          </div>
          <div class="colorContainer" style="grid-area:b3;">
            <div class="text">Background</div>
            <color-picker v-bind:color="body" @change="function(input){body = input.hex;}"></color-picker>
          </div>
          <div style="grid-area:c3;">
            <button @click="saveColor">Save</button>
          </div>
        </div>
      </tab>
      <tab title="Page Sort">
        <draggable v-model="navObj.child" group="people" @start="drag=true" @end="drag=false">
          <div v-for="n in navObj.child" :key="n.attr.id">
            <button>{{n.attr.id}}</button>
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
          <option v-for="n in nav">{{n}}</option>
        </select>
        <input type="text" v-model="menu" placeholder="menu" />
        <input type="text" v-model="submenu" placeholder="submenu" />
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
          <option v-for="n in nav">{{n}}</option>
        </select>
        <input type="text" v-model="menu" placeholder="menu" />
        <input type="text" v-model="submenu" placeholder="submenu" />
        <input type="text" v-model="name" placeholder="name" />
        <button @click="deleteContent">Delete</button>
        <br />
        <prism-editor v-model="content" language="html" :line-numbers="true"></prism-editor>
        <br />
        <button @click="saveContent">Save</button>
      </tab>
      <tab title="REST API Editor">
        <select v-model="pluginToLoad" @input="loadPlugin">
          <option disabled value>Select Plugin To Load</option>
          <option v-for="p in serverPlugins">{{p}}</option>
        </select>
        <input type="text" v-model="pluginName" placeholder="plugin name" />
        <br />
        <prism-editor v-model="RESTContent" language="js" :line-numbers="true"></prism-editor>
        <br />
        <button @click="saveRest">Save</button>
      </tab>
      <tab title="Logo Selector">
        <div class="file-upload">
          <input type="file" name="fileToUpload" id="fileToUpload" @change="getLogo" />
        </div>
      </tab>
      <tab title="Raw Code Upload" v-if="false"></tab>
    </tabs>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor";
import { Tabs, Tab } from "vue-slim-tabs";
import ColorPicker from "v-color";
import draggable from "vuedraggable";
import PrismEditor from "vue-prism-editor";
import Prism from "prismjs";
export default {
  name: "app",
  components: {
    VueEditor,
    Tabs,
    Tab,
    ColorPicker,
    draggable,
    PrismEditor
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
      pluginToLoad: ""
    };
  },
  methods: {
    loadPlugin: async function() {
      let password = prompt("Enter Admin Password");
      setTimeout(async () => {
        console.log(this.pluginToLoad);
        let response = await (
          await fetch(
            this.host + "/plugin/" + this.pluginToLoad + "?password=" + password
          )
        ).json();
        console.log(response);
        this.RESTContent = JSON.stringify(response);
        this.pluginName = this.pluginToLoad;
      });
    },
    saveRest: function() {
      let password = prompt("Enter Admin Password");
      fetch(
        this.host +
          "/installPlugin/" +
          this.pluginName +
          "?password=" +
          password,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          },
          body: this.RESTContent
        }
      );
    },
    reset: function() {
      this.menu = "";
      this.submenu = "";
      this.name = "";
      this.content = "";
      this.pageToLoad = "";
    },
    saveSort: async function() {
      let password = prompt("Enter Admin Password");
      fetch(this.host + "/navJson?password=" + password, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({ content: this.navObj })
      });
    },
    refresh: function() {
      this.$forceUpdate();
    },
    loadContent: async function() {
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
    deleteContent: function() {
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
    saveContent: function() {
      let password = prompt("Enter Admin Password");
      fetch(
        this.host +
          "/addPage/" +
          this.menu +
          "/" +
          this.submenu +
          "/" +
          this.name +
          "?password=" +
          password,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify({ content: this.content })
        }
      );
    },
    saveColor: function() {
      let password = prompt("Enter Admin Password");
      this.colorScheme.stylesheet.rules.find(
        r => r.selectors != undefined && r.selectors[0] == ".sidebar"
      ).declarations[0].value = this.sidebarBg;
      this.colorScheme.stylesheet.rules.find(
        r => r.selectors != undefined && r.selectors[0] == ".sidebar a"
      ).declarations[0].value = this.sidebarTxt;
      this.colorScheme.stylesheet.rules.find(
        r => r.selectors != undefined && r.selectors[0] == ".sidebar a.active"
      ).declarations[0].value = this.sidebarActive;
      this.colorScheme.stylesheet.rules.find(
        r => r.selectors != undefined && r.selectors[0] == ".sidebar a.active"
      ).declarations[1].value = this.sidebarActiveText;
      this.colorScheme.stylesheet.rules.find(
        r =>
          r.selectors != undefined &&
          r.selectors[0] == ".sidebar a:hover:not(.active)"
      ).declarations[0].value = this.sidebarHover;
      this.colorScheme.stylesheet.rules.find(
        r =>
          r.selectors != undefined &&
          r.selectors[0] == ".sidebar a:hover:not(.active)"
      ).declarations[1].value = this.sidebarHoverText;
      this.colorScheme.stylesheet.rules.find(
        r => r.selectors != undefined && r.selectors[0] == "body"
      ).declarations[0].value = this.body;
      fetch(this.host + "/colorScheme" + "?password=" + password, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({ content: this.colorScheme })
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
            "Content-type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify({
            content: dataURL
          })
        });
      };
      reader.abort();
      reader.readAsDataURL(input.target.files[0]);
    }
  },
  async mounted() {
    try {
      this.host = (await (await fetch("config")).json()).api;
    } catch (ex) {
      this.host = "http://localhost:80";
    }
    this.navObj = await (await fetch(this.host + "/navJson")).json();
    this.nav = await (await fetch(this.host + "/navList")).json();
    this.colorScheme = await (await fetch(this.host + "/colorScheme")).json();
    console.log(this.colorScheme);
    this.sidebarBg = this.colorScheme.stylesheet.rules.find(
      r => r.selectors != undefined && r.selectors[0] == ".sidebar"
    ).declarations[0].value;
    this.sidebarTxt = this.colorScheme.stylesheet.rules.find(
      r => r.selectors != undefined && r.selectors[0] == ".sidebar a"
    ).declarations[0].value;
    this.sidebarActive = this.colorScheme.stylesheet.rules.find(
      r => r.selectors != undefined && r.selectors[0] == ".sidebar a.active"
    ).declarations[0].value;
    this.sidebarActiveText = this.colorScheme.stylesheet.rules.find(
      r => r.selectors != undefined && r.selectors[0] == ".sidebar a.active"
    ).declarations[1].value;
    this.sidebarHover = this.colorScheme.stylesheet.rules.find(
      r =>
        r.selectors != undefined &&
        r.selectors[0] == ".sidebar a:hover:not(.active)"
    ).declarations[0].value;
    this.sidebarHoverText = this.colorScheme.stylesheet.rules.find(
      r =>
        r.selectors != undefined &&
        r.selectors[0] == ".sidebar a:hover:not(.active)"
    ).declarations[1].value;
    this.body = this.colorScheme.stylesheet.rules.find(
      r => r.selectors != undefined && r.selectors[0] == "body"
    ).declarations[0].value;
    this.serverPlugins = await (
      await fetch(this.host + "/getPluginList")
    ).json();
  }
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
