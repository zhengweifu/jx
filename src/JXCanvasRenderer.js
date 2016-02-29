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

        var m4;
        if(!isScale) {
            var _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
            object.matrixWorld.decompose(_p, _q, _s);
            _s.set(1, 1, 1);
            m4 = new THREE.Matrix4();
            m4.compose(_p, _q, _s);
        } else {
            m4 = object.matrixWorld.clone();
        }

        // reversed canvas rotate
        m4.elements[1] = -m4.elements[1];
        m4.elements[4] = -m4.elements[4];

        var a = m4.elements[0],
            b = m4.elements[1],
            c = m4.elements[4],
            d = m4.elements[5],

            e = m4.elements[12] + _canvasWidthHalf 
                - (w/2 * Math.cos(object.rotation.z) * object.scale.x
                + h/2 * Math.sin(object.rotation.z) * object.scale.y),
            f = _canvasHeightHalf - m4.elements[13]
                - (w/2 * Math.sin(object.rotation.z) * object.scale.x 
                - h/2 * Math.cos(object.rotation.z) * object.scale.y);
        // console.log(a, b, c, d, e, f);
        _context.setTransform(a, b, c, d, e, f);
    };

    var renderHepler = function(object, heplerOffset, smallSize) {
        heplerOffset = heplerOffset || 5;

        var heplerPosition_x = object.boundingBox.min.x * object.scale.x - heplerOffset,
            heplerPosition_y = -object.boundingBox.max.y * object.scale.y - heplerOffset,
            helperWidth = object.boundingBox.max.x * 2 * object.scale.x + heplerOffset * 2,
            helperHeight = (object.boundingBox.max.y - object.boundingBox.min.y) * object.scale.y + heplerOffset * 2;

        smallSize = smallSize || 10;
        setStrokeStyle("#669911");
        _context.strokeRect(heplerPosition_x-smallSize, heplerPosition_y-smallSize, smallSize, smallSize);
        _context.strokeRect(heplerPosition_x+helperWidth, heplerPosition_y-smallSize, smallSize, smallSize);
        _context.strokeRect(heplerPosition_x-smallSize, heplerPosition_y+helperHeight, smallSize, smallSize);
        _context.strokeRect(heplerPosition_x+helperWidth, heplerPosition_y+helperHeight, smallSize, smallSize);
        _context.strokeRect(heplerPosition_x, heplerPosition_y, helperWidth, helperHeight);
    };

    var renderShadow = function(object) {
        _context.shadowColor = object.shadowColor.getStyle();
        _context.shadowOffsetX = object.shadowDistance * -Math.cos(object.shadowAngle * Math.PI / 180);
        _context.shadowOffsetY = object.shadowDistance * Math.sin(object.shadowAngle * Math.PI / 180);
        _context.shadowBlur = object.shadowBlur;
    };

    var disableShadow = function() {
        _context.shadowColor = "rgb(0, 0 ,0, 0)";
        _context.shadowOffsetX = 0;  
        _context.shadowOffsetY = 0;
        _context.shadowBlur = 0;
    };

    var setStroke = function(object) {
        setLineWidth(object.strokeSize); 
        setStrokeStyle(object.strokeColor.getStyle());
        setLineCap(object.strokeCap);
        setLineJoin(object.strokeJoin);
    };

    // render JXText
    var renderText = function(text) {
        text.update();

        _context.font= text.size + "pt " + text.font;

        // console.log(text.boundingBox.min.y, text.boundingBox.max.y);
        setTransform(text, true);
        _context.textBaseline="middle";
        for(var i=0; i<text.subTransforms.length; i++) {
            _context.save();
            _context.translate(text.subTransforms[i].position.x, text.subTransforms[i].position.y);
            // console.log(text.subTransforms[i].rotate);
            _context.rotate(text.subTransforms[i].rotate);
            // _context.scale(text.scale.x, text.scale.y);

            if(text.useShadow) renderShadow(text);

            if(text.useStroke) {
                setStroke(text);
                _context.strokeText(text.subTransforms[i].content, 0, 0);
                disableShadow();
            }

            if(text.useColor) {
                setFillStyle(text.color.getStyle());
                _context.fillText(text.subTransforms[i].content, 0, 0);
                disableShadow();
            }
            _context.restore();
            self.init();
        }
    };

    var renderSprite = function(sprite) {
        sprite.update();

        setTransform(sprite, true);
        _context.translate(-sprite.width/2, -sprite.height/2);

        if(sprite.useShadow) renderShadow(sprite);

        if(sprite.useImage && sprite.image) {
            var sprite_width = sprite.width * sprite.scale.x;
            if(sprite.image.width > sprite_width) {
                // 图片抗锯齿处理
                var oc = document.createElement('canvas'),
                    octx = oc.getContext('2d');
                var steps = Math.ceil(Math.log(sprite.image.width / sprite_width ) / Math.log(2));

                oc.width = sprite.image.width * 0.5;
                oc.height =  sprite.image.height * 0.5;

                octx.drawImage(sprite.image, 0, 0, oc.width , oc.height);

                var _pow, _w, _h, d_w = oc.width, d_h = oc.height;
                for(var s=1; s<steps; s++) {
                    _pow = Math.pow(2, s);
                    _w = sprite.image.width / _pow;
                    _h = sprite.image.height / _pow;
                    octx.drawImage(oc, 0, 0, d_w , d_h, 0, 0, _w, _h);
                    d_w = _w;
                    d_h = _h;
                }

                _context.drawImage(oc, 0, 0, d_w, d_h, 0, 0, sprite.width, sprite.height);
            } else {
                _context.drawImage(oc, 0, 0, sprite.width, sprite.height);
            }

            disableShadow();
        }

        if(sprite.useColor) {
            setFillStyle(sprite.color.getStyle());
            _context.fillRect(0, 0, sprite.width, sprite.height);

            disableShadow();
        }

        if(sprite.useStroke) {
            setStroke(sprite);
            _context.strokeRect(0, 0, sprite.width, sprite.height);
            disableShadow();
        }
    };

    var toCanvasCoord = function(v2) {
        var result = {x: 0, y: 0};
        result.x = v2.x + _canvasWidthHalf;
        result.y = v2.y + _canvasHeightHalf;

        return result;
    };

    var renderMask = function(mask) {
        var l=mask.vertices.length;

        if(l < 3) return;


        setTransform(mask, true);

        _context.beginPath();

        var s_p = mask.vertices[0], c_p;

        _context.moveTo(s_p.x, s_p.y);

        for(var i=1; i<l; i++) {
            c_p = mask.vertices[i];

            _context.lineTo(c_p.x, c_p.y);
        }

        _context.lineTo(s_p.x, s_p.y);

        if(mask.useStroke) {
            setStroke(mask);
            _context.stroke();
        }

        _context.globalCompositeOperation="destination-in";

        _context.fill();

        _context.globalCompositeOperation="source-over";
    };

    // render object recursive
    var renderObject = function(object) {
        if(object.visible) {
            if(object instanceof THREE.JX.JXText) {
                renderText(object);
            } else if(object instanceof THREE.JX.JXSprite) {
                renderSprite(object);
            } else if(object instanceof THREE.JX.JXPolygonMask) {
                renderMask(object);
            }

            for(var i=0; i<object.children.length; i++) {
                renderObject(object.children[i]);
            }
        }
    };

    // render
    this.render = function(scene, camera) {
        if(this.needUpdate) {
            this.clear();
            _context.save();
            // // create grid
            // _context.beginPath();
            // setStrokeStyle("#669911");
            // _context.moveTo(0, _canvasHeightHalf);
            // _context.lineTo(_canvasWidth, _canvasHeightHalf);
            // _context.moveTo(_canvasWidthHalf, 0);
            // _context.lineTo(_canvasWidthHalf, _canvasHeight);
            // _context.stroke();
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