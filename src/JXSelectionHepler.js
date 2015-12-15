THREE.JX.JXSelectionHepler = function(object) {
	this.margin = 10;
	this.smallBox = 20;

	this.object = {
		object : object,
		centerBox : new THREE.JX.JXSprite(),
		samllBox_LT : new THREE.JX.JXSprite(),
		samllBox_RT : new THREE.JX.JXSprite(),
		samllBox_LB : new THREE.JX.JXSprite(),
		samllBox_RB : new THREE.JX.JXSprite()
	};

	this.update();
};

THREE.JX.JXSelectionHepler.prototype.constructor = THREE.JX.JXSelectionHepler;

THREE.JX.JXSelectionHepler.update = function() {

}