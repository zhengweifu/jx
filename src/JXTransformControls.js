THREE.JX.JXTransformControls = function(dom, renderer, mask) {
	this.object = undefined;

	this.mask = mask;

	this.onTransfrom = undefined;

	var STATE = {
		NONE: - 1, 
		ROTATE: 0, 
		ZOOMLT: 1, 
		ZOOMRT: 2, 
		ZOOMLB: 3, 
		ZOOMRB: 4, 
		ZOOMML: 5,
		ZOOMMR: 6,
		ZOOMMT: 7,
		ZOOMMB: 8,
		PAN: 9, 
		DELETE: 10 
	};
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
		"RB" : translateGizmo.clone(),	// right bottom
		"ML" : translateGizmo.clone(),	// middle left
		"MR" : translateGizmo.clone(),	// middle right
		"MT" : translateGizmo.clone(),	// middle top
		"MB" : translateGizmo.clone()	// middle bottom
	};

	scaleGizmo["LT"].state = STATE.ZOOMLT;
	scaleGizmo["RT"].state = STATE.ZOOMRT;
	scaleGizmo["LB"].state = STATE.ZOOMLB;
	scaleGizmo["RB"].state = STATE.ZOOMRB;
	scaleGizmo["ML"].state = STATE.ZOOMML;
	scaleGizmo["MR"].state = STATE.ZOOMMR;
	scaleGizmo["MT"].state = STATE.ZOOMMT;
	scaleGizmo["MB"].state = STATE.ZOOMMB;

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

	this.rd_s = this.gizmoSize * 1.43,

	deleteGizmo.width  = rotationGizmo.width = this.rd_s;
	deleteGizmo.height = rotationGizmo.height = this.rd_s;

	deleteGizmo.image = new Image();
	deleteGizmo.image.onload = function() {
		deleteGizmo.useStroke = false;
		deleteGizmo.useImage = true;
		deleteGizmo.update(true);
	};
	deleteGizmo.image.src = 'data:image/png;base64,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';

	rotationGizmo.image = new Image();
	rotationGizmo.image.onload = function() {
		rotationGizmo.useStroke = false;
		rotationGizmo.useImage = true;
		rotationGizmo.update(true);
	};
	rotationGizmo.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAFWElEQVRYR81YYWhWVRh+nrLWSJlbFk6KKbkfJdS+CMLQtlkERdGiEApDrf6GG/Uzm6t+VioE/SlUkgQpWiQFkW1DSazgm8Hoh5KOQkfYnGgsJXrjuZyznXt3vu/e79uozp+x797znue+7/M+7/seYh7LzJYBWA/gHvc3tHYGwAkAR0j+UO8xrHWjmS0CsBnAFgDrCu4fF1AA+0h+XXBP8lpNAM3sBQAvA7hDm6eu/o3hc9MYnbyCkYk/U+euXLwId7c0oKv1BnS0NITPDgHoI3mqCNBCAM3sVgDvAXhMRgVq36lL2HvyUpEzILCb25egd81SLL3+Gu2ZBrCd5Nt5BnIBOnAHAayVx/qOny8MLHu4wO28bxm2tC/xjw6QfLYayKoAHbivFFKFsfuLs0lY57t62m7EnvW3eG9WBVkRoJktBiBwaxXSJw9PRMHJKzqwc3ljEkq/hiemcWLyKgbH/4h+j3g59OgKD/Jdki/FXqwG8CMAz1TynMD0l1rCcEWBnLn8FwbKk1FaCGS5R/RO1tMkP8kaiQI0s6cAfKxwlgZ/gQ4JlzgkLgWEPwxgEMDP7r1rnS5u8FJU6UN71zQltgAcI3l/UYDSrHVKiF1jF+eAE3/cOgDgtWqS4aRJ8pQkmXgssOGSF50UvUlye/hsjgedwffltVUHpa+zS1z79MHl/ocXSX5QJGFCmYp5squ1EUOPrIh6MQbwc+nd1iO/pXijcJ7e2ObD+koRDcuCN7Nv5Unpp+xX8GKKiymAroydB9DUvP90KmsVVqdfh0g+XsRzEYCrAfwIoFHRCbkdcDGV0VmA3QC+kax0f3k2Zf/CplXee+1Fy1TsI8zsQwCbsl4MMnqUZMnvzQLsA/COEkMJ4lfAvaMk1b3UvcxMXjwZ47g9f3til+QMrizAAWXljvIkBsoXZkD0l5qxo9Si/18n2V83OrfRzKZiNAqyuURyNAEbHmZm0rInVDXCChDwbyvJvQsAcBhAp2gkOvmlTFZGA9hAcigGUK3UW5KCqSuzNbfjpoYF4Z8HYmb1AZQBLwURL+V2HkU9a2bqttuymZzrweALOwA0Bwcqs2ZJWRRJ5D2fJKoqkrIUxVySALiOZFJfc/vBWrE4AJ2uFmseSVUbM3sDwKtZmVHzoUIAYJzkSn/uggJ0h4vHCdPdmimJroX7Tv1lNkFUBFyN30/yuQUFGDYEMizvjExM+wM1KGnAEr+TFi5WCAL+pWr8vDxoZg8B2OZnFWV/3/HfE+kIGoARkl0+tLEWLgwvgNWef3Vz0M3DO1WyZCQ2q4QAAWi6SgaurMbqN3VIqlYAUuGtC6DzhPq7VhlQ1dk9dnHOOBAAlBI36iMELhRm7Q/K6DkAd5GcrbG1ZHGWZ6o0qtfZbtuTOwCYcFLvZgcuhbbcc1vVFi6Xg2Z2LwDV3yREIc+qSZC6Ew3t+pDYR6i/1NDkOumKRSBv7BS47yvxrFaN9O8L1J4HbvbgjgF4mOTlmL08gIksqP3SZLYQM7EaU02DbuASuI0kf630sdXGTpW6SYHaNTaVar/q8ZySYdudTb5bkYlCtb2QB2VNPBLRKw3iWdDykBJFA73ABUP9T+5eZs4MXHOInfpLjJUkyVWbZEJinB0ds8bDLHbPjrrZeXcoxHnRyM1ib8DMVGOlf8nVWyXpiMjMCABNgXVdYhYG6LypyxdVEAFNxFfJkx3u9W621OV5quYkqWbQtVQCmmij+Kk5N6wS/ynAIOy6w+kN+SmgAvy/ABgAVRMqsAk/FXK1W+6a5DOSPf9qiGOHuWZU18RJhxOsuq5J/P6akqSIF1ztDlv+3Hvoanb/AeRqxkckDkYGAAAAAElFTkSuQmCC';

	this.gizmo = new THREE.Group();
	var _gizmo = new THREE.Group();
	this.gizmo.add(_gizmo);
	_gizmo.add(scaleGizmo["LT"], scaleGizmo["RT"], scaleGizmo["LB"], scaleGizmo["RB"], scaleGizmo["ML"], scaleGizmo["MR"], scaleGizmo["MT"], scaleGizmo["MB"], rotationGizmo, deleteGizmo, translateGizmo);

	this.gizmo.visible = false;// default hide

	var _min_scale = 0.01;

	var pivot_start = new THREE.Vector3(), pivot_end = new THREE.Vector3(), _center = new THREE.Vector3();

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
		for(var o=0; o<_gizmo.children.length; o++) {
			if(_gizmo.children[o].pointInJXNode(point)) {
				return _gizmo.children[o];
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
			oldScale.set(scope.object.scale.x, scope.object.scale.y);
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
		
		var _scale = 1, _scale_x = 1, _scale_y = 1, _sin, _cos;

		if(state === STATE.PAN) {

			scope.object.position.x += moveX * _scale;

			scope.object.position.y -= moveY * _scale;

			oldPointer.copy(pointer);

		} else if(state === STATE.ROTATE) {

			pointer.fromArray(THREE.JX.getDeckardCoordinate(event.target, event.clientX, event.clientY));
			var _cx = (scope.object.boundingBox.max.x + scope.object.boundingBox.min.x) / 2,
				_cy = (scope.object.boundingBox.max.y + scope.object.boundingBox.min.y) / 2;

			_center.set(_cx, _cy, 0);
			_center.applyMatrix4(scope.object.matrix);

			pivot_start.set(_center.x, _center.y, 0);
			pivot_end.set(_center.x, _center.y, 1);

			scope.object.applyMatrix(
				THREE.JX.getMatrix4FromRotationAxis(
					Math.atan2(pointer.y - _center.y, pointer.x - _center.x) - scope.object.rotation.z,
					pivot_start,
					pivot_end
				)
			)

		} else if(state === STATE.ZOOMRT || state === STATE.ZOOMRB || state === STATE.ZOOMLT || state === STATE.ZOOMLB ||
			state === STATE.ZOOMML || state === STATE.ZOOMMR || state === STATE.ZOOMMT || state === STATE.ZOOMMB) {
			var _sx, _sy;
			_cos = Math.cos(scope.object.rotation.z);

			if(Math.cos(scope.object.rotation.z) > 0) {
				_scale_x = 1;
				_scale_y = 1;
				_scale = 1;
			} else {
				_scale_x = -1;
				_scale_y = -1;
				_scale = -1;
			}

			var m_s = 1000;

			if(state === STATE.ZOOMRT || state === STATE.ZOOMRB || state === STATE.ZOOMLT || state === STATE.ZOOMLB) {
				if(state === STATE.ZOOMLB || state === STATE.ZOOMRB) {
					_scale *= moveX / m_s;
				} else {
					_scale *= -moveX / m_s;
				}

				_scale += 1;

				_sx = _scale;
				_sy = _scale;

			} else {
				if(state === STATE.ZOOMML) {
					_scale_x *= -moveX / m_s;
					_scale_y = 0;
				} else if(state === STATE.ZOOMMR) {
					_scale_x *= moveX / m_s;
					_scale_y = 0;
				} else if(state === STATE.ZOOMMT) {
					_scale_x = 0;
					_scale_y *= -moveY / m_s;
				} else if(state === STATE.ZOOMMB) {
					_scale_x = 0;
					_scale_y *= moveY / m_s;
				}

				_scale_x = 1 + _scale_x;
				_scale_y = 1 + _scale_y;
				
				_sx = _scale_x;
				_sy = _scale_y;
			}

			// if(_sx <=0 || _sy <= 0) return;

			if(state === STATE.ZOOMLT) {
				_center.set(scope.object.boundingBox.max.x, scope.object.boundingBox.min.y, 0);
			} else if(state === STATE.ZOOMRT) {
				_center.set(scope.object.boundingBox.min.x, scope.object.boundingBox.min.y, 0);
			} else if(state === STATE.ZOOMLB) {
				_center.set(scope.object.boundingBox.max.x, scope.object.boundingBox.max.y, 0);
			} else if(state === STATE.ZOOMRB) {
				_center.set(scope.object.boundingBox.min.x, scope.object.boundingBox.max.y, 0);
			} else if(state === STATE.ZOOMML) {
				pivot_start.set(scope.object.boundingBox.max.x, scope.object.boundingBox.min.y, 0);
				pivot_end.copy(pivot_start);
				pivot_end.x += 1;
			} else if(state === STATE.ZOOMMR) {
				pivot_start.set(scope.object.boundingBox.min.x, (scope.object.boundingBox.max.y + scope.object.boundingBox.min.y) / 2, 0);
				pivot_end.copy(pivot_start);
				pivot_end.x += 1;
			}else if(state === STATE.ZOOMMT) {
				pivot_start.set((scope.object.boundingBox.max.x + scope.object.boundingBox.min.x) / 2, scope.object.boundingBox.min.y, 0);
				pivot_end.copy(pivot_start);
				pivot_end.y += 1;
			}else if(state === STATE.ZOOMMB) {
				pivot_start.set((scope.object.boundingBox.max.x + scope.object.boundingBox.min.x) / 2, scope.object.boundingBox.max.y, 0);
				pivot_end.copy(pivot_start);
				pivot_end.y += 1;
			}
			
			scope.object.updateMatrix();

			if(state === STATE.ZOOMRT || state === STATE.ZOOMRB || state === STATE.ZOOMLT || state === STATE.ZOOMLB) {
				pivot_start.copy(_center);
				pivot_end.copy(_center);
				pivot_end.x += 1;
				pivot_start.applyMatrix4(scope.object.matrix);
				pivot_end.applyMatrix4(scope.object.matrix);
				
				THREE.JX.setObjectScale(scope.object, pivot_start, pivot_end, _sx);

				// scope.object.updateMatrix();
				// pivot_start.copy(_center);
				pivot_end.copy(_center);
				pivot_end.y += 1;
				// pivot_start.applyMatrix4(scope.object.matrix);
				pivot_end.applyMatrix4(scope.object.matrix);
				THREE.JX.setObjectScale(scope.object, pivot_start, pivot_end, _sy);
			} else {
				pivot_start.applyMatrix4(scope.object.matrix);
				pivot_end.applyMatrix4(scope.object.matrix);

				THREE.JX.setObjectScale(scope.object, pivot_start, pivot_end, _sx);
				
				THREE.JX.setObjectScale(scope.object, pivot_start, pivot_end, _sy);
			}

			
	
		}

		if(scope.onTransfrom) scope.onTransfrom(scope.object);

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
		_h = (object.boundingBox.max.y - object.boundingBox.min.y),
		_cx = (object.boundingBox.max.x + object.boundingBox.min.x) / 2,
		_cy = (object.boundingBox.max.y + object.boundingBox.min.y) / 2;
	this.transformGizmo.translateGizmo.width = _w * object.scale.x + this.spaceSize * 2;
	this.transformGizmo.translateGizmo.height = _h * object.scale.y + this.spaceSize * 2;

	this.gizmo.children[0].position.x = _cx * object.scale.x;
	this.gizmo.children[0].position.y = _cy * object.scale.y;

	this.transformGizmo.translateGizmo.update(true);

	var bbx = this.transformGizmo.translateGizmo.boundingBox;

	// delete gizmo control
	this.transformGizmo.deleteGizmo.position.set(bbx.min.x - this.rd_s, (bbx.max.y + bbx.min.y) / 2, 0);

	// rotation gizmo control
	this.transformGizmo.rotationGizmo.position.set(bbx.max.x + this.rd_s, (bbx.max.y + bbx.min.y) / 2, 0);

	// scale gizmo control
	this.transformGizmo.scaleGizmo["LT"].position.set(bbx.min.x, bbx.max.y, 0);
	this.transformGizmo.scaleGizmo["RT"].position.set(bbx.max.x, bbx.max.y, 0);
	this.transformGizmo.scaleGizmo["LB"].position.set(bbx.min.x, bbx.min.y, 0);
	this.transformGizmo.scaleGizmo["RB"].position.set(bbx.max.x, bbx.min.y, 0);
	this.transformGizmo.scaleGizmo["ML"].position.set(bbx.min.x, (bbx.max.y + bbx.min.y) / 2, 0);
	this.transformGizmo.scaleGizmo["MR"].position.set(bbx.max.x, (bbx.max.y + bbx.min.y) / 2, 0);
	this.transformGizmo.scaleGizmo["MT"].position.set((bbx.max.x + bbx.min.x) / 2, bbx.max.y, 0);
	this.transformGizmo.scaleGizmo["MB"].position.set((bbx.max.x + bbx.min.x) / 2, bbx.min.y, 0);

	// this.gizmo tanslate and rotation
	this.gizmo.position.copy(object.position);
	// this.gizmo.position.x += _cx;
	// this.gizmo.position.y += _cy;
	this.gizmo.rotation.copy(object.rotation);

}