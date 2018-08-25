'use strict';

const restify = require('restify'),
	    swaggerTools = require('swagger-tools'),	  
      fs = require('fs'), 
      Logger = require('bunyan'),      
      log = new Logger.createLogger({
          name: 'super-Charge',
          serializers: {
              req: Logger.stdSerializers.req
          }
      }),
      server = restify.createServer({
         log: log
      }),           
      swaggerDoc = require('../lib/swagger.json'),
      Account = require('../app/Model/Account');

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  
  var options = {
  	"swaggerUiDir" : './lib/swagger-ui'
  };

  server.use(restify.CORS());
  server.use(restify.bodyParser());  

  server.pre(function (request, response, next) {
    request.log.info({ req: request }, 'REQUEST');    
    next();
  });

  server.get('/', function (req, res) {
    res.end("type /docs with all API docs");
  });

  let swaggerUi = middleware.swaggerUi(options);
  server.get('/docs/', swaggerUi);  

  server.get(/\/js|css|lib|fonts|images\/?.*/, restify.serveStatic({
     directory: './lib/swagger-ui'
  }));

  server.get(/\/?.js/, restify.serveStatic({
     directory: './lib/swagger-ui'
  }));
  
  //features
  server.get('/get-account/:id', Account.getAccountSnapshot);
  server.post('/notes/:id', Account.postNotes);
  server.get('/get-transaction/:id/:seq1/:datefrom/:dateto/:lastcycledate/:lastrecnbr', Account.getTransactionSettlement);
  server.get('/get-auth/:id/:seq1/:datefrom/:dateto', Account.getTransactionAuth);  
  server.post('/charge-back/:id/:cardNumber/:cardSeqNumber', Account.chargeBack);
  server.post('/safe-report/:id/:cardNumber/:cardSeqNumber', Account.safeReport);
  server.post('/write-off/:id/:cardNumber/:cardSeqNumber', Account.writeOff);

  //date :: ddmmyyyy 

  server.listen(8080, function () {
	    console.log('%s listening at %s', server.name, server.url);
  });

  server.on('uncaughtException', function (req, res, route, err) {
	    console.log('uncaughtException', err.stack);
  });
});



