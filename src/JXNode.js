THREE.JX.JXNode = function() {
	THREE.Object3D.call(this);

	this.type = "JXNode";

	this.boundingBox = new THREE.Box2();

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

	return this;
};