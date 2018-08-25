const Http = require('../Service/Http'),      
      fs = require('fs'),
      path = require("path"),
      connect = require("../../server/connect"),
      jsonfile = require('jsonfile'),
      monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

exports.getAccountSnapshot = (req, res, next) => {    
    //5446371110036817
    Http.getHttpRequest('/getAccountSnapshot/SUPERCHARGE/'+req.params.id).then( data => {                     
         res.send(data);
         next();
    });     
}


exports.postNotes = (req, res, next) => {
  //0005446370340000304
    Http.postHttpRequest('/postAccountNotes/SUPERCHARGE/'+req.params.id+'/0001',req.body).then( data => {          
         res.send(data);         
         next();
    });
}

exports.getTransactionSettlement = (req, res, next) => {  
    // get-transaction/0005446370340000304/0001/24122013/24012014/00000000/00000    
    var fromDate = req.params.datefrom,
        toDate = req.params.dateto;    

    var callParameter = '/getSettlementData/SUPERCHARGE/'+req.params.id + '/' +req.params.seq1+ '/' +req.params.datefrom + '/' + req.params.dateto+ '/' +req.params.lastcycledate+ '/' +req.params.lastrecnbr;
    Http.getHttpRequest(callParameter).then( data => {            
         res.send(data);         
         next();
    });     
}

exports.getTransactionAuth = (req, res, next) => {
    // get-auth/0005446370340000304/0001/24122013/24012014
    // get-auth/0005218942500102371/0001/24122013/24012014
    var fromDate = "'" + req.params.datefrom.toString().slice(0,2) + '-' + monthNames[req.params.datefrom.toString().slice(2,4) - 1] + '-' + req.params.datefrom.toString().slice(4,9) + "'",
        toDate = "'" + req.params.dateto.toString().slice(0,2) + '-' + monthNames[req.params.dateto.toString().slice(2,4) - 1] + '-' + req.params.dateto.toString().slice(4,9) + "'",
        acctNbr = req.params.id,
        sql = fs.readFileSync(path.join(__dirname, '../../lib/sql/fraud.sql')).toString();            

    sql += " WHERE dc.Decodeacctnbr = '"+acctNbr+"'" + 
           " AND a.Auth_Date between to_date("+fromDate+") and to_date("+toDate+")";    

    connect.bulkLoadAuth(sql).then( data => {
         var target = [];
         data.forEach(function(e){
         target.push( { Product : e[0], ACCOUNT_NUMBER : e[1], CARD_NUMBER : e[2], Transaction_Date : e[3], Transaction_Time : e[4],
                         POS_Entry_Mode : e[5], PIN_INDICATOR : e[6] , SECURECODE : e[7] , DECISION : e[8], TRANSACTION_AMOUNT : e[9],
                         MERCHANT_NAME : e[10], MERCHANT_CITY : e[11], MERCHANT_STATE : e[12], MCC : e[13], TERMINAL_ID : e[14] ,
                         TRANSACTION_TYPE : e[15], COUNTRY_CODE : e[16], AUTH_CODE: e[17] , FRAUD_LEGIT : null    } );          
         })   
         res.send(target);         
         next();
    });     
}

exports.chargeBack = (req, res, next) => {  
    // charge-back/SUPERCHARGE/0005446370340000304/0001
    var callParameter = '/postChargeback/'+req.params.id + '/' +req.params.cardNumber+ '/' +req.params.cardSeqNumber;    
    Http.postHttpRequest(callParameter,req.body).then( data => {          
         res.send(data);         
         next();
    });      
}

exports.safeReport = (req, res, next) => {  
    // safe-report/SUPERCHARGE/0005446370340000304/0001
    var callParameter = '/postSafeReport/'+req.params.id + '/' +req.params.cardNumber+ '/' +req.params.cardSeqNumber;    
    Http.postHttpRequest(callParameter,req.body).then( data => {          
         res.send(data);         
         next();
    }); 
}

exports.writeOff = (req, res, next) => {  
    // safe-report/SUPERCHARGE/0005446370340000304/0001
    var callParameter = '/postWriteOff/'+req.params.id + '/' +req.params.cardNumber+ '/' +req.params.cardSeqNumber;    
    Http.postHttpRequest(callParameter,req.body).then( data => {          
         res.send(data);         
         next();
    }); 
}


