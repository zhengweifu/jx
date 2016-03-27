var Viewport2D = function(inCanvas, shapeGroup, mask) {
	var canvas = inCanvas;

	var width = canvas.clientWidth, height = canvas.clientHeight, halfWidth = width/2, halfHeight = height/2;

	var scene = new THREE.Scene();

	var camera = new THREE.OrthographicCamera(-width/2, width/2, -height/2, height/2, 0.1, 1000);

	var renderer = new THREE.JX.JXCanvasRenderer({canvas: canvas, alpha: true});

	// var shapeGroup = new THREE.Group();


	this.onIntersect = undefined;
	this.onNotIntersect = undefined;

	this.current_object = undefined;

	var i, scope = this;

	// for(i=0; i<objects.length; i++) shapeGroup.add(objects[i]);
	
	// gizmos
	var gizmo = new THREE.JX.JXTransformControls(canvas, renderer, mask);
	var gizmoGroup = new THREE.Group();
	gizmoGroup.add(gizmo.gizmo);

	scene.add(shapeGroup);

	scene.add(mask);

	scene.add(gizmoGroup);

	this.selectPrecision = 0.001;

	this.setCurrent = function(object) {
		if(this.current_object == object) return;

		this.current_object = object;

		if(this.current_object) {
			if(!gizmo.gizmo.visible) gizmo.gizmo.visible = true;

			if(scope.onIntersect) scope.onIntersect(scope.current_object);

		} else {
			if(gizmo.gizmo.visible) gizmo.gizmo.visible = false;

			if(scope.onNotIntersect) scope.onNotIntersect();

		}

		this.update();
	};

	this.getGizmo = function() {
		return gizmo;
	};

	this.update = function() {
		gizmo.update(this.current_object);
		renderer.needUpdate = true;
	};

	// setCurrent(text);

	var render = function() {
		scene.updateMatrixWorld();

		renderer.render(scene, camera);
	};

	var renderLoop = function() {
		requestAnimationFrame(renderLoop);
		render();
	};

	renderLoop();

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var getIntersect = function( point, objects ) {
		for(var i=objects.length-1; i>=0; i--) {
			if(objects[i].pointInJXNode(point)) {
				// console.log(objects[i]);
				return objects[i];
			}
		}

		return undefined;
	};

	var onMouseDown = function(event) {

		// onDownPosition.fromArray(THREE.JX.getMousePosition(event.target, event.clientX, event.clientY));
		onDownPosition.set(event.clientX, event.clientY);

		canvas.addEventListener('mouseup', onMouseUp, false);
	};

	var onMouseUp = function(event) {
		// onUpPosition.fromArray(THREE.JX.getMousePosition(event.target, event.clientX, event.clientY));
		onUpPosition.set(event.clientX, event.clientY);

		if ( onDownPosition.distanceTo( onUpPosition ) <= width * scope.selectPrecision ) {
			onUpPosition.fromArray(THREE.JX.getDeckardCoordinate(event.target, event.clientX, event.clientY));
			scope.setCurrent(getIntersect(onUpPosition, shapeGroup.children));
		}

		canvas.removeEventListener( 'mouseup', onMouseUp, false );
	};

	canvas.addEventListener('mousedown', onMouseDown, false);
};