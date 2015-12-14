THREE.JX.JXSpriteLoader = function( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.JX.JXSpriteLoader.prototype = {

	constructor: THREE.JX.JXSpriteLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var sprite = new THREE.JX.JXSprite();

		var loader = new THREE.ImageLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( image ) {
			image.width = sprite.width;
			image.height = sprite.height;

			sprite.image = image;

			sprite.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( sprite );

			}

		}, onProgress, onError );

		return sprite;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

};
