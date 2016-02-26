THREE.JX.JXTransformControls = function(dom, renderer, mask) {
	this.object = undefined;

	this.mask = mask;

	var STATE = { NONE: - 1, ROTATE: 0, ZOOMLT: 1, ZOOMRT: 2, ZOOMLB: 3, ZOOMRB: 4, PAN: 5, DELETE: 6 };
	var state = STATE.NONE;

	var translateGizmo = new THREE.JX.JXSprite();
	translateGizmo.width = this.gizmoSize;
	translateGizmo.height = this.gizmoSize;
	translateGizmo.useStroke = true;
	translateGizmo.strokeColor.fromArray(this.defaultColor);
	translateGizmo.computBoundingBox();

	translateGizmo.state = STATE.PAN;

	var scaleGizmo = {
		"LT" : translateGizmo.clone(), // left top
		"RT" : translateGizmo.clone(), // right top
		"LB" : translateGizmo.clone(), // left bottom
		"RB" : translateGizmo.clone()	// right bottom
	};

	scaleGizmo["LT"].state = STATE.ZOOMLT;
	scaleGizmo["RT"].state = STATE.ZOOMRT;
	scaleGizmo["LB"].state = STATE.ZOOMLB;
	scaleGizmo["RB"].state = STATE.ZOOMRB;

	var rotationGizmo = translateGizmo.clone();
	rotationGizmo.state = STATE.ROTATE

	var deleteGizmo = translateGizmo.clone();
	deleteGizmo.state = STATE.DELETE;

	this.transformGizmo = {
		translateGizmo : translateGizmo,
		scaleGizmo : scaleGizmo,
		rotationGizmo : rotationGizmo,
		deleteGizmo : deleteGizmo
	};

	this.gizmo = new THREE.Group();
	this.gizmo.add(scaleGizmo["LT"]);
	this.gizmo.add(scaleGizmo["RT"]);
	this.gizmo.add(scaleGizmo["LB"]);
	this.gizmo.add(scaleGizmo["RB"]);
	this.gizmo.add(rotationGizmo);
	this.gizmo.add(deleteGizmo);
	this.gizmo.add(translateGizmo);

	this.gizmo.visible = false;// default hide

	var _min_scale = 0.01;

	var p = new THREE.Vector2(),
		oldPointer = new THREE.Vector2(),
		pointer = new THREE.Vector2(),
		oldScale = new THREE.Vector2(),
		oldRotation = 0.0,
		scale = new THREE.Vector2(),
		width = dom.clientWidth, 
		height = dom.clientHeight, 
		halfWidth = width/2, 
		halfHeight = height/2,
		scope = this;

	var getIntersect = function( point ) {
		for(var o=0; o<scope.gizmo.children.length; o++) {
			if(scope.gizmo.children[o].pointInJXNode(point)) {
				return scope.gizmo.children[o];
			}
		}

		return null;
	};


	var intersect;
	var onMouseDown = function(event) {
		
		if(!scope.gizmo.visible || !scope.object) return;

		p.fromArray(THREE.JX.getDeckardCoordinate(event.target, event.clientX, event.clientY));
		intersect = getIntersect(p);
		
		if(intersect) state = intersect.state;
		else state = STATE.NONE;
		
		if(state != STATE.NONE) {

			if(scope.mask && scope.mask.useStroke !== undefined) scope.mask.useStroke = true; // show mask strole
			
			// oldPointer.fromArray(THREE.JX.getMousePosition(event.target, event.clientX, event.clientY));
			oldPointer.set(event.clientX, event.clientY);
			oldScale.set(scope.object.scale.x, scope.object.scale.x);
			oldRotation = scope.object.rotation.z;

			intersect.strokeColor.fromArray(scope.activeColor);

			renderer.needUpdate = true;
			if(state != STATE.DELETE) {
				dom.addEventListener("mousemove", onMouseMove, false);
				dom.addEventListener("mouseout", onMouseUp, false);
				dom.addEventListener("dblclick", onMouseUp, false);
			}
			dom.addEventListener("mouseup", onMouseUp, false);
		}
	};

	var onMouseMove = function(event) {
		// pointer.fromArray(THREE.JX.getMousePosition(event.target, event.clientX, event.clientY));
		pointer.set(event.clientX, event.clientY);

		var moveX = pointer.x - oldPointer.x;

		var moveY = pointer.y - oldPointer.y;
		
		var _scale = 1;

		if(state === STATE.PAN) {

			scope.object.position.x += moveX * _scale;

			scope.object.position.y -= moveY * _scale;

			oldPointer.copy(pointer);

		} else if(state === STATE.ROTATE) {

			pointer.fromArray(THREE.JX.getDeckardCoordinate(event.target, event.clientX, event.clientY));

			scope.object.rotation.z = Math.atan2(pointer.y - scope.object.position.y, pointer.x - scope.object.position.x);

		} else if(state === STATE.ZOOMRT || state === STATE.ZOOMRB || state === STATE.ZOOMLT || state === STATE.ZOOMLB) {

			if(state === STATE.ZOOMRT || state === STATE.ZOOMRB) {
				_scale = 1 + moveX / 50;
			} else {
				_scale = 1 - moveX / 50;
			}

			scope.object.scale.x = oldScale.x * _scale;
			scope.object.scale.y = oldScale.y * _scale;

			if(scope.object.scale.x <= _min_scale) scope.object.scale.x = _min_scale;
			if(scope.object.scale.y <= _min_scale) scope.object.scale.y = _min_scale;
		} 

		scope.update(scope.object);
		renderer.needUpdate = true;
	};

	var onMouseUp = function(event) {
		if(state === STATE.DELETE) {
			scope.object.parent.remove(scope.object);

		}

		if(scope.mask && scope.mask.useStroke !== undefined) scope.mask.useStroke = false;

		intersect.strokeColor.fromArray(scope.defaultColor);
		renderer.needUpdate = true;
		dom.removeEventListener( 'mousemove', onMouseMove, false );
		dom.removeEventListener( 'mouseup', onMouseUp, false );
		dom.removeEventListener( 'mouseout', onMouseUp, false );
		dom.removeEventListener( 'dblclick', onMouseUp, false );
	};

	dom.addEventListener('mousedown', onMouseDown, false);

};

