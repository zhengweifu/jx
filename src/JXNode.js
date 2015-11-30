THREE.JX.JXNode = function() {
	THREE.Object3D.call(this);

	this.type = "JXNode";

	this.boundingBox = new THREE.Box2();

	this.width = 0;

	this.height = 0;
};

THREE.JX.JXNode.prototype = Object.create(THREE.Object3D.prototype);

THREE.JX.JXNode.prototype.constructor = THREE.JX.JXNode;

THREE.JX.JXNode.prototype.clone = function(recursive) {
	return new this.constructor().copy(this, recursive);
};

THREE.JX.JXNode.prototype.copy = function(source, recursive) {
	if(recursive === undefined) recursive = true;

	THREE.Object3D.prototype.copy.call( this, source, recursive );

	this.boundingBox.copy(source.boundingBox);

	this.width = source.width;

	this.height = source.height;

	return this;
};

THREE.JX.JXNode.prototype.pointInJXNode = function(point) {
	/**
	 * p1 + + + + p2
	 * +           +
	 * +           +
	 * +           +
	 * +           +
	 * p4 + + + + p3
	 */

	var bbx = this.boundingBox;
	var p1 = new THREE.Vector2(bbx.min.x, bbx.max.y),
		p2 = bbx.max.clone(),
		p3 = new THREE.Vector2(bbx.max.x, bbx.min.y),
		p4 = bbx.min.clone();

	THREE.JX.vector2ApplyMatrix4(p1, this.matrixWorld);
	THREE.JX.vector2ApplyMatrix4(p2, this.matrixWorld);
	THREE.JX.vector2ApplyMatrix4(p3, this.matrixWorld);
	THREE.JX.vector2ApplyMatrix4(p4, this.matrixWorld);

	var points = [p1, p2, p3, p4];

	return THREE.JX.pointInPolygon(point, points);
};