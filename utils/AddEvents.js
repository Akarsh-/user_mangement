const csv = require('csv-parser');
const fs = require('fs');
const through2 = require('through2')
const rds = require('./rds.js')

const readEventCSV = function (filepath, callback) {

    if (!filepath) {
        console.error("no file path");
        callback({ err: "no file path" })
        return;
    }

    fs.createReadStream(filepath)
        .on('error', (err) => {
            // handle error
            console.error("error while reading filepath ", err);
            callback({ err: "error while reading filepath" })
            return
        })

        .pipe(csv())
        .pipe(through2({ objectMode: true }, async (row, enc, cb) => {
            let thisrow = []
            if (!(row["title"] && row["starttime"] && row["endtime"] && row["description"] && row["allday"])) {
                console.error("error in file format ", row);

                callback({ err: "error in file format" })
                return
            }
            thisrow.push(row["title"])
            thisrow.push(new Date(row["starttime"]))
            thisrow.push(new Date(row["endtime"]))
            thisrow.push(row["description"])
            thisrow.push(row["users#rsvp"])
            thisrow.push(row["allday"] == 'true' ? 1 : 0)


            try {
                await insertIntoDB(thisrow);
                cb(null, true);
            }
            catch (e) {
                console.error("error while inserting event ", e)
                callback({ err: "error while inserting event " })
                return
            }


        }))
        .on('data', (row) => {

        })

        .on('end', async () => {
            // handle end of CSV
            console.log("inserted all rows");
            callback({ err: false })
        })

}


const insertIntoDB = async function (values) {
    return new Promise(async function (resolve, reject) {
        let newStartTime = values[1]
        let newEndTime = values[2]

        if (newStartTime > newEndTime && values[5] == 0) {
            console.error("invalid event ", values[0])
            resolve()
            return;
        }

        try {
            let query = 'INSERT INTO events (title, start_time, end_time, description, allday) VALUE (?,?,?,?,?)';
            let eventId = await rds.INSERT(query, [values[0], values[1], values[2], values[3], values[5]])

            let strUserWithRSVP = values[4]
            let lstUserWithRSVP = strUserWithRSVP.length > 0 ? strUserWithRSVP.split(";") : []
            let lstUsers = []
            let lstUsersAndRes = []
            for (let i = 0; i < lstUserWithRSVP.length; i++) {
                let userWithRSVP = lstUserWithRSVP[i]

                if (userWithRSVP.length == 0) {
                    break
                }
                let userId = userWithRSVP.split("#")[0]
                let userResp = userWithRSVP.split("#")[1]
                lstUsers.push(userId);
                lstUsersAndRes.push([userId, eventId, userResp])
            }

            // console.log("userid is ", lstUsers);
            // console.log("response maps is ", lstUsersAndRes)

            if (lstUsers.length == 0) {
                resolve()
                return
            }

            query = 'SELECT event_id FROM events where (start_time < ? AND end_time > ?) OR (start_time < ? AND allday = ?)'
            let overlapEvents = await rds.SELECT(query, [newEndTime, newStartTime, newEndTime, 1]);

            let lstOverlapEvents = []
            for (let i = 0; i < overlapEvents.length; i++) {

                lstOverlapEvents.push(overlapEvents[i]["event_id"])
            }

            //console.log("overlapped event ids are ", lstOverlapEvents);

            if (lstOverlapEvents.length > 0) {
                query = 'SELECT user_name from event_users where event_id in (?) and user_name in (?) and user_resp = ?'
                let overlapYESEventUsers = await rds.SELECT(query, [lstOverlapEvents, lstUsers, 'yes'])

                //console.log("overlap users with yes are ", overlapYESEventUsers)

                //mark overlap users as no
                if (overlapYESEventUsers.length != 0) {
                    let lstUserNameOverlapYes = []
                    for (let i = 0; i < overlapYESEventUsers.length; i++) {

                        lstUserNameOverlapYes.push(overlapYESEventUsers[i]["user_name"])
                    }
                    for (let i = 0; i < lstUsersAndRes.length; i++) {
                        if (lstUserNameOverlapYes.indexOf(lstUsersAndRes[i][0]) >= 0) {
                            lstUsersAndRes[i][2] = "No";
                            console.log("changing answer to no ", lstUsersAndRes[i][0])
                        }
                    }
                }
            }


            console.log("final list of users with res ", lstUsersAndRes);

            query = "INSERT into event_users (user_name, event_id, user_resp) VALUES ?"
            await rds.INSERT(query, [lstUsersAndRes])

            resolve()

        }
        catch (e) {
            reject(e)
        }

    })
}

module.exports = {
    readEventCSV
}