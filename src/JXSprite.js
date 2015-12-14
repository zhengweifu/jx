THREE.JX.JXSprite = function(image, color, strokeColor, strokeCap, strokeJoin, strokeSize, shadowColor, shadowDistance, shadowAngle, shadowBlur) {

	THREE.JX.JXNode.call(this);

	this.type = "JXSprite";

	// content
	this.image = image;
	this.color = color !== undefined ? color : new THREE.Color();

	// stroke
	this.useStroke = false;
	this.strokeColor = strokeColor !== undefined ? strokeColor : new THREE.Color(0x888888);
	this.strokeCap = strokeCap !== undefined ? strokeCap : "round"; // butt, round, square
	this.strokeJoin = strokeJoin !== undefined ? strokeJoin : "round"; // miter, round, 
	this.strokeSize = strokeSize !== undefined ? strokeSize : 1;

	// shadow
	this.useShadow = false;
	this.shadowColor = shadowColor !== undefined ? shadowColor : new THREE.Color(0x000000);
	this.shadowDistance = shadowDistance !== undefined ? shadowDistance : 3.0;
	this.shadowAngle = shadowAngle !== undefined ? shadowAngle : 100;
	this.shadowBlur = shadowBlur !== undefined ? shadowBlur : 0;

	this.width = 100;
	this.height = 100;
};

THREE.JX.JXSprite.prototype = Object.create(THREE.JX.JXNode.prototype);

THREE.JX.JXSprite.prototype.constructor = THREE.JX.JXSprite;

THREE.JX.JXSprite.prototype.clone = function(recursive) {
	return new this.constructor().copy(this, recursive);
};

THREE.JX.JXSprite.prototype.copy = function(source, recursive) {
	if(recursive === undefined) recursive = true;

	THREE.JX.JXNode.prototype.copy.call( this, source, recursive );

	this.url = source.url;
	this.color.copy(source.color);

	this.strokeColor.copy(source.strokeColor);
	this.strokeCap = source.strokeCap;
	this.strokeJoin = source.strokeJoin;
	this.strokeSize = source.strokeSize;

	this.shadowColor.copy(source.shadowColor);
	this.shadowDistance = source.shadowDistance;
	this.shadowAngle = source.shadowAngle;
	this.shadowBlur = source.shadowBlur;

	return this;
};

THREE.JX.JXSprite.prototype.computBoundingBox = function() {
	var w = this.width, 
		h = this.height,
		half_w = w / 2,
		half_h = h / 2;

	this.boundingBox.min.set(-half_w, -half_h);

	this.boundingBox.max.set(half_w, half_h);

	return this.boundingBox;
}