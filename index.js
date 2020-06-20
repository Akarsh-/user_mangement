const express = require("express");
const bodyParser = require("body-parser");
const uploadRouter = require("./routes/upload")
const app = express();

const addUsers = require('./utils/AddEvents')
const totalEntryIn1Go = 10;


const rds = require('./utils/rds.js')
rds.initConnectionPoolNew()
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.raw({ limit: "50mb" }));
app.use(bodyParser.text({ type: "text/*", limit: "50mb" }));

app.use("/upload", uploadRouter(express));


app.listen(4344);

