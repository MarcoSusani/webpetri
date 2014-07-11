var socket = io.connect(window.location.hostname);	

socket.on('connect', function() {
	//Connected, let's sign-up for to receive messages for this room
	socket.emit('room', room);
});

socket.on('drawPlace', function (data) {
	drawPlace(data);
	if(drawItem === SELECTION){
		stopListener();
		startListenerForSelection();
	}
});

socket.on('drawTransition', function (data) {
	drawTransition(data);
	if(drawItem === SELECTION){
		stopListener();
		startListenerForSelection();
	}
});

socket.on('selectShape', function (data) {
	selectShape(data.layerId, data.shapeId);
});

socket.on('deselectItems', function () {
	deselectItems();
});

socket.on('createToken', function (data) {
	createToken(data.id);
});

socket.on('eraseToken', function (data) {
	eraseToken(data.id);
});

socket.on('dragShape', function(data){
	dragShape(data.layerId, data.shapeId, data.shapeX, data.shapeY);
});

socket.on('dragShape2', function(data){
	dragShape2(data.layerId, data.shapeId, data.ap, data.pos);
});
	