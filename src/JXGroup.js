THREE.JX.JXGroup = function() {
	THREE.JX.JXNode.call(this);

	this.type = "JXGroup";

	this.needUpdate = true;
};

THREE.JX.JXGroup.prototype = Object.create(THREE.JX.JXNode.prototype);

THREE.JX.JXGroup.prototype.constructor = THREE.JX.JXGroup;

THREE.JX.JXGroup.prototype.update = function(force) {
	if(this.needUpdate === true || !!force) {
		THREE.JX.box2FromObjects(this.boundingBox, this.children, true);
		this.needUpdate = false;
	}
}

