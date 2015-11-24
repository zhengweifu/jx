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

	var l = tb.w + this.space * (this.content.length - 1);
	var r = l / this.arc, etw, ea, ta=0, tl=0;

	if(this.arc >= Math.PI) {
		this.width = 2 * (r + tb.h);
	} else {
		this.width = 2 * (r + tb.h) * Math.sin(this.arc/2);
	}
	this.height = (r + tb.h) * (1 - Math.cos(this.arc/2));

	for(var i=0; i<this.content.length; i++) {
		etw = THREE.JX.getTextSize(this.content[i], options).w; 
		ea = this.arc * (tl/l - 0.5);

		this.subTransforms.push({
			content: this.content[i],
			position: {x: r * Math.sin(ea-ta), y: r * (1 - Math.cos(ea-ta))},
			rotate: ea-ta
		});

		ta = ea;
		tl += etw + this.space;
	}

	return this.subTransforms;
};