
var ES = require('./email-settings');
var EM = {};
var os = require('os');

module.exports = EM;

EM.server = require("emailjs/email").server.connect({

	host 	    : ES.host,
	user 	    : ES.user,
	password    : ES.password,
	ssl		    : true

});

EM.dispatchResetPasswordLink = function(account, callback)
{
	EM.server.send({
		from         : ES.sender,
		to           : account.email,
		subject      : 'Password Reset',
		text         : 'something went wrong... :(',
		attachment   : EM.composeEmailResetPassword(account)
	}, callback );
}

EM.composeEmailResetPassword = function(o)
{
	var link = 'http://'+os.hostname()+'/reset-password?e='+o.email+'&p='+o.pass;
	var html = "<html><body>";
		html += "Hi "+o.name+",<br><br>";
		html += "Your username is : <b>"+o.user+"</b><br><br>";
		html += "<a href='"+link+"'>Please click here to reset your password</a><br><br>";
		html += "</body></html>";
	return  [{data:html, alternative:true}];
}

EM.dispatchReportBug = function(account, bug, callback)
{
	EM.server.send({
		from         : account.email,
		to           : ES.sender,
		subject      : 'Report a bug from ' + account.email,
		text         : 'something went wrong... :(',
		attachment   : EM.composeEmailReportBug(account, bug)
	}, callback );
}

EM.composeEmailReportBug = function(o, bug)
{
	var html = "<html><body>";
		html += o.name+" ("+o.user+"), have been report the following bug: <br><br>";
		html += "<b>" + bug + "</b>";
		html += "</body></html>";
	return  [{data:html, alternative:true}];
}

EM.dispatchRate = function(account, rate, comment, callback)
{
	EM.server.send({
		from         : account.email,
		to           : ES.sender,
		subject      : 'Rate WebPetri from ' + account.email,
		text         : 'something went wrong... :(',
		attachment   : EM.composeEmailRate(account, rate, comment)
	}, callback );
}

EM.composeEmailRate = function(o, rate, comment)
{
	var html = "<html><body>";
		html += o.name+" ("+o.user+"), have been rate WebPetri with <b>"+rate+" stars</b><br><br>";
		html += "Also it's write the following comment:<br><br>";
		html += "<b>" + comment + "</b>";
		html += "</body></html>";
	return  [{data:html, alternative:true}];
}