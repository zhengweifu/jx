THREE.JX.JXPath = function(points) {
	THREE.JX.JXNode.call(this);

	this.type = "JXPath";

	this.useColor = true;
	this.color = new THREE.Color(0x000000);

	// stroke
	this.useStroke = false;
	this.strokeColor = new THREE.Color(0x888888);
	this.strokeCap = "round"; // butt, round, square
	this.strokeJoin = "round"; // miter, round, 
	this.strokeSize = 1;

	// shadow
	this.useShadow = false;
	this.shadowColor = new THREE.Color(0x000000);
	this.shadowDistance = 3.0;
	this.shadowAngle = 100;
	this.shadowBlur = 0;

	this.path = new THREE.Path();

	this.needUpdate = true;
};

THREE.JX.JXPath.prototype = Object.create(THREE.JX.JXNode.prototype);

THREE.JX.JXPath.prototype.constructor = THREE.JX.JXPath;

THREE.JX.JXPath.prototype.update = function(force) {
	if(this.needUpdate === true || !!force) {
		this.boundingBox.setFromPoints(this.path.getPoints(10));
		// this.pointsToCenter();
		this.needUpdate = false;
	}
};

THREE.JX.JXPath.prototype.pointsToCenter = function() {
	var _cx = (this.boundingBox.max.x + this.boundingBox.min.x) / 2,
		_cy = (this.boundingBox.max.y + this.boundingBox.min.y) / 2;

	if(_cx <= 0.00001 && _cy <= 0.00001) return;

	var i, j, l = this.path.actions.length;

	for(i=0; i<l; i++) {
		for(j=0; j<this.path.actions[i]["args"].length; j++) {
			if(j % 2 === 0) {
				this.path.actions[i]["args"][j] -= _cx;
			} else {
				this.path.actions[i]["args"][j] -= _cy;
			}
		}
	}

	this.boundingBox.min.x -= _cx;
	this.boundingBox.min.y -= _cy;

	this.boundingBox.max.x -= _cx;
	this.boundingBox.max.y -= _cy;

	this.position.set(_cx, _cy, 0);
};

THREE.JX.JXPath.prototype.filpY = function() {
	for(var i=0; i<this.path.actions.length; i++) {
		for(var j=0; j<this.path.actions[i]["action"].length; j++) {
			if(j % 2 === 1) {
				this.path.actions[i]["action"][j] *= -1;
			} 
		}
	}
};

