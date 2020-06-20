const events = require("../utils/AddEvents.js")
const users = require("../utils/AddUsers")
const totalEntryIn1Go = 10;

const uploadEvent = function (request, response, next) {
    let path = request.body.path;
    events.readEventCSV(path, result => {
        if (result.err) {
            response.json(result.err)
            return
        }

        response.json("events added successfully")

    })
}

const uploadUser = function (request, response, next) {

    let path = request.body.path;
    users.readUserCSV(path, totalEntryIn1Go, result => {
        if (result.err) {
            response.json(result.err)
            return
        }

        response.json("events added successfully")

    })
}

module.exports = {
    uploadEvent,
    uploadUser
}