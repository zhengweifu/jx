THREE.JX.JXFilter = {};

/**
 * @description: 灰度扩展
 *
 */
THREE.JX.JXFilter.imageEnhance = function(imgData, arg1, arg2){
    var lamta = arg || 0.5;
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var p1 = arg1 || {x: 10,y: 10};
    var p2 = arg2 || {x: 50,y: 40};

    function transfer(d){
    }

    for(var i = 0,n = data.length;i < n;i += 4){
        
    }

    imgData.data = data;

    return imgData;
};

/**
 * @description: 腐蚀 
 *
 */
THREE.JX.JXFilter.corrode = function(imgData, arg){
    var R = parseInt(arg[0]) || 3;
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var xLength = R * 2 + 1;

    //区块
    for(var x = 0; x < width; x ++) {

        for(var y = 0; y < height; y ++) {
            
            var randomI = parseInt(Math.random() * R * 2) - R ;//区块随机代表
            var randomJ = parseInt(Math.random() * R * 2) - R;//区块随机代表
            var realI = y * width + x;
            var realJ = (y + randomI) * width + x + randomJ;

            for(var j = 0; j < 3; j ++) {
                data[realI * 4 + j] = data[realJ * 4 + j];
            }

        }

    }

    return imgData;
};

/**
 * @description: 暗角
 *
 */

THREE.JX.JXFilter.darkCorner = function(imgData,arg){
    //暗角级别 分1-10级吧
    var R = parseInt(arg[0]) || 3;

    //暗角的形状
    var type = arg[2] || "round";

    //暗角最终的级别 0 - 255
    var lastLevel = arg[1] || 30;

    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var xLength = R * 2 + 1;

    //计算中心点
    var middleX = width * 2 / 3;
    var middleY = height * 1/ 2;
    
    //计算距中心点最长距离
    var maxDistance = new THREE.Vector2(middleX ,middleY).length();
    //开始产生暗角的距离
    var startDistance = maxDistance * (1 - R / 10);

    var f = function(x, p0, p1, p2, p3){

     //基于三次贝塞尔曲线 
         return p0 * Math.pow((1 - x), 3) + 3 * p1 * x * Math.pow((1 - x), 2) + 3 * p2 * x * x * (1 - x) + p3 * Math.pow(x, 3);
   }

    //计算当前点应增加的暗度
    function calDark(x, y, p){
        //计算距中心点距离
        var distance = new THREE.Vector2(x, y).distanceTo(new THREE.Vector2(middleX, middleY));
        var currBilv = (distance - startDistance) / (maxDistance - startDistance);
        if(currBilv < 0) currBilv = 0;

        //应该增加暗度
        return  f(currBilv, 0, 0.02, 0.3, 1) * p * lastLevel / 255;
    }

    //区块
    for(var x = 0; x < width; x ++){

        for(var y = 0; y < height; y ++){
            
            var realI = y * width + x;
            for(var j = 0;j < 3;j ++){
                var dDarkness = calDark(x, y, data[realI * 4 + j]);
                data[realI * 4 + j] -= dDarkness;
            }

        }

    }


    return imgData;
};

/**
 * @description: 喷点 
 *
 */
THREE.JX.JXFilter.dotted = function(imgData, arg){//调节亮度对比度
    //矩形半径
    var R = parseInt(arg[0]) || 1;

    //内小圆半径
    var r = parseInt(arg[1]) || 1;

    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var xLength = R * 2 + 1;

    //构造距离模板
    var disTmlMatrix = [
    ];

    var r2 = r * r;
    for(var x = -R; x < R; x ++){

        for(var y = -R; y < R; y ++){
            if((x * x + y * y) > r2){
                disTmlMatrix.push([x, y]);
            }
        }

    }

    var xyToIFun = THREE.JX.JXFilterMath.xyToIFun(width);

    //将大于距离外面的透明度置为0
    for(var x = 0, n = parseInt(width / xLength); x < n; x ++){

        for(var y = 0, m = parseInt(height / xLength); y < m;y ++){
            var middleX = parseInt((x + 0.5) * xLength);
            var middleY = parseInt((y + 0.5) * xLength);

            for(var i = 0; i < disTmlMatrix.length; i ++){
                var dotX = middleX + disTmlMatrix[i][0];
                var dotY = middleY + disTmlMatrix[i][1];

                //data[(dotY * width + dotX) * 4 + 3] = 0;
                data[xyToIFun(dotX, dotY, 3)] = 225;
                data[xyToIFun(dotX, dotY, 2)] = 225;
                data[xyToIFun(dotX, dotY, 0)] = 225;
                data[xyToIFun(dotX, dotY, 1)] = 225;
            }
        }

    }

    /*
    for(var x = 0; x < width; x ++){
        for(var y = 0; y < height; y ++){
            data[(y * width + x) * 4 + 3] = 0;
        }
    }
    */


    return imgData;
};

