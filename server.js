const express = require("express");
const path = require("path");
const homeRoutes = require("./routes/index");
const socket = require("socket.io");
const http = require("http");
require("dotenv").config();

const app = express();

// create server
const server = http.createServer(app);
const io = socket(server);
// midleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// register view engine
app.set("view engine", "ejs");

app.use(function (req, res, next) {
  req.io = io;
  next();
});
app.use("/", homeRoutes);

io.on("connection", (socket) => {
  console.log("made connection");
});

server.listen(process.env.PORT || 4000, () =>
  console.log("running on port 4000")
);
