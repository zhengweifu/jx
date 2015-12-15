THREE.JX.JXTransformControls = function(dom, renderer) {
	this.object = undefined;

	var translateGizmo = new THREE.JX.JXSprite();
	translateGizmo.width = this.gizmoSize;
	translateGizmo.height = this.gizmoSize;
	translateGizmo.useStroke = true;
	translateGizmo.strokeColor.setRGB(0.2, 0.8, 0.3);

	var scaleGizmo = {
		"LT" : translateGizmo.clone(), // left top
		"RT" : translateGizmo.clone(), // right top
		"LB" : translateGizmo.clone(), // left bottom
		"RB" : translateGizmo.clone()	// right bottom
	};

	var rotationGizmo = translateGizmo.clone();

	var deleteGizmo = translateGizmo.clone();
	

	this.transformGizmo = {
		translateGizmo : translateGizmo,
		scaleGizmo : scaleGizmo,
		rotationGizmo : rotationGizmo,
		deleteGizmo : deleteGizmo
	};

	this.gizmo = new THREE.Group();
	this.gizmo.add(translateGizmo);
	this.gizmo.add(scaleGizmo["LT"]);
	this.gizmo.add(scaleGizmo["RT"]);
	this.gizmo.add(scaleGizmo["LB"]);
	this.gizmo.add(scaleGizmo["RB"]);
	this.gizmo.add(rotationGizmo);
	this.gizmo.add(deleteGizmo);

	var p = new THREE.Vector2(),
		pointerOld = new THREE.Vector2(),
		pointer = new THREE.Vector2(),
		width = dom.clientWidth, 
		height = dom.clientHeight, 
		halfWidth = width/2, 
		halfHeight = height/2;

	var onMouseDown = function(event) {
		pointerOld.set(event.clientX, event.clientY);
	};

	var onMouseMove = function(event) {
		pointer.set(event.clientX, event.clientY);
		var moveX = pointer.x - pointerOld.x;
		var moveY = pointer.y - pointerOld.y;
		var _scale = 1;
		this.object.position.x += moveX * _scale;
		this.object.position.y -= moveY * _scale;

		pointerOld.copy(pointer);

		gizmo.update(this.object);
		renderer.needUpdate = true;
	};

	var onMouseUp = function(event) {
		dom.removeEventListener( 'mousemove', onMouseMove, false );
		dom.removeEventListener( 'mouseup', onMouseUp, false );
		dom.removeEventListener( 'mouseout', onMouseUp, false );
		dom.removeEventListener( 'dblclick', onMouseUp, false );
	};

	dom.addEventListener('mousedown', function(event) {
		var mp = THREE.JX.getMousePosition(event.target, event.clientX, event.clientY);
		p.set(mp[0] * width - halfWidth, halfHeight - mp[1] * height);
		console.log(p);
	}, false);
};

THREE.JX.JXTransformControls.prototype.constructor = THREE.JX.JXTransformControls;

THREE.JX.JXTransformControls.prototype.spaceSize = 5;

THREE.JX.JXTransformControls.prototype.gizmoSize = 10;

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
	// console.log(object.boundingBox);
	// delete gizmo control
	this.transformGizmo.deleteGizmo.position.set(bbx.min.x, (bbx.max.y + bbx.min.y) / 2, 0);

	// rotation gizmo control
	this.transformGizmo.rotationGizmo.position.set(bbx.max.x, (bbx.max.y + bbx.min.y) / 2, 0);

	// scale gizmo control
	this.transformGizmo.scaleGizmo["LT"].position.set(bbx.min.x, bbx.max.y, 0);
	this.transformGizmo.scaleGizmo["RT"].position.set(bbx.max.x, bbx.max.y, 0);
	this.transformGizmo.scaleGizmo["LB"].position.set(bbx.min.x, bbx.min.y, 0);
	this.transformGizmo.scaleGizmo["RB"].position.set(bbx.max.x, bbx.min.y, 0);

	// this.gizmo tanslate and rotation
	this.gizmo.position.copy(object.position);
	this.gizmo.rotation.copy(object.rotation);

}