THREE.JX.JXTransformControls.prototype.constructor = THREE.JX.JXTransformControls;

THREE.JX.JXTransformControls.prototype.spaceSize = 5;

THREE.JX.JXTransformControls.prototype.gizmoSize = 14;

THREE.JX.JXTransformControls.prototype.defaultColor = [0.2, 0.8, 0.3];
THREE.JX.JXTransformControls.prototype.activeColor = [1.0, 0.734, 0.0];

THREE.JX.JXTransformControls.prototype.update = function(object) {
	this.object = object;

	if(!this.object) return;

	object.update(true);

	// translate gizmo control
	var _w = (object.boundingBox.max.x - object.boundingBox.min.x),
		_h = (object.boundingBox.max.y - object.boundingBox.min.y);
	this.transformGizmo.translateGizmo.width = _w * object.scale.x + this.spaceSize * 2;
	this.transformGizmo.translateGizmo.height = _h * object.scale.y + this.spaceSize * 2;

	this.transformGizmo.translateGizmo.update(true);

	var bbx = this.transformGizmo.translateGizmo.boundingBox;

	// delete gizmo control
	this.transformGizmo.deleteGizmo.position.set(bbx.min.x - this.gizmoSize, (bbx.max.y + bbx.min.y) / 2, 0);

	// rotation gizmo control
	this.transformGizmo.rotationGizmo.position.set(bbx.max.x + this.gizmoSize, (bbx.max.y + bbx.min.y) / 2, 0);

	// scale gizmo control
	this.transformGizmo.scaleGizmo["LT"].position.set(bbx.min.x, bbx.max.y, 0);
	this.transformGizmo.scaleGizmo["RT"].position.set(bbx.max.x, bbx.max.y, 0);
	this.transformGizmo.scaleGizmo["LB"].position.set(bbx.min.x, bbx.min.y, 0);
	this.transformGizmo.scaleGizmo["RB"].position.set(bbx.max.x, bbx.min.y, 0);

	// this.gizmo tanslate and rotation
	this.gizmo.position.copy(object.position);
	this.gizmo.rotation.copy(object.rotation);

}