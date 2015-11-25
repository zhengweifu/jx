THREE.JX.JXText = function() {

	THREE.JX.JXNode.call(this);

	this.type = "JXText";

	// content
	this.content = "www.jianxi.com";
	this.color = new THREE.Color();
	this.size = 1.0;
	this.space = 0.0;
	this.font = "Arial";

	// stroke
	this.strokeColor = new THREE.Color(0x888888);
	this.strokeCap = "round"; // butt, round, square
	this.strokeJoin = "round"; // miter, round, 
	this.strokeSize = 1;

	// shadow
	this.shadowColor = new THREE.Color(0x000000);
	this.shadowDistance = 3.0;
	this.shadowAngle = 100;
	this.shadowBlur = 0;

	// arc
	this.arc = 0;

	this.subTransforms = [];
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
	this.color.copy(source.color);
	this.size = source.size;
	this.space = source.space;
	this.font = source.font;

	this.strokeColor.copy(source.strokeColor);
	this.strokeCap = source.strokeCap;
	this.strokeJoin = source.strokeJoin;
	this.strokeSize = source.strokeSize;

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
	// l *= this.scale.x;
	var r = l/2;
	if(this.arc != 0) r = l / this.arc;
	var etw, ea, ta=0, tl=0;

	if(this.arc == 0) {
		this.width = l;
		this.height = h;
	} else {
		var _a = Math.abs(this.arc), _r = Math.abs(r), _h = Math.abs(h);
		if(_a >= Math.PI) {
			this.width = 2 * (_r + _h);
			this.height = (_r + _h) * (1 - Math.cos(_a/2));
		} else {
			this.width = 2 * (_r + _h) * Math.sin(_a/2);
			this.height = _r * (1 - Math.cos(_a/2)) + _h;
		}
	}

	// set boundingBox
	var b_x = this.width * this.scale.x/2;
	if(this.arc > 0) {
		this.boundingBox.min.set(-b_x, h * this.scale.y * 3/4 - this.height * this.scale.y);
		this.boundingBox.max.set(b_x, h * this.scale.y * 3/4);
	} else {
		this.boundingBox.min.set(-b_x, -h * this.scale.y * 1/4);
		this.boundingBox.max.set(b_x, this.height * this.scale.y - h * this.scale.y * 1/4);
	}

	var pos_x, pos_y, rot;
	for(var i=0; i<this.content.length; i++) {

		etw = THREE.JX.getTextSize(this.content[i], options).w; 
		ea = this.arc * (tl/l - 0.5);

		if(this.arc != 0) {
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

		this.subTransforms.push({
			content: this.content[i],
			position: {x: pos_x, y: pos_y},
			rotate: rot
		});
	}

	return this.subTransforms;
};