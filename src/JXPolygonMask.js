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

	this.needUpdate = true;
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

THREE.JX.JXPolygonMask.prototype.fromJson = function(json) {
	if(json.useStroke !== undefined) this.useStroke = json.useStroke;
	if(json.strokeColor !== undefined) this.strokeColor.setHex(json.strokeColor);
	if(json.strokeCap !== undefined) this.strokeCap = json.strokeCap;
	if(json.strokeJoin !== undefined) this.strokeJoin = json.strokeJoin;
	if(json.strokeSize !== undefined) this.strokeSize = json.strokeSize;
	if(json.vertices !== undefined) {
		this.vertices.length = 0;
		for(var i=0; i<json.vertices.length; i++) {
			this.vertices.push(new THREE.Vector2().fromArray(json.vertices[i]));
		}
	}

	this.needUpdate = true;
};


THREE.JX.JXPolygonMask.prototype.toJson = function() {

	var vertices = [];
	for(var i=0; i<this.vertices.length; i++) {

		vertices.push(this.vertices[i].toArray());
	}

	return {
		type: this.type,
		useStroke: this.useStroke,
		strokeColor: this.strokeColor.getHex(),
		strokeCap: this.strokeCap,
		strokeJoin: this.strokeJoin,
		strokeSize: this.strokeSize,
		vertices: vertices
	}
};