/**
 * @description:  浮雕效果
 *
 */

THREE.JX.JXFilter.embossment = function(imgData, arg){//调节亮度对比度
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;

    var outData = [];
    for(var i = 0,n = data.length;i < n;i += 4){

        var ii = i / 4;
        var row = parseInt(ii / width);
        var col = ii % width;
        var A = ((row - 1) *  width + (col - 1)) * 4;
        var G = (row + 1) * width * 4 + (col + 1) * 4;

        if(row == 0 || col == 0) continue;
        for(var j = 0;j < 3;j ++){
            outData[i + j] = data[A + j] - data[G + j] + 127.5;
        }
        outData[i + 4] = data[i + 4];
    }

    for(var i = 0,n = data.length;i < n;i ++){
        data[i] = outData[i] || data[i];
    }


    return imgData;
};

/**
 * 高斯模糊
 * @param  {Array} pixes  pix array
 * @param  {Number} width 图片的宽度
 * @param  {Number} height 图片的高度
 * @param  {Number} radius 取样区域半径, 正数, 可选, 默认为 3.0
 * @param  {Number} sigma 标准方差, 可选, 默认取值为 radius / 3
 * @return {Array}
 */
THREE.JX.JXFilter.gaussBlur = function(imgData, args) {
    var pixes = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var gaussMatrix = [],
        gaussSum = 0,
        x, y,
        r, g, b, a,
        i, j, k, len;

    var radius = args[0];
    var sigma = args[1];


    radius = Math.floor(radius) || 3;
    sigma = sigma || radius / 3;
    
    a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
    b = -1 / (2 * sigma * sigma);
    //生成高斯矩阵
    for (i = 0, x = -radius; x <= radius; x++, i++){
        g = a * Math.exp(b * x * x);
        gaussMatrix[i] = g;
        gaussSum += g;
    
    }
    //归一化, 保证高斯矩阵的值在[0,1]之间
    for (i = 0, len = gaussMatrix.length; i < len; i++) {
        gaussMatrix[i] /= gaussSum;
    }
    //x 方向一维高斯运算
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            r = g = b = a = 0;
            gaussSum = 0;
            for(j = -radius; j <= radius; j++){
                k = x + j;
                if(k >= 0 && k < width){//确保 k 没超出 x 的范围
                    //r,g,b,a 四个一组
                    i = (y * width + k) * 4;
                    r += pixes[i] * gaussMatrix[j + radius];
                    g += pixes[i + 1] * gaussMatrix[j + radius];
                    b += pixes[i + 2] * gaussMatrix[j + radius];
                    // a += pixes[i + 3] * gaussMatrix[j];
                    gaussSum += gaussMatrix[j + radius];
                }
            }
            i = (y * width + x) * 4;
            // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
            // console.log(gaussSum)
            pixes[i] = r / gaussSum;
            pixes[i + 1] = g / gaussSum;
            pixes[i + 2] = b / gaussSum;
            // pixes[i + 3] = a ;
        }
    }
    //y 方向一维高斯运算
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            r = g = b = a = 0;
            gaussSum = 0;
            for(j = -radius; j <= radius; j++){
                k = y + j;
                if(k >= 0 && k < height){//确保 k 没超出 y 的范围
                    i = (k * width + x) * 4;
                    r += pixes[i] * gaussMatrix[j + radius];
                    g += pixes[i + 1] * gaussMatrix[j + radius];
                    b += pixes[i + 2] * gaussMatrix[j + radius];
                    // a += pixes[i + 3] * gaussMatrix[j];
                    gaussSum += gaussMatrix[j + radius];
                }
            }
            i = (y * width + x) * 4;
            pixes[i] = r / gaussSum;
            pixes[i + 1] = g / gaussSum;
            pixes[i + 2] = b / gaussSum;
            // pixes[i] = r ;
            // pixes[i + 1] = g ;
            // pixes[i + 2] = b ;
            // pixes[i + 3] = a ;
        }
    }
    //end
    imgData.data = pixes;
    return imgData;
};

