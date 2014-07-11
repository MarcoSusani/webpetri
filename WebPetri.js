if(process.env.NODETIME_ACCOUNT_KEY) {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'webpetri' // optional
  });
}
var express = require('express');
var http = require('http');
var app = express();
app.configure(function(){
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
//	app.use(express.favicon());
//	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'super-duper-secret-secret' }));
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
	app.use(express.static(__dirname + '/app/public'));
});


var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;


var db;

app.configure('development', function(){
	console.log('Server started in development mode');

	app.set('port', 80);

	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 

	var dbPort 		= '__DBPORT__';
	var dbHost 		= '__DBHOST__';
	var dbName 		= '__DBNAME__';
	var dbUser 		= '__DBUSER__';
	var dbPass		= '__DBPASSWORD__';

	/* establish the database connection */

	db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1}); 

	db.open(function(e, d){
		if (e) {
			console.log(e);
		}	else{
			db.authenticate(dbUser, dbPass, function(err, result){
				if(result){
					console.log('Connected to database :: ' + dbName);
				}	
			});
		}
	});
});

require('./app/server/router')(app, db);

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

require('./app/server/routerRoom')(server, db);
