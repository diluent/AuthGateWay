var sql = require('mssql');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var settings = require('./settings.json');

var IS_PROD = (process.env.NODE_ENV || '').trim() === 'production'
var port = settings.apiPort; 

var dbConnectionString = settings.db_connection;

var app = express();
var router = express.Router();    


// http://localhost:8080/api?procName=StateSchemeWebLst&StateSchemeSysName=StateSchemeMissionSubAgent
router.get('/', function(req, res) {

    var procName = req.query.procName;

    if(!procName) res.json({ Error: "'procName' parameter wasn't specified" });

    var inputParams = [];
    for(var p in req.query) {
        if(p.toLowerCase() !== 'procname')
            inputParams.push({ name: p, value: req.query[p] });
    }

    sql
        .connect(dbConnectionString)
        .then(function() {
            var sqlReq = new sql.Request();

            for(var i = 0, max = inputParams.length; i < max; i++) {
                sqlReq = sqlReq.input(inputParams[i].name, sql.VarChar, inputParams[i].value);
            }

            sqlReq
                .execute('[dbo].[' + procName + ']')
                .then(function(recordset) {
                    res.json({ Result: recordset });
                }).catch(function(err) {
                    res.json({ Error: err });
                });
    })
    .catch(function(err) {
        res.json({ Error: err });
    });

});

app.use('/api', router);
app.listen(port);

console.log('Webserver is running on port: ' + port);