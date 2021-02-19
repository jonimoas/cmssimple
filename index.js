//docker vars
var HOST = process.env.HOST;
var NAME = process.env.NAME;
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
var port = process.env.MAIN_PORT;
var ext_port = process.env.NEW_PORT;

//libs
const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const express = require("express");
var css = require("css");
var cors = require("cors");
const bodyParser = require("body-parser");
var html2json = require("html2json").html2json;
var json2html = require("html2json").json2html;
var npm = require("npm");
var exec = require("child_process").exec;
const multer = require("multer");
var fs = require("fs");

//inits
var db;
buildVue();
initDB();
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
const upload = multer({ dest: "./" });
var myIP = HOST + ":" + ext_port;
var siteName = NAME;
var password = ADMIN_PASSWORD;

//vue endpoints
app.use("/vue", express.static("dist"));
app.use("/js", express.static("dist/js"));
app.use("/css", express.static("dist/css"));
app.post("/uploadVue", auth, upload.single("vue"), (req, res) => {
  console.log(req.file);
  try {
    fs.unlinkSync("./src/" + req.file.originalname);
  } catch (e) {}
  fs.renameSync("./" + req.file.filename, "./src/" + req.file.originalname);
  let navigation = db
    .get("main")
    .find({ name: "nav" })
    .value();
  console.log(navigation);
  if (navigation.content == undefined) {
    navigation.content = { node: "root", child: [] };
    navigation.content["child"].push({
      node: "element",
      tag: "a",
      attr: {
        onclick: "getVue(this.id)",
        id: req.file.originalname.split(".")[0],
      },
      child: [
        {
          node: "text",
          text: req.file.originalname.split(".")[0],
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
        onclick: "getVue(this.id)",
        id: req.file.originalname.split(".")[0],
      },
      child: [
        {
          node: "text",
          text: req.file.originalname.split(".")[0],
        },
      ],
    });
  }
  let packages = [];
  let contents = fs.readFileSync("./src/" + req.file.originalname);
  for (const l of contents
    .toString()
    .split("<script>")[1]
    .split("</string>")[0]
    .split(";")) {
    if (
      l.indexOf("import") > -1 &&
      l.indexOf("from") > -1 &&
      l.indexOf("/") < 0
    ) {
      packages.push(
        l
          .split("from")[1]
          .split('"')
          .join("")
          .split(" ")
          .join("")
          .split("'")
          .join("")
      );
    }
  }
  console.log(packages);
  db.get("main")
    .remove({ name: "nav" })
    .write();
  console.log(
    db
      .get("main")
      .push({ name: "nav", content: navigation.content })
      .write()
  );
  npm.load(function(err) {
    npm.commands.install(packages, function(er, data) {
      buildVue();
      res.send(200);
    });
  });
});

//plugin endpoints
app.get("/getPluginList", (req, res) => {
  res.send(
    db
      .get("plugins")
      .map("name")
      .value()
  );
});
app.get("/plugin/:name", auth, (req, res) => {
  let response = db
    .get("plugins")
    .find({ name: req.params.name })
    .value();
  res.send(response.content);
});
app.get("/plugins/:name/:call", async (req, res) => {
  let result = db
    .get("plugins")
    .find({ name: req.params.name })
    .value().content;
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
  let result = db
    .get("plugins")
    .find({ name: req.params.name })
    .value().content;
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
app.post("/installPlugin/:name", auth, (req, res) => {
  db.get("plugins")
    .remove({ name: req.params.name })
    .write();
  db.get("plugins")
    .push({ name: req.params.name, content: req.body })
    .write();
  let pluginList = req.body[Object.keys(req.body)[0]][1];
  npm.load(function(err) {
    npm.commands.install(pluginList, function(er, data) {
      res.send(200);
    });
  });
});
app.get("/reInstallDeps/:name", auth, (req, res) => {
  result = db
    .get("plugins")
    .find({ name: req.params.name })
    .value().content;
  let pluginList = result[1];
  npm.load(function(err) {
    npm.commands.install(pluginList, function(er, data) {
      res.send(200);
    });
  });
});
app.get("/removePlugin/:name", auth, (req, res) => {
  db.get("plugins")
    .remove({ name: req.params.name })
    .write();
  res.send(200);
});

//page endpoints
app.get("/deletePage/:menu/:submenu/:name", auth, (req, res) => {
  db.get("pages")
    .remove({
      name: req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
    })
    .write();
  navigation = db
    .get("main")
    .find({ name: "nav" })
    .value();
  navigation.child = navigation.child.filter(
    (r) => r.child[0].text != req.params.name
  );
  db.get("main")
    .remove({ name: "nav" })
    .write();
  db.get("main")
    .push({ name: "nav", content: navigation })
    .write();
  res.send(200);
});
app.post("/addPage/:menu/:submenu/:name", auth, (req, res) => {
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
  let navigation = db
    .get("main")
    .find({ name: "nav" })
    .value();
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
  db.get("main")
    .remove({ name: "nav" })
    .write();
  console.log(
    db
      .get("main")
      .push({ name: "nav", content: navigation.content })
      .write()
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

//navigation endpoints
app.get("/navList", (req, res) => {
  let respArray = [];
  nav = db
    .get("main")
    .find({ name: "nav" })
    .value();
  if (nav == null) {
    respArray = [];
  } else {
    for (const n of nav.content.child) {
      respArray.push(n.attr.id);
    }
  }
  res.send(respArray);
});
app.get("/navigation", (req, res) => {
  let navigation = db
    .get("main")
    .find({ name: "nav" })
    .value();
  if (navigation.content == undefined) {
    res.send("");
  } else {
    res.send(json2html(navigation.content));
  }
});
app.get("/navJson", (req, res) => {
  res.send(
    db
      .get("main")
      .find({ name: "nav" })
      .value().content
  );
});
app.post("/navJson", auth, (req, res) => {
  db.get("main")
    .remove({ name: "nav" })
    .write();
  db.get("main")
    .push({ name: "nav", content: req.body.content })
    .write();
  res.send(200);
});

//logo endpoints
app.get("/logo", (req, res) => {
  let logo = db
    .get("main")
    .find({ name: "logo" })
    .value();
  if (logo.content == undefined) {
    res.send("");
  } else {
    res.send(json2html(logo.content));
  }
});
app.post("/logo", auth, (req, res) => {
  db.get("main")
    .remove({ name: "logo" })
    .write();
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

//color scheme endpoints
app.get("/colorScheme", (req, res) => {
  let result = db
    .get("main")
    .find({ name: "index" })
    .value().content;
  res.send(
    css.parse(
      result.child[0].child
        .find((r) => r.tag == "head")
        .child.find((r) => r.tag == "style" && r.attr.id == "colors").child[0]
        .text
    )
  );
});
app.post("/colorScheme", auth, (req, res) => {
  let result = db
    .get("main")
    .find({ name: "index" })
    .value().content;
  result.child[0].child
    .find((r) => r.tag == "head")
    .child.find(
      (r) => r.tag == "style" && r.attr.id == "colors"
    ).child[0].text = css.stringify(req.body.content);
  db.get("main")
    .remove({ name: "index" })
    .write();
  db.get("main")
    .push({ name: "index", content: result })
    .write();
  res.send(200);
});

//backup endpoints
app.get("/backup", auth, (req, res) => {
  res.download("./db.json");
});
app.post("/restore", auth, upload.single("db"), (req, res) => {
  fs.unlinkSync("./db.json");
  fs.renameSync("./" + req.file.filename, "./db.json");
  initDB();
  res.send(200);
});

//main endpoints
app.post("/updateMain", auth, (req, res) => {
  db.get("main")
    .push({ name: "index", content: req.body.content })
    .write();
  res.send(200);
});
app.get("/init", auth, (req, res) => {
  db.get("main")
    .push({ name: "index", content: index })
    .write();
  res.send(200);
});
app.get("/", (req, res) => {
  console.log(
    db
      .get("main")
      .find({ name: "index" })
      .value()
  );
  res.cookie("cmshost", HOST + ":" + ext_port);
  res.send(
    json2html(
      db
        .get("main")
        .find({ name: "index" })
        .value().content
    )
      .split("http://localhost:80")
      .join(myIP)
  );
});
app.get("/siteName", (req, res) => {
  res.send(siteName);
});

app.listen(port, () => console.log(`CMSSimple online on ${port}!`));

//helper functions
function buildVue() {
  let routes = [];
  fs.readdirSync("./src").forEach((file) => {
    if (file.indexOf(".vue") > 0 && file != "App.vue") {
      routes.push({
        name: file.split(".")[0],
        file: file,
      });
    }
  });
  console.log(routes);
  fs.writeFileSync("./routes.json", JSON.stringify(routes));
  child = exec("npm run build").stderr.pipe(process.stderr);
}
async function initDB() {
  let index = html2json(fs.readFileSync("./default.html").toString());
  const adapter = new FileSync("db.json");
  db = low(adapter);
  db.defaults({
    pages: [],
    plugins: [],
    main: [
      { name: "index", content: index },
      { name: "nav", content: undefined },
      { name: "logo", content: undefined },
    ],
  }).write();
}
function auth(req, res, next) {
  if (req.query.password != password) {
    res.send(400);
    return;
  } else {
    next();
  }
}