/**
 * @author: Bin Wang
 * @description: 查找边缘
 *
 */
THREE.JX.JXFilter.borderline = function(imgData, arg) {
    var template1 = [
        -2,-4,-4,-4,-2,
        -4,0,8,0,-4,
        -4,8,24,8,-4,
        -4,0,8,0,-4,
        -2,-4,-4,-4,-2
    ];
    var template2 = [
            0,		1,		0,
			1,		-4,		1,
			0,		1,		0
    ];
    var template3 = [
    ];
    return THREE.JX.JXFilterMath.applyMatrix(imgData, template2, 250);
};


/**
 * @description:  马赛克 
 *
 */
THREE.JX.JXFilter.mosaic = function(imgData, arg) {//调节亮度对比度
    var R = parseInt(arg[0]) || 3;
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var xLength = R * 2 + 1;

    for(var x = 0,n = parseInt(width / xLength);x < n;x ++){

        for(var y = 0,m = parseInt(height / xLength);y < m;y ++){

            var average = [],sum = [0,0,0];
            for(var i = 0;i < xLength;i ++){

                for(var j = 0;j < xLength;j ++){
                    var realI = (y * xLength + i) * width + x * xLength + j;
                    sum[0] += data[realI * 4];
                    sum[1] += data[realI * 4 + 1];
                    sum[2] += data[realI * 4 + 2];
                }
            }
            average[0] = sum[0] / (xLength * xLength);
            average[1] = sum[1] / (xLength * xLength);
            average[2] = sum[2] / (xLength * xLength);

            for(var i = 0;i < xLength;i ++){

                for(var j = 0;j < xLength;j ++){
                    var realI = (y * xLength + i) * width + x * xLength + j;
                    data[realI * 4] = average[0];
                    data[realI * 4 + 1] = average[1];
                    data[realI * 4 + 2] = average[2];

                }
            }

        }

    }


    return imgData;
};

/**
 * @description:   添加杂色 
 *
 */
THREE.JX.JXFilter.noise = function(imgData, arg) {
    var R = parseInt(arg[0]) || 100;
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var xLength = R * 2 + 1;

    //区块
    for(var x = 0; x < width; x++) {

        for(var y = 0; y < height; y ++) {
            
            var realI = y * width + x;
            for(var j = 0;j < 3;j ++) {
                var rand = parseInt(Math.random() * R * 2) - R;
                data[realI * 4 + j] += rand;
            }

        }

    }

    return imgData;
};

/**
 * @description: 油画 
 *
 */

THREE.JX.JXFilter.oilPainting = function(imgData, arg){
    var R = parseInt(arg[0]) || 16;
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var xLength = R * 2 + 1;

    //区块
    for(var x = 0; x < width; x++) {

        for(var y = 0; y < height; y++) {
            
            var realI = y * width + x;
            var gray = 0;
            for(var j = 0;j < 3;j ++) {
                gray += data[realI * 4 + j];
            }
            gray = gray / 3;
            var every = parseInt(gray / R) * R;
            for(var j = 0;j < 3;j ++) {
                data[realI * 4 + j] = every;
            }
        }

    }

    return imgData;
};

/**
 * @description: 色调分离
 *
 */
