const express = require("express");
require("express-async-errors");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("./custom/logger");

const app = express();
const http = require("http");

const server = http.createServer(app);

app.use(bodyParser.json({ limit: "10MB" }));

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id,x-acess-id"
  );
  app.use(cors());
  next();
});

app.use(routes);

app.use((err, req, res, next) => {
  logger.error(
    `path: ${err.path ? err.path : "no path"} message: ${err.message}`
  );

  if (err.status) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({
      message: err.message,
    });
  }
});

server.listen(3333, () => {
  console.log("server on *:3333");
});
