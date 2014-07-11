var moment 		= require('moment');

var rates;

/* record insertion, update & deletion methods */

exports.connect = function(db) {
	rates = db.collection('rates');
};

exports.addNewRate = function(newData, callback)
{
	newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
	rates.insert(newData, {safe: true}, callback);
}


var getObjectId = function(id)
{
	return rates.db.bson_serializer.ObjectID.createFromHexString(id)
}



