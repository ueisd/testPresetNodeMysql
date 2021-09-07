const mysql = require('mysql');
exports.connection = undefined;
const fs = require("fs");

exports.execQuery = async (sql) => {
    let connection = await exports.getConnection();
    /*return new Promise(function(resolve, reject) {
        connection.query(sql, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    });*/
}

var getPresetRequest = (connection, filepath) => {
    // Read the SQL file
    let data = fs.readFileSync(filepath)
        .toString().replace(/\r\n/g, '').replace(/\n/g, '');
    try {
        connection.query(data, function(err, results) {
            if (err) console.log("attentioen ereure bd" + err);//throw err;
            console.log(results);
            //console.log("réussite ! " + results);
            return results;
        });
    } catch (e) {
        console.log(e);
    }
    
}

exports.getConnection = () => {
    return new Promise((resolve, reject)=>{
        try{
            if(exports.connection) resolve(exports.connection);
            const connection = mysql.createConnection({
                host: "us-cdbr-east-04.cleardb.com",
                user: "b427f8896f0ef8",
                password: "d3c978e1",
                database: "heroku_f8244a62bf3df81",
                multipleStatements: true
            });
            let data1 = getPresetRequest(connection, "./src/database/database_shema.init.sql");
            let data2 = getPresetRequest(connection, "./src/database/database_data.init.sql");
            exports.connection = connection;
            resolve(exports.connection);
        } catch (err) {
            reject(err)
        }
    });
};