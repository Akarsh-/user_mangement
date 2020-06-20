const express = require("express");
const bodyParser = require("body-parser");
const uploadRouter = require("./routes/upload")
const commonRouter = require("./routes/common")
const app = express();

//connect to rds, config can be changed in rds file
const rds = require('./utils/rds.js')
rds.initConnectionPoolNew()

app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.raw({ limit: "50mb" }));
app.use(bodyParser.text({ type: "text/*", limit: "50mb" }));

//routes for all upload apis
app.use("/upload", uploadRouter(express));
//route for all other api
app.use("/", commonRouter(express));


app.listen(4344);

