	//var socket = io.connect('http://localhost:1337');

	/*
	socket.on('connect', function () {
		console.log("Connected");
	});
	*/
	var netId;
	var places = [];
	var transitions = [];
	var arcs = [];
	
	var selectedItems = [];
	var multiSelection = false;
	var BACKGROUND_ID = "BACKGROUND";
	//var for draw items. -1 for selection, 0 for places, 1 for transitions, 2 for arcs, 3 for add a token, 4 for remove a token, 5 for simulation
	var drawItem = -2;
	var SELECTION = -1;
	var DRAW_PLACE = 0;
	var DRAW_TRANSITION = 1;
	var DRAW_ARC = 2;
	var ADD_TOKEN = 3;
	var REMOVE_TOKEN = 4;
	var SIMULATION = 5;
	
	var T_HEIGHT = 30;
	var T_WIDTH = 10;
	var T_STROKEWIDTH = 1;
	var T_FILL = "white";
	var T_STROKE = "black";
	var T_OPACITY = 1;
	var T_xOffsetText = 15;
	var T_yOffsetText = 30;
	
	var P_RADIUS = 12;
	var P_FILL = "white";
	var P_STROKE = "black";
	var P_STROKEWIDTH = 1;
	var P_OPACITY = 1;
	var P_xOffsetText = 10;
	var P_yOffsetText = 10;
	
	var P_xOffsetToken = -3;
	var P_yOffsetToken = -6;
	
	var A_FILL = "black";
	var A_STROKE = "black";
	var A_ARROW_SIZE = 10;
	var A_WIDTH = 1;
	var A_OPACITY = 1;
	
	var PREFIX_GROUP = "_GRP_";
	var PREFIX_TEXT = "_TXT_";
	var PREFIX_TOKEN = "_TOK_";
	var PREFIX_ARROW = "_ARW_";
	
	var TXT_FONTSIZE = 12;
	var TXT_FONTFAMILY = "Calibri";
	var TXT_FILL = "black";
	
	var mySelFill = "white";
	var mySelStroke = "blue";
	var mySelStrokeWidth = 2;
	var mySelOpacity = 1;
	
	var RIGHT = 0;
	var LEFT = 1;
	var UP = 2;
	var DOWN = 3;
	
	var tmpArcJs;
	var tmpArc;
	var isDrawingArc = false;
	
	var counterTransitionID = -1;
	var counterPlaceID = -1;
	var counterArcID = -1;
	
	var stage;
	var drawerLayer;
	var arcsLayer;
	var placesLayer;
	var transitionsLayer;
	var background;
	
	var STAGE_WIDTH = $('#container').outerWidth();
	var STAGE_HEIGHT = $('#container').outerHeight();
	
	Place.prototype.getId = function(){
		return this.id;
	}
	
	Transition.prototype.getId = function(){
		return this.id;
	}
	
	Arc.prototype.getId = function(){
		return this.id;
	}
	
	String.prototype.startsWith = function(str){
		return (this.match("^"+str)==str);
	}
	
	Array.prototype.contains = function(obj) {
		var i = this.length;
		while (i--) {
			if (this[i].getId() === obj.getId()) {
				return true;
			}
		}
		return false;
	}
	
	Array.prototype.remove = function(obj) {
		var i = this.length;
		while (i--) {
			if (this[i].getId() === obj.getId()) {
				this.splice(i,1);
				return true;
			}
		}
		return false;
	}
	
	function Transition(transition) {
		if(transition != null){
			this.id = transition.id;
			this.textId = transition.textId;
			this.arcsIn = [];
			if(transition.arcsIn != null){
				a = transition.arcsIn.length;
				for (var i = a-1; i >= 0; i--) {
					this.arcsIn.push(getArc(transition.arcsIn[i].id));
				}
			}
			this.arcsOut = [];
			if(transition.arcsOut != null){
				a = transition.arcsOut.length;
				for (var i = a-1; i >= 0; i--) {
					this.arcsOut.push(getArc(transition.arcsOut[i].id))
				}
			}
			this.x = transition.x;
			this.y = transition.y;
		}else {
			this.id = "T"+ (++counterTransitionID);
			this.textId = PREFIX_TEXT+this.id;
			this.arcsIn = [];
			this.arcsOut = [];
			this.x = 0;
			this.y = 0;
		}
	}
	
	
	function Place(place) {
		if(place != null){
			this.id = place.id;
			this.textId = place.textId;
			this.arcsIn = [];
			if(place.arcsIn != null){
				a = place.arcsIn.length;
				for (var i = a-1; i >= 0; i--) {
					this.arcsIn.push(getArc(place.arcsIn[i].id))
				}
			}
			this.arcsOut = [];
			if(place.arcsOut != null){
				a = place.arcsOut.length;
				for (var i = a-1; i >= 0; i--) {
					this.arcsOut.push(getArc(place.arcsOut[i].id))
				}
			}
			this.token = place.token;
			this.x = place.x;
			this.y = place.y;
		}else{
			this.id = "P"+ (++counterPlaceID);
			this.textId = PREFIX_TEXT+this.id;
			this.arcsIn = [];
			this.arcsOut = [];
			this.token = 0;
			this.x = 0;
			this.y = 0;
		}	
	}
	
	function Arc(arc) {
		if(arc != null){
			this.id = arc.id;
			this.textId = arc.textId;
			this.startId = arc.startId;
			this.endId = arc.endId;
			this.weight = arc.weight;
			this.points = arc.points;
		} else{
			this.id = "A"+ (++counterArcID);
			this.textId = PREFIX_TEXT+this.id;
			this.startId = null;
			this.endId = null;
			this.weight = 1;
			this.points = new Array();
		}
	}

	function resetDrawer(){
		places = new Array();
		transitions = new Array();
		arcs = new Array();

		counterTransitionID = -1;
		counterPlaceID = -1;
		counterArcID = -1;

		arcsLayer.destroyChildren();
		placesLayer.destroyChildren();
		transitionsLayer.destroyChildren();
		
		stopListener();
		if(simulationStatus){
			stopSimulation();
		}

		stage.draw();
	}

	function openPetriNet(net){
		netId = net._id;
		$('.btn-draw').removeAttr('disabled');
		$('#btn-simulation').removeAttr('disabled');
		//$('.btn-draw').removeClass('active');
		//$('#btn-simulation').removeClass('active');
		resetDrawer();

		arcsTmp = net.arcs;
		if(arcsTmp != null){
			a = arcsTmp.length;
			for (var i = a-1; i >= 0; i--) {
				arcs.push(new Arc(arcsTmp[i]));
				openArc(arcsTmp[i]);
				counterArcIDTmp = Number(arcsTmp[i].id.substring(1));
				if(counterArcID < counterArcIDTmp){
					counterArcID = counterArcIDTmp;
				}
			}
			arcsLayer.draw(); 
		}

		placesTmp = net.places;
		if(placesTmp != null){
			p = placesTmp.length;
			for (var i = p-1; i >= 0; i--) {
				places.push(new Place(placesTmp[i]));
				openPlace(placesTmp[i]);
				counterPlaceIDTmp = Number(placesTmp[i].id.substring(1));
				if(counterPlaceID < counterPlaceIDTmp){
					counterPlaceID = counterPlaceIDTmp;
				}
			}
			placesLayer.draw();
		}

		transitionsTmp = net.transitions;
		if(transitionsTmp != null){
			t = transitionsTmp.length;
			for (var i = t-1; i >= 0; i--) {
				transitions.push(new Transition(transitionsTmp[i]));
				openTransition(transitionsTmp[i]);
				counterTransitionIDTmp = Number(transitionsTmp[i].id.substring(1));
				if(counterTransitionID < counterTransitionIDTmp){
					counterTransitionID = counterTransitionIDTmp;
				}
			}
			transitionsLayer.draw();
		}
	}

	function openTransition(transition){
		var group = createGroup(transition.id);
		
		var x = Number(transition.x);
		var y = Number(transition.y);
		
		transitionJs = new Kinetic.Rect({
			id: transition.id,
			x: x,
			y: y,
			width: T_WIDTH,
			height: T_HEIGHT,
			fill: T_FILL,
			stroke: T_STROKE,
			strokeWidth: T_STROKEWIDTH,
			opacity: T_OPACITY
		});
		
		var transitionJsText = new Kinetic.Text({
			id: PREFIX_TEXT+transition.id,
			x: x + T_xOffsetText,
			y: y + T_yOffsetText,
			text: transition.id,
			fontSize: TXT_FONTSIZE,
			fontFamily: TXT_FONTFAMILY,
			fill: TXT_FILL
		});
		
		group.add(transitionJs);
		group.add(transitionJsText);

		transitionsLayer.add(group);
	}

	function openArc(arc){
		var group = createGroup(arc.id);

		var length = arc.points.length;
		var tox = arc.points[length-1].x;
		var toy = arc.points[length-1].y;

		var fromx = arc.points[length-2].x;
		var fromy = arc.points[length-2].y;
		
		tmpArcJs = new Kinetic.Line({
			id: arc.id,
			points: arc.points,
			fill: A_FILL,
			stroke: A_STROKE,
			strokeWidth: A_WIDTH,
			opacity: A_OPACITY
		});
		
		var headlen = A_ARROW_SIZE;
		var angle = Math.atan2(toy-fromy,tox-fromx);

		var datas = 'M'+tox+","+toy+",L"+(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+",M"+
						tox+","+toy+",L"+(tox-headlen*Math.cos(angle+Math.PI/6))+","+(toy-headlen*Math.sin(angle+Math.PI/6))+",L"+
						(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+"Z";

		arrow = new Kinetic.Path({
			id: PREFIX_ARROW + arc.id,
			data: datas,
			fill: A_FILL,
			visible: true
		});
		
		group.add(tmpArcJs);
		group.add(arrow);
		
		
		arcsLayer.add(group);
	}

	function openPlace(place){	
		var group = createGroup(place.id);
		
		placeJs = new Kinetic.Circle({
			id: place.id,
			x: place.x,
			y: place.y,
			radius: P_RADIUS,
			fill: P_FILL,
			stroke: P_STROKE,
			strokeWidth: P_STROKEWIDTH,
			opacity: P_OPACITY
		});
		
		placeJsText = new Kinetic.Text({
			id: PREFIX_TEXT+place.id,
			x: Number(place.x) + P_xOffsetText,
			y: Number(place.y) + P_yOffsetText,
			text: place.id,
			fontSize: TXT_FONTSIZE,
			fontFamily: TXT_FONTFAMILY,
			fill: TXT_FILL
		});
		
		
		
		group.add(placeJs);
		group.add(placeJsText);

		tokenVisible = false;
		if(Number(place.token) > 0 ){
			tokenVisible = true;
		}

		var x = Number(place.x) + P_xOffsetToken;
		var y = Number(place.y) + P_yOffsetToken;
		var text = place.token;
		if(place.token > 9 && place.token < 100){
			x = x - 3;
		}else if(place.token > 99){
			text = "99+";
			x = x - 6;
		}
		
		tokenJsText = new Kinetic.Text({
			id: PREFIX_TOKEN+place.id,
			x: x,
			y: y,
			text: text,
			fontSize: TXT_FONTSIZE,
			fontFamily: TXT_FONTFAMILY,
			fill: TXT_FILL,
			visible: tokenVisible
		});
		
		group.add(tokenJsText);
		
		placesLayer.add(group);
	}

	function deleteArcsConnected(shape){

	}
	
	function init() {
		stage = new Kinetic.Stage({
			id: "stage1",
			container: "container",
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT
		});

		drawerLayer = new Kinetic.Layer({
			id: "drawerLayer"
		});
		
		arcsLayer = new Kinetic.Layer({
			id: "arcsLayer"
		});
		
		placesLayer = new Kinetic.Layer({
			id: "placesLayer"
		});
		
		transitionsLayer = new Kinetic.Layer({
			id: "transitionsLayer"
		});
			
		background = new Kinetic.Rect({
			id: BACKGROUND_ID,
			width: stage.getWidth(),
			height: stage.getHeight()
		});

		window.addEventListener("keydown",function(e){
			switch(e.keyCode){
				case 46:
					var redrawArcsLayer = false;
					var redrawTransitionsLayer = false;
					var redrawPlacesLayer = false;
					var s = selectedItems.length;
					for (var i = s-1; i >= 0; i--) {
						var shape = selectedItems[i];
						
						if(shape instanceof Kinetic.Rect){
							var transition = getTransition(shape.getId());
							var ai = transition.arcsIn.length;
							for (var j = ai-1; j >= 0; j--) {
								redrawArcsLayer = true;
								var arc = transition.arcsIn[j];
								start = getPlace(arc.startId);
								start.arcsOut.remove(arc);
								arcs.remove(arc);
								var arcJs = arcsLayer.get("#"+arc.id)[0];
								if(arcJs.getParent() != null){
									arcJs.getParent().destroy();
								}
								updateArcsReference(start);
								deleteFromDB(arc);
							}
							var ao = transition.arcsOut.length;
							for (var z = ao-1; z >= 0; z--) {
								redrawArcsLayer = true;
								var arc = transition.arcsOut[z];
								end = getPlace(arc.endId);
								end.arcsIn.remove(arc);
								arcs.remove(arc);
								var arcJs = arcsLayer.get("#"+arc.id)[0];
								if(arcJs.getParent() != null){
									arcJs.getParent().destroy();
								}
								updateArcsReference(end);
								deleteFromDB(arc);
							}
							redrawTransitionsLayer = true;
							deleteFromDB(getTransition(shape.getId()));
							transitions.remove(shape);
						}
						if(shape instanceof Kinetic.Circle){
							var place = getPlace(shape.getId());
							var ai = place.arcsIn.length;
							for (var j = ai-1; j >= 0; j--) {
								redrawArcsLayer = true;
								var arc = place.arcsIn[j];
								start = getTransition(arc.startId);
								start.arcsOut.remove(arc);
								arcs.remove(arc);
								var arcJs = arcsLayer.get("#"+arc.id)[0];
								if(arcJs.getParent() != null){
									arcJs.getParent().destroy();
								}
								updateArcsReference(start);
								deleteFromDB(arc);
							}
							var ao = place.arcsOut.length;
							for (var z = ao-1; z >= 0; z--) {
								redrawArcsLayer = true;
								var arc = place.arcsOut[z];
								end = getTransition(arc.endId);
								end.arcsIn.remove(arc);
								arcs.remove(arc);
								var arcJs = arcsLayer.get("#"+arc.id)[0];
								if(arcJs.getParent() != null){
									arcJs.getParent().destroy();
								}

								updateArcsReference(end);
								deleteFromDB(arc);
							}
							redrawPlacesLayer = true;
							deleteFromDB(getPlace(shape.getId()));
							places.remove(shape);
						}
						if(shape instanceof Kinetic.Line){
							redrawArcsLayer = true;

							var arc = getArc(shape.getId());
							if(arc != null){
								var shapeIdStart = arc.startId;
								var item;
								if(shapeIdStart.startsWith("P")){
									item = getPlace(shapeIdStart);
								}else if(shapeIdStart.startsWith("T")){
									item = getTransition(shapeIdStart);
								}
								item.arcsOut.remove(shape);
								updateArcsReference(item);

								var shapeIdEnd = arc.endId;
								if(shapeIdEnd.startsWith("P")){
									item = getPlace(shapeIdEnd);
								}else if(shapeIdEnd.startsWith("T")){
									item = getTransition(shapeIdEnd);
								}
								item.arcsIn.remove(shape);
								updateArcsReference(item);
								
								arcs.remove(shape);
								deleteFromDB(arc);
							}
						}
						
						if(shape.getParent() != null){
							shape.getParent().destroy();
						}
					}
					if(redrawTransitionsLayer){
						transitionsLayer.drawScene();
					}
					if(redrawPlacesLayer){
						placesLayer.drawScene();
					}
					if(redrawArcsLayer){
						arcsLayer.drawScene();
					}
					break;
			}
		});
				
		drawerLayer.add(background);
		
		stage.add(drawerLayer);
		stage.add(arcsLayer);
		stage.add(transitionsLayer);	
		
		stage.add(placesLayer);
		
		
		
		
	}

	function deselectItems(){
		if(selectedItems.length > 0){
			var redrawArcsLayer = false;
			var redrawTransitionsLayer = false;
			var redrawPlacesLayer = false;
			
			var si = selectedItems.length;
			for (var i = si-1; i >= 0; i--) {
				var shape = selectedItems[i];
				if(shape instanceof Kinetic.Rect){
					redrawTransitionsLayer = true;
				}
				if(shape instanceof Kinetic.Circle){
					redrawPlacesLayer = true;
				}
				if(shape instanceof Kinetic.Line){
					redrawArcsLayer = true;
				}
				if(shape instanceof Kinetic.Path){
					redrawArcsLayer = true;
				}
				setDefaultStyle(shape);
			}
			
			selectedItems = [];
			if(redrawTransitionsLayer){
				transitionsLayer.drawScene();
			}
			if(redrawPlacesLayer){
				placesLayer.drawScene();
			}
			if(redrawArcsLayer){
				arcsLayer.drawScene();
			}
		}
	}
	
	function drawArc(shape){
		tmpArc = addArc();
		
		var group = createGroup(tmpArc.id);
		
		tmpArc.startId  = shape.getId();
		
		if(shape instanceof Kinetic.Circle){
			var tox = shape.getAbsolutePosition().x;
			var toy = shape.getAbsolutePosition().y;

			var fromx = shape.getAbsolutePosition().x;
			var fromy = shape.getAbsolutePosition().y;
		}else{
			var tox = shape.getAbsolutePosition().x + (T_WIDTH / 2);
			var toy = shape.getAbsolutePosition().y + (T_HEIGHT / 2);

			var fromx = shape.getAbsolutePosition().x + (T_WIDTH / 2);
			var fromy = shape.getAbsolutePosition().y + (T_HEIGHT / 2);
		}	
		
		tmpArcJs = new Kinetic.Line({
			id: tmpArc.id,
			points: [fromx, fromy, tox, toy],
			fill: A_FILL,
			stroke: A_STROKE,
			strokeWidth: A_WIDTH,
			opacity: A_OPACITY
		});
		
		var headlen = A_ARROW_SIZE;
		var angle = Math.atan2(toy-fromy,tox-fromx);

		var datas = 'M'+tox+","+toy+",L"+(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+",M"+
						tox+","+toy+",L"+(tox-headlen*Math.cos(angle+Math.PI/6))+","+(toy-headlen*Math.sin(angle+Math.PI/6))+",L"+
						(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+"Z";

		arrow = new Kinetic.Path({
			id: PREFIX_ARROW + tmpArc.id,
			data: datas,
			fill: A_FILL,
			visible: false
		});
		
		group.add(tmpArcJs);
		group.add(arrow);
		
		
		drawerLayer.add(group);
		
		isDrawingArc = true;
		drawerLayer.draw(); 
	}
	
	function addArc() {
		var arc = new Arc;
		arcs.push(arc);
		return arc;
	}
	
	function getPlace(placeId){
		for(var p in places){
			if(places[p].id == placeId){
				return places[p];
			}
		}
	}
	
	function getTransition(transitionId){
		for(var t in transitions){
			if(transitions[t].id == transitionId){
				return transitions[t];
			}
		}
	}
	
	function getArc(arcId){
		for(var a in arcs){
			if(arcs[a].id == arcId){
				return arcs[a];
			}
		}
	}
	
	function startListenerForNewPlaces(){
		//placesLayer.moveToTop();
		background.on("click",function(){
			var mousePos = stage.getMousePosition();

			socket.emit('drawPlace', {room: room, coords: mousePos});	
		});

		background.on("tap",function(){
			var touchPos = stage.getTouchPosition();

			socket.emit('drawPlace', {room: room, coords: touchPos});	
		});
	}
	
	function startListenerForNewTransitions(){
		//transitionsLayer.moveToTop();
		background.on("click",function(){
			var mousePos = stage.getMousePosition();

			socket.emit('drawTransition', {room: room, coords: mousePos});	
		});

		background.on("tap",function(){
			var touchPos = stage.getTouchPosition();

			socket.emit('drawTransition', {room: room, coords: touchPos});	
		});
	}
	
	function startListenerForAddTokens(){
		var groups = placesLayer.get("Group");
		groups.each(function(group){
			var childrens = group.getChildren();
			childrens.each(function(child){
				if(child.getId().startsWith("P") || child.getId().startsWith(PREFIX_TOKEN)){
					child.on("click", function(){
						socket.emit('createToken', {room: room, id: child.getId()});
						//createToken(child.getId());
					});
				}
			});
		});
		/*
		var p = places.length;
		for (var i = p-1; i >= 0; i--) {
			var place = places[i];
			
			var placeJs = stage.get("#"+place.id)[0];
			
			placeJs.on("click", function(){
				createToken(this.getId());
			});
			
			var tokenJsText = stage.get("#"+PREFIX_TOKEN+place.id)[0];
			tokenJsText.on("click", function(){
				createToken(this.getId());
			});
		}
		*/
	}
	
	function startListenerForRemoveTokens(){
		var groups = placesLayer.get("Group");
		groups.each(function(group){
			var childrens = group.getChildren();
			childrens.each(function(child){
				if(child.getId().startsWith("P") || child.getId().startsWith(PREFIX_TOKEN)){
					child.on("click", function(){
						socket.emit('eraseToken', {room: room, id: child.getId()});
						//eraseToken(child.getId());
					});
				}
			});
		});
		/*
		var p = places.length;
		for (var i = p-1; i >= 0; i--) {
			var place = places[i];
			
			var placeJs = stage.get("#"+place.id)[0];
			
			placeJs.on("click", function(){
				eraseToken(this.getId());
			});
			
			var tokenJsText = stage.get("#"+PREFIX_TOKEN+place.id)[0];
			tokenJsText.on("click", function(){
				eraseToken(this.getId());
			});
		}
		*/
	}
	
	function startShapeMouseover(shape){
		if(shape instanceof Kinetic.Circle){
			var rects = transitionsLayer.get("Rect");
			rects.each(function(rect) {
				rect.on("mouseenter", function(){
					if(isDrawingArc){
						var length = tmpArcJs.getPoints().length -1;
			
						var direction = witchSpace(tmpArcJs.getPoints()[length-1],tmpArcJs.getPoints()[length]);
						switch(direction){
							case DOWN:
								tmpArcJs.getPoints()[length].x = rect.getAbsolutePosition().x + (T_WIDTH / 2);
								tmpArcJs.getPoints()[length].y = rect.getAbsolutePosition().y + T_HEIGHT;
								break;
							case LEFT:
								tmpArcJs.getPoints()[length].x = rect.getAbsolutePosition().x;
								tmpArcJs.getPoints()[length].y = rect.getAbsolutePosition().y + (T_HEIGHT / 2);
								break;
							case UP:
								tmpArcJs.getPoints()[length].x = rect.getAbsolutePosition().x + (T_WIDTH / 2);
								tmpArcJs.getPoints()[length].y = rect.getAbsolutePosition().y;
								break;
							case RIGHT:
								tmpArcJs.getPoints()[length].x = rect.getAbsolutePosition().x + T_WIDTH;
								tmpArcJs.getPoints()[length].y = rect.getAbsolutePosition().y + (T_HEIGHT / 2);
								break;
						}
						
						var fromx = tmpArcJs.getPoints()[length-1].x;
						var fromy = tmpArcJs.getPoints()[length-1].y;
						
						var tox = tmpArcJs.getPoints()[length].x;
						var toy = tmpArcJs.getPoints()[length].y;
						
						var headlen = A_ARROW_SIZE;
						var angle = Math.atan2(toy-fromy,tox-fromx);
						
						var datas = 'M'+tox+","+toy+",L"+(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+",M"+
								tox+","+toy+",L"+(tox-headlen*Math.cos(angle+Math.PI/6))+","+(toy-headlen*Math.sin(angle+Math.PI/6))+",L"+
								(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+"Z";
						
						var arrow = stage.get('#'+PREFIX_ARROW + tmpArc.id)[0];
						arrow.setData(datas);

						
						stage.off("mousemove");
						drawerLayer.drawScene();
					}
				});
				rect.on("mouseleave", function(){
					stage.on("mousemove", function(){
						startStageMousemove();
					});
				});
			});
		}else if(shape instanceof Kinetic.Rect){
			var circles = placesLayer.get("Circle");
			circles.each(function(circle) {
				circle.on("mouseenter", function(){
					if(isDrawingArc){
						var length = tmpArcJs.getPoints().length -1;
			
						var direction = witchSpace(tmpArcJs.getPoints()[length-1],tmpArcJs.getPoints()[length]);
						switch(direction){
							case DOWN:
								tmpArcJs.getPoints()[length].x = circle.getAbsolutePosition().x;
								tmpArcJs.getPoints()[length].y = circle.getAbsolutePosition().y + P_RADIUS;
								break;
							case LEFT:	
								tmpArcJs.getPoints()[length].x = circle.getAbsolutePosition().x - P_RADIUS;
								tmpArcJs.getPoints()[length].y = circle.getAbsolutePosition().y;
								break;
							case UP:
								tmpArcJs.getPoints()[length].x = circle.getAbsolutePosition().x;
								tmpArcJs.getPoints()[length].y = circle.getAbsolutePosition().y - P_RADIUS;
								break;
							case RIGHT:
								tmpArcJs.getPoints()[length].x = circle.getAbsolutePosition().x + P_RADIUS;
								tmpArcJs.getPoints()[length].y = circle.getAbsolutePosition().y;
								break;
						}
						
						var fromx = tmpArcJs.getPoints()[length-1].x;
						var fromy = tmpArcJs.getPoints()[length-1].y;
						
						var tox = tmpArcJs.getPoints()[length].x;
						var toy = tmpArcJs.getPoints()[length].y;
						
						var headlen = A_ARROW_SIZE;
						var angle = Math.atan2(toy-fromy,tox-fromx);
						
						var datas = 'M'+tox+","+toy+",L"+(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+",M"+
								tox+","+toy+",L"+(tox-headlen*Math.cos(angle+Math.PI/6))+","+(toy-headlen*Math.sin(angle+Math.PI/6))+",L"+
								(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+"Z";
						
						var arrow = stage.get('#'+PREFIX_ARROW + tmpArc.id)[0];
						arrow.setData(datas);
						
						
						stage.off("mousemove");
						drawerLayer.drawScene();
					}
				});
				circle.on("mouseleave", function(){
					stage.on("mousemove", function(){
						startStageMousemove();
					});
				});
			});
		}
	}
	
	function startStageMousemove(){
		if (isDrawingArc) {
			var mousePos = stage.getMousePosition();
			var tox = mousePos.x + 10;
			var toy = mousePos.y + 10;
			var length = tmpArcJs.getPoints().length - 1;
			
			tmpArcJs.getPoints()[length].x = tox;
			tmpArcJs.getPoints()[length].y = toy;
			
			var fromx = tmpArcJs.getPoints()[length-1].x;
			var fromy = tmpArcJs.getPoints()[length-1].y;
			
			var headlen = A_ARROW_SIZE;
			var angle = Math.atan2(toy-fromy,tox-fromx);

			var datas = 'M'+tox+","+toy+",L"+(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+",M"+
					tox+","+toy+",L"+(tox-headlen*Math.cos(angle+Math.PI/6))+","+(toy-headlen*Math.sin(angle+Math.PI/6))+",L"+
					(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+"Z";
			
			var arrow = stage.get('#'+PREFIX_ARROW + tmpArc.id)[0];
			arrow.setData(datas);
			arrow.setVisible(true);
			var group = stage.get('#'+PREFIX_GROUP + tmpArc.id)[0];
			
			group.setZIndex(1);
			drawerLayer.drawScene();
		}
	}
	
	function startDrawingArc(shape){
		shape.on("click", function(){
			if(tmpArc == null){
				var rects = transitionsLayer.get("Rect");
				rects.each(function(rect) {
					rect.off("mouseenter");
					rect.off("mouseleave");
				});
				
				var circles = placesLayer.get("Circle");
				circles.each(function(circle) {
					circle.off("mouseenter");
					circle.off("mouseleave");
				});
				
				stage.on("mousemove", function(){
					startStageMousemove();
				});
				
				drawArc(shape);
				startShapeMouseover(shape);
			}else if(tmpArc.startId != "" && tmpArc.startId != shape.getId()){
				var exists = false;
				var a = arcs.length;
				for (var i = a-1; i >= 0; i--) {
					arc = arcs[i];
					if(arc.startId == tmpArc.startId && arc.endId == shape.getId()){
						exists = true;
						break;
					}
				}
				if(!exists){
					var start = stage.get('#'+tmpArc.startId)[0];
					if( (start instanceof Kinetic.Circle && shape instanceof Kinetic.Rect ) 
							|| (start instanceof Kinetic.Rect && shape instanceof Kinetic.Circle) ){
						tmpArc.endId  = shape.getId();
						tmpArc.points = tmpArcJs.getPoints();
						if(start instanceof Kinetic.Circle){
							var place = getPlace(tmpArc.startId);
							place.arcsOut.push(tmpArc);
							updateArcsReference(place);
						}
						if(shape instanceof Kinetic.Circle){
							var place = getPlace(tmpArc.endId);
							place.arcsIn.push(tmpArc);
							updateArcsReference(place);
						}
						if(start instanceof Kinetic.Rect){
							var transition = getTransition(tmpArc.startId);
							transition.arcsOut.push(tmpArc);
							updateArcsReference(transition);
						}
						if(shape instanceof Kinetic.Rect){
							var transition = getTransition(tmpArc.endId);
							transition.arcsIn.push(tmpArc);
							updateArcsReference(transition);
						}
						tmpArcJs.getParent().moveTo(arcsLayer);
						
						arcsLayer.draw();
						drawerLayer.drawScene();
						
						storeOnDB(tmpArc);
						
						isDrawingArc = false;
						tmpArc = null;
						tmpArcJs = null;
						
						shape.off("mouseenter");
						shape.off("mouseleave");


					}
				}else{
					//INCREMENTARE IL PESO DELL'ARCO DI UNO
					tmpArcJs.getParent().destroy();
					arcs.remove(tmpArc);
					
					arcsLayer.draw();
					drawerLayer.drawScene();
					
					
					isDrawingArc = false;
					tmpArc = null;
					tmpArcJs = null;
					
					shape.off("mouseenter");
					shape.off("mouseleave");
				}
				
				/*var groups = stage.get("Group");
				groups.each(function(group) {
					var children = group.getChildren();
					children.each(function(shape) {
						shape.off("mouseover");
						shape.off("mouseout");
					});
				});*/
			}
		});
	}
	
	function startListenerForNewArcs(){
		//arcsLayer.moveToTop();
		
		var circles = placesLayer.get("Circle");
		/*
		circles.each(function(circle) {
			circle.setDrawHitFunc(function(canvas){
				var context = canvas.getContext();
				context.beginPath();
				context.arc(0, 0, this.getRadius() + 10, 0, Math.PI * 2);
				context.closePath();
				canvas.fillStroke(this);
			});
		});
		*/
		var rects = transitionsLayer.get("Rect");
		/*
		rects.each(function(rect) {
			rect.setDrawHitFunc(function(canvas){
				var context = canvas.getContext();
				context.beginPath();
				context.rect(-10, -10, this.getWidth() + 20, this.getHeight() + 20);
				context.closePath();
				canvas.fillStroke(this);
			});
		});
		*/
		
		window.addEventListener("keydown",function(e){
			if(e.keyCode == 27){
				if(isDrawingArc){
					tmpArcJs.destroy();
					arrow.destroy();
					tmpArc = null;
					tmpArcJs = null;
					isDrawingArc = false;
					drawerLayer.drawScene();
				}
			}
		});
		
		background.on("mousemove", function(){
			startStageMousemove();
		});
		
		background.on("click", function(){ 
			if (isDrawingArc){
				var mousePos = stage.getMousePosition();
				tmpArcJs.getPoints().push({x: mousePos.x + 10, y: mousePos.y + 10});
				
				drawerLayer.drawScene();            
			}
		});
		
		circles.each(function(circle) {
			startDrawingArc(circle);
			//startShapeMouseover(circle);
		});
		
		rects.each(function(rect) {
			startDrawingArc(rect);
			//startShapeMouseover(rect);
		});

	}
	
	function witchSpace(start, end){
		var xCenterShape = end.x;
		var yCenterShape = end.y;

		var xStart = start.x;
		var yStart = start.y;
	
		mouseXFromCenter = xStart - xCenterShape;
		mouseYFromCenter = yStart - yCenterShape;
		mouseAngle = Math.atan2(mouseYFromCenter, mouseXFromCenter);
		
		if(mouseAngle < 0){
			mouseAngle = (2 * Math.PI) - Math.abs(mouseAngle);
		}
		angleDegrees = mouseAngle * (180 / Math.PI);
		
		if(angleDegrees >= 45 && angleDegrees < 135){
			return DOWN;
		}else if (angleDegrees >= 135 && angleDegrees < 225){
			return LEFT;
		}else if (angleDegrees >= 225 && angleDegrees < 315){
			return UP;
		}else{
			return RIGHT;
		}
	}

	function startListenerForSelection(){
		startDrag();
		
		window.addEventListener("keydown",function(e){
			if(e.keyCode == 16){
				multiSelection = true;
				background.off("click");
			}
		});

		window.addEventListener("keyup",function(e){
			if(e.keyCode == 16){
				multiSelection = false;
				background.on("click",function(){
					//deselectItems();
					socket.emit('deselectItems', {room: room});
				});
			}
		});
		
		background.on("click",function(){
			//deselectItems();
			socket.emit('deselectItems', {room: room});
		});
		
		startListenerForSelectionLayer("P",placesLayer);
		startListenerForSelectionLayer("T",transitionsLayer);
		startListenerForSelectionLayer("A",arcsLayer);
	}
	
	function startListenerForSelectionLayer(firstLetter, layer){	
		var groups = layer.get("Group");
		groups.each(function(group) {
			
			group.on("mousedown", function(){
				if(!multiSelection){
					//deselectItems();
					socket.emit('deselectItems', {room: room});
				}
				var children = group.getChildren();
				children.each(function(shape) {
					if(shape.getId().startsWith(firstLetter) || (shape.getId().startsWith(PREFIX_ARROW))){
						//selectItem(shape);
						socket.emit('selectShape', {room: room, layerId: layer.getId(), shapeId: shape.getId()});
						if(shape.getId().startsWith("P") || shape.getId().startsWith("T")){
							selectArcsConnected(shape);
						}
						
						//layer.drawScene();
					}
				});	
			});
			group.on('mouseenter', function() {
				document.body.style.cursor = 'pointer';
			});
			group.on('mouseleave', function() {
				document.body.style.cursor = 'default';
			});
		});
	}
	
	function selectArcsConnected(shapeJs){
		var shape;
		if(shapeJs instanceof Kinetic.Circle){
			shape = getPlace(shapeJs.getId());
		}else if(shapeJs instanceof Kinetic.Rect){
			shape = getTransition(shapeJs.getId());
		}
		
		redrawArcsLayer = false;
		if(shape.arcsIn != null){
			var ai = shape.arcsIn.length;
			for (var i = ai-1; i >= 0; i--) {
				var arc = arcsLayer.get("#"+shape.arcsIn[i].id)[0];
				selectItem(arc);
				var arrow = arcsLayer.get("#"+PREFIX_ARROW + shape.arcsIn[i].id)[0];
				selectItem(arrow);
				redrawArcsLayer = true;
			}
		}
		
		if(shape.arcsOut != null){
			var ao = shape.arcsOut.length;
			for (var i = ao-1; i >= 0; i--) {
				var arc = arcsLayer.get("#"+shape.arcsOut[i].id)[0];
				selectItem(arc);
				var arrow = arcsLayer.get("#"+PREFIX_ARROW + shape.arcsOut[i].id)[0];
				selectItem(arrow);
				redrawArcsLayer = true;
			}
		}
		arcsLayer.draw();
	}

	function selectShape(layerId, shapeId){
		var layer = stage.get("#"+layerId)[0];
		var shape = layer.get("#"+ shapeId)[0];

		selectedItems.push(shape);
		shape.setFill(mySelFill);
		shape.setStroke(mySelStroke);
		shape.setStrokeWidth(mySelStrokeWidth);
		shape.setOpacity(mySelOpacity);
		
		layer.drawScene();
	}
	
	function selectItem(shape){
		if(multiSelection){
			if(selectedItems.contains(shape)){
				selectedItems.remove(shape);
				setDefaultStyle(shape);
			}else{
				selectedItems.push(shape);
				shape.setFill(mySelFill);
				shape.setStroke(mySelStroke);
				shape.setStrokeWidth(mySelStrokeWidth);
				shape.setOpacity(mySelOpacity);
			}
		}else{
			selectedItems.push(shape);
			shape.setFill(mySelFill);
			shape.setStroke(mySelStroke);
			shape.setStrokeWidth(mySelStrokeWidth);
			shape.setOpacity(mySelOpacity);
			
		}
	}
	
	function stopListener(){
		stopDrag();
		
		var groups = stage.get("Group");
		groups.each(function(group) {
			group.off("mousedown");
			group.off("mouseenter");
			group.off("mouseleave");
			group.off("dragmove");
			var children = group.getChildren();
			children.each(function(shape) {
				shape.off("click");
				shape.off("mouseover");
				shape.off("mouseout");
			});
		});
		stage.off("click");
		stage.off("mousemove");
		background.off("click");
		background.off("tap");

		//deselectItems();
		socket.emit('deselectItems', {room: room});
	}
	
	function startDragPlaces(){
		var groups = placesLayer.get("Group");
		groups.each(function(group) {
			group.setDraggable(true);
			var placeId = group.getId().substring(5);
			//group.get("#"+PREFIX_TEXT+placeId)[0].setDraggable(true);
			
			group.on('dragmove', function(){
				var place = getPlace(placeId);
				//updateArcsConnected(place, placesLayer);
				//var pEmit = group.get("#"+placeId)[0];
				socket.emit('dragShape', {room: room, layerId: placesLayer.getId(), shapeId: placeId, 
					shapeX: group.getAbsolutePosition().x, shapeY: group.getAbsolutePosition().y});
			});
			/*
			group.on('dragend', function(){

				arcsLayer.drawHit();
				
				var place = getPlace(placeId);

				var ai = place.arcsIn.length;
				for (var i = ai-1; i >= 0; i--) {
					//shape.arcsIn[i].points = arc.getPoints();
					var arc = place.arcsIn[i];
					var arcJs = arcsLayer.get("#"+arc.id)[0];
					arc.points = arcJs.getPoints();
					updatePosition(arc);

					var startObj = getTransition(place.arcsIn[i].startId);
					updateArcsReference(startObj);
				}

				var ao = place.arcsOut.length;
				for (var i = ao-1; i >= 0; i--) {
					//shape.arcsIn[i].points = arc.getPoints();
					var arc = place.arcsOut[i];
					var arcJs = arcsLayer.get("#"+arc.id)[0];
					arc.points = arcJs.getPoints();
					updatePosition(arc);

					var endObj = getTransition(place.arcsOut[i].endId);
					updateArcsReference(endObj);
				}

				var placeJs = group.get("#"+place.id)[0];
				place.x = placeJs.getAbsolutePosition().x;
				place.y = placeJs.getAbsolutePosition().y;
				updatePosition(place);
				updateArcsReference(place);

				var pEmit = group.get("#"+placeId)[0];
				//socket.emit('dragShape', {room: room, layerId: placesLayer.getId(), shapeId: placeId, 
				//	shapeX: group.getAbsolutePosition().x, shapeY: group.getAbsolutePosition().y});
			});
			*/
			/*
			group.on('dragend', function(){
				var pEmit = group.get("#"+placeId)[0];
				socket.emit('dragPlace', {id: placeId, x: pEmit.getAbsolutePosition().x, y: pEmit.getAbsolutePosition().y});
			});
			*/
		});
	}

	function dragShape(layerId, shapeId, shapeX, shapeY){
		var layer = stage.get("#"+layerId)[0];
		var shape = layer.get("#"+ PREFIX_GROUP + shapeId)[0];

		//shape.setX(shapeX);
		//shape.setY(shapeY);
		shape.setAbsolutePosition(shapeX, shapeY);

		var firstLetter = shapeId.substring(0,1);
		if(firstLetter === 'P'){
			var place = getPlace(shapeId);
			place.x = shapeX;
			place.y = shapeY;
		}else if(firstLetter === 'T'){
			var transition = getTransition(shapeId);
			transition.x = shapeX;
			transition.y = shapeY;
		}

		layer.batchDraw();
	}

	function dragShape2(layerId, shapeId, ap, pos){
		var layer = stage.get("#"+layerId)[0];
		var shape = layer.get("#"+ PREFIX_GROUP + shapeId)[0];

		shape.startDrag2(pos, ap);
	}
	
	function moveArcToLayer(groupPlace, fromLayer, toLayer){
		var placeId = groupPlace.getId().substring(5);
		var place = getPlace(placeId);
		
		var ai = place.arcsIn.length;
		for (var i = ai-1; i >= 0; i--) {
			var arc = fromLayer.get("#"+place.arcsIn[i].id)[0];
			arc.moveTo(toLayer);
		}
		
		var ao = place.arcsOut.length;
		for (var i = ao-1; i >= 0; i--) {
			var arc = fromLayer.get("#"+place.arcsOut[i].id)[0];
			arc.moveTo(toLayer);
		}
		fromLayer.draw();
		toLayer.draw();
	}
	
	function updateArcsConnected(shape, layer){
		
		if(shape.arcsIn != null){
			var ai = shape.arcsIn.length;
			for (var i = ai-1; i >= 0; i--) {
				var arc = arcsLayer.get("#"+shape.arcsIn[i].id)[0];
				var length = arc.getPoints().length -1;
				var direction = witchSpace(arc.getPoints()[length-1],arc.getPoints()[length]);
				
				if(shape instanceof Transition){
					var rect = transitionsLayer.get("#"+shape.arcsIn[i].endId)[0];
					switch(direction){
						case DOWN:
							arc.getPoints()[length].x = rect.getAbsolutePosition().x + (T_WIDTH / 2);
							arc.getPoints()[length].y = rect.getAbsolutePosition().y + T_HEIGHT;
							break;
						case LEFT:
							arc.getPoints()[length].x = rect.getAbsolutePosition().x;
							arc.getPoints()[length].y = rect.getAbsolutePosition().y + (T_HEIGHT / 2);
							break;
						case UP:
							arc.getPoints()[length].x = rect.getAbsolutePosition().x + (T_WIDTH / 2);
							arc.getPoints()[length].y = rect.getAbsolutePosition().y;
							break;
						case RIGHT:
							arc.getPoints()[length].x = rect.getAbsolutePosition().x + T_WIDTH;
							arc.getPoints()[length].y = rect.getAbsolutePosition().y + (T_HEIGHT / 2);
							break;
					}
					
				}else if(shape instanceof Place){
					var circle = placesLayer.get("#"+shape.arcsIn[i].endId)[0];
					switch(direction){
						case DOWN:
							arc.getPoints()[length].x = circle.getAbsolutePosition().x;
							arc.getPoints()[length].y = circle.getAbsolutePosition().y + P_RADIUS;
							break;
						case LEFT:	
							arc.getPoints()[length].x = circle.getAbsolutePosition().x - P_RADIUS;
							arc.getPoints()[length].y = circle.getAbsolutePosition().y;
							break;
						case UP:
							arc.getPoints()[length].x = circle.getAbsolutePosition().x;
							arc.getPoints()[length].y = circle.getAbsolutePosition().y - P_RADIUS;
							break;
						case RIGHT:
							arc.getPoints()[length].x = circle.getAbsolutePosition().x + P_RADIUS;
							arc.getPoints()[length].y = circle.getAbsolutePosition().y;
							break;
					}
				}
				
				var fromx = arc.getPoints()[length-1].x;
				var fromy = arc.getPoints()[length-1].y;
				
				var tox = arc.getPoints()[length].x;
				var toy = arc.getPoints()[length].y;
				
				var headlen = A_ARROW_SIZE;
				var angle = Math.atan2(toy-fromy,tox-fromx);
				
				var datas = 'M'+tox+","+toy+",L"+(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+",M"+
						tox+","+toy+",L"+(tox-headlen*Math.cos(angle+Math.PI/6))+","+(toy-headlen*Math.sin(angle+Math.PI/6))+",L"+
						(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+"Z";

				var arrow = arcsLayer.get('#'+PREFIX_ARROW + arc.getId())[0];
				
				arrow.setData(datas);

				arcsLayer.drawScene();
			}
		}
		if(shape.arcsOut != null){
			var shapeJs = layer.get("#"+shape.id)[0];
			var ao = shape.arcsOut.length;
			for (var i = ao-1; i >= 0; i--) {
				var arc = arcsLayer.get("#"+shape.arcsOut[i].id)[0];
				
				if(shape instanceof Transition){
					arc.getPoints()[0].x = shapeJs.getAbsolutePosition().x + (T_WIDTH / 2);
					arc.getPoints()[0].y = shapeJs.getAbsolutePosition().y + (T_HEIGHT / 2);
				}else if(shape instanceof Place){
					arc.getPoints()[0].x = shapeJs.getAbsolutePosition().x;
					arc.getPoints()[0].y = shapeJs.getAbsolutePosition().y;
				}
				
				if(arc.getPoints().length == 2){
					var length = arc.getPoints().length -1;
					var direction = witchSpace(arc.getPoints()[length-1],arc.getPoints()[length]);
					
					if(shape instanceof Place){
						var rect = transitionsLayer.get("#"+shape.arcsOut[i].endId)[0];
						switch(direction){
							case DOWN:
								arc.getPoints()[length].x = rect.getAbsolutePosition().x + (T_WIDTH / 2);
								arc.getPoints()[length].y = rect.getAbsolutePosition().y + T_HEIGHT;
								break;
							case LEFT:
								arc.getPoints()[length].x = rect.getAbsolutePosition().x;
								arc.getPoints()[length].y = rect.getAbsolutePosition().y + (T_HEIGHT / 2);
								break;
							case UP:
								arc.getPoints()[length].x = rect.getAbsolutePosition().x + (T_WIDTH / 2);
								arc.getPoints()[length].y = rect.getAbsolutePosition().y;
								break;
							case RIGHT:
								arc.getPoints()[length].x = rect.getAbsolutePosition().x + T_WIDTH;
								arc.getPoints()[length].y = rect.getAbsolutePosition().y + (T_HEIGHT / 2);
								break;
						}
					
					}else if(shape instanceof Transition){
						var circle = placesLayer.get("#"+shape.arcsOut[i].endId)[0];
						switch(direction){
							case DOWN:
								arc.getPoints()[length].x = circle.getAbsolutePosition().x;
								arc.getPoints()[length].y = circle.getAbsolutePosition().y + P_RADIUS;
								break;
							case LEFT:	
								arc.getPoints()[length].x = circle.getAbsolutePosition().x - P_RADIUS;
								arc.getPoints()[length].y = circle.getAbsolutePosition().y;
								break;
							case UP:
								arc.getPoints()[length].x = circle.getAbsolutePosition().x;
								arc.getPoints()[length].y = circle.getAbsolutePosition().y - P_RADIUS;
								break;
							case RIGHT:
								arc.getPoints()[length].x = circle.getAbsolutePosition().x + P_RADIUS;
								arc.getPoints()[length].y = circle.getAbsolutePosition().y;
								break;
						}
					}
					
					var fromx = arc.getPoints()[length-1].x;
					var fromy = arc.getPoints()[length-1].y;
					
					var tox = arc.getPoints()[length].x;
					var toy = arc.getPoints()[length].y;
					
					var headlen = A_ARROW_SIZE;
					var angle = Math.atan2(toy-fromy,tox-fromx);
					
					var datas = 'M'+tox+","+toy+",L"+(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+",M"+
							tox+","+toy+",L"+(tox-headlen*Math.cos(angle+Math.PI/6))+","+(toy-headlen*Math.sin(angle+Math.PI/6))+",L"+
							(tox-headlen*Math.cos(angle-Math.PI/6))+","+(toy-headlen*Math.sin(angle-Math.PI/6))+"Z";
					
					var arrow = arcsLayer.get('#'+PREFIX_ARROW + arc.getId())[0];
					arrow.setData(datas);
				}	
				arcsLayer.drawScene();
			}
		}
	}
	
	function startDragTransitions(){
		var groups = transitionsLayer.get("Group");

		groups.each(function(group) {
			group.setDraggable(true);
			var transitionId = group.getId().substring(5);
			group.get("#"+PREFIX_TEXT+transitionId)[0].setDraggable(true);
			
			group.on('dragmove', function(){
				var transition = getTransition(transitionId);
				updateArcsConnected(transition, transitionsLayer);

				//var tEmit = group.get("#"+transitionId)[0];
				//socket.emit('dragShape', {room: room, layerId: transitionsLayer.getId(), shapeId: transitionId, shapeX: tEmit.getAbsolutePosition().x, shapeY: tEmit.getAbsolutePosition().y});
			});

			group.on('dragend', function(){

				arcsLayer.drawHit();

				var transition = getTransition(transitionId);

				var ai = transition.arcsIn.length;
				for (var i = ai-1; i >= 0; i--) {
					//shape.arcsIn[i].points = arc.getPoints();
					var arc = transition.arcsIn[i];
					var arcJs = arcsLayer.get("#"+arc.id)[0];
					arc.points = arcJs.getPoints();
					updatePosition(arc);

					var startObj = getPlace(transition.arcsIn[i].startId);
					updateArcsReference(startObj);
				}

				var ao = transition.arcsOut.length;
				for (var i = ao-1; i >= 0; i--) {
					//shape.arcsIn[i].points = arc.getPoints();
					var arc = transition.arcsOut[i];
					var arcJs = arcsLayer.get("#"+arc.id)[0];
					arc.points = arcJs.getPoints();
					updatePosition(arc);

					var endObj = getPlace(transition.arcsOut[i].endId);
					updateArcsReference(startObj);
				}

				var transitionJs = group.get("#"+transition.id)[0];
				transition.x = transitionJs.getAbsolutePosition().x;
				transition.y = transitionJs.getAbsolutePosition().y;
				updatePosition(transition);
				updateArcsReference(transition);

				var tEmit = group.get("#"+transitionId)[0];
				socket.emit('dragShape', {room: room, layerId: transitionsLayer.getId(), shapeId: transitionId, 
					shapeX: group.getAbsolutePosition().x, shapeY: group.getAbsolutePosition().y});
			});
		});
	}
	
	
	function startDrag(){
		startDragTransitions();
		startDragPlaces();
		/*
		var groups = stage.get("Group");
		groups.each(function(group) {
			group.on('dragstart dragend', function(){
				selectedItems.push(group);
				var children = group.getChildren();
				children.each(function(shape) {
					if(shape.getId().startsWith("P") || shape.getId().startsWith("T")){
						shape.setFill(mySelFill);
						shape.setStroke(mySelStroke);
						shape.setStrokeWidth(mySelStrokeWidth);
						shape.setOpacity(mySelOpacity);
						layer.draw();
					}
				});	
			});
			
			if(!group.getId().startsWith(PREFIX_GROUP+"A")){
				group.on('mouseover', function() {
					document.body.style.cursor = 'pointer';
				});
				group.on('mouseout', function() {
					document.body.style.cursor = 'default';
				});
				group.setDraggable(true);
			}
		});
		*/
	}

	function stopDragTransitions(){
		var groups = transitionsLayer.get("Group");
		groups.each(function(group) {
			group.setDraggable(false);
		});
	}
	
	function stopDragPlaces(){
		var groups = placesLayer.get("Group");
		groups.each(function(group) {
			group.setDraggable(false);
		});
	}
	
	function stopDrag(){
		stopDragTransitions();
		stopDragPlaces();
		/*
		var groups = stage.get("Group");
		groups.each(function(group) {
			if(!group.getId().startsWith(PREFIX_GROUP+"A")){
				group.off("mouseover");
				group.off("mouseout");
				group.setDraggable(false);
			}
		});
		*/
	}
	
	function createGroup(id){
		var group = new Kinetic.Group({
			id: PREFIX_GROUP+id
		});
		
		return group;
	}
	
	function setDefaultStyle(shape){
		if(shape instanceof Kinetic.Circle){
			shape.setFill(P_FILL);
			shape.setStroke(P_STROKE);
			shape.setStrokeWidth(P_STROKEWIDTH);
			shape.setOpacity(P_OPACITY);
		}
		else if(shape instanceof Kinetic.Rect){
			shape.setFill(T_FILL);
			shape.setStroke(T_STROKE);
			shape.setStrokeWidth(T_STROKEWIDTH);
			shape.setOpacity(T_OPACITY);
		}else if(shape instanceof Kinetic.Line){
			shape.setFill(A_FILL);
			shape.setStroke(A_STROKE);
			shape.setStrokeWidth(A_WIDTH);
			shape.setOpacity(A_OPACITY);
		}else if(shape instanceof Kinetic.Path){
			shape.setFill(A_FILL);
			shape.setStroke(A_STROKE);
			shape.setStrokeWidth(A_WIDTH);
			shape.setOpacity(A_OPACITY);
		}
	}
	
	function drawPlace(mousePos){
		var place = addPlace();
		place.x = mousePos.x;
		place.y = mousePos.y;
		
		var group = createGroup(place.id);
		
		placeJs = new Kinetic.Circle({
			id: place.id,
			x: mousePos.x,
			y: mousePos.y,
			radius: P_RADIUS,
			fill: P_FILL,
			stroke: P_STROKE,
			strokeWidth: P_STROKEWIDTH,
			opacity: P_OPACITY
		});
		
		var placeJsText = new Kinetic.Text({
			id: PREFIX_TEXT+place.id,
			x: place.x + P_xOffsetText,
			y: place.y + P_yOffsetText,
			text: place.id,
			fontSize: TXT_FONTSIZE,
			fontFamily: TXT_FONTFAMILY,
			fill: TXT_FILL
		});
		
		
		
		group.add(placeJs);
		group.add(placeJsText);
		
		var tokenJsText = new Kinetic.Text({
			id: PREFIX_TOKEN+place.id,
			x: place.x + P_xOffsetToken,
			y: place.y + P_yOffsetToken,
			text: place.token,
			fontSize: TXT_FONTSIZE,
			fontFamily: TXT_FONTFAMILY,
			fill: TXT_FILL,
			visible: false
		});
		
		group.add(tokenJsText);
		
		placesLayer.add(group);
		
		placesLayer.draw();

		storeOnDB(place);	
	}

	function deleteFromDB(obj){
		if(obj instanceof Place){
			$.ajax({
				url: '/delete-place',
				type: 'POST',
				async:   false,
				data: { netId: netId, place: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}else if(obj instanceof Transition){
			$.ajax({
				url: '/delete-transition',
				type: 'POST',
				async:   false,
				data: { netId: netId, transition: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		} else if(obj instanceof Arc){
			$.ajax({
				url: '/delete-arc',
				type: 'POST',
				async:   false,
				data: { netId: netId, arc: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}
	}

	function storeOnDB(obj){
		if(obj instanceof Place){
			$.ajax({
				url: '/store-place',
				type: 'POST',
				async:   false,
				data: { netId: netId, place: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}else if(obj instanceof Transition){
			$.ajax({
				url: '/store-transition',
				type: 'POST',
				async:   false,
				data: { netId: netId, transition: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}else if(obj instanceof Arc){
			$.ajax({
				url: '/store-arc',
				type: 'POST',
				async:   false,
				data: { netId: netId, arc: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}
	}

	function updateToken(obj){
		$.ajax({
			url: '/update-token',
			type: 'POST',
			async:   false,
			data: { netId: netId, place: JSON.stringify(obj)},
			success: function(data){
	 			//window.location.href = '/home';
	 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	function updateArcsReference(obj){
		if(obj instanceof Place){
			$.ajax({
				url: '/update-place-arcs',
				type: 'POST',
				async:   false,
				data: { netId: netId, place: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}else if(obj instanceof Transition){
			$.ajax({
				url: '/update-transition-arcs',
				type: 'POST',
				async:   false,
				data: { netId: netId, transition: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}
	}

	function updatePosition(obj){	
		if(obj instanceof Place){
			$.ajax({
				url: '/update-place-position',
				type: 'POST',
				async:   false,
				data: { netId: netId, place: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});	
		}else if(obj instanceof Transition){
			$.ajax({
				url: '/update-transition-position',
				type: 'POST',
				async:   false,
				data: { netId: netId, transition: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		} else if(obj instanceof Arc){
			$.ajax({
				url: '/update-arc-position',
				type: 'POST',
				async:   false,
				data: { netId: netId, arc: JSON.stringify(obj)},
				success: function(data){
		 			//window.location.href = '/home';
		 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}
		
	}
	
	function createToken(placeId){
		var place;
		var p = places.length;
		for (var i = p-1; i >= 0; i--) {
			if(placeId.startsWith(PREFIX_TOKEN)){
				if(PREFIX_TOKEN + places[i].id == placeId){
					place = places[i];
				}
			}else{
				if(places[i].id == placeId){
					place = places[i];
				}
			}
		}
		
		var tokenId = placeId;
		if(!placeId.startsWith(PREFIX_TOKEN)){
			tokenId = PREFIX_TOKEN+placeId
		}
		
		place.token++;
		var token = place.token; 
		if(token > 0 && token < 10){
			var tokenJsText = stage.get('#'+tokenId)[0];
			tokenJsText.setText(token);
			tokenJsText.setVisible(true);
		} else if(token > 9 && token < 100){
			var tokenJsText = stage.get('#'+tokenId)[0];
			tokenJsText.setText(token);
			if(token == 10){
				tokenJsText.setX(tokenJsText.getX() - 3);
			}
		} else if(token > 99){
			var tokenJsText = stage.get('#'+tokenId)[0];
			tokenJsText.setText("99+");
			if(token == 100){
				tokenJsText.setX(tokenJsText.getX() - 3);
			}
		}
		placesLayer.draw();

		updateToken(place);
	}
	
	function eraseToken(placeId){
		var place;
		var p = places.length;
		for (var i = p-1; i >= 0; i--) {
			if(placeId.startsWith(PREFIX_TOKEN)){
				if(PREFIX_TOKEN + places[i].id == placeId){
					place = places[i];
				}
			}else{
				if(places[i].id == placeId){
					place = places[i];
				}
			}
		}
		
		var tokenId = placeId;
		if(!placeId.startsWith(PREFIX_TOKEN)){
			tokenId = PREFIX_TOKEN+placeId
		}
		
		if(place.token > 0){
			place.token--;
			
			var token = place.token; 
			if(token > 0 && token < 10){
				var tokenJsText = stage.get('#'+tokenId)[0];
				tokenJsText.setText(token);
				if(token == 9){
					tokenJsText.setX(tokenJsText.getX() + 3);
				}
			} else if(token > 9 && token < 100){
				var tokenJsText = stage.get('#'+tokenId)[0];
				tokenJsText.setText(token);
				if(token == 99){
					tokenJsText.setX(tokenJsText.getX() + 3);
				}
			} else if(token > 99){
				var tokenJsText = stage.get('#'+tokenId)[0];
				tokenJsText.setText("99+");
			}else{
				var tokenJsText = stage.get('#'+tokenId)[0];
				tokenJsText.setVisible(false);
			}
			placesLayer.draw();

			updateToken(place);
		}
	}
	
	function addPlace() {
		var place = new Place;
		places.push(place);
		return place;
	}
	
	function drawTransition(mousePos){
		var transition = addTransition();
		transition.x = mousePos.x - (T_WIDTH / 2);
		transition.y = mousePos.y - (T_HEIGHT / 2);
		
		var group = createGroup(transition.id);
		
		transitionJs = new Kinetic.Rect({
			id: transition.id,
			x: transition.x,
			y: transition.y,
			width: T_WIDTH,
			height: T_HEIGHT,
			fill: T_FILL,
			stroke: T_STROKE,
			strokeWidth: T_STROKEWIDTH,
			opacity: T_OPACITY
		});
		
		var transitionJsText = new Kinetic.Text({
			id: PREFIX_TEXT+transition.id,
			x: transition.x + T_xOffsetText,
			y: transition.y + T_yOffsetText,
			text: transition.id,
			fontSize: TXT_FONTSIZE,
			fontFamily: TXT_FONTFAMILY,
			fill: TXT_FILL
		});
		
		group.add(transitionJs);
		group.add(transitionJsText);

		transitionsLayer.add(group);
		
		transitionsLayer.draw();
		
		storeOnDB(transition);	
	}
	
	function addTransition() {
		var transition = new Transition;
		transitions.push(transition);
		return transition;
	} 
	
	function forNewTransitions(){
		drawItem = DRAW_TRANSITION;
		stopListener();
		startListenerForNewTransitions();
	}
	
	function forNewPlaces(){
		drawItem = DRAW_PLACE;
		stopListener();
		startListenerForNewPlaces();
	}
	
	function forNewArcs(){
		drawItem = DRAW_ARC;
		stopListener();
		startListenerForNewArcs();
	}
	
	function forAddTokens(){
		drawItem = ADD_TOKEN;
		stopListener();
		startListenerForAddTokens();
	}
	
	function forRemoveTokens(){
		drawItem = REMOVE_TOKEN;
		stopListener();
		startListenerForRemoveTokens();
	}
	
	function forSelection(){
		drawItem = SELECTION;
		stopListener();
		startListenerForSelection();
	}