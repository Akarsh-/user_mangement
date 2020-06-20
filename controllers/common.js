const commonUtils = require("../utils/common")

module.exports.getEvents = async function (req, res, next) {

    try {
        let startTime = new Date(req.body.startTime);
        let endTime = new Date(req.body.endTime);
        if (startTime > endTime) {
            res.json({ err: "startdate greater than end date" })
            return
        }
        let result = await commonUtils.getEvents(startTime, endTime)

        console.log(result);
        res.json(result.data)
    }
    catch (e) {
        console.error("error while getting event data", e)
        res.json({ err: "error while getting event data" })
    }
}

module.exports.getUserSchedule = async function (req, res, next) {

    try {
        let startTime = new Date(req.body.startTime);
        let endTime = new Date(req.body.endTime);

        if (startTime == "Invalid Date" || endTime == "Invalid Date") {
            res.json({ err: "invalid date format" })
            return
        }
        let userName = req.body.userName
        if (startTime > endTime) {
            res.json({ err: "startdate greater than end date" })
            return
        }
        let result = await commonUtils.getUserFreeTime(startTime, endTime, userName)

        console.log(result);

        let output = "user is free from "
        for (let i = 0; i < result.data.length; i = i + 2) {
            output += result.data[i]
            output += " to "
            output += result.data[i + 1]

            if (i + 1 != result.data.length - 1) {
                output += " .Then he is free from "
            }
        }

        if (result.data.length == 0) {
            output = "User is never free in selected date range"
        }
        res.json({ err: false, data: output })
    }
    catch (e) {
        console.error("error while getting event data", e)
        res.json({ err: "error while getting event data" })
    }
}