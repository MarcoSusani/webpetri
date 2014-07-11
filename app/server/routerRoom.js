
var CT = require('./modules/country-list');
var AM;
var EM = require('./modules/email-dispatcher');
var PNM;
var RMM;
var moment = require('moment');

module.exports = function(server, db) {

	AM = require('./modules/account-manager');
	AM.connect(db);
	PNM = require('./modules/petri-nets-manager');
	PNM.connect(db);
	RMM = require('./modules/rooms-manager');
	RMM.connect(db);
	
	var io = require('socket.io').listen(server);

	io.configure(function () {
	  io.set("transports", ["xhr-polling"]);
	  io.set("polling duration", 10);
	});


	io.sockets.on('connection', function(socket) {
	    // once a client has connected, we expect to get a ping from them saying what room they want to join
	    socket.on('room', function(room) {
	        socket.join(room);
	    });

		socket.on('drawPlace', function (data) {
			console.log("Room: " + data.room + " Coords: " + data.coords);

			io.sockets.in(data.room).emit('drawPlace', data.coords);
		});

		socket.on('drawTransition', function (data) {
			console.log("Room: " + data.room + " Coords: " + data.coords);
			
			io.sockets.in(data.room).emit('drawTransition', data.coords);
		});

		socket.on('selectShape', function (data) {
			console.log("Room: " + data.room + " Shape: " + data.shapeId);
			
			io.sockets.in(data.room).emit('selectShape', data);
		});

		socket.on('deselectItems', function (data) {
			console.log("Room: " + data.room);
			
			io.sockets.in(data.room).emit('deselectItems');
		});

		socket.on('createToken', function (data) {
			console.log("Room: " + data.room + " Place: " + data.id);
			
			io.sockets.in(data.room).emit('createToken', data);
		});

		socket.on('eraseToken', function (data) {
			console.log("Room: " + data.room + " Place: " + data.id);
			
			io.sockets.in(data.room).emit('eraseToken', data);
		});

		socket.on('dragShape', function (data) {
			console.log("Room: " + data.room + " Shape: " + data.shapeId);
			io.sockets.in(data.room).emit('dragShape', data);
		});

		socket.on('dragShape2', function (data) {
			console.log("Room: " + data.room + " Shape: " + data.shapeId);
			socket.broadcast.to(data.room).emit('dragShape2', data);
		});
	});
};