THREE.JX.JXFilter.posterize = function(imgData, args) {
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;

    //灰度阶数
    //由原来的255阶映射为现在的阶数
    var step = args[0] || 20;

    step = step < 1 ? 1 : (step > 255 ? 255 : step);
    var level = Math.floor(255 / step);
    
    for(var x = 0; x < width; x++) {
        for(var y = 0; y < height; y++) {
            THREE.JX.JXFilterMath.xyCal(imgData, x, y, function(r, g, b) {
                return [
                    Math.floor(r / level) * level,
                    Math.floor(g / level) * level,
                    Math.floor(b / level) * level
                ];
            });
        }
    }
    return imgData;
};

/**
 * @description: 棕褐色
 *
 */
THREE.JX.JXFilter.sepia = function(imgData) {
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    
    for(var x = 0; x < width; x ++){
        for(var y = 0; y < height; y ++){
            THREE.JX.JXFilterMath.xyCal(imgData, x, y, function(r, g, b){
                return [
                    r * 0.393 + g * 0.769 + b * 0.189,
                    r * 0.349 + g * 0.686 + b * 0.168,
                    r * 0.272 + g * 0.534 + b * 0.131
                ];
            });
        }
    }
    return imgData;
};

/**
 * @description:锐化 
 *
 */
THREE.JX.JXFilter.sharp = function(imgData,arg){
    var lamta = arg[0] || 0.6;
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;

    for(var i = 0,n = data.length;i < n;i += 4){
        var ii = i / 4;
        var row = parseInt(ii / width);
        var col = ii % width;
        if(row == 0 || col == 0) continue;

        var A = ((row - 1) *  width + (col - 1)) * 4;
        var B = ((row - 1) * width + col) * 4;
        var E = (ii - 1) * 4;

        for(var j = 0;j < 3;j ++){
            var delta = data[i + j] - (data[B + j] + data[E + j] + data[A + j]) / 3;
            data[i + j] += delta * lamta;
        }
    }

    return imgData;
};

/**
 * @description: 灰度处理
 * @modify: 灰度算法改成加权平均值 (0.299, 0.578, 0.114)
 */
THREE.JX.JXFilter.toGray = function(imgData) {
    var data = imgData.data;

    for(var i = 0,n = data.length;i < n;i += 4){
        var gray = parseInt((0.299 * data[i] + 0.578 * data[i + 1] + 0.114 * data[i + 2]));
        data[i + 2] = data[i + 1] = data[i] = gray;
    }

    imgData.data = data;

    return imgData;
};


/**
 * @description:灰度阈值 做只有2级灰度图像处理 
 *
 */
THREE.JX.JXFilter.toThresh = function(imgData, arg){
    imgData = THREE.JX.JXFilter.toGray(imgData);
    var data = imgData.data;

    var arg = arg[0] || 128;
    for(var i = 0,n = data.length;i < n;i ++){
        if((i + 1) % 4){
            data[i] = data[i] > arg ? 255 : 0;
        }
    }

    imgData.data = data;

    return imgData;
};

/**
 * @description: 反色
 *
 */
THREE.JX.JXFilter.toReverse = function(imgData){
    var data = imgData.data;

    for(var i = 0,n = data.length;i < n;i += 4){
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }

    imgData.data = data;

    return imgData;
};

//////////////////////////////////////////////alteration//////////////////////////////////////////////////
/**
 * @description: 调整亮度对比度
 *
 */

THREE.JX.JXFilter.brightness = function(imgData, args) {
    var data = imgData.data;
    var brightness = args[0] / 50;// -1,1
    var arg2 = args[1] || 0;
    var c = arg2 / 50;// -1,1
    var k = Math.tan((45 + 44 * c) * Math.PI / 180);

    for(var i = 0,n = data.length;i < n;i += 4){
        for(var j = 0;j < 3;j ++){
            data[i + j] = (data[i + j] - 127.5 * (1 - brightness)) * k + 127.5 * (1 + brightness);
        }
    }

    return imgData;
};

/**
 * @description:    曲线 
 *
 */

