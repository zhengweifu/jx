THREE.JX = {
	version : "1.0.0"
};

/**
 * [getTextSize description]
 * @param  {[type]} text    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
THREE.JX.getTextSize = function(text, options) {
	options = options || {};
    options.font = options.font || 'Times';
    options.fontSize = options.fontSize || '16pt';
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

	if(!THREE.JX.JX_CANVAS_CONTEXT) {
		var _canvas = document.createElement('canvas');
		THREE.JX.JX_CANVAS_CONTEXT = _canvas.getContext('2d');
	}

	if(THREE.JX.JX_CANVAS_CONTEXT) {
		THREE.JX.JX_CANVAS_CONTEXT.font = options.fontSize + " " + options.font + " " + options.fontWeight;
		result.w = THREE.JX.JX_CANVAS_CONTEXT.measureText(text).width;
	}

	return result;
};

/**
 * [pointInPolygon description]
 * @param  {[type]} point  [THREE.Vector2]
 * @param  {[type]} points [THREE.Vector2 array]
 * @return {[type]}        [bool]
 */
THREE.JX.pointInPolygon = function(point, points) {
	var i, p1, p2;
	var nCross = 0, nCount = points.length;
	for(i=0; i<nCount; i++) {
		p1 = points[i];
		p2 = points[(i+1)%nCount];
		if(p1.y == p2.y) {
			continue;
		}

		if(point.y < Math.min(p1.y, p2.y)) {
			continue;
		}

		if(point.y >= Math.max(p1.y, p2.y)) {
			continue;
		}

		var x = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;

		if(x > point.x) nCross++;
	}

	return (nCross % 2 == 1);

};

THREE.JX.vector2ApplyMatrix4 = function(v2, m4) {
	var e = m4.elements;
	var x = v2.x, y = v2.y;

	v2.x = e[ 0 ] * x + e[ 4 ] * y + e[ 12 ];
	v2.y = e[ 1 ] * x + e[ 5 ] * y + e[ 13 ];

	return v2;
};

THREE.JX.box2ApplyMatrix4 = function(b2, m4) {
	THREE.JX.vector2ApplyMatrix4(b2.min);
	THREE.JX.vector2ApplyMatrix4(b2.max);
	return b2;
};

THREE.JX.box2FromObjects = function(b2, objects, applyMatrix) {
	applyMatrix = !!applyMatrix;
	var v2Array = [], i, j, l=objects.length;
	for(i=0; i<l; i++) {
		objects[i].update();
		objects[i].updateMatrixWorld();
		v2Array.push(new THREE.Vector2(objects[i].boundingBox.min.x, objects[i].boundingBox.max.y));
		v2Array.push(new THREE.Vector2(objects[i].boundingBox.min.x, objects[i].boundingBox.min.y));
		v2Array.push(new THREE.Vector2(objects[i].boundingBox.max.x, objects[i].boundingBox.min.y));
		v2Array.push(new THREE.Vector2(objects[i].boundingBox.max.x, objects[i].boundingBox.max.y));
		if(applyMatrix) {
			for(j=0; j<4; j++) {
				THREE.JX.vector2ApplyMatrix4(v2Array[i * 4 + j], objects[i].matrix);
			}
		}
	}

	return b2.setFromPoints(v2Array);
};

THREE.JX.getMousePosition = function(dom, x, y) { // x = event.clientX, y = event.clientY, 转element坐标
	var rect = dom.getBoundingClientRect();
	// return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
	return [ x - rect.left, y - rect.top ];
};

THREE.JX.getDeckardCoordinate = function(dom, x, y) { // x = event.clientX, y = event.clientY, 转迪卡坐标
	var rect = dom.getBoundingClientRect();
	return [ x - rect.left - rect.width * 0.5, rect.height * 0.5 - y + rect.top ];
}

// swap array elements
THREE.JX.swapArrayElements = function(arr, index1, index2) {
	arr[index1] = arr.splice(index2, 1, arr[index1])[0];
	return arr;
}

// get element indexOf array 
THREE.JX.elementIndexOfArray = function(arr, element) {
	for(var i=0, l=arr.length; i<l; i++) {
		if(arr[i] === element) {
			return i;
		}
	}

	return -1;
};

// element move up
THREE.JX.moveUpArrayElement = function(arr, element) {
	var index = THREE.JX.elementIndexOfArray(arr, element);
	if(index > 0) {
		THREE.JX.swapArrayElements(arr, index-1, index);
	}
};

// element move down
THREE.JX.moveDownArrayElement = function(arr, element) {
	var index = THREE.JX.elementIndexOfArray(arr, element);
	if(index > -1 && index < arr.length - 1) {
		THREE.JX.swapArrayElements(arr, index, index+1);
	}
};

