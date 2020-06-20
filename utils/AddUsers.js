const csv = require('csv-parser');
const fs = require('fs');
const through2 = require('through2')
const rds = require('./rds.js')

//read user csv file
const readUserCSV = function (filepath, totalEntryIn1Go, callback) {

    var lstRows = []
    var currentCounter = 0;

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
            return;
        })

        .pipe(csv())
        .pipe(through2({ objectMode: true }, async (row, enc, cb) => {
            let thisrow = []
            if (!(row["username"] && row["email"] && row["phone"])) {
                console.error("error in file format ", row);
                callback({ err: "error in file format" })
                return
            }
            thisrow.push(row["username"])
            thisrow.push(row["email"])
            thisrow.push(row["phone"])
            lstRows.push(thisrow)

            currentCounter++;

            if (currentCounter == totalEntryIn1Go) {
                console.log(lstRows.length)

                try {
                    await insertIntoDB(lstRows);
                    currentCounter = 0;
                    lstRows = []
                    cb(null, true);
                }
                catch {
                    console.error("error while inserting into db");
                    callback({ err: "error while inserting into db" })
                    return
                }
            }
            else {
                cb(null, true);
            }
        }))
        .on('data', (row) => {

        })

        .on('end', async () => {
            // handle end of CSV
            //console.log(" at end " + lstRows.length);
            try {
                if (lstRows.length > 0) {
                    await insertIntoDB(lstRows);

                }
                lstRows = null;
                callback({ err: false })
            }
            catch {
                console.error("error while inserting into db")
            }
        })

}


const insertIntoDB = async function (values) {
    return new Promise(function (resolve, reject) {
        let query = 'INSERT INTO users (user_name, user_email, user_phone) VALUES ?';
        rds.INSERT(query, [values], (result) => {
            if (result.err) {
                console.log("error while inserting ", result);
                reject();
            } else {

                resolve();
            }
        });
    })
}

module.exports = {
    readUserCSV
}