THREE.JX.JXFilter.curve = function(imgData, arg) {
    /*
     * arg   arg[0] = [3,3] ,arg[1]  = [2,2]
     * */

    //获得插值函数
    var f = THREE.JX.JXFilterMath.lagrange(arg[0], arg[1]);
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;

    //调节通道
    var channel = arg[2];
    if(!(/[RGB]+/.test(channel))){
        channel = "RGB";
    }
    
    var channelString = channel.replace("R","0").replace("G","1").replace("B","2");
    
    var indexOfArr = [
        channelString.indexOf("0") > -1,
        channelString.indexOf("1") > -1,
        channelString.indexOf("2") > -1
    ];

    //区块
    for(var x = 0; x < width; x ++){

        for(var y = 0; y < height; y ++){
            
            var realI = y * width + x;

            for(var j = 0; j < 3; j ++){
                if(! indexOfArr[j]) continue;
                data[realI * 4 + j] = f(data[realI * 4 + j]);
            }

        }

    }

    return imgData;
};

/**
 * @description: gamma调节
 *
 */
THREE.JX.JXFilter.gamma = function(imgData, args){
    var data = imgData.data;
    var width = imgData.width;
    var height = imgData.height;

    //gamma阶-100， 100
    var gamma;

    if(args[0] == undefined) gamma = 10;
    else gamma = args[0];

    var normalizedArg = ((gamma + 100) / 200) * 2;
    
    for(var x = 0; x < width; x ++){
        for(var y = 0; y < height; y ++){
            THREE.JX.JXFilterMath.xyCal(imgData, x, y, function(r, g, b){
                return [
                    Math.pow(r, normalizedArg),
                    Math.pow(g, normalizedArg),
                    Math.pow(b, normalizedArg)
                ];
            });
        }
    }
    return imgData;
};

/**
 * @description:  可选颜色 
 * @参考：http://wenku.baidu.com/view/e32d41ea856a561252d36f0b.html
 *
 */
