var simulationStatus = false;
var placesForSimulation = [];
var transitionsForSimulation = [];
var arcsForSimulation = [];
var transitionsEnabled = [];

var tEnabledFill = "white";
var tEnabledStroke = "red";
var tEnabledStrokeWidth = 2;
var tEnabledOpacity = 1;

function TransitionForSimulation() {
	this.transition = null;
	this.arcsIn = [];
	this.arcsOut = [];
	this.enabled = false;
	this.id = null;
}

TransitionForSimulation.prototype.getId = function(){
	return this.id;
}

function forSimulation(){
	if(simulationStatus){
		stopSimulation();
	}else{
		startSimulation();
	}
}	

function startListenerForSimulation(){
	var groups = transitionsLayer.get("Group");
	groups.each(function(group){
		var childrens = group.getChildren();
		childrens.each(function(child){
			if(child.getId().startsWith("T")){
				child.on("click", function(){
					if(transitionsEnabled.contains(child)){
						fireTransition(getTransitionEnabled(child.getId()));
					}
				});
			}
		});
	});
}

function startSimulation(){
	$("#radio").hide();
	stopListener();
	startListenerForSimulation();
	simulationStatus = true;
	drawItem = SIMULATION;
	var p = places.length;
	for (var i = p-1; i >= 0; i--) {
		placesForSimulation.push(new Place(places[i]));
	}
	var t = transitions.length;
	for (var i = t-1; i >= 0; i--) {
		transitionsForSimulation.push(new Transition(transitions[i]));
	}
	var a = arcs.length;
	for (var i = a-1; i >= 0; i--) {
		arcsForSimulation.push(new Arc(arcs[i]));
	}
	checkTransitions();
}

function checkTransitions(){
	transitionsEnabled = [];
	var t = transitionsForSimulation.length;
	for (var i = t-1; i >= 0; i--) {
		var transition = transitionsForSimulation[i];
		
		var transitionJs = transitionsLayer.get("#"+transition.id)[0];
		transitionJs.setFill(T_FILL);
		transitionJs.setStroke(T_STROKE);
		transitionJs.setStrokeWidth(T_STROKEWIDTH);
		transitionJs.setOpacity(T_OPACITY);
		
		if(isEnabled(transition)){
			transitionJs.setFill(tEnabledFill);
			transitionJs.setStroke(tEnabledStroke);
			transitionJs.setStrokeWidth(tEnabledStrokeWidth);
			transitionJs.setOpacity(tEnabledOpacity);
			
			addTransitionForSimulation(transition);
		}
	}
	transitionsLayer.drawScene();
}

function fireTransition(transitionEnabled){
	var ai = transitionEnabled.transition.arcsIn.length;
	for (var i = ai-1; i >= 0; i--) {
		var arcIn = transitionEnabled.transition.arcsIn[i];
		var place = getPlaceForSimulation(arcIn.startId);
		place.token--;
		var token = place.token; 
		var tokenId = PREFIX_TOKEN + place.id;
		var token = place.token; 
		var tokenJsText = stage.get('#'+tokenId)[0];
		if(token > 0 && token < 10){
			tokenJsText.setText(token);
			if(token == 9){
				tokenJsText.setX(tokenJsText.getX() + 3);
			}
		} else if(token > 9 && token < 100){
			tokenJsText.setText(token);
			if(token == 99){
				tokenJsText.setX(tokenJsText.getX() + 3);
			}
		} else if(token > 99){
			tokenJsText.setText("99+");
		}else{
			tokenJsText.setVisible(false);
		}
	}
	var ao = transitionEnabled.transition.arcsOut.length;
	for (var i = ao-1; i >= 0; i--) {
		var arcOut = transitionEnabled.transition.arcsOut[i];
		var place = getPlaceForSimulation(arcOut.endId);
		place.token++;
		var token = place.token; 
		var tokenId = PREFIX_TOKEN + place.id;
		var tokenJsText = stage.get('#'+tokenId)[0];
		if(token > 0 && token < 10){
			tokenJsText.setText(token);
			tokenJsText.setVisible(true);
		} else if(token > 9 && token < 100){
			tokenJsText.setText(token);
			if(token == 10){
				tokenJsText.setX(tokenJsText.getX() - 3);
			}
		} else if(token > 99){
			tokenJsText.setText("99+");
			if(token == 100){
				tokenJsText.setX(tokenJsText.getX() - 3);
			}
		}
	}
	
	placesLayer.drawScene();
	
	checkTransitions();
}

function stopSimulation(){
	stopListener();
	placesForSimulation = [];
	transitionsForSimulation = [];
	arcsForSimulation = [];
	drawItem = -2;
	simulationStatus = false;
	
	var groups = transitionsLayer.get("Group");
	groups.each(function(group){
		var childrens = group.getChildren();
		childrens.each(function(child){
			if(child.getId().startsWith("T")){
				setDefaultStyle(child);
			}
		});
	});
	transitionsLayer.drawScene();	
	
	var p = places.length;
	for (var i = p-1; i >= 0; i--) {
		var place = places[i];
		
		var token = place.token; 
		var tokenId = PREFIX_TOKEN + place.id;
		var tokenJsText = stage.get('#'+tokenId)[0];
		if(token > 0 && token < 10){
			tokenJsText.setText(token);
			tokenJsText.setVisible(true);
		} else if(token > 9 && token < 100){
			tokenJsText.setText(token);
			if(token == 10){
				tokenJsText.setX(tokenJsText.getX() - 3);
			}
			tokenJsText.setVisible(true);
		} else if(token > 99){
			tokenJsText.setText("99+");
			if(token == 100){
				tokenJsText.setX(tokenJsText.getX() - 3);
			}
			tokenJsText.setVisible(true);
		}else{
			tokenJsText.setVisible(false);
		}
	}
	
	placesLayer.drawScene();	
	$("#radio").show();
}

function addTransitionForSimulation(transition) {
	var transitionForSimulation = new TransitionForSimulation;
	transitionForSimulation.transition = transition;
	transitionForSimulation.id = transition.id;
/*
	var a = arcsForSimulation.length;
	for (var i = a-1; i >= 0; i--) {
		var arc = arcsForSimulation[i];
		if(arc.endId == transition.id){
			transitionForSimulation.arcsIn.push(arc);
		}
		if(arc.startId == transition.id){
			transitionForSimulation.arcsOut.push(arc);
		}
	}
	*/
	transitionForSimulation.enabled = true;
	transitionsEnabled.push(transitionForSimulation);
}

function isEnabled(transition){
	var enabledTransition = true;
	var a = arcsForSimulation.length;
	for (var i = a-1; i >= 0; i--) {
		var arc = arcsForSimulation[i];
		if(arc.endId == transition.id){
			var place = getPlaceForSimulation(arc.startId);
			if(place.token > 0){
				enabledTransition = true;
			} else {
				return false;
			}
		}
	}
	return enabledTransition;
}	

function getPlaceForSimulation(placeId){
	for(var p in placesForSimulation){
		if(placesForSimulation[p].id == placeId){
			return placesForSimulation[p];
		}
	}
}

function getTransitionEnabled(transitionId){
	for(var t in transitionsEnabled){
		if(transitionsEnabled[t].id == transitionId){
			return transitionsEnabled[t];
		}
	}
}
