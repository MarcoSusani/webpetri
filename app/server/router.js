
var CT = require('./modules/country-list');
var AM;
var EM = require('./modules/email-dispatcher');
var PNM;
var RMM;
var BM;
var RM;
var moment = require('moment');

function containsUser(array, user){
	var i = array.length;
	while (i--) {
		if (array[i].user === user.user) {
			return true;
		}
	}
	return false;
}

function removeUser(array, user){
	var i = array.length;
	while (i--) {
		if (array[i].user === user.user) {
			array.splice(i, 1);
		}
	}
}

module.exports = function(app, db) {

	AM = require('./modules/account-manager');
	AM.connect(db);
	PNM = require('./modules/petri-nets-manager');
	PNM.connect(db);
	RMM = require('./modules/rooms-manager');
	RMM.connect(db);
	BM = require('./modules/bugs-manager');
	BM.connect(db);
	RM = require('./modules/rates-manager');
	RM.connect(db);
// main login page //

	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Login' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					PNM.getPetriNetsByUser(req.session.user, function(e, petrinets){
						RMM.getRoomsByUser(req.session.user, function(e, rooms){
							res.render('home', {
								title : 'WebPetri',
								petrinets: petrinets,
								rooms: rooms,
								udata: req.session.user
							});
						});
					});

				}	else{
					res.render('login', { title: 'Login' });
				}
			});
		}
	});

	app.get('/room/*', function(req, res){
		var n = req.url.lastIndexOf('/');
		var roomId = req.url.substring(n + 1);
		RMM.loadRoom(roomId, function(e, obj){
			if(obj != null){
				if (req.session.user == null){
					res.render('login', { title: 'Login'});
				}else{
					if( (obj.owner.user !== req.session.user.user) && !containsUser(obj.users, req.session.user) ){
						obj.users.push(req.session.user);
						RMM.updateRoom(obj , function(e, objNew) {
							if(objNew != null){
								PNM.loadPetriNetById(objNew.petrinet, function(e, pn) {
									if(pn != null){
										if(!containsUser(pn.user, req.session.user)){
											var userTmp = req.session.user;
											userTmp.lastSeen = moment().format('MMMM Do YYYY, h:mm:ss a');
											pn.user.push(userTmp);
											PNM.updatePetriNet(pn, function(e, pnNew){
												if(pnNew!=null){
													res.render('room', {
														title : 'Room ' + objNew.name,
														room: objNew,
														petrinet: pnNew,
														udata: req.session.user
													});
												}
											})	
										}else{
											res.render('room', {
												title : 'Room ' + objNew.name,
												room: objNew,
												petrinet: pn,
												udata: req.session.user
											});
										}
									}
								});
							}
						});
					}else{
						PNM.loadPetriNetById(obj.petrinet, function(e, pn) {
							if(pn != null){
								if(!containsUser(pn.user, req.session.user)){
									var userTmp = req.session.user;
									userTmp.lastSeen = moment().format('MMMM Do YYYY, h:mm:ss a');
									pn.user.push(userTmp);
									PNM.updatePetriNet(pn, function(e, pnNew){
										if(pnNew!=null){
											res.render('room', {
												title : 'Room ' + obj.name,
												room: obj,
												petrinet: pnNew,
												udata: req.session.user
											});
										}
									})	
								}else{
									res.render('room', {
										title : 'Room ' + obj.name,
										room: obj,
										petrinet: pn,
										udata: req.session.user
									});
								}
							}
						});
					}
					
				}
			}else{
				res.render('404', { title: 'Page Not Found'});
			}
		});
	});

	app.post('/room/*', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(req.url, 200);
			}
		});
	});

	app.get('/user-offline', function(req, res){
		PNM.loadPetriNet(req.param('id'), req.session.user, function(e, pn){
			if(pn != null){
				removeUser(pn.user, req.session.user);
				PNM.updatePetriNet(pn, function(e, pnNew){
					if(pnNew != null){
						res.send('ok', 200);
					}else{
						res.send(e, 400);
					}
				});
			}else{
				res.send(e, 400);
			}
		});
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send('/home', 200);
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/home', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
    		PNM.getPetriNetsByUser(req.session.user, function(e, petrinets){
				RMM.getRoomsByUser(req.session.user, function(e, rooms){
					res.render('home', {
						title : 'WebPetri',
						petrinets: petrinets,
						rooms: rooms,
						udata: req.session.user
					});
				});
			});
	    }
	});

	app.get('/settings', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('settings', {
				title : 'Settings',
				countries : CT,
				udata : req.session.user
			});
	    }
	});
	
	app.post('/home', function(req, res){
		if (req.param('user') != undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Signup', countries : CT });
	});
	
	app.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.post('/report-bug', function(req, res){
		AM.getAccountByEmail(req.session.user.email, function(o){
			if (o){
				res.send('ok', 200);
				BM.addNewBug({user: o, bug: req.param('bug')}, function(e, obj){
					if(!e){
						EM.dispatchReportBug(o, req.param('bug'), function(error, m){
						// this callback takes a moment to return //
						// should add an ajax loader to give user feedback //
							if (!error) {
								res.send('ok', 200);
							}	else{
								res.send('email-server-error', 400);
								for (k in error) console.log('error : ', k, error[k]);
							}
						});
					}else{
						res.send('bug-not-store', 400);		
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.post('/rate-webpetri', function(req, res){
		AM.getAccountByEmail(req.session.user.email, function(o){
			if (o){
				res.send('ok', 200);
				RM.addNewRate({user: o, rate: req.param('rate'), comment: req.param('comment')}, function(e, obj){
					if(!e){
						EM.dispatchRate(o, req.param('rate'), req.param('comment'), function(error, m){
						// this callback takes a moment to return //
						// should add an ajax loader to give user feedback //
							if (!error) {
								res.send('ok', 200);
							}	else{
								res.send('email-server-error', 400);
								for (k in error) console.log('error : ', k, error[k]);
							}
						});
					}else{
						res.send('rate-not-store', 400);		
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.post('/new-net', function(req, res){
		name = req.param('name');
		PNM.addNewPetriNet({name: name, user: req.session.user, roomed: false}, function(e, obj){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('Ok: new net saved correctly', 200);
			}
		});
	});

	app.post('/new-room', function(req, res){
		name = req.param('name');
		PNM.addNewPetriNet({name: name, user: [], roomed: true}, function(e, obj){
			if (e){
				res.send(e, 400);
			}	else{
				RMM.addNewRoom({name: name, owner: req.session.user, users: [req.session.user], petrinet: obj[0]._id}, function(e){
					if (e){
						res.send(e, 400);
					}	else{
						res.send('Ok: new room saved correctly', 200);
					}
				});
			}
		});
	});

	app.post('/delete-net', function(req, res){
		PNM.deletePetriNet(req.body.id, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: net ' + obj.name + ' deleted correctly', 200);
			}	else{
				res.send('Net ' + obj.name + ' not deleted', 400);
			}
	    });
	});

	app.post('/delete-room', function(req, res){
		RMM.loadRoom(req.body.id, function(e, obj){
			if(obj != null){
				PNM.deletePetriNetRoomed(obj.petrinet, function(e, obj){
					if (!e){
						RMM.deleteRoom(req.body.id, req.session.user, function(e, obj){
							if (!e){
								res.send('Ok: room ' + obj.name + ' deleted correctly', 200);
							}	else{
								res.send('Room ' + obj.name + ' not deleted', 400);
							}
					    });
					}	else{
						res.send('Room ' + obj.name + ' not deleted', 400);
					}
			    });
			}else{
				res.send('Room ' + obj.name + ' not deleted', 400);
			}
		});
	});

	app.post('/open-net', function(req, res){
		PNM.loadPetriNet(req.body.id, req.session.user, function(e, obj){
			if (!e){
				//req.session.net = obj;
				res.send(obj, 200);
			}	else{
				res.send('Net ' + obj.name + ' not opened', 400);
			}
	    });
	});

	app.post('/store-place', function(req, res){
		PNM.addNewPlace(JSON.parse(req.body.place), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: place ' + obj.id + ' stored correctly', 200);
			}	else{
				res.send('Place ' + obj.id + ' not stored', 400);
			}
	    });
	});

	app.post('/store-arc', function(req, res){
		PNM.addNewArc(JSON.parse(req.body.arc), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: arc ' + obj.id + ' stored correctly', 200);
			}	else{
				res.send('Arc ' + obj.id + ' not stored', 400);
			}
	    });
	});
	app.post('/delete-place', function(req, res){
		PNM.deletePlace(JSON.parse(req.body.place), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: place ' + obj.id + ' deleted correctly', 200);
			}	else{
				res.send('Place ' + obj.id + ' not deleted', 400);
			}
	    });
	});
	app.post('/delete-arc', function(req, res){
		PNM.deleteArc(JSON.parse(req.body.arc), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: arc ' + obj.id + ' deleted correctly', 200);
			}	else{
				res.send('Arc ' + obj.id + ' not deleted', 400);
			}
	    });
	});

	app.post('/delete-transition', function(req, res){
		PNM.deleteTransition(JSON.parse(req.body.transition), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: transition ' + obj.id + ' deleted correctly', 200);
			}	else{
				res.send('Transition ' + obj.id + ' not deleted', 400);
			}
	    });
	});

	app.post('/store-transition', function(req, res){
		PNM.addNewTransition(JSON.parse(req.body.transition), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: transition ' + obj.id + ' stored correctly', 200);
			}	else{
				res.send('Transition ' + obj.id + ' not stored', 400);
			}
	    });
	});

	app.post('/update-token', function(req, res){
		PNM.updateToken(JSON.parse(req.body.place), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: token ' + obj.id + ' updated correctly', 200);
			}	else{
				res.send('Token ' + obj.id + ' not updated', 400);
			}
	    });
	});

	app.post('/update-place-arcs', function(req, res){
		PNM.updatePlaceArcs(JSON.parse(req.body.place), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: arcs ' + obj.id + ' updated correctly', 200);
			}	else{
				res.send('Arcs ' + obj.id + ' not updated', 400);
			}
	    });
	});

	app.post('/update-transition-arcs', function(req, res){
		PNM.updateTransitionArcs(JSON.parse(req.body.transition), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: arcs ' + obj.id + ' updated correctly', 200);
			}	else{
				res.send('Arcs ' + obj.id + ' not updated', 400);
			}
	    });
	});

	app.post('/update-place-position', function(req, res){
		PNM.updatePlacePosition(JSON.parse(req.body.place), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: place position ' + obj.id + ' updated correctly', 200);
			}	else{
				res.send('Place position ' + obj.id + ' not updated', 400);
			}
	    });
	});

	app.post('/update-arc-position', function(req, res){
		PNM.updateArcPosition(JSON.parse(req.body.arc), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: arc position ' + obj.id + ' updated correctly', 200);
			}	else{
				res.send('Arc position ' + obj.id + ' not updated', 400);
			}
	    });
	});

	app.post('/update-transition-position', function(req, res){
		PNM.updateTransitionPosition(JSON.parse(req.body.transition), req.body.netId, req.session.user, function(e, obj){
			if (!e){
				res.send('Ok: transition position ' + obj.id + ' updated correctly', 200);
			}	else{
				res.send('Transition position ' + obj.id + ' not updated', 400);
			}
	    });
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //

	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});

	/*
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	*/
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};