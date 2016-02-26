THREE.JX.JXPolygonMask = function(vertices, strokeColor, strokeCap, strokeJoin, strokeSize) {

	THREE.JX.JXNode.call(this);

	this.type = "JXPolygonMask";

	// stroke
	this.useStroke = false;
	this.strokeColor = strokeColor !== undefined ? strokeColor : new THREE.Color(0x888888);
	this.strokeCap = strokeCap !== undefined ? strokeCap : "round"; // butt, round, square
	this.strokeJoin = strokeJoin !== undefined ? strokeJoin : "round"; // miter, round, 
	this.strokeSize = strokeSize !== undefined ? strokeSize : 1;

	this.vertices = vertices;
};


THREE.JX.JXPolygonMask.prototype = Object.create(THREE.JX.JXNode.prototype);

THREE.JX.JXPolygonMask.prototype.constructor = THREE.JX.JXPolygonMask;

THREE.JX.JXPolygonMask.prototype.computBoundingBox = function() {

	this.boundingBox.setFromPoints(this.vertices);

	return this.boundingBox;
}

THREE.JX.JXPolygonMask.prototype.update = function(force) {
	if(this.needUpdate === true || force === true) {
		this.computBoundingBox();
		this.needUpdate = false;
	}
};