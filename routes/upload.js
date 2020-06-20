const upload = require("../controllers/upload")
const bodyParser = require("body-parser");
var router;

//upload router
module.exports = express => {
    router = express.Router();

    __registerPostRoute("/events", upload.uploadEvent);
    __registerPostRoute("/users", upload.uploadUser)


    return router;
};

const __registerPostRoute = (route, mainHandler) => {
    let handlers = [];


    handlers.push(bodyParser.urlencoded({ extended: true }));
    handlers.push(mainHandler);
    router.post(route, handlers);
};

const __registerGetRoute = function (route, mainHandler) {
    var handlers = [];
    handlers.push(mainHandler);

    router.get(route, handlers);
}