THREE.JX.JXText = function() {

	THREE.JX.JXNode.call(this);

	this.type = "JXText";

	// content
	this.content = "www.jianxi.com";
	this.useColor = true;
	this.color = new THREE.Color();
	this.size = 1.0;
	this.space = 0.0;
	this.font = "Arial";

	// stroke
	this.useStroke = false;
	this.strokeColor = new THREE.Color(0x888888);
	this.strokeCap = "round"; // butt, round, square
	this.strokeJoin = "round"; // miter, round, 
	this.strokeSize = 1;

	// shadow
	this.useShadow = false;
	this.shadowColor = new THREE.Color(0x000000);
	this.shadowDistance = 3.0;
	this.shadowAngle = 100;
	this.shadowBlur = 0;

	// arc
	this.arc = 0;

	this.subTransforms = [];

	this.needUpdate = true;
};

THREE.JX.JXText.prototype = Object.create(THREE.JX.JXNode.prototype);

THREE.JX.JXText.prototype.constructor = THREE.JX.JXText;

THREE.JX.JXText.prototype.clone = function(recursive) {
	return new this.constructor().copy(this, recursive);
};

THREE.JX.JXText.prototype.copy = function(source, recursive) {
	if(recursive === undefined) recursive = true;

	THREE.JX.JXNode.prototype.copy.call( this, source, recursive );

	this.content = source.content;
	this.useColor = source.useColor;
	this.color.copy(source.color);
	this.size = source.size;
	this.space = source.space;
	this.font = source.font;

	this.useStroke = source.useStroke;
	this.strokeColor.copy(source.strokeColor);
	this.strokeCap = source.strokeCap;
	this.strokeJoin = source.strokeJoin;
	this.strokeSize = source.strokeSize;

	this.useShadow = source.useShadow;
	this.shadowColor.copy(source.shadowColor);
	this.shadowDistance = source.shadowDistance;
	this.shadowAngle = source.shadowAngle;
	this.shadowBlur = source.shadowBlur;

	this.arc = source.arc;

	return this;
};

THREE.JX.JXText.prototype.updateSubTransform = function() {
	this.subTransforms.length = 0;

	var options = {
		font : this.font,
		fontSize : this.size + 'pt'
	};
	var tb = THREE.JX.getTextSize(this.content, options);
	var h = tb.h;

	var l = tb.w + this.space * (this.content.length - 1);

	var a = this.arc, ta = (l / (l + this.space)) * 2 * Math.PI;
	if(a > ta) a = ta;
	else if(a < -ta) a = -ta;

	// l *= this.scale.x;
	var r = l/2;
	if(a != 0) r = l / a;
	var etw, ea, ta=0, tl=0;

	if(a == 0) {
		this.width = l;
		this.height = h;
	} else {
		var _a = Math.abs(a), _r = Math.abs(r), _h = Math.abs(h);
		if(_a >= Math.PI) {
			this.width = 2 * _r + _h;
			this.height = (_r + _h/2) * (1 - Math.cos(_a/2));
		} else {
			this.width = 2 * (_r + _h/2) * Math.sin(_a/2);
			this.height = (_r + _h/2) -((_r - _h/2) * Math.cos(_a/2));
		}
	}

	// set boundingBox
	// var b_x = this.width * this.scale.x/2;
	// if(a > 0) {
	// 	this.boundingBox.min.set(-b_x, h * this.scale.y * 0.5 - this.height * this.scale.y);
	// 	this.boundingBox.max.set(b_x, h * this.scale.y * 0.5);
	// } else {
	// 	this.boundingBox.min.set(-b_x, -h * this.scale.y * 0.5);
	// 	this.boundingBox.max.set(b_x, this.height * this.scale.y - h * this.scale.y * 0.5);
	// }

	// var b_x = this.width * 0.5;
	// if(a >= 0) {
	// 	this.boundingBox.min.set(-b_x, h * 0.5 - this.height);
	// 	this.boundingBox.max.set(b_x, h * 0.5);
	// } else {
	// 	this.boundingBox.min.set(-b_x, -h * 0.5);
	// 	this.boundingBox.max.set(b_x, this.height - h * 0.5);
	// }

	var b_x = this.width * 0.5, b_y = this.height * 0.5, _center = new THREE.Vector2();
	this.boundingBox.min.set(-b_x, -b_y);
	this.boundingBox.max.set( b_x,  b_y);
	if(a >= 0) {
		_center.set(0, (h - this.height) / 2);
	} else {
		_center.set(0, (this.height - h) / 2);
	}

	var pos_x, pos_y, rot;
	for(var i=0; i<this.content.length; i++) {

		etw = THREE.JX.getTextSize(this.content[i], options).w; 
		ea = a * (tl/l - 0.5);

		if(a != 0) {
			pos_x = r * Math.sin(ea);
			pos_y = r * (1 - Math.cos(ea));
			rot = ea;
		} else {
			pos_x = tl - l/2;
			pos_y = 0;
			rot = 0;
		}
		
		// console.log(this.subTransforms[i].content, this.subTransforms[i].position);
		ta = ea;
		tl += etw + this.space;

		// move position to center
		pos_x += _center.x;
		pos_y += _center.y;

		this.subTransforms.push({
			content: this.content[i],
			position: {x: pos_x, y: pos_y},
			rotate: rot
		});
	}

	return this.subTransforms;
};

THREE.JX.JXText.prototype.update = function(force) {
	if(this.needUpdate === true || force === true) {
		this.updateSubTransform();
		this.needUpdate = false;
	}
};