var moment 		= require('moment');

var rooms;

/* record insertion, update & deletion methods */

exports.connect = function(db) {
	rooms = db.collection('rooms');
};


exports.getRoomsByUser = function(user, callback)
{
	rooms.find({'owner.user':user.user}).toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.addNewRoom = function(newData, callback)
{
	newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
	rooms.insert(newData, {safe: true}, callback);
	/*rooms.findOne({name:newData.name,'user.user': newData.owner.user}, function(e, o) {
		if (o){
			callback('rooms-taken');
		}	else{
			
		}
	});*/
}

exports.updateRoom = function(newData, callback)
{
	rooms.save(newData, {safe: true}, function(err) {
		if (err) callback(err);
		else callback(null, newData);
	});
}

exports.loadRoom = function(id, callback)
{
	rooms.findOne({_id: getObjectId(id)}, 
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.deleteRoom = function(id, user, callback)
{
	rooms.remove({_id: getObjectId(id), 'owner.user': user.user}, callback);
}

var getObjectId = function(id)
{
	return rooms.db.bson_serializer.ObjectID.createFromHexString(id)
}



