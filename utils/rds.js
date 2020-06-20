const mysql = require('mysql')

const DB = {
    MASTER_HOST: 'localhost',
    SLAVE_HOST: '',
    DATABASE: 'user_events',
    USER: 'root',
    PASS: 'password@1',
    POOL_SIZE: 10
}

var mysqlConnectionPoolNew = null

/**
 * connect to DB
 */
module.exports.initConnectionPoolNew = function () {


    if (mysqlConnectionPoolNew == null) {

        mysqlConnectionPoolNew = mysql.createPool({

            host: DB.MASTER_HOST,
            user: DB.USER,
            password: DB.PASS,
            database: DB.DATABASE,
            connectionLimit: DB.POOL_SIZE
        })
    }

    return mysqlConnectionPoolNew
}


const query = function (statement, values, fn, resultHandler) {
    let isCallback = false;
    if (typeof values === "function")
        fn = values;
    if (typeof fn === "function")
        isCallback = true;

    return new Promise((resolve, reject) => {
        mysqlConnectionPoolNew.getConnection((err, mysqlConnection) => {
            if (!err) {
                function callback(err, record) {
                    if (!err) {
                        if (isCallback) fn({ err: false, data: resultHandler(record) });
                        resolve(resultHandler(record));
                    } else {
                        if (isCallback) fn({ err: err, errCode: "1007" });
                        else reject({ err: err, errCode: "1007" });
                    }
                    mysqlConnection.release();
                }

                if (typeof values === "function")
                    mysqlConnection.query(statement, callback);
                else
                    mysqlConnection.query(statement, values, callback);

            } else {
                if (isCallback)
                    fn({ err: true, errCode: "1006" });
                else
                    reject({ err: err, errCode: "1006" });
            }
        });
    });
};

module.exports.SELECT = function (statement, values, fn) {
    return query(statement, values, fn, (record) => {
        return record;
    });
};

module.exports.UPDATE = function (statement, values, fn) {
    return query(statement, values, fn, (record) => {
        return record;
    });
};

module.exports.INSERT = function (statement, values, fn) {
    return query(statement, values, fn, (record) => {
        return record.insertId;
    });
};