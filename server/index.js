require("dotenv").config();
const express = require("express");
const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const { checkJwt, scope_order } = require("./security");
const { saveOrderHistory } = require("./order-service");

const bodyParser = require("body-parser");

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const app = express();

  // create application/json parser
  var jsonParser = bodyParser.json();

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

  // Answer API requests.
  app.get("/api", function (req, res) {
    res.set("Content-Type", "application/json");
    res.send('{"message":"Hello from the custom server!"}');
  });

  app.get("/api/external", (req, res) => {
    res.set("Content-Type", "application/json");
    res.send({
      msg: "It's working with no security!",
    });
  });

  app.post("/api/order", checkJwt, scope_order, jsonParser, (req, res) => {
    res.set("Content-Type", "application/json");

    try {
      const response = saveOrderHistory(req.body);
      if (!response.error) {
        const pizza = req.body.item_ordered;
        res.send({ msg: `Your ${pizza} is on the way!` });
      }
    } catch (error) {
      console.log("put in order failed", error);
      throw error;
    }
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get("*", function (request, response) {
    response.sendFile(
      path.resolve(__dirname, "../react-ui/build", "index.html")
    );
  });

  app.listen(PORT, function () {
    console.error(
      `Node ${
        isDev ? "dev server" : "cluster worker " + process.pid
      }: listening on port ${PORT}`
    );
  });
}