THREE.JX.getPositionFromAngleAndScale = function(a, x, y, s) {
    a = -a || 0;
    x = x || 0;
    y = y || 0;
    s = s || 1;

    var result = {x: 0, y: 0}, ma;

    if(a == 0 && s == 1) return result;
    else if(a == 0 && s != 1) {
       result.x = x * -(s - 1);
       result.y = y * -(s - 1);
       return result;
    }

    if(x == 0 && y == 0) {
        return result;
    } else if(x == 0 && y != 0) {
        ma = 0;
    } else if(x == 0 && y != 0) {
        ma = Math.PI / 2;
    } else {
        ma = Math.atan(x / y);
    }

    var _a = Math.PI / 2 - a / 2 - ma,
    l = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
    _l = Math.sin(a / 2) * l * 2;

    var t_x = _l * Math.sin(_a),
        t_y = _l * Math.cos(_a);

    var __a = Math.PI / 2 - a - ma,
        l_x = t_x / Math.cos(__a),
        y_x = t_x * Math.tan(__a);
         
    result.x = -(l_x + (s - 1) * l) * t_x / l_x,
    result.y = t_y - (y_x * (s - 1) * l / l_x);

    return result;
};

THREE.JX.getMatrix4FromRotationAxis = function(radian, pivot_start, pivot_end, m4) {
    m4 = (m4 === undefined) ? new THREE.Matrix4() : m4;

    var c = Math.cos(radian);
    var s = Math.sin(radian);

    var p = new THREE.Vector3();
    p.subVectors(pivot_end, pivot_start).normalize();

    var u = p.x, v = p.y, w = p.z;

    var x =  pivot_start.x, y = pivot_start.y, z = pivot_start.z;

    var uu = u * u,
        uv = u * v, 
        uw = u * w,
        vv = v * v, 
        vw = v * w, 
        ww = w * w,

        xu = x * u,
        xv = x * v,
        xw = x * w,
        yu = y * u,
        yv = y * v,
        yw = y * w,
        zu = z * u,
        zv = z * v,
        zw = z * w;

    var m11 = uu +(vv + ww) * c,
        m12 = uv * (1 - c) - w * s,
        m13 = uw * (1 - c) + v * s,
        m14 = (x * (vv + ww) - u * (yv + zw)) * (1 - c) + (yw - zv) * s,

        m21 = uv * (1 - c) + w * s,
        m22 = vv + (uu + ww) * c,
        m23 = vw * (1 - c) - u * s,
        m24 = (y * (uu + ww) - v * (xu + zw)) * (1 - c) + (zu - xw) * s,

        m31 = uw * (1 - c) - v * s,
        m32 = vw * (1 - c) + u * s,
        m33 = ww + (uu + vv) * c,
        m34 = (z * (uu + vv) - w * (xu + yv)) * (1 - c) + (xv - yu) * s;

    m4.set(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, 0, 0, 0, 1);

    return m4;
};

THREE.JX.getMatrix4FromScaleAxis = function(v, vector, m4) { // vector is normalize
	m4 = (m4 === undefined) ? new THREE.Matrix4() : m4;

	// m4.set(
	// 	1 + (v - 1) * vector.x * vector.x,  (v - 1) * vector.x * vector.y,       (v - 1) * vector.x * vector.z,      0,
	// 	(v - 1) * vector.x * vector.y,      1 + (v - 1) * vector.y * vector.y,   (v - 1) * vector.y * vector.z,      0,
	// 	(v - 1) * vector.x * vector.z,      (v - 1) * vector.y * vector.z,       1 + (v - 1) * vector.z * vector.z,  0,
	// 	0,                        0,                         0,                        1
	// );
	// 

	m4.set(
		1 + (v - 1) * vector.x * vector.x,  (v - 1) * vector.x * vector.y,      (v - 1) * vector.x * vector.z,      0,
		(v - 1) * vector.x * vector.y,      1 + (v - 1) * vector.y * vector.y,  (v - 1) * vector.y * vector.z,      0,
		(v - 1) * vector.x * vector.z,      (v - 1) * vector.y * vector.z,      1 + (v - 1) * vector.z * vector.z,  0,
		0,                        0,                        0,                        1
	);

	return m4;
};

THREE.JX.setObjectScale = function(object, pivot_start, pivot_end, s) {
	var vector = new THREE.Vector3();
    vector.subVectors(pivot_end, pivot_start).normalize();

    object.updateMatrix();

    var _matrix = object.matrix;
    var _m4 = new THREE.Matrix4();

    _m4.makeTranslation(-pivot_start.x, -pivot_start.y, -pivot_start.z);
	// _matrix.multiply(_m4);
	object.applyMatrix(_m4);

	// _matrix.multiply(THREE.JX.getMatrix4FromScaleAxis(s, vector));
	object.applyMatrix(THREE.JX.getMatrix4FromScaleAxis(s, vector));

    _m4.makeTranslation(pivot_start.x, pivot_start.y, pivot_start.z);
    // _matrix.multiply(_m4);
    object.applyMatrix(_m4);

    // _matrix.decompose(object.position, object.rotation, object.scale);
};

// 判断类型
THREE.JX.is = function (obj, type) { 
	return (type === "Null" && obj === null) || 
	(type === "Undefined" && obj === void 0 ) || 
	(type === "Number" && isFinite(obj)) || 
	Object.prototype.toString.call(obj).slice(8,-1) === type; 
}
