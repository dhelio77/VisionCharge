const fs = require('fs'),
      path = require("path"),
      oracledb = require('oracledb'),
      Http = require('../app/Service/Http'),
      moment = require('moment'),
      args = process.argv,
      jsonfile = require('jsonfile'),
      restify = require('restify');
oracledb.maxRows = 500000;

require('dotenv').config();       
const DbUser = args.slice(2) == 'prod' ? process.env.ORACLE_USER : process.env.ORACLE_USER_DEV ,
      DbPass = args.slice(2) == 'prod' ? process.env.ORACLE_PASSWORD : process.env.ORACLE_PASSWORD_DEV ,
      DbHost = args.slice(2) == 'prod' ? process.env.ORACLE_HOST : process.env.ORACLE_HOST_DEV;

function oracleConnect() {  
  return new Promise( (resolve, reject) => {
    oracledb.getConnection(dbConfig.db_dwh)
    .then( connection => {
      resolve(connection)
    })
    .catch( err => reject(err) )
  })
}

function bulkLoad(){
  var target = [];
  const client = restify.createJsonClient({
    url: process.env.MS_SERVER,
    version: '*'
  });  
  oracledb.getConnection(
  {
    user          : DbUser,
    password      : DbPass,
    connectString : DbHost
  },
  function(err, connection)
  {
    if (err) {
      console.error(err.message);
      return;
    }        
     var sql = "SELECT DISTINCT AUC_ACCOUNT,AUC_ACTION_CODE,AUC_HIST_DATE FROM ODS_ASM256.TB_CASE_AU where " +
               "AUC_ACTION_CODE in('MDIS','FRDT','FDIS') AND trunc(AUC_CREATE_DT)  > trunc(SYSDATE - 10)";

    //var sql = 'SELECT DISTINCT AUC_ACCOUNT,AUC_ACTION_CODE,AUC_HIST_DATE FROM ODS_ASM256.TB_CASE_AU where ' +
    //           'AUC_ACTION_CODE in('MDIS','FRDT','FDIS') AND ACTION.AUC_HIST_DATE = TO_DATE(TO_CHAR(SYSDATE + (DT_WSTR, 5) @[User::DateOffset]", 'DD/MM/YYYY'), 'DD/MM/YYYY')';

    //var sql = fs.readFileSync(path.join(__dirname, '../lib/sql/cases.sql')).toString();            

    // var sql = "SELECT max(AUC_CREATE_DT) FROM ODS_ASM256.TB_CASE_AU";
               //"AUC_ACTION_CODE in('MDIS','FRDT','FDIS') AND AUC_ACCOUNT = '0005218942502471105' ";    
    connection.execute(      
      sql,      
      // { outFormat: oracledb.OBJECT, extendedMetaData: true },      
      function(err, result)
      {
        if (err) {
          console.error(err.message);          
          return;
        }        
        var arr = result.rows,
        uniques = [],
        itemsFound = {};
        for(var i = 0; i < arr.length; i++) {
            var stringified = arr[i][0];        
            if(itemsFound[stringified]) {           
              continue;
            }else{
              uniques[i] = new Array(arr[i][0],arr[i][1],arr[i][2]);
              itemsFound[stringified] = true;  
            }            
        }
        var i = 0;        
        uniques.forEach(function(e){                            
            //moment( localTime ).format('x')
            var localTime  = moment.utc(e[2]).local(),
            hrs = -(new Date().getTimezoneOffset() / 60),
            millsecs = parseInt(moment( localTime ).format('x')) + (hrs * 1000 * 60 * 60);                        
            target[i] = {'AccountNumber': e[0],'CaseReferalTypeName' : e[1], 'ReferalDate' : '\/Date(' + millsecs + ')\/' };          
            i++;                    
        });        
        //console.log(i);                        
        client.post('/api/PushApi/PostCaseHeaders', target, function(err, req, res, obj) {
            var objRes = {http:res.statusCode,message:res.statusMessage};            
            console.log(objRes);
        });
      });
  });
}

function multiDimensionalUnique(arr) {
    var uniques = [];
    var itemsFound = {};
    for(var i = 0; i < arr.length; i++) {
        var stringified = arr[i][0];        
        if(itemsFound[stringified]) {           
          continue;
        }else{
          uniques.push(arr[i][0]);
          itemsFound[stringified] = true;  
        }
        
    }
    return uniques;
}

function bulkLoadTemp(){

  const client = restify.createJsonClient({
    url: process.env.MS_SERVER,
    version: '*'
  });

  var data = [{'AccountNumber':"0005218932500324555",'CaseReferalTypeName':"FRDT", 'ReferalDate':"\/Date(1481769476139)\/"}];
  
  client.post('/api/PushApi/PostCaseHeaders', data, function(err, req, res, obj) {
      var objRes = {http:res.statusCode,message:res.statusMessage};            
      console.log(objRes);
  });

}


function bulkLoadAuthTemp(){

   oracledb.getConnection(
    {
      user          : process.env.ORACLE_USER,
      password      : process.env.ORACLE_PASSWORD,
      connectString : process.env.ORACLE_HOST
    },
    function(err, connection)
    {
      if (err) {
        console.error(err.message);
        return;
      }    

      var sql = fs.readFileSync(path.join(__dirname, '../lib/sql/fraud.sql')).toString();
      sql += "WHERE dc.Decodeacctnbr = '0005446370340000304'" + 
             "AND a.Auth_Date between to_date('01-JAN-13') and to_date('30-JAN-13')";            
      connection.execute(              
        sql,      
        // { outFormat: oracledb.OBJECT, extendedMetaData: true },        
        function(err, result)
        {
          if (err) {
            console.error(err.message);          
            return;
          }
          console.log(result.metaData); 
          console.log(result.rows);     
        });
    });


}


exports.bulkLoadAuth = (sql) => {      
  return new Promise( (resolve, reject) => {
    oracledb.getConnection({
      user          : DbUser,
      password      : DbPass,
      connectString : DbHost
    },
    function(err, connection){
      if (err) {
        console.error(err.message);
        return;
      }     
      connection.execute(            
        sql,            
        function(err, result){
          if (err) {
            console.error(err.message);          
            return;
          }          
          resolve(result.rows);     
        });
    });
  })
}

//bulkLoad();

//exports.bulkLoad = bulkLoad();