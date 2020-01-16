//docker vars
var COUCHBASE_USERNAME = process.env.COUCHBASE_USERNAME;
var COUCHBASE_PASSWORD = process.env.COUCHBASE_PASSWORD;
var COUCHBASE_HOST = process.env.COUCHBASE_HOST;
var HOST = process.env.HOST;
var NAME = process.env.NAME;
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
var DEFAULT_BUCKET = process.env.DEFAULT_BUCKET;
var PAGES_BUCKET = process.env.PAGES_BUCKET;
var port = process.env.PORT;
//libs
const express = require("express");
var css = require("css");
var cors = require("cors");
const bodyParser = require("body-parser");
var html2json = require("html2json").html2json;
var json2html = require("html2json").json2html;
var couchbase = require("couchbase");
var index = require("./index.json");
//inits
const app = express();

const options = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token"
  ],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: "*",
  preflightContinue: false
};
app.use(cors(options));
app.use(bodyParser.json());
var cluster = new couchbase.Cluster(COUCHBASE_HOST);
cluster.authenticate(COUCHBASE_USERNAME, COUCHBASE_PASSWORD);
var defaultBucket = cluster.openBucket(DEFAULT_BUCKET);
var pagesBucket = cluster.openBucket(PAGES_BUCKET);
var myIP = HOST;
var siteName = NAME;
var password = ADMIN_PASSWORD;
defaultBucket.on("error", function(err) {
  console.log("CONNECT ERROR:", err);
});
pagesBucket.on("error", function(err) {
  console.log("CONNECT ERROR:", err);
});
app.post("/updateMain", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  defaultBucket.upsert("index", html2json(req.body.content), function(
    err,
    result
  ) {
    res.send(200);
  });
});
app.get("/init", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  defaultBucket.upsert("index", index, function(err, result) {
    res.send(200);
  });
});
app.get("/deletePage/:menu/:submenu/:name", (req, res) => {
  pagesBucket.remove(
    req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
    function(err, result) {
      defaultBucket.get("navigation", function(err, result) {
        let newJson;
        newJson = result.value;
        newJson.child = newJson.child.filter(
          r => r.child[0].text != req.params.name
        );
        defaultBucket.upsert(
          "navigation",
          Object.assign({}, newJson, {}),
          function(err, result) {
            console.log(err);
            res.send(200);
          }
        );
      });
    }
  );
});
app.post("/addPage/:menu/:submenu/:name", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  pagesBucket.upsert(
    req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
    html2json(req.body.content),
    function(err, result) {
      console.log(err);
      defaultBucket.get("navigation", function(err, result) {
        let newJson;
        if (result == null) {
          newJson = { node: "root", child: [] };
          newJson["child"].push({
            node: "element",
            tag: "a",
            attr: {
              onclick: "getPage(this.id)",
              id:
                req.params.menu +
                "_" +
                req.params.submenu +
                "_" +
                req.params.name,
              href:
                "#/" +
                req.params.menu +
                "_" +
                req.params.submenu +
                "_" +
                req.params.name
            },
            child: [
              {
                node: "text",
                text: req.params.name
              }
            ]
          });
          defaultBucket.upsert(
            "navigation",
            Object.assign({}, newJson, {}),
            function(err, result) {
              console.log(err);
              res.send(200);
            }
          );
        } else {
          newJson = result.value;
          newJson.child = newJson.child.filter(
            r => r.child[0].text != req.params.name
          );
          newJson.child.push({
            node: "element",
            tag: "a",
            attr: {
              onclick: "getPage(this.id)",
              id:
                req.params.menu +
                "_" +
                req.params.submenu +
                "_" +
                req.params.name,
              href:
                "#/" +
                req.params.menu +
                "_" +
                req.params.submenu +
                "_" +
                req.params.name
            },
            child: [
              {
                node: "text",
                text: req.params.name
              }
            ]
          });
          defaultBucket.upsert(
            "navigation",
            Object.assign({}, newJson, {}),
            function(err, result) {
              console.log(err);
              res.send(200);
            }
          );
        }
      });
    }
  );
});
app.get("/getPage/:menu/:submenu/:name", (req, res) => {
  pagesBucket.get(
    req.params.menu + "_" + req.params.submenu + "_" + req.params.name,
    function(err, result) {
      console.log(result);
      res.send(json2html(result.value));
    }
  );
});
app.get("/navigation", (req, res) => {
  defaultBucket.get("navigation", function(err, result) {
    if (result == null) {
      res.send("Your Pages will show here!");
    } else {
      console.log(result);
      res.send(json2html(result.value));
    }
  });
});
app.get("/navJson", (req, res) => {
  defaultBucket.get("navigation", function(err, result) {
    if (result == null) {
      res.send("Your Pages will show here!");
    } else {
      console.log(result);
      res.send(result.value);
    }
  });
});
app.post("/navJson", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  defaultBucket.upsert("navigation", req.body.content, function(err, result) {
    res.send(200);
  });
});
app.get("/logo", (req, res) => {
  defaultBucket.get("logo", function(err, result) {
    if (result == null) {
      res.send("Your Logo Will Show Here!<br>");
    } else {
      console.log(result);
      res.send(json2html(result.value));
    }
  });
});
app.post("/logo", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  defaultBucket.upsert(
    "logo",
    {
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
                src: req.body.content
              }
            }
          ]
        }
      ]
    },
    function(err, result) {
      res.send(200);
    }
  );
});
app.get("/navList", (req, res) => {
  let respArray = [];
  defaultBucket.get("navigation", function(err, result) {
    console.log(result);
    if (result == null) {
      respArray = [];
    } else {
      for (const n of result.value.child) {
        respArray.push(n.attr.id);
      }
    }
    res.send(respArray);
  });
});
app.get("/", (req, res) => {
  defaultBucket.get("index", function(err, result) {
    if (result == null) {
      res.send("Please use the /init call to initialize CMSSimple!");
    } else {
      console.log(result);
      res.send(
        json2html(result.value)
          .split("http://localhost:80")
          .join(myIP)
      );
    }
  });
});
app.get("/colorScheme", (req, res) => {
  defaultBucket.get("index", function(err, result) {
    if (result == null) {
      res.send("");
    } else {
      res.send(
        css.parse(
          result.value.child[0].child
            .find(r => r.tag == "head")
            .child.find(r => r.tag == "style" && r.attr.id == "colors").child[0]
            .text
        )
      );
    }
  });
});
app.post("/colorScheme", (req, res) => {
  if (req.query.password != password) {
    res.send(400);
    return;
  }
  defaultBucket.get("index", function(err, result) {
    result.value.child[0].child
      .find(r => r.tag == "head")
      .child.find(
        r => r.tag == "style" && r.attr.id == "colors"
      ).child[0].text = css.stringify(req.body.content);
    defaultBucket.upsert("index", result.value, function(err, result) {
      res.send(200);
    });
  });
});
app.get("/siteName", (req, res) => {
  res.send(siteName);
});
console.log(index);
app.listen(port, () => console.log(`CMSSimple online on ${port}!`));