THREE.JX.JXPath.prototype.fromSVGPath = function(pathStr) {

	const DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46,
			MINUS = 45;
	
	var idx = 1, len = pathStr.length, activeCmd,
			x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
			x1 = 0, x2 = 0, y1 = 0, y2 = 0,
			rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;
	
	function eatNum() {
		var sidx, c, isFloat = false, s;
		// eat delims
		while (idx < len) {
			c = pathStr.charCodeAt(idx);
			if (c !== COMMA && c !== SPACE)
				break;
			idx++;
		}
		if (c === MINUS)
			sidx = idx++;
		else
			sidx = idx;
		// eat number
		while (idx < len) {
			c = pathStr.charCodeAt(idx);
			if (DIGIT_0 <= c && c <= DIGIT_9) {
				idx++;
				continue;
			}
			else if (c === PERIOD) {
				idx++;
				isFloat = true;
				continue;
			}
			
			s = pathStr.substring(sidx, idx);
			return isFloat ? parseFloat(s) : parseInt(s);
		}
		
		s = pathStr.substring(sidx);
		return isFloat ? parseFloat(s) : parseInt(s);
	}
	
	function nextIsNum() {
		var c;
		// do permanently eat any delims...
		while (idx < len) {
			c = pathStr.charCodeAt(idx);
			if (c !== COMMA && c !== SPACE)
				break;
			idx++;
		}
		c = pathStr.charCodeAt(idx);
		return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
	}
	
	var canRepeat;
	activeCmd = pathStr[0];
	while (idx <= len) {
		canRepeat = true;
		switch (activeCmd) {
				// moveto commands, become lineto's if repeated
			case 'M':
				x = eatNum();
				y = eatNum();
				this.path.moveTo(x, y);
				activeCmd = 'L';
				break;
			case 'm':
				x += eatNum();
				y += eatNum();
				this.path.moveTo(x, y);
				activeCmd = 'l';
				break;
			case 'Z':
			case 'z':
				canRepeat = false;
				if (x !== firstX || y !== firstY)
					this.path.lineTo(firstX, firstY);
				break;
				// - lines!
			case 'L':
			case 'H':
			case 'V':
				nx = (activeCmd === 'V') ? x : eatNum();
				ny = (activeCmd === 'H') ? y : eatNum();
				this.path.lineTo(nx, ny);
				x = nx;
				y = ny;
				break;
			case 'l':
			case 'h':
			case 'v':
				nx = (activeCmd === 'v') ? x : (x + eatNum());
				ny = (activeCmd === 'h') ? y : (y + eatNum());
				this.path.lineTo(nx, ny);
				x = nx;
				y = ny;
				break;
				// - cubic bezier
			case 'C':
				x1 = eatNum(); y1 = eatNum();
			case 'S':
				if (activeCmd === 'S') {
					x1 = 2 * x - x2; y1 = 2 * y - y2;
				}
				x2 = eatNum();
				y2 = eatNum();
				nx = eatNum();
				ny = eatNum();
				this.path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
				x = nx; y = ny;
				break;
			case 'c':
				x1 = x + eatNum();
				y1 = y + eatNum();
			case 's':
				if (activeCmd === 's') {
					x1 = 2 * x - x2;
					y1 = 2 * y - y2;
				}
				x2 = x + eatNum();
				y2 = y + eatNum();
				nx = x + eatNum();
				ny = y + eatNum();
				this.path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
				x = nx; y = ny;
				break;
				// - quadratic bezier
			case 'Q':
				x1 = eatNum(); y1 = eatNum();
			case 'T':
				if (activeCmd === 'T') {
					x1 = 2 * x - x1;
					y1 = 2 * y - y1;
				}
				nx = eatNum();
				ny = eatNum();
				this.path.quadraticCurveTo(x1, y1, nx, ny);
				x = nx;
				y = ny;
				break;
			case 'q':
				x1 = x + eatNum();
				y1 = y + eatNum();
			case 't':
				if (activeCmd === 't') {
					x1 = 2 * x - x1;
					y1 = 2 * y - y1;
				}
				nx = x + eatNum();
				ny = y + eatNum();
				this.path.quadraticCurveTo(x1, y1, nx, ny);
				x = nx; y = ny;
				break;
				// - elliptical arc
			case 'A':
				rx = eatNum();
				ry = eatNum();
				xar = eatNum() * DEGS_TO_RADS;
				laf = eatNum();
				sf = eatNum();
				nx = eatNum();
				ny = eatNum();
				if (rx !== ry) {
					console.warn("Forcing elliptical arc to be a circular one :(",
											 rx, ry);
				}
				// SVG implementation notes does all the math for us! woo!
				// http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
				// step1, using x1 as x1'
				x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
				y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
				// step 2, using x2 as cx'
				var norm = Math.sqrt(
					(rx*rx * ry*ry - rx*rx * y1*y1 - ry*ry * x1*x1) /
					(rx*rx * y1*y1 + ry*ry * x1*x1));
				if (laf === sf)
					norm = -norm;
				x2 = norm * rx * y1 / ry;
				y2 = norm * -ry * x1 / rx;
				// step 3
				cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
				cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;
				
				var u = new THREE.Vector2(1, 0),
						v = new THREE.Vector2((x1 - x2) / rx,
																	(y1 - y2) / ry);
				var startAng = Math.acos(u.dot(v) / u.length() / v.length());
				if (u.x * v.y - u.y * v.x < 0)
					startAng = -startAng;
				
				// we can reuse 'v' from start angle as our 'u' for delta angle
				u.x = (-x1 - x2) / rx;
				u.y = (-y1 - y2) / ry;
				
				var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
				// This normalization ends up making our curves fail to triangulate...
				if (v.x * u.y - v.y * u.x < 0)
					deltaAng = -deltaAng;
				if (!sf && deltaAng > 0)
					deltaAng -= Math.PI * 2;
				if (sf && deltaAng < 0)
					deltaAng += Math.PI * 2;
				
				this.path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
				x = nx;
				y = ny;
				break;
			default:
				throw new Error("weird path command: " + activeCmd);
		}
		if (firstX === null) {
			firstX = x;
			firstY = y;
		}
		// just reissue the command
		if (canRepeat && nextIsNum())
			continue;
		activeCmd = pathStr[idx++];

		this.filpY();
	}
};

THREE.JX.JXPath.prototype.toSVGPath = function() {}; 