THREE.JX.JXFilter.selectiveColor = function(imgData, arg){//调节亮度对比度
    //选择的颜色
    var color = arg[0];

    //百分数
    var C = arg[1];
    var M = arg[2];
    var Y = arg[3];
    var K = arg[4];

    //是否相对
    var isRelative = arg[5] || 0;

    var maxColorMap = {
        red: "R",
        green: "G",
        blue: "B",
        "红色": "R",
        "绿色": "G",
        "蓝色": "B"
    };

    var minColorMap = {
        cyan: "R",
        magenta: "G",
        yellow: "B",
        "青色": "R",
        "洋红": "G",
        "黄色": "B"
    };

    //检查是否是被选中的颜色
    var checkSelectedColor = function(colorObj){
        if(maxColorMap[color]){
            return Math.max(colorObj.R, colorObj.G, colorObj.B) == colorObj[maxColorMap[color]];
        }else if(minColorMap[color]){
            return Math.min(colorObj.R, colorObj.G, colorObj.B) == colorObj[minColorMap[color]];
        }else if(color == "black" || color == "黑色"){
            return Math.min(colorObj.R, colorObj.G, colorObj.B) < 128;
        }else if(color == "white" || color == "白色"){
            return Math.max(colorObj.R, colorObj.G, colorObj.B) > 128;
        }else if(color == "中性色"){
            return ! ((Math.max(colorObj.R, colorObj.G, colorObj.B) < 1) || (Math.min(colorObj.R, colorObj.G, colorObj.B) > 224));
        }
    };

    var upLimit = 0;
    var lowLimit = 0;
    var limit = 0;

    var alterNum = [C, M, Y, K];
    for(var x = 0, w = imgData.width; x < w; x ++){
        for(var y = 0, h = imgData.height; y < h; y ++){
            THREE.JX.JXFilterMath.xyCal(imgData, x, y, function(R, G, B){
                var colorObj = {
                    R: R,
                    G: G,
                    B: B
                };

                var colorArr = [R, G, B];
                var resultArr =[];

                if(checkSelectedColor(colorObj)){
                    if(maxColorMap[color]){
                        var maxColor = maxColorMap[color];

                        var middleValue = R + G + B - Math.max(R, G, B) - Math.min(R, G, B);
                        limit = colorObj[maxColor] - middleValue;
                    }else if(minColorMap[color]){
                        var minColor = minColorMap[color];

                        var middleValue = R + G + B - Math.max(R, G, B) - Math.min(R, G, B);
                        limit = middleValue - colorObj[minColor]  ;
                    }else if(color == "black" || color == "黑色"){
                        limit = parseInt(127.5 - Math.max(R, G, B)) * 2;
                    }else if(color == "white" || color == "白色"){
                        limit = parseInt(Math.min(R, G, B) - 127.5) * 2;
                    }else if(color == "中性色"){
                        limit = 255 - (Math.abs(Math.max(R, G, B) - 127.5) + Math.abs(Math.min(R, G, B) - 127.5));
                    }else{
                        return;
                    }

                    for(var i = 0; i < 3; i ++){
                        //可减少到的量
                        var lowLimitDelta = parseInt(limit * (colorArr[i] / 255));
                        var lowLimit = colorArr[i] - lowLimitDelta;

                        //可增加到的量
                        var upLimitDelta =  parseInt(limit * (1 - colorArr[i] / 255));
                        var upLimit = colorArr[i] + upLimitDelta;

                        //将黑色算进去 得到影响百分比因子
                        var factor = (alterNum[i] + K + alterNum[i] * K);

                        //相对调节
                        if(isRelative){
                            //如果分量大于128  减少量=增加量
                            if(colorArr[i] > 128){
                                lowLimitDelta = upLimitDelta;
                            }

                            //先算出黑色导致的原始增量
                            if(K > 0){
                                var realUpLimit = colorArr[i] - K * lowLimitDelta; 
                            }else{
                                var realUpLimit = colorArr[i] - K * upLimitDelta; 
                            }

                            //标准化
                            if(realUpLimit > upLimit) realUpLimit = upLimit;
                            if(realUpLimit < lowLimit) realUpLimit = lowLimit;

                            upLimitDelta = upLimit - realUpLimit;
                            lowLimitDelta = realUpLimit - lowLimit;

                            if(K < 0){
                                lowLimitDelta = upLimitDelta;
                            }else{
                            }

                            //> 0表明在减少
                            if(alterNum[i] > 0){
                                realUpLimit -= alterNum[i] * lowLimitDelta; 
                            }else{
                                realUpLimit -= alterNum[i] * upLimitDelta; 
                            }


                        }else{

                            //现在量
                            var realUpLimit = limit * - factor + colorArr[i];

                        }

                        if(realUpLimit > upLimit) realUpLimit = upLimit;
                        if(realUpLimit < lowLimit) realUpLimit = lowLimit;
                        
                        resultArr[i] = realUpLimit;
                    }

                    return resultArr;
                }
            });//end xyCal
        }//end forY
    }//end forX

    return imgData;

};//end process Method


/**
 * @description: 调整RGB 饱和和度  
 * H (-2*Math.PI , 2 * Math.PI)  S (-100,100) I (-100,100)
 * 着色原理  勾选着色后，所有的像素不管之前是什么色相，都变成当前设置的色相，
 * 然后饱和度变成现在设置的饱和度，但保持明度为原来的基础上加上设置的明度
 *
 */
THREE.JX.JXFilter.setHSI = function(imgData,arg){//调节亮度对比度
    arg[0] = arg[0] / 180 * Math.PI;
    arg[1] = arg[1] / 100 || 0;
    arg[2] = arg[2] / 100 * 255 || 0;
    arg[3] = arg[3] || false;//着色
    
    //调节通道
    var channel = arg[4];
    if(!(/[RGBCMY]+/.test(channel))){
        channel = "RGBCMY";
    }
    
    var letters = channel.split("");
    var indexOf = {};

    for(var i = 0; i < letters.length; i ++){
        indexOf[letters[i]] = 1;
    }

    THREE.JX.JXFilterMath.applyInHSI(imgData,function(i, color){
        if(! indexOf[color]) return;

        if(arg[3]){
            i.H = arg[0];
            i.S = arg[1];
            i.I += arg[2];
        }else{
            i.H += arg[0];
            i.S += arg[1];
            i.I += arg[2];
        }

    });

    return imgData;
};
