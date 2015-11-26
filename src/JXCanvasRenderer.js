THREE.JX.JXCanvasRenderer = function(parameters) {
	console.log( 'THREE.JX.JXCanvasRenderer', THREE.JX.version );

	parameters = parameters || {};

	var _canvas = (parameters.canvas !== undefined ? parameters.canvas : document.createElement("canvas"));

	var _canvasWidth = _canvas.width,
		_canvasHeight = _canvas.height,
		_canvasWidthHalf = Math.floor( _canvasWidth / 2 ),
		_canvasHeightHalf = Math.floor( _canvasHeight / 2 ),

		_viewportX = 0,
		_viewportY = 0,
		_viewportWidth = _canvasWidth,
		_viewportHeight = _canvasHeight,

		pixelRatio = 1,

		_context = _canvas.getContext( '2d', {
			alpha: parameters.alpha === true
		} ),

		_clearColor = new THREE.Color( 0x000000 ),
		_clearAlpha = parameters.alpha === true ? 0 : 1,

		_contextGlobalAlpha = 1,
		_contextGlobalCompositeOperation = 0,
		_contextStrokeStyle = null,
		_contextFillStyle = null,
		_contextLineWidth = null,
		_contextLineCap = null,
		_contextLineJoin = null,
		_contextLineDash = [];

	var self = this;

	this.needUpdate = true;

	this.init = function() {
		_clearColor = new THREE.Color( 0x000000 ),
		_clearAlpha = parameters.alpha === true ? 0 : 1,

		_contextGlobalAlpha = 1,
		_contextGlobalCompositeOperation = 0,
		_contextStrokeStyle = null,
		_contextFillStyle = null,
		_contextLineWidth = null,
		_contextLineCap = null,
		_contextLineJoin = null,
		_contextLineDash = [];
	};

	this.clear = function() {
		this.init();
		_context.clearRect(_viewportX, _viewportY, _viewportWidth, _viewportHeight);
	};

	var setTransform = function(object, isScale, w, h) {
		w = w || 0;
		h = h || 0;

		isScale = !!isScale
		var a = object.matrixWorld.elements[0],
			b = object.matrixWorld.elements[1],
			c = object.matrixWorld.elements[4],
			d = object.matrixWorld.elements[5],

			e = object.matrixWorld.elements[12] + _canvasWidthHalf 
				- (w/2 * Math.cos(object.rotation.z) * object.scale.x
				+ h/2 * Math.sin(object.rotation.z) * object.scale.y),
			f = _canvasHeightHalf - object.matrixWorld.elements[13]
				- (w/2 * Math.sin(object.rotation.z) * object.scale.x 
				- h/2 * Math.cos(object.rotation.z) * object.scale.y);


		if(!isScale) {
			a = 1;
			d = 1;
		}
		_context.setTransform(a, b, c, d, e, f);
	};

	// render JXText
	var renderText = function(text) {

		text.updateSubTransform();

		_context.font= text.size + "pt " + text.font;

		setTransform(text);
		var heplerOffset = 20;
		var heplerPosition_x = text.boundingBox.min.x - heplerOffset/2,
			heplerPosition_y = -text.boundingBox.max.y - heplerOffset/2,
			helperWidth = text.boundingBox.max.x * 2  + heplerOffset,
			helperHeight = (text.boundingBox.max.y - text.boundingBox.min.y) + heplerOffset;
		
		var small_size = 20;
		_context.rect(heplerPosition_x-small_size, heplerPosition_y-small_size, small_size, small_size);
		_context.rect(heplerPosition_x+helperWidth, heplerPosition_y-small_size, small_size, small_size);
		_context.rect(heplerPosition_x-small_size, heplerPosition_y+helperHeight, small_size, small_size);
		_context.rect(heplerPosition_x+helperWidth, heplerPosition_y+helperHeight, small_size, small_size);
		_context.rect(heplerPosition_x, heplerPosition_y, helperWidth, helperHeight);
		_context.stroke();
		// console.log(text.boundingBox.min.y, text.boundingBox.max.y);
		setTransform(text, true);
		_context.textBaseline="middle";
		for(var i=0; i<text.subTransforms.length; i++) {
			_context.save();
			_context.translate(text.subTransforms[i].position.x, text.subTransforms[i].position.y);
			// console.log(text.subTransforms[i].rotate);
			_context.rotate(text.subTransforms[i].rotate);
			// _context.scale(text.scale.x, text.scale.y);

			_context.shadowColor = text.shadowColor.getStyle();
			_context.shadowOffsetX = text.shadowDistance * -Math.cos(text.shadowAngle * Math.PI / 180);
			_context.shadowOffsetY = text.shadowDistance * Math.sin(text.shadowAngle * Math.PI / 180);
			_context.shadowBlur = text.shadowBlur;

			setLineWidth(text.strokeSize * 2); 
			setStrokeStyle(text.strokeColor.getStyle());
			setLineCap(text.strokeCap);
			setLineJoin(text.strokeJoin);
			_context.strokeText(text.subTransforms[i].content, 0, 0);

			_context.shadowOffsetX = 0;  
            _context.shadowOffsetY = 0;  
			setFillStyle(text.color.getStyle());
			_context.fillText(text.subTransforms[i].content, 0, 0);
			_context.restore();
			self.init();
		}

	};

	// render object recursive
	var renderObject = function(object) {
		if(object instanceof THREE.JX.JXText) {
			renderText(object);
		}

		for(var i=0; i<object.children.length; i++) {
			renderObject(object.children[i]);
		}
	};

	// render
	this.render = function(scene, camera) {
		if(this.needUpdate) {
			this.clear();
			_context.save();
			// create grid
			_context.beginPath();
			setStrokeStyle("#669911");
			_context.moveTo(0, _canvasHeightHalf);
			_context.lineTo(_canvasWidth, _canvasHeightHalf);
			_context.moveTo(_canvasWidthHalf, 0);
			_context.lineTo(_canvasWidthHalf, _canvasHeight);
			_context.stroke();
			renderObject(scene);

			_context.restore();

			this.needUpdate = false;
		}
	};

	function setLineWidth( value ) {

		if ( _contextLineWidth !== value ) {

			_context.lineWidth = value;
			_contextLineWidth = value;

		}

	}

	function setLineCap( value ) {

		// "butt", "round", "square"

		if ( _contextLineCap !== value ) {

			_context.lineCap = value;
			_contextLineCap = value;

		}

	}

	function setLineJoin( value ) {

		// "round", "bevel", "miter"

		if ( _contextLineJoin !== value ) {

			_context.lineJoin = value;
			_contextLineJoin = value;

		}

	}

	function setStrokeStyle( value ) {

		if ( _contextStrokeStyle !== value ) {

			_context.strokeStyle = value;
			_contextStrokeStyle = value;

		}

	}

	function setFillStyle( value ) {

		if ( _contextFillStyle !== value ) {

			_context.fillStyle = value;
			_contextFillStyle = value;

		}

	}

	function setLineDash( value ) {

		if ( _contextLineDash.length !== value.length ) {

			_context.setLineDash( value );
			_contextLineDash = value;

		}

	}
}