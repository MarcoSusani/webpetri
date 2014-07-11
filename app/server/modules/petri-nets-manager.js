var moment 		= require('moment');

var petrinets;
var rooms;

exports.connect = function(db) {
	petrinets = db.collection('petrinets');
	rooms = db.collection('rooms');
};

/* record insertion, update & deletion methods */

exports.addNewPetriNet = function(newData, callback)
{
	newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
	petrinets.insert(newData, {safe: true}, callback);
	/*petrinets.findOne({name:newData.name,'user.user': newData.user.user}, function(e, o) {
		if (o){
			callback('petrinets-taken');
		}	else{
			newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
			petrinets.insert(newData, {safe: true}, callback);
		}
	});*/
}

exports.addNewPlace = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		if(o.places == null){
			o.places = new Array();
			o.places.push(newData);
		}else{
			founded = false;
			for(p in o.places){
				place = o.places[p];
				if(place.id == newData.id){
					founded = true;
				}
			}
			if(!founded){
				o.places.push(newData);	
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.addNewArc = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		if(o.arcs == null){
			o.arcs = new Array();
		}
		o.arcs.push(newData);
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.updateToken = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		for(p in o.places){
			place = o.places[p];
			if(place.id == newData.id){
				place.token = newData.token;
				place.date = newData.date;
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.updatePlaceArcs = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		for(p in o.places){
			place = o.places[p];
			if(place.id == newData.id){
				place.arcsIn = newData.arcsIn;
				place.arcsOut = newData.arcsOut;
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.updateTransitionArcs = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		for(t in o.transitions){
			transition = o.transitions[t];
			if(transition.id == newData.id){
				transition.arcsIn = newData.arcsIn;
				transition.arcsOut = newData.arcsOut;
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.updatePlacePosition = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		for(p in o.places){
			place = o.places[p];
			if(place.id == newData.id){
				place.x = newData.x;
				place.y = newData.y;
				place.date = newData.date;
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.updateTransitionPosition = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		for(t in o.transitions){
			transition = o.transitions[t];
			if(transition.id == newData.id){
				transition.x = newData.x;
				transition.y = newData.y;
				transition.date = newData.date;
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.updateArcPosition = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		for(a in o.arcs){
			arc = o.arcs[a];
			if(arc.id == newData.id){
				arc.points = newData.points;
				arc.date = newData.date;
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.addNewTransition = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		if(o.transitions == null){
			o.transitions = new Array();
			o.transitions.push(newData);
		}else{
			founded = false;
			for(t in o.transitions){
				transition = o.transitions[t];
				if(transition.id == newData.id){
					founded = true;
				}
			}
			if(!founded){
				o.transitions.push(newData);	
			}
		}

		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
		
	});
}

exports.deleteTransition = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		for(t in o.transitions){
			transition = o.transitions[t];
			if(transition.id == newData.id){
				o.transitions.splice(t,1);
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.deletePlace = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		for(p in o.places){
			place = o.places[p];
			if(place.id == newData.id){
				o.places.splice(p,1);
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}

exports.deleteArc = function(newData, netId, user, callback)
{
	petrinets.findOne({_id: getObjectId(netId), 'user.user': user.user}, function(e, o) {
		for(a in o.arcs){
			arc = o.arcs[a];
			if(arc.id == newData.id){
				o.arcs.splice(a,1);
			}
		}
		
		petrinets.save(o, {safe: true}, function(err) {
			if (err) callback(err);
			else callback(null, o);
		});
	});
}


exports.updatePetriNet = function(newData, callback)
{
	petrinets.findOne({name:newData.name}, function(e, o){
		o.name 		= newData.name;
		
		petrinets.save(o, {safe: true}, function(err) {
				if (err) callback(err);
				else callback(null, o);
		});
	});
}

exports.deletePetriNet = function(id, user, callback)
{
	petrinets.remove({_id: getObjectId(id), 'user.user': user.user, roomed: false}, callback);
}

exports.deletePetriNetRoomed = function(id, callback)
{
	petrinets.remove({_id: id, roomed: true}, callback);
}

exports.getPetriNetByName = function(name, callback)
{
	petrinets.findOne({name:name}, function(e, o){ callback(o); });
}

exports.getAllRecords = function(callback)
{
	petrinets.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.getPetriNetsByUser = function(user, callback)
{
	petrinets.find({'user.user':user.user, 'roomed': false}).toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.getRoomsByUser = function(user, callback)
{
	rooms.find({'user.user':user.user}).toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.loadPetriNet = function(id, user, callback)
{
	petrinets.findOne({_id: getObjectId(id), 'user.user':user.user}, 
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.loadPetriNetById = function(id, callback)
{
	petrinets.findOne({_id: id},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.delAllRecords = function(callback)
{
	petrinets.remove({}, callback);
}

exports.updatePetriNet = function(newData, callback)
{
	petrinets.save(newData, {safe: true}, function(err) {
		if (err) callback(err);
		else callback(null, newData);
	});
}

/* auxiliary methods */

var getObjectId = function(id)
{
	return petrinets.db.bson_serializer.ObjectID.createFromHexString(id)
}




var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	petrinets.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}
