const rds = require('./rds.js')

/**
 * gets all scheduled event in the given time range
 * @param {DateTime} startTime 
 * @param {DateTime} endTime 
 */
const getEvents = async function (startTime, endTime) {
    //no need of try catch here, since error is being catched by caller
    let query = 'SELECT title,description FROM events where (start_time <= ? AND end_time >= ?) OR (start_time <= ? AND allday = ?)'

    let events = await rds.SELECT(query, [endTime, startTime, endTime, 1]);
    return { err: false, data: events }

}

/**
 * gets user free time
 * @param {DateTime} startTime : start time for range
 * @param {DateTime} endTime : end time for range
 * @param {string} userName : user name (must be unique)
 */
const getUserFreeTime = async function (startTime, endTime, userName) {

    //this will get his schedule for which he has said yes in between selected range
    let query = 'SELECT e.start_time,e.end_time, e.allday FROM events e JOIN event_users eu ON eu.event_id = e.event_id  where eu.user_name = ? and eu.user_resp = ? and ((start_time <= ? AND end_time >= ?) OR (start_time <= ? AND allday = ?)) order by start_time'

    let schedule = await rds.SELECT(query, [userName, "yes", endTime, startTime, endTime, 1]);

    //console.log(schedule)

    let tempIndex = 0;
    let tempTime = startTime;
    let lstAvaiTime = []

    //while to get free time
    while (endTime > tempTime && tempIndex < schedule.length) {
        if (tempTime < schedule[tempIndex].start_time) {
            let freeStartTime = tempTime;
            lstAvaiTime.push(freeStartTime)
            let freeEndTime = schedule[tempIndex].start_time
            lstAvaiTime.push(freeEndTime)
        }
        if (schedule[tempIndex].allday == 0) {
            //console.log("typ " , typeof )
            tempTime = new Date(schedule[tempIndex].end_time)
        }
        else {

            tempTime = new Date(schedule[tempIndex].start_time)
            tempTime.setDate(tempTime.getDate() + 1)
            tempTime.setUTCHours(0, 0, 0, 0)
        }
        //console.log("new temptime is  ", tempTime)
        tempIndex++;
    }

    //if no schedule in selected date range then he is full free 
    if (schedule.length == 0) {
        lstAvaiTime.push(startTime)
        lstAvaiTime.push(endTime)
    }



    return { err: false, data: lstAvaiTime }
}

module.exports = {
    getEvents,
    getUserFreeTime
}