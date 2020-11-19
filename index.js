//docker vars
var HOST = process.env.HOST;
var NAME = process.env.NAME;
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
var port = process.env.MAIN_PORT;
var ext_port = process.env.NEW_PORT;

//libs
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const express = require("express");
var css = require("css");
var cors = require("cors");
const bodyParser = require("body-parser");
var html2json = require("html2json").html2json;
var json2html = require("html2json").json2html;
var index = require("./index.json");
var npm = require("npm");
var exec = require("child_process").exec;

//inits
const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({
  pages: [],
  plugins: [],
  main: [
    { name: "index", content: index },
    { name: "nav", content: undefined },
    { name: "logo", content: undefined },
  ],
}).write();
const app = express();
const options = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
  ],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: "*",
  preflightContinue: false,
};
app.use(cors(options));
app.use(bodyParser.json());
var myIP = HOST + ":" + port;
var siteName = NAME;
var password = ADMIN_PASSWORD;
child = exec("npm run build").stderr.pipe(process.stderr);
app.use("/editor", express.static("dist"));
app.use("/js", express.static("dist/js"));
app.use("/css", express.static("dist/css"));
app.get("/getPluginList", (req, res) => {
  res.send(db.get("plugins").map("name").value());
});
app.get("/plugin/:name", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  let response = db.get("plugins").find({ name: req.params.name }).value();
  res.send(response.content);
});
app.post("/updateMain", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  db.get("main").push({ name: "index", content: req.body.content }).write();
  res.send(200);
});
app.get("/init", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  db.get("main").push({ name: "index", content: index }).write();
  res.send(200);
});
app.get("/deletePage/:menu/:submenu/:name", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  db.get("pages")
    .remove({
      name: req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
    })
    .write();
  navigation = db.get("main").find({ name: "nav" }).value();
  navigation.child = navigation.child.filter(
    (r) => r.child[0].text != req.params.name
  );
  db.get("main").remove({ name: "nav" }).write();
  db.get("main").push({ name: "nav", content: navigation }).write();
  res.send(200);
});
app.post("/addPage/:menu/:submenu/:name", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  db.get("pages")
    .remove({
      name: req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
    })
    .write();
  db.get("pages")
    .push({
      name: req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
      content: html2json(req.body.content),
    })
    .write();
  let navigation = db.get("main").find({ name: "nav" }).value();
  console.log(navigation);
  if (navigation.content == undefined) {
    navigation.content = { node: "root", child: [] };
    navigation.content["child"].push({
      node: "element",
      tag: "a",
      attr: {
        onclick: "getPage(this.id)",
        id: req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
        href:
          "#/" +
          req.params.menu +
          "_" +
          req.params.submenu +
          "_" +
          req.params.name,
      },
      child: [
        {
          node: "text",
          text: req.params.name,
        },
      ],
    });
  } else {
    navigation.content.child = navigation.content.child.filter(
      (r) => r.child[0].text != req.params.name
    );
    navigation.content.child.push({
      node: "element",
      tag: "a",
      attr: {
        onclick: "getPage(this.id)",
        id: req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
        href:
          "#/" +
          req.params.menu +
          "_" +
          req.params.submenu +
          "_" +
          req.params.name,
      },
      child: [
        {
          node: "text",
          text: req.params.name,
        },
      ],
    });
  }
  db.get("main").remove({ name: "nav" }).write();
  console.log(
    db.get("main").push({ name: "nav", content: navigation.content }).write()
  );
  res.send(200);
});
app.get("/getPage/:menu/:submenu/:name", (req, res) => {
  res.send(
    json2html(
      db
        .get("pages")
        .find({
          name:
            req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
        })
        .value().content
    )
  );
});
app.get("/navigation", (req, res) => {
  let navigation = db.get("main").find({ name: "nav" }).value();
  if (navigation.content == undefined) {
    res.send("");
  } else {
    res.send(json2html(navigation.content));
  }
});
app.get("/navJson", (req, res) => {
  res.send(db.get("main").find({ name: "nav" }).value().content);
});
app.post("/navJson", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  db.get("main").remove({ name: "nav" }).write();
  db.get("main").push({ name: "nav", content: req.body.content }).write();
  res.send(200);
});
app.get("/logo", (req, res) => {
  let logo = db.get("main").find({ name: "logo" }).value();
  if (logo.content == undefined) {
    res.send("");
  } else {
    res.send(json2html(logo.content));
  }
});
app.post("/logo", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  db.get("main").remove({ name: "logo" }).write();
  db.get("main")
    .push({
      name: "logo",
      content: {
        node: "root",
        child: [
          {
            node: "element",
            tag: "p",
            child: [
              {
                node: "element",
                tag: "img",
                attr: {
                  src: req.body.content,
                },
              },
            ],
          },
        ],
      },
    })
    .write();
  res.send(200);
});
app.get("/navList", (req, res) => {
  let respArray = [];
  nav = db.get("main").find({ name: "nav" }).value();
  if (nav == null) {
    respArray = [];
  } else {
    for (const n of nav.content.child) {
      respArray.push(n.attr.id);
    }
  }
  res.send(respArray);
});
app.get("/", (req, res) => {
  console.log(db.get("main").find({ name: "index" }).value());
  res.cookie("cmshost", HOST + ":" + ext_port);
  res.send(
    json2html(db.get("main").find({ name: "index" }).value().content)
      .split("http://localhost:80")
      .join(myIP)
  );
});
app.get("/colorScheme", (req, res) => {
  let result = db.get("main").find({ name: "index" }).value().content;
  res.send(
    css.parse(
      result.child[0].child
        .find((r) => r.tag == "head")
        .child.find((r) => r.tag == "style" && r.attr.id == "colors").child[0]
        .text
    )
  );
});
app.post("/colorScheme", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  let result = db.get("main").find({ name: "index" }).value().content;
  result.child[0].child
    .find((r) => r.tag == "head")
    .child.find(
      (r) => r.tag == "style" && r.attr.id == "colors"
    ).child[0].text = css.stringify(req.body.content);
  db.get("main").remove({ name: "index" }).write();
  db.get("main").push({ name: "index", content: result }).write();
  res.send(200);
});
app.get("/siteName", (req, res) => {
  res.send(siteName);
});
app.get("/plugins/:name/:call", async (req, res) => {
  let result = db.get("plugins").find({ name: req.params.name }).value()
    .content;
  var func = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    "return " + result[req.params.call][0]
  )(exports, require, module, __filename, __dirname);
  let response = await func(req.query);
  res.send(response);
});
app.post("/plugins/:name/:call", async (req, res) => {
  let result = db.get("plugins").find({ name: req.params.name }).value()
    .content;
  var func = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    "return " + result[req.params.call][0]
  )(exports, require, module, __filename, __dirname);
  let response = await func(req.query, req.body);
  res.send(response);
});
app.post("/installPlugin/:name", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  console.log(req.body);
  db.get("plugins").remove({ name: req.params.name }).write();
  db.get("plugins").push({ name: req.params.name, content: req.body }).write();
  console.log(req.body);
  let pluginList = req.body[Object.keys(req.body)[0]][1];
  npm.load(function (err) {
    npm.commands.install(pluginList, function (er, data) {
      res.send(200);
    });
  });
});
app.get("/reInstallDeps/:name", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  result = db.get("plugins").find({ name: req.params.name }).value().content;
  let pluginList = result[1];
  npm.load(function (err) {
    npm.commands.install(pluginList, function (er, data) {
      res.send(200);
    });
  });
});
app.get("/removePlugin/:name", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  db.get("plugins").remove({ name: req.params.name }).write();
  res.send(200);
});
app.listen(port, () => console.log(`CMSSimple online on ${port}!`));
