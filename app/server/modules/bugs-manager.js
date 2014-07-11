var moment 		= require('moment');

var bugs;

/* record insertion, update & deletion methods */

exports.connect = function(db) {
	bugs = db.collection('bugs');
};

exports.addNewBug = function(newData, callback)
{
	newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
	bugs.insert(newData, {safe: true}, callback);
}


var getObjectId = function(id)
{
	return bugs.db.bson_serializer.ObjectID.createFromHexString(id)
}



