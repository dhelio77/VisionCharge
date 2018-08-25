require('dotenv').config();
const restify = require('restify'),
      fs = require('fs'),
      client = restify.createJsonClient({
          url: process.env.HTTPS_HOST,
          version: '*',      
          key: fs.readFileSync('./lib/client/client.key'),
          cert: fs.readFileSync('./lib/client/signed.crt'),
          ca: fs.readFileSync('./lib/client/geca.crt'),
          requestCert: true,
          rejectUnauthorized: false
      });         



module.exports.getHttpRequest = (url) => {    
    return new Promise(function(resolve,reject){        
        client.get(url, function (err, req, res, obj) {     
            //res.log.info({ res: obj }, 'RESPONSE');   
            //req.log.info({ req: 111 }, 'REQUEST');                                       
            //console.log(res.log);
            resolve(obj);        
        });
    });    
}

module.exports.postHttpRequest = (url,data) => {
    return new Promise(function(resolve,reject){
        client.post(url, data, function(err, req, res, obj) {                              
                var objRes = {"http":res.statusCode,"message":res.statusMessage};            
                resolve(objRes);
        });
    });
}