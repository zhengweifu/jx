THREE.JX = {
	version : "1.0.0"
};

THREE.JX.getTextSize = function(text, options) {
	options = options || {};
    options.font = options.font || 'Times';
    options.fontSize = options.fontSize || '16px';
    options.fontWeight = options.fontWeight || 'normal';

	var result = {w: 0, h: 0};

	if(!THREE.JX.JX_MEASURE_DIV) {
		THREE.JX.JX_MEASURE_DIV = document.createElement('div');
		document.body.appendChild(THREE.JX.JX_MEASURE_DIV);
		THREE.JX.JX_MEASURE_DIV.style.position = "absolute";
		THREE.JX.JX_MEASURE_DIV.style.visibility = 'hidden';
		THREE.JX.JX_MEASURE_DIV.style.left = -10000;
		THREE.JX.JX_MEASURE_DIV.style.top = THREE.JX.JX_MEASURE_DIV.style.left;
		THREE.JX.JX_MEASURE_DIV.style.width = 'auto';
    	THREE.JX.JX_MEASURE_DIV.style.height = 'auto';
	}

	var _div = THREE.JX.JX_MEASURE_DIV;
	_div.style.fontSize = options.fontSize;
	_div.style.fontFamily = options.font;
	_div.style.fontWeight = options.fontWeight;

	_div.innerHTML = text;

	result.w = _div.offsetWidth;
	result.h = _div.offsetHeight;

	return result;
};