//import * as ort from 'onnxruntime-web';

var vertexShaderText =
    `
        precision mediump float;
        
        attribute vec3 vertPosition;
        attribute vec3 vertColor;
        attribute vec3 vertNormal;

        varying vec3 fragColor;
        varying vec3 fragNormal;
        
        uniform mat4 mModel;
        uniform mat4 mView;
        uniform mat4 mProj;

        varying float height;

        varying vec4 position;

        varying vec3 nPosition;

        float random(vec2 st)
        {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main()
        {
            //vec2 st = gl_FragColor.xy / u_resolution.xy;

            //float rnd = random(st);

            fragColor = vertColor;
            //fragNormal = (mModel * vec4(vertNormal, 0.0)).xyz;
            fragNormal = vertNormal;
            
            gl_Position = mProj * mView * mModel * vec4(vertPosition, 1.0);
            
            nPosition = vec3(mModel * vec4(vertPosition, 1.0));
            
            //gl_Position.y += rnd;
            position = gl_Position;
            height = vertPosition.y;
        }
    `;


var fragmentShaderText1 =
    `
        precision mediump float;

        varying vec3 fragColor;

        //uniform float aspect;
        //uniform float border_width;
        //uniform float width;
        //uniform float height;
        uniform float maxHeight;
        uniform float minHeight;

        varying vec3 fragNormal;

        varying float height;

        varying vec4 position;

        varying vec3 nPosition;

        vec3 getColor(float f)
        {
            float a = (1.0 - f) * 4.0;
            int x = int(floor(a));
            float y = a - floor(a);
            float r = 0.0;
            float g = 0.0;
            float b = 0.0;
            if (x == 0)
            {
                r = 1.0;
                g = y;
                b = 0.0;
            }
            else if (x == 1)
            {
                r = 1.0 - y;
                g = 1.0;
                b = 0.0;
            }
            else if (x == 2)
            {
                r = 0.0;
                g = 1.0;
                b = y;
            }
            else if (x == 3)
            {
                r = 0.0;
                g = 1.0 - y;
                b = 1.0;
            }
            else if (x == 4)
            {
                r = 0.0;
                g = 0.0;
                b = 1.0;
            }
            return vec3(r, g, b);
        }

        void main()
        {
            //float maxX = 1.0 - border_width;
            //float minX = border_width;
            //float maxY = maxX / aspect;
            //float minY = minX / aspect;

            //float x = (1.0 + position.x / position.z) / 2.0;
            //float y = (1.0 - position.y / position.z) / 2.0;

            //if (x < maxX && x > minX && y < maxY && y > minY)
            //{
            //    gl_FragColor = vec4(fragColor, 1.0);
            //}
            //else
            //{
            //    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            //}
            vec3 c = fragColor;
            //gl_FragColor = vec4(fragColor, 1.0);
            //gl_FragColor = vec4(c.r > c.g && c.r > c.b ? c.r : 0.0, c.g > c.r && c.g > c.b ? c.g : 0.0, c.b > c.r && c.b > c.g ? c.b : 0.0, 1.0 );
            
            gl_FragColor = vec4(getColor((height - minHeight) / (maxHeight - minHeight)), 1.0);
            //gl_FragColor = vec4(fragColor, 1.0);
        }
    `;

var fragmentShaderText2 =
    `
        #extension GL_OES_standard_derivatives : enable

        precision mediump float;

        varying vec3 fragColor;

        varying vec4 position;

        varying vec3 fragNormal;

        varying vec3 nPosition;

        void main()
        {
            //vec3 ambientLightIntensity = vec3(0.2, 0.2, 0.3);
            //vec3 sunlightIntensity = vec3(0.7, 0.6, 0.4);
            //vec3 sunlightDirection = normalize(vec3(1.0, -4.0, 0.0));

            //vec4 texel = texture2D()

            vec3 dx = dFdx(nPosition);
            vec3 dy = dFdy(nPosition);

            vec3 normal = normalize(cross(dx, dy));

            vec3 lightDirection = normalize(vec3(-1.0, 1.0, -1.0));

            float brightness = max(dot(lightDirection, normal), 0.0);

            gl_FragColor = vec4(fragColor * 0.2 + fragColor * brightness * 0.8, 1.0);
            //gl_FragColor = vec4(fragColor, 1.0);
        }
    `;

function InitDemo() {
    console.log("It's working");
    //console.log(mathCalc.pointOnTriangle(0, 0, -3, 2, -1, -1, 2, 4, 3, 3, -1));
    var SQRT32 = Math.sqrt(3) / 2;
    var SCREEN_EPSILON = 10;
    var pointInsideCircle = function (px, py, x, y) {
        return Math.pow(x - px, 2) + Math.pow(y - py, 2) <= Math.pow(SCREEN_EPSILON, 2);
    };
    var distance2 = function (px, py, x, y) {
        return Math.pow(x - px, 2) + Math.pow(y - py, 2);
    };

    var ortSession = null;

    async function load() {
        try {
            //console.log('check');
            //const session = await new ort.InferenceSession.create("./onnx_model_5.onnx");
            //console.log(session);
            ortSession = await ort.InferenceSession.create("./onnx_model_6.onnx",
                //    { executionProviders: ['wasm'] }
                //);
                //console.log(session);
                { executionProviders: ["wasm"] });
            //console.log(session);
            return ortSession;
        } catch (e) {
            document.write(`failed to inference ONNX model: ${e}.`);
        }
    }

    load().then(() => {
        console.log("Модель готова к использованию");
    });

    //console.log(mathCalc.ABRACADABRA);
    //console.log(mathCalc.findPointOnSegment([0, 1, 1], [1, 2, 3], 1));
    //console.log(mathCalc.findPointOnOrtSegment([0, 1, 1], [1, 2, 3], 1));
    //console.log(mathCalc.findPointOnOrtSegment([1, 2, 3], [2, 3, 5], 1));

    //var canvas = document.getElementById("canvas");
    var canvases = document.getElementsByTagName("canvas");
    //console.log(canvases);
    var canvas = canvases[0];
    var gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

    const ext1 = gl.getExtension("OES_element_index_uint");
    if (ext1) {
        console.log("extension works")
    }
    else {
        console.log("extension doesn't work")
    }

    const ext2 = gl.getExtension("OES_standard_derivatives");
    if (ext2) {
        console.log("extension works")
    }
    else {
        console.log("extension doesn't work")
    }

    //gl.canvas.width = window.;
    //gl.canvas.height = 500;
    //console.log(canvas.width, canvas.height);
    //console.log(canvas.clientWidth, canvas.clientHeight);

    var canvas2 = canvases[1];
    var ctx = canvas2.getContext("2d");

    var canvas3 = canvases[2];
    var image_ctx = canvas3.getContext('2d');

    var canvas4 = canvases[3];
    var mask_ctx = canvas4.getContext('2d');

    //var contextScale = 10;

    var CANVAS_SCALE = 1

    canvas.width = CANVAS_SCALE * canvas.clientWidth;
    canvas.height = CANVAS_SCALE * canvas.clientHeight;

    canvas2.width = canvas2.clientWidth;
    canvas2.height = canvas2.clientHeight;

    //console.log(canvas3.clientWidth, canvas3.clientHeight, canvas4.clientWidth, canvas4.clientHeight);

    canvas3.width = canvas3.clientWidth;
    canvas3.height = canvas3.clientHeight

    canvas4.width = canvas4.clientWidth;
    canvas4.height = canvas4.clientHeight;

    //console.log(canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //console.log(canvas.width, canvas.height);
    //console.log(canvas.clientWidth, canvas.clientHeight);


    if (!gl) {
        console.log("include experimental-webgl");
        gl = canvas.getContext("experimental-webgl");
    }

    if (!gl) {
        alert("browser doesn't support webgl");
    }

    if (!ctx) {
        alert("browser doesn't support canvas 2d context");
    }

    //ctx.translate(canvas2.width / 2, canvas2.height);
    //var contextScale = 10;
    //ctx.scale(contextScale, -contextScale);

    //ctx.clearRect(0, 0, canvas2.width, canvas2.height);
    //ctx.beginPath();
    //ctx.moveTo(75, 50);
    //ctx.lineTo(100, 75);
    //ctx.lineTo(100, 25);
    //ctx.lineTo(75, 50);
    //ctx.stroke();

    //drawArray([[0, 0], [120, 100]]);

    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;

    //gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    //gl.clearColor(0, 0.3, 0.3, 0.3);
    gl.clearColor(0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.enable(gl.POLYGON_OFFSET_FILL);
    //gl.polygonOffset(2, 3);


    var roverMode = false;
    var roverCameraShift = 9;

    //gl.depthRange(0.2, 0.8);

    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW);
    //gl.cullFace(gl.BACK);

    //gl.lineWidth(5);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader1 = gl.createShader(gl.FRAGMENT_SHADER);
    var fragmentShader2 = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader1, fragmentShaderText1);
    gl.shaderSource(fragmentShader2, fragmentShaderText2);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader1);
    if (!gl.getShaderParameter(fragmentShader1, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader1));
        return;
    }

    gl.compileShader(fragmentShader2);
    if (!gl.getShaderParameter(fragmentShader2, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader2));
        return;
    }

    var program1 = gl.createProgram();
    gl.attachShader(program1, vertexShader);
    gl.attachShader(program1, fragmentShader1);
    gl.linkProgram(program1);
    if (!gl.getProgramParameter(program1, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program1));
        return;
    }
    gl.validateProgram(program1);
    if (!gl.getProgramParameter(program1, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program1));
        return;
    }

    var program2 = gl.createProgram();
    gl.attachShader(program2, vertexShader);
    gl.attachShader(program2, fragmentShader2);
    gl.linkProgram(program2);
    if (!gl.getProgramParameter(program2, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program2));
        return;
    }
    gl.validateProgram(program2);
    if (!gl.getProgramParameter(program2, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program2));
        return;
    }

    //
    // Create buffer
    //

    var MODEL_SCALE = 4;
    var pathEpsilon = 0.001;

    var redHeight = 1.0;//1.0
    var greenHeight = 0.5;//0.5
    var blueHeight = 0.0;//0.0

    var boxVertices = [];

    var fieldWidth = 300;//20;
    var fieldHeight = 300;//20;

    var maxHeight = -Infinity;
    var minHeight = Infinity;

    //var randomHeights = [];

    //for (var i = 0; i < fieldWidth * fieldHeight; i++) {
    //    randomHeights.push(20 * Math.random());
    //}

    //console.log(randomHeights);

    var mod289 = function (v) {
        return v.map(x => x - Math.floor(x * (1.0 / 289.0)) * 289.0);
    }

    var permute = function (v) {
        return mod289(v.map(x => (x * 34.0 + 1.0) * x));
    }

    var noise = function (vx, vy) {
        var C = [0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439];
        var i = [Math.floor(vx + C[1] * (vx + vy)), Math.floor(vy + C[1] * (vx + vy))];
        var x0 = [vx - i[0] + C[0] * (i[0] + i[1]), vy - i[1] + C[0] * (i[0] + i[1])];
        var i1 = x0[0] > x0[1] ? [1.0, 0.0] : [0.0, 1.0];
        var x1 = [x0[0] + C[0] - i1[0], x0[1] + C[0] - i1[1]];
        var x2 = [x0[0] + C[2], x0[1] + C[2]];
        i = mod289(i);
        var p1 = permute([i[1], i[1] + i1[1], 1.0 + i[1]]);
        var p = permute([p1[0] + i[0], p1[0] + i[0] + i1[0], p1[0] + i[0] + 1.0]);
        var m = [Math.max(0.5 - x0[0] * x0[0] - x0[1] * x0[1], 0.0), Math.max(0.5 - x1[0] * x1[0] - x1[1] * x1[1], 0.0), Math.max(0.5 - x2[0] * x2[0] - x2[1] * x2[1], 0.0)];
        m.map(x => x * x);
        m.map(x => x * x);
        var x = p.map(x => (x * C[3] - Math.floor(x * C[3])) * 2.0 - 1.0);
        var h = x.map(x => Math.abs(x) - 0.5);
        var ox = x.map(x => Math.floor(x + 0.5));
        var a0 = x.map((x, idx) => x - ox[idx]);
        m.map((x, idx) => x * (1.79284291400159 - 0.85373472095314 * (a0.map(x => x * x)[idx] + h.map(x => x * x)[idx])));
        var g = [a0[0] * x0[0] + h[0] * x0[1], a0[1] * x1[0] + h[1] * x1[1], a0[2] * x2[0] + h[2] * x2[1]];
        return 130.0 * (m[0] * g[0] + m[1] * g[1] + m[2] * g[2]);
    }

    var bilinearInterpolation = function (x, y, f00, f01, f10, f11) {
        return f00 * (1 - x) * (1 - y) + f01 * (1 - x) * y + f10 * x * (1 - y) + f11 * x * y;
    }

    var smooth = function (x) {
        return x * x * (3 - 2 * x);
    }

    var smoother = function (x) {
        return x * x * x * (6 * x * x - 15 * x + 10);
    }

    var smoothInterpolation = function (x, y, f00, f01, f10, f11) {
        var u = smooth(x); //smoother
        var v = smooth(y); //smoother
        return f00 * (1 - u) + f10 * u + (f01 - f00) * v * (1 - u) + (f11 - f10) * u * v;
    }

    var perlinTick = 40;

    var randomHeights = [];
    var HEIGHT_SCALE = 10;

    var widthRH = Math.floor((fieldWidth - 1) * SQRT32 / perlinTick) + 2;
    var heightRH = Math.floor((fieldHeight - 0.5) / perlinTick) + 2;

    for (var i = 0; i < widthRH; i++) {
        for (var j = 0; j < heightRH; j++) {
            //console.log(i * SQRT32 * perlinTick, (j + (i % 2) / 2) * perlinTick);
            //console.log(i * perlinTick, j * perlinTick);
            randomHeights.push(HEIGHT_SCALE * Math.random());
        }
    }

    //console.log(widthRH, heightRH);
    //console.log(randomHeights);

    var randint = function (min_value, max_value) {
        return Math.floor(Math.random() * (max_value - min_value)) + min_value;
    }

    //console.log(createSmallRock());

    var displacementMap = [];

    for (var i = 0; i < fieldWidth * fieldHeight; i++) {
        displacementMap.push(Math.random());
    }

    for (var i = 0; i < fieldWidth; i++) {
        for (var j = 0; j < fieldHeight; j++) {
            boxVertices.push(MODEL_SCALE * i * SQRT32, 0.0, MODEL_SCALE * (j + (i % 2) / 2), 0.5, 0.5, 0.5);
        }
    }

    for (var i = 0; i < fieldWidth; i++) {
        for (var j = 0; j < fieldHeight; j++) {
            //console.log(`${i * SQRT32}, ${j + (i % 2) / 2}`);
            //var tmpHeight = 2 * Math.random();
            //var tmpHeight = (
            //    (0 <= i * fieldHeight + j - 1 && i * fieldHeight + j - 1 < fieldWidth * fieldHeight) ? randomHeights[i * fieldHeight + j - 1] : 0.0 +
            //        (0 <= i * fieldHeight + j + 1 && i * fieldHeight + j + 1 < fieldWidth * fieldHeight) ? randomHeights[i * fieldHeight + j + 1] : 0.0 +
            //            (0 <= (i + 1) * fieldHeight + j - 1 + i % 2 && (i + 1) * fieldHeight + j - 1 + i % 2 < fieldWidth * fieldHeight) ? randomHeights[(i + 1) * fieldHeight + j - 1 + i % 2] : 0.0 +
            //                (0 <= (i + 1) * fieldHeight + j + i % 2 && (i + 1) * fieldHeight + j + i % 2 < fieldWidth * fieldHeight) ? randomHeights[(i + 1) * fieldHeight + j + i % 2] : 0.0 +
            //                    (0 <= (i - 1) * fieldHeight + j - 1 + i % 2 && (i - 1) * fieldHeight + j - 1 + i % 2 < fieldWidth * fieldHeight) ? randomHeights[(i - 1) * fieldHeight + j - 1 + i % 2] : 0.0 +
            //                        (0 <= (i - 1) * fieldHeight + j + i % 2 && (i - 1) * fieldHeight + j + i % 2 < fieldWidth * fieldHeight) ? randomHeights[(i - 1) * fieldHeight + j + i % 2] : 0.0
            //) / 6;
            //console.log(i * SQRT32, j + (i % 2) / 2);
            //console.log(Math.floor(i * SQRT32 / perlinTick), Math.floor((j + (i % 2) / 2) / perlinTick));
            //console.log(randomHeights[Math.floor(i * SQRT32 / perlinTick) * heightRH + Math.floor((j + (i % 2) / 2) / perlinTick)]);
            //var tmpHeight = noise(i / fieldWidth - 0.5, j / fieldHeight - 0.5);
            //console.log(tmpHeight);

            var interI = Math.floor(i * SQRT32 / perlinTick);
            var interJ = Math.floor((j + (i % 2) / 2) / perlinTick);
            //console.log(i * SQRT32 / perlinTick - interI, (j + (i % 2) / 2) / perlinTick - interJ);
            //console.log(interI, interJ, interI + 1, interJ + 1);

            var tmpHeight = smoothInterpolation( // bilinear or smooth
                i * SQRT32 / perlinTick - interI,
                (j + (i % 2) / 2) / perlinTick - interJ,
                randomHeights[interI * heightRH + interJ],
                randomHeights[interI * heightRH + interJ + 1],
                randomHeights[(interI + 1) * heightRH + interJ],
                randomHeights[(interI + 1) * heightRH + interJ + 1],
            ) * HEIGHT_SCALE * 1.2; //+ displacementMap[i * fieldHeight + j] * HEIGHT_SCALE * 0.0;

            tmpHeight += (Math.random() - 0.5) * HEIGHT_SCALE * 0.1;

            //console.log(tmpHeight);

            //tmpHeight = Math.random() * HEIGHT_SCALE;


            maxHeight = Math.max(maxHeight, tmpHeight);
            minHeight = Math.min(minHeight, tmpHeight);
            //var tmpRed = Math.random();
            //var tmpGreen = Math.random();
            //var tmpBlue = Math.random();
            //var tmpRed = 0.0;
            //var tmpGreen = 1.0;
            //var tmpBlue = 0.0;
            ////console.log(tmpHeight);
            //if (blueHeight <= tmpHeight && tmpHeight <= greenHeight) {
            //    tmpRed = 0.0;
            //    tmpGreen = (tmpHeight - blueHeight) / (greenHeight - blueHeight);
            //    tmpBlue = 1 - (tmpHeight - blueHeight) / (greenHeight - blueHeight);
            //}
            //if (greenHeight <= tmpHeight && tmpHeight <= redHeight) {
            //    tmpRed = (tmpHeight - greenHeight) / (redHeight - greenHeight);
            //    tmpGreen = 1 - (tmpHeight - greenHeight) / (redHeight - greenHeight);
            //    tmpBlue = 0.0;
            //}
            //if (tmpHeight < blueHeight) {
            //    tmpBlue = 1.0;
            //}
            //if (redHeight < tmpHeight) {
            //    tmpRed = 1.0;
            //}
            //console.log(tmpRed, tmpGreen, tmpBlue);
            //boxVertices.push(MODEL_SCALE * i * SQRT32, MODEL_SCALE * tmpHeight, MODEL_SCALE * (j + (i % 2) / 2), tmpHeight, tmpHeight, tmpHeight);

            //boxVertices.push(MODEL_SCALE * i * SQRT32, tmpHeight, MODEL_SCALE * (j + (i % 2) / 2), 0.5, 0.5, 0.5);
            boxVertices[6 * (i * fieldHeight + j) + 1] = tmpHeight;

            //boxVertices.push(MODEL_SCALE * i * SQRT32, MODEL_SCALE * tmpHeight, MODEL_SCALE * (j + (i % 2) / 2), Math.random(), Math.random(), Math.random());
        }
    }

    var createSmallRock = function () {
        var r_i = randint(0, fieldWidth);
        var r_j = randint(0, fieldHeight);
        var top = [
            [r_i, r_j]
        ];
        return top;
    }

    var smallRocks = Array.from({ length: 200 }, (_, i) => createSmallRock()); //200
    //var smallRocks = [];

    for (const items of smallRocks) {

        for (const item of items) {

            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 1] += 0.3 * HEIGHT_SCALE + (Math.random() - 0.5) * HEIGHT_SCALE;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 3] = 0.8;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 4] = 0.8;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 5] = 0.8;
        }
    }

    var createMediumRock = function () {
        var r_i = randint(0, fieldWidth - 1);
        var r_j = randint(0, fieldHeight - 1);
        var top = [
            [r_i, r_j],
            [r_i, r_j + 1],
            [r_i + 1, r_j + r_i % 2]
        ];
        return top;
    }

    var mediumRocks = Array.from({ length: 150 }, (_, i) => createMediumRock()); //150
    //var smallRocks = [];

    for (const items of mediumRocks) {

        for (const item of items) {

            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 1] += 0.5 * HEIGHT_SCALE + (Math.random() - 0.5) * HEIGHT_SCALE;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 3] = 0.8;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 4] = 0.8;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 5] = 0.8;
        }
    }

    var createBigRock = function () {
        var r_i = randint(1, fieldWidth - 2);
        var r_j = randint(1, fieldHeight - 2);
        var top = [
            [r_i, r_j],
            [r_i, r_j + 1],
            [r_i + 1, r_j + r_i % 2 - 1],
            [r_i + 1, r_j + r_i % 2],
            [r_i + 1, r_j + r_i % 2 + 1],
            [r_i + 2, r_j],
            [r_i + 2, r_j + 1]
        ];
        return top;
    }

    var bigRocks = Array.from({ length: 100 }, (_, i) => createBigRock()); //100
    //var bigRocks = [];

    for (const items of bigRocks) {

        for (const item of items) {

            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 1] += 1.0 * HEIGHT_SCALE + (Math.random() - 0.5) * HEIGHT_SCALE;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 3] = 0.8;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 4] = 0.8;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 5] = 0.8;
        }
    }

    var createHugeRock = function () {
        var r_i = randint(3, fieldWidth - 5);
        var r_j = randint(3, fieldHeight - 5);
        var top = [
            [r_i, r_j],
            [r_i, r_j + 1],
            [r_i, r_j + 2],

            [r_i + 1, r_j + r_i % 2 - 1],
            [r_i + 1, r_j + r_i % 2],
            [r_i + 1, r_j + r_i % 2 + 1],
            [r_i + 1, r_j + r_i % 2 + 2],

            [r_i + 2, r_j - 1],
            [r_i + 2, r_j],
            [r_i + 2, r_j + 1],
            [r_i + 2, r_j + 2],
            [r_i + 2, r_j + 3],

            [r_i + 3, r_j + r_i % 2 - 1],
            [r_i + 3, r_j + r_i % 2],
            [r_i + 3, r_j + r_i % 2 + 1],
            [r_i + 3, r_j + r_i % 2 + 2],

            [r_i + 4, r_j],
            [r_i + 4, r_j + 1],
            [r_i + 4, r_j + 2],
        ];
        return top;
    }

    var hugeRocks = Array.from({ length: 50 }, (_, i) => createHugeRock()); //50
    //var bigRocks = [];

    for (const items of hugeRocks) {

        for (const item of items) {

            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 1] += 2.0 * HEIGHT_SCALE + (Math.random() - 0.5) * HEIGHT_SCALE;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 3] = 0.8;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 4] = 0.8;
            boxVertices[6 * (item[0] * fieldHeight + item[1]) + 5] = 0.8;
        }
    }

    //for (var i = 0; i < fieldWidth; i++) {
    //    for (var j = 0; j < fieldHeight; j++) {
    //
    //        //boxVertices[6 * (i * fieldHeight + j)]
    //        //boxVertices[6 * (i * fieldHeight + j) + 1]
    //        //boxVertices[6 * (i * fieldHeight + j) + 2]
    //
    //    }
    //}

    var createNormalMap = function (box, w, h) {
        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {

                var a = [box[6 * (i * h + j)], box[6 * (i * h + j) + 1], box[6 * (i * h + j) + 2]];
                var b = [box[6 * (i * h + j)], box[6 * (i * h + j) + 1], box[6 * (i * h + j) + 2]];
            }
        }
    }

    //console.log(boxVertices);

    for (var i = 0; i < fieldWidth; i++) {
        for (var j = 0; j < fieldHeight; j++) {
            //console.log(`${i * SQRT32}, ${j + (i % 2) / 2}`);
            boxVertices.push(
                boxVertices[6 * (i * fieldHeight + j)],
                boxVertices[6 * (i * fieldHeight + j) + 1],
                boxVertices[6 * (i * fieldHeight + j) + 2],
                0.0, 0.0, 0.0);
        }
    }

    var roverScale = 10.0;

    //cube rover
    //boxVertices.push(1, 0, 1, 1.0, 0.0, 1.0);
    //boxVertices.push(1, 0, -1, 1.0, 0.0, 1.0);
    //boxVertices.push(-1, 0, 1, 1.0, 0.0, 1.0);
    //boxVertices.push(-1, 0, -1, 1.0, 0.0, 1.0);
    //boxVertices.push(1, 2, 1, 1.0, 0.0, 1.0);
    //boxVertices.push(1, 2, -1, 1.0, 0.0, 1.0);
    //boxVertices.push(-1, 2, 1, 1.0, 0.0, 1.0);
    //boxVertices.push(-1, 2, -1, 1.0, 0.0, 1.0);
    //black lines
    //boxVertices.push(1, 0, 1, 0.0, 0.0, 0.0);
    //boxVertices.push(1, 0, -1, 0.0, 0.0, 0.0);
    //boxVertices.push(-1, 0, 1, 0.0, 0.0, 0.0);
    //boxVertices.push(-1, 0, -1, 0.0, 0.0, 0.0);
    //boxVertices.push(1, 2, 1, 0.0, 0.0, 0.0);
    //boxVertices.push(1, 2, -1, 0.0, 0.0, 0.0);
    //boxVertices.push(-1, 2, 1, 0.0, 0.0, 0.0);
    //boxVertices.push(-1, 2, -1, 0.0, 0.0, 0.0);

    //cube rover
    //boxVertices.push(roverScale, 0, roverScale, 1.0, 0.0, 1.0);
    //boxVertices.push(roverScale, 0, -roverScale, 1.0, 0.0, 1.0);
    //boxVertices.push(-roverScale, 0, roverScale, 1.0, 0.0, 1.0);
    //boxVertices.push(-roverScale, 0, -roverScale, 1.0, 0.0, 1.0);
    //boxVertices.push(roverScale, 2 * roverScale, roverScale, 1.0, 0.0, 1.0);
    //boxVertices.push(roverScale, 2 * roverScale, -roverScale, 1.0, 0.0, 1.0);
    //boxVertices.push(-roverScale, 2 * roverScale, roverScale, 1.0, 0.0, 1.0);
    //boxVertices.push(-roverScale, 2 * roverScale, -roverScale, 1.0, 0.0, 1.0);
    //down
    boxVertices.push(roverScale, 0, roverScale, 1.0, 1.0, 0.0);
    boxVertices.push(roverScale, 0, -roverScale, 1.0, 1.0, 0.0);
    boxVertices.push(-roverScale, 0, roverScale, 1.0, 1.0, 0.0);
    boxVertices.push(-roverScale, 0, -roverScale, 1.0, 1.0, 0.0);
    //up
    boxVertices.push(roverScale, 2 * roverScale, roverScale, 0.0, 0.0, 1.0);
    boxVertices.push(roverScale, 2 * roverScale, -roverScale, 0.0, 0.0, 1.0);
    boxVertices.push(-roverScale, 2 * roverScale, roverScale, 0.0, 0.0, 1.0);
    boxVertices.push(-roverScale, 2 * roverScale, -roverScale, 0.0, 0.0, 1.0);
    //front
    boxVertices.push(roverScale, 0, roverScale, 1.0, 0.0, 0.0);
    boxVertices.push(roverScale, 0, -roverScale, 1.0, 0.0, 0.0);
    boxVertices.push(roverScale, 2 * roverScale, roverScale, 1.0, 0.0, 0.0);
    boxVertices.push(roverScale, 2 * roverScale, -roverScale, 1.0, 0.0, 0.0);
    //back
    boxVertices.push(-roverScale, 0, roverScale, 0.0, 1.0, 1.0);
    boxVertices.push(-roverScale, 0, -roverScale, 0.0, 1.0, 1.0);
    boxVertices.push(-roverScale, 2 * roverScale, roverScale, 0.0, 1.0, 1.0);
    boxVertices.push(-roverScale, 2 * roverScale, -roverScale, 0.0, 1.0, 1.0);
    //left
    boxVertices.push(roverScale, 0, roverScale, 0.0, 1.0, 0.0);
    boxVertices.push(-roverScale, 0, roverScale, 0.0, 1.0, 0.0);
    boxVertices.push(roverScale, 2 * roverScale, roverScale, 0.0, 1.0, 0.0);
    boxVertices.push(-roverScale, 2 * roverScale, roverScale, 0.0, 1.0, 0.0);
    //right
    boxVertices.push(roverScale, 0, -roverScale, 1.0, 0.0, 1.0);
    boxVertices.push(-roverScale, 0, -roverScale, 1.0, 0.0, 1.0);
    boxVertices.push(roverScale, 2 * roverScale, -roverScale, 1.0, 0.0, 1.0);
    boxVertices.push(-roverScale, 2 * roverScale, -roverScale, 1.0, 0.0, 1.0);
    //black lines
    boxVertices.push(roverScale, 0, roverScale, 0.0, 0.0, 0.0);
    boxVertices.push(roverScale, 0, -roverScale, 0.0, 0.0, 0.0);
    boxVertices.push(-roverScale, 0, roverScale, 0.0, 0.0, 0.0);
    boxVertices.push(-roverScale, 0, -roverScale, 0.0, 0.0, 0.0);
    boxVertices.push(roverScale, 2 * roverScale, roverScale, 0.0, 0.0, 0.0);
    boxVertices.push(roverScale, 2 * roverScale, -roverScale, 0.0, 0.0, 0.0);
    boxVertices.push(-roverScale, 2 * roverScale, roverScale, 0.0, 0.0, 0.0);
    boxVertices.push(-roverScale, 2 * roverScale, -roverScale, 0.0, 0.0, 0.0);
    //forward vector(polygon)

    var forward_vector_width = roverScale / 10;

    //boxVertices.push(0, roverScale, 0, 1.0, 0.0, 1.0);
    //boxVertices.push(0, roverScale, 5 * roverScale, 1.0, 0.0, 1.0);
    boxVertices.push(forward_vector_width, roverScale, 0, 1.0, 0.0, 1.0);
    boxVertices.push(forward_vector_width, roverScale, 5 * roverScale, 1.0, 0.0, 1.0);
    boxVertices.push(- forward_vector_width, roverScale, 5 * roverScale, 1.0, 0.0, 1.0);
    boxVertices.push(- forward_vector_width, roverScale, 0, 1.0, 0.0, 1.0);

    boxVertices.push(forward_vector_width, roverScale, 0, 0.0, 0.0, 0.0);
    boxVertices.push(forward_vector_width, roverScale, 5 * roverScale, 0.0, 0.0, 0.0);
    boxVertices.push(- forward_vector_width, roverScale, 5 * roverScale, 0.0, 0.0, 0.0);
    boxVertices.push(- forward_vector_width, roverScale, 0, 0.0, 0.0, 0.0);

    var roverVerticesLength = 40;

    //console.log(boxVertices.slice(0, fieldWidth * fieldHeight * 6));


    boxVertices = new Float32Array(boxVertices);
    //console.log(boxVertices, typeof (boxVertices));

    var boxIndices = [];

    for (var i = 0; i < fieldWidth - 1; i++) {
        for (var j = 0; j < fieldHeight - 1; j++) {
            var index1 = i * fieldHeight + j;
            var index2 = (i + 1) * fieldHeight + j;
            if (i % 2) {
                boxIndices.push(
                    index1, index2, index2 + 1,
                    index2 + 1, index1, index1 + 1
                );
            }
            else {
                boxIndices.push(
                    index1, index1 + 1, index2,
                    index1 + 1, index2, index2 + 1
                );
            }
        }
    }

    var trianglesLength = (fieldWidth - 1) * (fieldHeight - 1) * 6; //boxIndices.length;

    var offset = fieldWidth * fieldHeight;

    for (var i = 0; i < fieldWidth - 1; i++) {
        for (var j = 0; j < fieldHeight - 1; j++) {
            var index1 = i * fieldHeight + j + offset;
            var index2 = (i + 1) * fieldHeight + j + offset;
            boxIndices.push(
                index1, index1 + 1,
                index1 + 1, index2 + 1,
                index1, index2,
                index2, index2 + 1
            );
            if (i % 2) {
                boxIndices.push(
                    index1, index2 + 1
                );
            }
            else {
                boxIndices.push(
                    index1 + 1, index2
                );
            }
        }
    }

    var linesLength = (fieldWidth - 1) * (fieldHeight - 1) * 10;

    for (var i = 0; i < 6; i++) {
        boxIndices.push(2 * offset + 4 * i, 2 * offset + 4 * i + 1, 2 * offset + 4 * i + 2);
        boxIndices.push(2 * offset + 4 * i + 1, 2 * offset + 4 * i + 2, 2 * offset + 4 * i + 3);
    }

    //boxIndices.push(2 * offset, 2 * offset + 1, 2 * offset + 2);
    //boxIndices.push(2 * offset + 1, 2 * offset + 2, 2 * offset + 3);
    //boxIndices.push(2 * offset + 4, 2 * offset + 5, 2 * offset + 6);
    //boxIndices.push(2 * offset + 5, 2 * offset + 6, 2 * offset + 7);

    //boxIndices.push(2 * offset, 2 * offset + 1, 2 * offset + 4);
    //boxIndices.push(2 * offset + 1, 2 * offset + 4, 2 * offset + 5);
    //boxIndices.push(2 * offset + 2, 2 * offset + 3, 2 * offset + 6);
    //boxIndices.push(2 * offset + 3, 2 * offset + 6, 2 * offset + 7);

    //boxIndices.push(2 * offset, 2 * offset + 2, 2 * offset + 4);
    //boxIndices.push(2 * offset + 2, 2 * offset + 4, 2 * offset + 6);
    //boxIndices.push(2 * offset + 1, 2 * offset + 3, 2 * offset + 5);
    //boxIndices.push(2 * offset + 3, 2 * offset + 5, 2 * offset + 7);

    //var roverLength = 3 * 4 * 3;
    var roverLength = 6 * 2 * 3;
    var roverOffset = 4 * 6;

    boxIndices.push(2 * offset + roverOffset, 2 * offset + roverOffset + 1);
    boxIndices.push(2 * offset + roverOffset + 2, 2 * offset + roverOffset + 3);
    boxIndices.push(2 * offset + roverOffset, 2 * offset + roverOffset + 2);
    boxIndices.push(2 * offset + roverOffset + 1, 2 * offset + roverOffset + 3);

    boxIndices.push(2 * offset + roverOffset + 4, 2 * offset + roverOffset + 5);
    boxIndices.push(2 * offset + roverOffset + 6, 2 * offset + roverOffset + 7);
    boxIndices.push(2 * offset + roverOffset + 4, 2 * offset + roverOffset + 6);
    boxIndices.push(2 * offset + roverOffset + 5, 2 * offset + roverOffset + 7);

    boxIndices.push(2 * offset + roverOffset, 2 * offset + roverOffset + 1);
    boxIndices.push(2 * offset + roverOffset + 4, 2 * offset + roverOffset + 5);
    boxIndices.push(2 * offset + roverOffset, 2 * offset + roverOffset + 4);
    boxIndices.push(2 * offset + roverOffset + 1, 2 * offset + roverOffset + 5);

    boxIndices.push(2 * offset + roverOffset + 2, 2 * offset + roverOffset + 3);
    boxIndices.push(2 * offset + roverOffset + 6, 2 * offset + roverOffset + 7);
    boxIndices.push(2 * offset + roverOffset + 2, 2 * offset + roverOffset + 6);
    boxIndices.push(2 * offset + roverOffset + 3, 2 * offset + roverOffset + 7);

    boxIndices.push(2 * offset + roverOffset, 2 * offset + roverOffset + 2);
    boxIndices.push(2 * offset + roverOffset + 4, 2 * offset + roverOffset + 6);
    boxIndices.push(2 * offset + roverOffset, 2 * offset + roverOffset + 4);
    boxIndices.push(2 * offset + roverOffset + 2, 2 * offset + roverOffset + 6);

    boxIndices.push(2 * offset + roverOffset + 1, 2 * offset + roverOffset + 3);
    boxIndices.push(2 * offset + roverOffset + 5, 2 * offset + roverOffset + 7);
    boxIndices.push(2 * offset + roverOffset + 1, 2 * offset + roverOffset + 5);
    boxIndices.push(2 * offset + roverOffset + 3, 2 * offset + roverOffset + 7);

    //boxIndices.push(2 * offset + roverOffset + 8, 2 * offset + roverOffset + 9);

    var roverLinesLength = 2 * 6 * 4;

    boxIndices.push(2 * offset + roverOffset + 8, 2 * offset + roverOffset + 9, 2 * offset + roverOffset + 10);
    boxIndices.push(2 * offset + roverOffset + 8, 2 * offset + roverOffset + 10, 2 * offset + roverOffset + 11);

    boxIndices.push(2 * offset + roverOffset + 12, 2 * offset + roverOffset + 13);
    boxIndices.push(2 * offset + roverOffset + 13, 2 * offset + roverOffset + 14);
    boxIndices.push(2 * offset + roverOffset + 14, 2 * offset + roverOffset + 15);
    boxIndices.push(2 * offset + roverOffset + 15, 2 * offset + roverOffset + 12);


    //console.log(boxIndices);
    //function onlyUnique(value, index, array) {
    //    return array.indexOf(value) === index;
    //}
    //console.log(boxIndices.filter(onlyUnique));

    boxIndices = new Float32Array(boxIndices);
    //console.log(new Uint32Array(boxIndices));

    //var linesLength = boxIndices.length - trianglesLength;
    //console.log(trianglesLength, linesLength);
    //console.log(Float32Array.BYTES_PER_ELEMENT);


    var normalVertices = [];

    //console.log(boxVertices.length);
    //console.log(6 * (2 * offset + roverVerticesLength));

    //for (var i = 0; i < 2 * offset + roverVerticesLength; i++) {
    //    //normalVertices.push(Math.random(), Math.random(), Math.random());
    //    normalVertices.push(0.0, 1.0, 0.0);
    //}

    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(boxIndices), gl.STATIC_DRAW);

    var positionAttribLocation1 = gl.getAttribLocation(program1, 'vertPosition');//name from shader program
    var colorAttribLocation1 = gl.getAttribLocation(program1, 'vertColor');//name from shader program

    gl.vertexAttribPointer(
        positionAttribLocation1, //Attribute location   
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //normalize
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation1, //Attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //normalize
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation1);
    gl.enableVertexAttribArray(colorAttribLocation1);


    //var boxNormalBufferObject = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, boxNormalBufferObject);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalVertices), gl.STATIC_DRAW);

    //var normalAttribLocation1 = gl.getAttribLocation(program1, 'vertNormal');

    //gl.vertexAttribPointer(
    //    normalAttribLocation1,
    //    3,
    //    gl.FLOAT,
    //    gl.TRUE,
    //    3 * Float32Array.BYTES_PER_ELEMENT,
    //    0
    //);

    //gl.enableVertexAttribArray(normalAttribLocation1);

    var positionAttribLocation2 = gl.getAttribLocation(program2, 'vertPosition');//name from shader program
    var colorAttribLocation2 = gl.getAttribLocation(program2, 'vertColor');//name from shader program
    gl.vertexAttribPointer(
        positionAttribLocation2, //Attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //normalize
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation2, //Attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //normalize
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation2);
    gl.enableVertexAttribArray(colorAttribLocation2);

    //var normalAttribLocation2 = gl.getAttribLocation(program2, 'vertNormal');

    //gl.vertexAttribPointer(
    //    normalAttribLocation2,
    //    3,
    //    gl.FLOAT,
    //    gl.TRUE,
    //    3 * Float32Array.BYTES_PER_ELEMENT,
    //    0
    //);

    //gl.enableVertexAttribArray(normalAttribLocation2);

    //tell opengl state machine which program should be active
    //gl.useProgram(program1);
    //gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(program1);

    var matModelUniformLocation1 = gl.getUniformLocation(program1, 'mModel');
    var matViewUniformLocation1 = gl.getUniformLocation(program1, 'mView');
    var matProjUniformLocation1 = gl.getUniformLocation(program1, 'mProj');

    gl.useProgram(program2);

    var matModelUniformLocation2 = gl.getUniformLocation(program2, 'mModel');
    var matViewUniformLocation2 = gl.getUniformLocation(program2, 'mView');
    var matProjUniformLocation2 = gl.getUniformLocation(program2, 'mProj');

    var modelMatrix = new Float32Array(16); // model(world)
    var viewMatrix = new Float32Array(16); // position(location and orientation) of camera
    var projMatrix = new Float32Array(16); // characteristics of camera
    glMatrix.mat4.identity(modelMatrix);
    //glMatrix.mat4.multiplyScalar(modelMatrix, modelMatrix, 10);
    //console.log(modelMatrix);
    glMatrix.mat4.identity(viewMatrix);
    //var cameraPosition = [0, 150, 0];
    var cameraPosition = [boxVertices[0], boxVertices[1], boxVertices[2]];
    //console.log(cameraPosition);
    var cameraSpeed = 10.0;
    var cameraRho = 1;
    var cameraYaw = 0.0;
    var cameraPitch = 0.0;
    var targetPosition = [
        cameraPosition[0] + cameraRho * Math.cos(glMatrix.glMatrix.toRadian(cameraYaw)) * Math.cos(glMatrix.glMatrix.toRadian(cameraPitch)),
        cameraPosition[1] + cameraRho * Math.sin(glMatrix.glMatrix.toRadian(cameraYaw)) * Math.cos(glMatrix.glMatrix.toRadian(cameraPitch)),
        cameraPosition[2] + cameraRho * Math.sin(glMatrix.glMatrix.toRadian(cameraPitch))
    ];
    var cameraSensitivity = 0.2;
    //console.log(mathCalc.findPointOnSegment(cameraPosition, targetPosition, 1));
    var upVector = [0, 1, 0]; // vector pointing to up (common is y axis)

    var pitchLock = 85; // limit for pitch angle rotation

    var changingPoint = -1;
    var dragSensitivity = 0.05;

    //var rover = new Rover(1, 2);

    //console.log(boxVertices[1]);
    var roverPosition = [boxVertices[0], boxVertices[1], boxVertices[2]];
    var roverTargetPosition = [boxVertices[0], boxVertices[1], boxVertices[2] + 1];

    for (var i = 0; i < roverVerticesLength; i++) {
        boxVertices[2 * 6 * offset + 6 * i + 1] += boxVertices[1];
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
    //gl.useProgram(program1);
    gl.vertexAttribPointer(
        positionAttribLocation1, //Attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //normalize
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );//important2
    //gl.useProgram(program2);
    gl.vertexAttribPointer(
        positionAttribLocation2, //Attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //normalize
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );//important2

    //console.log(roverPosition);
    //console.log(roverTargetPosition);
    var roverSpeed = 7.0;
    var roverSensitivity = 0.2;

    var aspectRatio = canvas.clientWidth / canvas.clientHeight;
    var borderWidth = 0.2;

    //var aspectRationUniformLocation = gl.getUniformLocation(program, 'aspect');
    //var borderWidthUniformLocation = gl.getUniformLocation(program, 'border_width');
    //var widthUniformLocation = gl.getUniformLocation(program, 'width');
    //var heightUniformLocation = gl.getUniformLocation(program, 'height');
    gl.useProgram(program1);
    var maxHeightUniformLocation = gl.getUniformLocation(program1, 'maxHeight');
    var minHeightUniformLocation = gl.getUniformLocation(program1, 'minHeight');

    //gl.uniform1f(aspectRationUniformLocation, aspectRatio);
    //gl.uniform1f(borderWidthUniformLocation, borderWidth);
    //gl.uniform1f(widthUniformLocation, canvas.clientWidth);
    //gl.uniform1f(heightUniformLocation, canvas.clientHeight);
    gl.uniform1f(maxHeightUniformLocation, maxHeight);
    gl.uniform1f(minHeightUniformLocation, minHeight);

    glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
    //console.log(viewMatrix);
    //glMatrix.mat4.identity(viewMatrix);

    var cameraFOV = 90.0;

    //gl.lineWidth(5);

    glMatrix.mat4.identity(projMatrix);
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(cameraFOV), aspectRatio, 0.1, 2000.0);



    gl.uniformMatrix4fv(matModelUniformLocation1, gl.FALSE, modelMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation1, gl.FALSE, projMatrix);

    gl.useProgram(program2);

    gl.uniformMatrix4fv(matModelUniformLocation2, gl.FALSE, modelMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation2, gl.FALSE, projMatrix);

    var solveLinearSystem = linear();
    //console.log(solveLinearSystem([[1, 2], [3, 4]], [1, 2]));

    var TranslateRotateRotateTranslate = function (camera, target, yaw, pitch) {
        var translateForward = glMatrix.mat4.create();
        glMatrix.mat4.translate(translateForward, translateForward, camera.map(x => -x));

        var rotatePhi = glMatrix.mat4.create();
        glMatrix.mat4.rotate(rotatePhi, rotatePhi, yaw, [0, 1, 0]);

        var n = [target[0] - camera[0], target[1] - camera[1], target[2] - camera[2]];
        var rotateTheta = glMatrix.mat4.create();
        glMatrix.mat4.rotate(rotateTheta, rotateTheta, pitch, mathCalc.findOrtVector(n));

        var translateBackward = glMatrix.mat4.create();
        glMatrix.mat4.translate(translateBackward, translateBackward, camera);

        var transform = glMatrix.mat4.create();
        glMatrix.mat4.multiply(transform, translateForward, transform);
        glMatrix.mat4.multiply(transform, rotatePhi, transform);
        glMatrix.mat4.multiply(transform, rotateTheta, transform);
        glMatrix.mat4.multiply(transform, translateBackward, transform);
        return transform;
    }

    var InverseMVP = function (model, view, projection) {
        var transform = glMatrix.mat4.create();
        glMatrix.mat4.multiply(transform, model, transform);
        glMatrix.mat4.multiply(transform, view, transform);
        glMatrix.mat4.multiply(transform, projection, transform);
        return glMatrix.mat4.invert(transform, transform);
    }

    var MVP = function (model, view, projection) {
        var transform = glMatrix.mat4.create();
        glMatrix.mat4.multiply(transform, model, transform);
        glMatrix.mat4.multiply(transform, view, transform);
        glMatrix.mat4.multiply(transform, projection, transform);
        return transform;
    }

    var findTriangle = function (r1, r2) {
        var i = Math.floor(r1 / (MODEL_SCALE * SQRT32));
        var j = Math.floor(r2 / MODEL_SCALE);

        var res_i = r1 - i * MODEL_SCALE * SQRT32;
        var res_j = r2 - j * MODEL_SCALE;

        if (i % 2 == 0) {
            if (res_i - 2 * SQRT32 * res_j > 0) {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j - 1;
                var i_3 = i + 1;
                var j_3 = j;
            }
            else if (res_i - 2 * SQRT32 * (MODEL_SCALE - res_j) > 0) {
                var i_1 = i;
                var j_1 = j + 1;
                var i_2 = i + 1;
                var j_2 = j;
                var i_3 = i + 1;
                var j_3 = j + 1;
            }
            else {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j;
                var i_3 = i;
                var j_3 = j + 1;
            }
        }
        else {
            if (res_i - SQRT32 * (MODEL_SCALE - 2 * res_j) < 0) {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j;
                var i_3 = i;
                var j_3 = j - 1;
            }
            else if (res_i - SQRT32 * (2 * res_j - MODEL_SCALE) < 0) {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j + 1;
                var i_3 = i;
                var j_3 = j + 1;
            }
            else {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j;
                var i_3 = i + 1;
                var j_3 = j + 1;
            }
        }

        return [i_1, j_1, i_2, j_2, i_3, j_3];
    }

    var findHeight = function (x, y, defaultValue = 0) {
        var trig = findTriangle(x, y);
        var h = defaultValue;
        if (0 <= trig[0] && trig[0] < fieldWidth && 0 <= trig[1] && trig[1] < fieldHeight && 0 <= trig[2] && trig[2] < fieldWidth && 0 <= trig[3] && trig[3] < fieldHeight && 0 <= trig[4] && trig[4] < fieldWidth && 0 <= trig[5] && trig[5] < fieldHeight) {
            var x0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1]];
            var y0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 1];
            var z0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 2];
            var x1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3]];
            var y1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 1];
            var z1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 2];
            var x2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5]];
            var y2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 1];
            var z2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 2];
            h = mathCalc.pointOnTriangle(x, y, x0, y0, z0, x1, y1, z1, x2, y2, z2);
        }
        return h;
    }

    var findPath = function (rovPos, rovTarPos, rovSpd) {
        //console.log(rovPos, rovTarPos, rovSpd);
        var forward = [rovTarPos[0] - rovPos[0], rovTarPos[1] - rovPos[1], rovTarPos[2] - rovPos[2]];
        //console.log(forward);
        //console.log(forward);
        var forwardTicks = 100;
        var backwardTicks = 200;

        var startX = rovPos[0] - backwardTicks * forward[0]; // * rovSpd
        var startY = rovPos[2] - backwardTicks * forward[2]; // * rovSpd
        //console.log(startX, startY);

        var endX = rovPos[0] + forwardTicks * forward[0]; // * rovSpd
        var endY = rovPos[2] + forwardTicks * forward[2]; // * rovSpd
        //console.log(endX, endY);

        var ans = [];

        var a = startX <= endX;
        var b = startY <= endY;

        var check_a = a ? endX - startX : startX - endX;
        var check_b = b ? endY - startY : startY - endY;

        while (check_a >= 0 && check_b >= 0) {
            ans.push([startX, findHeight(startX, startY), startY]);
            startX += pathEpsilon * MODEL_SCALE * forward[0];
            startY += pathEpsilon * MODEL_SCALE * forward[2];
            check_a = a ? endX - startX : startX - endX;
            check_b = b ? endY - startY : startY - endY;
        }

        return ans;
    }

    var roverContextPosition = function () {
        var forw = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];
        var n = mathCalc.euclidNorm(forw);
        //var k = forw[2] > 0 ? roverPosition[2] * forw[2] + roverPosition[0] * forw[0] : -roverPosition[2] * forw[2] - roverPosition[0] * forw[0];
        var k = roverPosition[2] * forw[2] + roverPosition[0] * forw[0];
        return [k / n, roverPosition[1]];
    }

    var roverBackForwardPath = function () {
        var pth = findPath(roverPosition, roverTargetPosition, roverSpeed);
        var forw = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];
        //console.log(pth);
        //console.log(roverPosition);
        //console.log(forw);
        var cnv2Array = [];
        for (var i = 0; i < pth.length; i++) {
            //console.log();
            var n = mathCalc.euclidNorm(forw);
            //var k = forw[2] > 0 ? pth[i][2] * forw[2] + pth[i][0] * forw[0] : -pth[i][2] * forw[2] - pth[i][0] * forw[0];
            var k = pth[i][2] * forw[2] + pth[i][0] * forw[0];
            //cnv2Array.push([(pth[i][0] * forw[0] + pth[i][2] * forw[2]) / n, (pth[i][0] * forw[2] - pth[i][2] * forw[0]) / n]);
            cnv2Array.push([k / n, pth[i][1]]);
            //cnv2Array.push([mathCalc.euclidNorm([pth[i][0], pth[i][2]]), pth[i][1]]);
        }
        //console.table(pth);
        //console.table(cnv2Array);
        return cnv2Array;
    }

    var drawArray = function (a, lineWidth, strokeStyle) {
        //ctx.clearRect(-canvas2.width, -canvas2.height, 2 * canvas2.width, 2 * canvas2.height);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        ctx.moveTo(a[0][0], a[0][1]);
        for (var i = 1; i < a.length; i++) {
            ctx.lineTo(a[i][0], a[i][1]);
        }
        ctx.stroke();
    }

    var drawScatter = function (a, lineWidth, fillStyle) {
        //ctx.fillStyle = "#0000ff";
        //ctx.fillRect(a[0][0] - lineWidth / 2, a[0][1] - lineWidth / 2, lineWidth, lineWidth);
        ctx.fillStyle = fillStyle
        for (var i = 0; i < a.length; i++) {
            ctx.fillRect(a[i][0] - lineWidth / 2, a[i][1] - lineWidth / 2, lineWidth, lineWidth);
        }
        //ctx.fillStyle = "#00ffff";
        //ctx.fillRect(a[a.length - 1][0] - lineWidth / 2, a[a.length - 1][1] - lineWidth / 2, lineWidth, lineWidth);
    }

    var drawWheelCenter = function (a, lineWidth, strokeStyle) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        ctx.moveTo(a[0][0][0], a[0][0][1]);
        for (var i = 1; i < a.length - 1; i++) {
            if (a[i].length == 1) {
                ctx.lineTo(a[i][0][0], a[i][0][1]);
            }
            else if (a[i].length == 3) {
                ctx.lineTo(a[i][0][0], a[i][0][1]);
                var startAngle = angleBetweenVectors2([-roverWheelRadius, 0], [a[i][0][0] - a[i][2][0], a[i][0][1] - a[i][2][1]]);
                var endAngle = angleBetweenVectors2([-roverWheelRadius, 0], [a[i][1][0] - a[i][2][0], a[i][1][1] - a[i][2][1]]);
                //console.log(Math.PI - startAngle, Math.PI - endAngle);
                ctx.arc(a[i][2][0], a[i][2][1], roverWheelRadius, Math.PI - startAngle, Math.PI - endAngle, counterclockwise = true);
                ctx.moveTo(a[i][1][0], a[i][1][1]);
            }
        }
        ctx.lineTo(a[a.length - 1][0][0], a[a.length - 1][0][1]);
        ctx.stroke();
    }

    var drawWheelCenterScatter = function (a, lineWidth, fillStyle) {
        for (var i = 0; i < a.length; i++) {
            if (a[i].length == 1) {
                ctx.fillStyle = fillStyle
                ctx.fillRect(a[i][0][0] - lineWidth / 2, a[i][0][1] - lineWidth / 2, lineWidth, lineWidth);
            }
            else if (a[i].length == 3) {
                ctx.fillStyle = "#ffff00";
                ctx.fillRect(a[i][0][0] - lineWidth / 2, a[i][0][1] - lineWidth / 2, lineWidth, lineWidth);
                ctx.fillRect(a[i][1][0] - lineWidth / 2, a[i][1][1] - lineWidth / 2, lineWidth, lineWidth);
                ctx.fillRect(a[i][2][0] - lineWidth / 2, a[i][2][1] - lineWidth / 2, lineWidth, lineWidth);
            }
        }
    }

    var contextScale = 2;

    var drawWheels = function (wheels, lineWidth) {
        var centerWidth = 1.0;
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = lineWidth;
        //ctx.beginPath();
        ////ctx.moveTo(wheels[0][0], wheels[0][1])
        //for (var i = 0; i < wheels.length; i++) {
        //    if (i % 2) {
        //        ctx.lineTo(wheels[i][0], wheels[i][1]);
        //    }
        //    else {
        //        ctx.moveTo(wheels[i][0], wheels[i][1]);
        //    }
        //    //ctx.lineTo(wheels[i][0],)
        //}
        //ctx.stroke();

        ctx.fillStyle = "#00ff00";
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        //ctx.moveTo(wheels[0][0], wheels[0][1])
        for (var i = 0; i < wheels.length; i++) {
            ctx.moveTo(wheels[i][0] + roverWheelRadius, wheels[i][1]);
            ctx.arc(wheels[i][0], wheels[i][1], roverWheelRadius, 0, 2 * Math.PI);
            //ctx.lineTo(wheels[i][0],)
        }
        ctx.stroke();

        //ctx.strokeStyle = "#00ff00";
        //ctx.fillStyle = "#00ff00";
        //ctx.lineWidth = 0.1;
        //ctx.beginPath();
        //ctx.fillRect(pos[0] - centerWidth / 2, h - centerWidth / 2, centerWidth, centerWidth);
        //ctx.arc(pos[0], h, roverWheelRadius, 0, 2 * Math.PI);
        //ctx.arc(pos[0], h, roverWheelDistance, 0, 2 * Math.PI);
        //ctx.stroke();
    }

    var drawSuspension = function (wheel1, suspension, wheel2, lineWidth) {
        //var mid = wheel1.map((x, idx) => (x + wheel2[idx]) / 2);
        //var l = Math.sqrt(roverLegLength * roverLegLength - roverWheelDistance * roverWheelDistance / 4);
        //var trig = findPointOnDistanceFromLine(mid, wheel2, l);
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(wheel1[0], wheel1[1]);
        ctx.lineTo(suspension[0], suspension[1]);
        ctx.lineTo(wheel2[0], wheel2[1]);
        ctx.stroke();
    }

    var drawBody = function (suspensions, lineWidth) {
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        //ctx.moveTo(suspensions[0][0], suspensions[0][1]);
        //console.log(suspensions);
        //for (var i = 1; i < suspensions.length; i++) {
        //    ctx.lineTo(suspensions[i][0], suspensions[i][1]);
        //}
        ctx.moveTo(suspensions[1][0], suspensions[1][1]);
        ctx.lineTo(suspensions[0][0], suspensions[0][1]);
        var kernelWidth = 50.0;
        var vec = [suspensions[0][0] - suspensions[1][0], suspensions[0][1] - suspensions[1][1]];
        var n = normaVector(vec);
        var vec = vec.map(x => x / n);
        ctx.lineTo(suspensions[0][0] + vec[0] * kernelWidth, suspensions[0][1] + vec[1] * kernelWidth);
        ctx.stroke();
    }

    var drawResFinding = function (resFinding) {
        for (var i = 0; i < resFinding.length; i++) {
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = "#000000";
            ctx.beginPath();
            ctx.moveTo(resFinding[i][0][0] + roverWheelRadius, resFinding[i][0][1]);
            ctx.arc(resFinding[i][0][0], resFinding[i][0][1], roverWheelRadius, 0, 2 * Math.PI);
            ctx.moveTo(resFinding[i][1][0] + roverWheelRadius, resFinding[i][1][1]);
            ctx.arc(resFinding[i][1][0], resFinding[i][1][1], roverWheelRadius, 0, 2 * Math.PI);
            ctx.moveTo(resFinding[i][0][0], resFinding[i][0][1])
            ctx.lineTo(resFinding[i][2][0], resFinding[i][2][1])
            ctx.lineTo(resFinding[i][1][0], resFinding[i][1][1])
            ctx.stroke();
        }
    }

    var drawReactions = function (reacts, surfs, lineWidth) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#ff0000";
        ctx.beginPath();
        for (var i = 0; i < surfs.length; i++) {
            ctx.moveTo(surfs[i][0], surfs[i][1]);
            ctx.lineTo(surfs[i][0] + reacts[i][0], surfs[i][1] + reacts[i][1]);
        }
        ctx.stroke();
    }

    var drawNormals = function (normals, surfs, lineWidth) {
        ctx.lineWidth = lineWidth;
        //ctx.strokeStyle = "#000000";
        for (var i = 0; i < normals.length; i++) {
            ctx.strokeStyle = "#0000ff";
            ctx.beginPath();
            ctx.moveTo(surfs[i][0], surfs[i][1]);
            ctx.lineTo(surfs[i][0] + normals[i][0][0], surfs[i][1] + normals[i][0][1]);
            ctx.stroke();
            ctx.strokeStyle = "#00ff00";
            ctx.beginPath();
            ctx.moveTo(surfs[i][0], surfs[i][1]);
            ctx.lineTo(surfs[i][0] + normals[i][1][0], surfs[i][1] + normals[i][1][1]);
            ctx.stroke();
        }
    }

    var drawContext = function (paths, pos, wheels, suspensions, surfs, reacts, normals, lineWidth) {
        ctx.resetTransform();
        //console.log(pos);
        //var pathH = path.map(x => x[1]);
        ctx.translate(canvas2.width / 2, canvas2.height);
        //ctx.translate(canvas2.width / 2 - pos[0] * contextScale, canvas2.height);
        //ctx.translate(canvas2.width / 2 - pos[0] * contextScale, canvas2.height + (Math.max.apply(Math, pathH) + Math.min.apply(Math, pathH)) * contextScale / 2);
        //ctx.translate(canvas2.width / 2 - pos[0] * contextScale, canvas2.height - pos[1] * contextScale);
        ctx.scale(contextScale, -contextScale);
        //console.log(pos[1]);
        //console.log(canvas2.height);
        ctx.translate(-pos[0] - canvas2.width / (10 * contextScale), -pos[1] + canvas2.height / (2.5 * contextScale));
        //ctx.scale(contextScale, contextScale);
        //var b = -path[0][0];
        //var k = canvas2.width / (path[path.length - 1][0] - path[0][0]);
        //console.log(k, b);
        //ctx.scale(k, 1);
        //ctx.translate(b, 0);
        var lineWidth = lineWidth;
        //ctx.clearRect(-canvas2.width, -canvas2.height, 2 * canvas2.width, 2 * canvas2.height);
        ctx.clearRect(pos[0] - 2 * canvas2.width, pos[1] - 2 * canvas2.height, 4 * canvas2.width, 4 * canvas2.height);
        //ctx.clearRect(0, 0, canvas2.width, canvas2.height);

        //drawArray(path);

        //var styles = ["#000000", "#ff0000", "#007700", "#1b98ee"];
        //var lineWidths = [lineWidth * 0.1, lineWidth * 0., lineWidth * 1.5, lineWidth * 1.5];

        for (var i = 0; i < paths.length; i++) {
            if (paths[i][1] == "line") {
                drawArray(paths[i][0], paths[i][2], paths[i][3]);
            }
            else if (paths[i][1] == "scatter") {
                drawScatter(paths[i][0], paths[i][2], paths[i][3]);
            }
            else if (paths[i][1] == "wheelCenter") {
                drawWheelCenter(paths[i][0], paths[i][2], paths[i][3]);
            }
            else if (paths[i][1] == "wheelCenterScatter") {
                drawWheelCenterScatter(paths[i][0], paths[i][2], paths[i][3]);
            }
        }

        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(pos[0], pos[1]);
        ctx.lineTo(pos[0], pos[1] + 2 * contextScale);
        //ctx.arc(pos[0], pos[1], roverWheelRadius, 0, Math.PI);
        ctx.stroke();

        drawWheels(wheels, lineWidth);

        for (var i = 0; i < wheels.length / 2; i++) {
            drawSuspension(wheels[2 * i], suspensions[i], wheels[2 * i + 1], lineWidth);
        }

        drawBody(suspensions, lineWidth);

        drawScatter(surfs, lineWidth * 2.0, "#ff0000");

        drawReactions(reacts, surfs, lineWidth * 0.5);

        drawNormals(normals, surfs, lineWidth * 0.5);

        //drawResFinding(resFinding);

        //var centerWidth = 1.0;

        //ctx.strokeStyle = "#00ff00";
        //ctx.fillStyle = "#00ff00";
        //ctx.lineWidth = 0.1;
        //ctx.beginPath();
        //ctx.fillRect(pos[0] - centerWidth / 2, h - centerWidth / 2, centerWidth, centerWidth);
        //ctx.arc(pos[0], h, roverWheelRadius, 0, 2 * Math.PI);
        //ctx.arc(pos[0], h, roverWheelDistance, 0, 2 * Math.PI);
        //ctx.stroke();

        ctx.strokeStyle = "#000000";
    }

    var normaVector = function (a) {
        var ans = 0.0;
        for (var i = 0; i < a.length; i++) {
            ans += a[i] * a[i];
        }
        return Math.sqrt(ans);
    }

    var normalizeVector = function (a) {
        var n = normaVector(a);
        return a.map(x => x / n);
    }

    var dotProductVectors = function (a, b) {
        var n = Math.min(a.length, b.length);
        var ans = 0.0;
        for (var i = 0; i < n; i++) {
            ans += a[i] * b[i];
        }
        return ans;
    }

    var angleBetweenVectors = function (a, b) {
        //console.log(dotProductVectors(a, b), normaVector(a), normaVector(b), dotProductVectors(a, b) / (normaVector(a) * normaVector(b)));
        return Math.acos(dotProductVectors(a, b) / (normaVector(a) * normaVector(b)));
    }

    var angleBetweenVectors2 = function (a, b) {
        return Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]);
    }

    var angleEpsilon = 1e-2;
    var roverWheelRadius = 10.0;
    var roverWheelDistance = 25.0;
    var roverLegLength = 25.0;
    var roverSuspensionsDistance = 100.0;
    var roverMass = 100.0;
    var gravityAcceleration = 10.0;
    var elasticity = 0.6;

    //console.log(compareEpsilon);

    var findSimplifiedPath = function (path) {
        var newPath = [];
        newPath.push(path[0]);
        //console.log(path[0], wheelCenter[0]);
        for (var i = 1; i < path.length - 1; i++) {
            var angle = angleBetweenVectors2([path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]], [path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]]);
            //console.log(angle);
            if (Math.abs(angle) >= angleEpsilon) {
                //console.log(angle);
                newPath.push(path[i]);
            }
        }
        newPath.push(path[path.length - 1]);
        //console.log(path[path.length - 1], wheelCenter[wheelCenter.length - 1]);
        //console.log(newPath);
        return newPath;//.map(x => [x[0], x[1] + contextScale]);
    }

    var findPointOnDistanceFromLine = function (a, b, distance) {
        var line = [b[0] - a[0], b[1] - a[1]];
        var ort = line[0] >= 0 ? [-line[1], line[0]] : [line[1], -line[0]];
        var n = normaVector(line);
        return a.map((x, idx) => x + ort[idx] * distance / n);
    }

    var findIntersectionLines = function (a, b, c, d) {
        var numerator_x = (c[0] * d[1] - c[1] * d[0]) * (a[0] - b[0]) + (a[0] * b[1] - a[1] * b[0]) * (d[0] - c[0]);
        var denominator_x = (a[1] - b[1]) * (c[0] - d[0]) + (c[1] - d[1]) * (b[0] - a[0]);
        var numerator_y = (c[0] * d[1] - c[1] * d[0]) * (b[1] - a[1]) + (a[0] * b[1] - a[1] * b[0]) * (c[1] - d[1]);
        var denominator_y = (b[0] - a[0]) * (d[1] - c[1]) + (d[0] - c[0]) * (a[1] - b[1]);
        return [numerator_x / denominator_x, numerator_y / denominator_y];
    }

    //console.log(findIntersectionLines([1.7, -0.7], [1.3, -1], [2, -5], [-0.9, 3.3]));

    var findWheelCenter = function (path) {
        var wheelCenter = [];
        wheelCenter.push([findPointOnDistanceFromLine(path[0], path[1], roverWheelRadius)]);
        for (var i = 1; i < path.length - 1; i++) {
            var angle = angleBetweenVectors2([path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]], [path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]]);
            //console.log(angle * 180.0 / Math.PI);
            var tmp = [];
            var b = findPointOnDistanceFromLine(path[i], path[i - 1], roverWheelRadius);
            var c = findPointOnDistanceFromLine(path[i], path[i + 1], roverWheelRadius);
            if (angle > angleEpsilon) {
                //console.log(b, c, path[i]);
                tmp.push(b, c, path[i]);
            }
            else if (angle < -angle) {
                var a = findPointOnDistanceFromLine(path[i - 1], path[i], roverWheelRadius);
                var d = findPointOnDistanceFromLine(path[i + 1], path[i], roverWheelRadius);
                tmp.push(findIntersectionLines(a, b, c, d));
            }
            if (tmp.length > 0) {
                wheelCenter.push(tmp);
            }
        }
        wheelCenter.push([findPointOnDistanceFromLine(path[path.length - 1], path[path.length - 2], roverWheelRadius)]);
        return wheelCenter
    }

    var fixWheelCenter = function (wheelCenter) {
        var newWheelCenter = [];
        for (var i = 0; i < wheelCenter.length; i++) {
            if (wheelCenter[i].length == 3) {
                newWheelCenter.push(wheelCenter[i]);
            }
            else if (wheelCenter[i].length == 1) {
                var check = false;
                for (var j = 0; j < wheelCenter.length; j++) {
                    if (wheelCenter[j].length == 3 && (wheelCenter[j][0][0] <= wheelCenter[i][0][0] && wheelCenter[i][0][0] <= wheelCenter[j][1][0] || wheelCenter[j][1][0] <= wheelCenter[i][0][0] && wheelCenter[i][0][0] <= wheelCenter[j][0][0])) {
                        check = true;
                        break;
                    }
                }
                if (!check) {
                    newWheelCenter.push(wheelCenter[i]);
                }
            }
        }
        return newWheelCenter;
    }

    //console.log(roverBackForwardPath());

    var findYByXFromLine = function (x, a, b) {
        //console.log(x, a, b);
        return a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
    }

    var findYByXFromCircle = function (x, c, r) {
        //console.log(x, c, r, c[1] + Math.sqrt(r * r - (x - c[0]) * (x - c[0])));
        return c[1] + Math.sqrt(r * r - (x - c[0]) * (x - c[0]));
    }

    var findYByXFromWheelCenter = function (x, wheelCenter) {
        var heights = [];
        //console.log(wheelCenter.length);
        for (var i = 0; i < wheelCenter.length - 1; i++) {
            if (wheelCenter[i].length == 1) {
                var a = Math.min(wheelCenter[i][0][0], wheelCenter[i + 1][0][0]);
                var b = Math.max(wheelCenter[i][0][0], wheelCenter[i + 1][0][0]);
                if (a <= x && x <= b) {
                    //console.log(wheelCenter[i][0], wheelCenter[i + 1][0]);
                    var h = findYByXFromLine(x, wheelCenter[i][0], wheelCenter[i + 1][0]);
                    heights.push(h);
                    //console.log("check", findYByXFromLine(x, wheelCenter[i][0], wheelCenter[i + 1][0]));
                }
            }
            else if (wheelCenter[i].length == 3) {
                //circle
                var a = Math.min(wheelCenter[i][0][0], wheelCenter[i][1][0]);
                var b = Math.max(wheelCenter[i][0][0], wheelCenter[i][1][0]);
                //console.log(a, x, b);
                if (a <= x && x <= b) {
                    //console.log(a, x, b);
                    var h = findYByXFromCircle(x, wheelCenter[i][2], roverWheelRadius);
                    //console.log(h);
                    if (h) {
                        heights.push(h);
                    }

                    //heights.push(h);
                }
                //line
                var a = Math.min(wheelCenter[i][1][0], wheelCenter[i + 1][0][0]);
                var b = Math.max(wheelCenter[i][1][0], wheelCenter[i + 1][0][0]);
                if (a <= x && x <= b) {
                    //console.log(wheelCenter[i][0], wheelCenter[i + 1][0]);
                    var h = findYByXFromLine(x, wheelCenter[i][1], wheelCenter[i + 1][0]);
                    heights.push(h);
                    //console.log("check", findYByXFromLine(x, wheelCenter[i][0], wheelCenter[i + 1][0]));
                }
            }
        }
        //console.log(heights);
        return Math.max.apply(Math, heights);
    }

    var distanceBetweenVectorsSquared = function (a, b) {
        return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
    }

    var distanceBetweenVectors = function (a, b) {
        return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
    }

    var EPS = 1e-7;

    var findIntersectionLineCircle = function (x1, x2, x0, r) {
        var a = x2[1] - x1[1];
        var b = x1[0] - x2[0];
        var c = x2[0] * x1[1] - x1[0] * x2[1] + a * x0[0] + b * x0[1];
        //var c = - a * (x1[0] - x0[0]) - b * (x1[1] - x0[1]);
        var m = a * a + b * b;
        var px = -a * c / m;
        var py = -b * c / m;
        var ans = [];
        if (c * c > r * r * m + EPS) {
            //do nothing
            //ans.push();
        }
        else if (Math.abs(c * c - r * r * m) < EPS) {
            ans.push([px - x0[0], py - x0[1]]);
        }
        else {
            var d = r * r - c * c / m;
            var mult = Math.sqrt(d / m);
            var ax = px + b * mult + x0[0];
            var bx = px - b * mult + x0[0];
            var ay = py - a * mult + x0[1];
            var by = py + a * mult + x0[1];
            ans.push([ax, ay], [bx, by]);
        }
        return ans;
    }

    var findIntersectionCircles = function (x1, r1, x2, r2) {
        var ans = [];
        if (Math.abs(x1[0] - x2[0]) < EPS && Math.abs(x1[1] - x2[1]) < EPS) {
            if (Math.abs(r1 - r2) < EPS) {
                //ans.push(NaN);
            }
            else {
                //do nothing
                //ans.push();
            }
        }
        else {
            var a = 2 * (x1[0] - x2[0]);
            var b = 2 * (x1[1] - x2[1]);
            var c = (x1[0] - x2[0]) * (x1[0] - x2[0]) + (x1[1] - x2[1]) * (x1[1] - x2[1]) + r1 * r1 - r2 * r2;
            var m = a * a + b * b;
            var px = -a * c / m;
            var py = -b * c / m;
            if (c * c > r1 * r1 * m + EPS) {
                //do nothing
                //ans.push();
            }
            else if (Math.abs(c * c - r1 * r1 * m) < EPS) {
                ans.push([px - x1[0], py - x1[1]]);
            }
            else {
                var d = r1 * r1 - c * c / m;
                var mult = Math.sqrt(d / m);
                var ax = px + b * mult + x1[0];
                var bx = px - b * mult + x1[0];
                var ay = py - a * mult + x1[1];
                var by = py + a * mult + x1[1];
                ans.push([ax, ay], [bx, by]);
            }
        }
        return ans;
    }

    //console.log(findIntersectionLineCircle([-0.6, -4], [-1.5, -3.1], [3.3, 1], 7.5));
    //console.log(findIntersectionCircles([1, 1], 1, [2.1, 1.8], 1.7));

    var findAnotherWheelByDistance = function (wheel, wheelCenter, d, back) {
        var ans = [];
        //ctx.arc(wheel1[0], wheel1[1]);
        for (var i = 0; i < wheelCenter.length - 1; i++) {
            if (wheelCenter[i].length == 1) {
                var d1 = distanceBetweenVectorsSquared(wheel, wheelCenter[i][0]);
                var d2 = distanceBetweenVectorsSquared(wheel, wheelCenter[i + 1][0]);
                if (d2 <= d * d && d * d <= d1 || d1 <= d * d && d * d <= d2) {
                    var pts = findIntersectionLineCircle(wheelCenter[i][0], wheelCenter[i + 1][0], wheel, d);
                    if (pts.length == 1) {
                        if (back && pts[0][0] <= wheel[0] || !back && wheel[0] <= pts[0][0]) {
                            if (Math.abs(distanceBetweenVectors(wheelCenter[i][0], wheelCenter[i + 1][0]) - distanceBetweenVectors(pts[0], wheelCenter[i][0]) - distanceBetweenVectors(pts[0], wheelCenter[i + 1][0])) < EPS) {
                                ans.push(pts[0]);
                            }
                        }
                        //console.log("line", pts[0]);\
                    }
                    else if (pts.length == 2) {
                        if (back && pts[0][0] <= wheel[0] || !back && wheel[0] <= pts[0][0]) {
                            if (Math.abs(distanceBetweenVectors(wheelCenter[i][0], wheelCenter[i + 1][0]) - distanceBetweenVectors(pts[0], wheelCenter[i][0]) - distanceBetweenVectors(pts[0], wheelCenter[i + 1][0])) < EPS) {
                                ans.push(pts[0]);
                            }
                        }
                        if (back && pts[1][0] <= wheel[0] || !back && wheel[0] <= pts[1][0]) {
                            if (Math.abs(distanceBetweenVectors(wheelCenter[i][0], wheelCenter[i + 1][0]) - distanceBetweenVectors(pts[1], wheelCenter[i][0]) - distanceBetweenVectors(pts[1], wheelCenter[i + 1][0])) < EPS) {
                                ans.push(pts[1]);
                            }
                        }
                        //var index = back ? (pts[0][0] < pts[1][0] ? 0 : 1) : (pts[0][0] < pts[1][0] ? 1 : 0);
                        //console.log(index);
                        //ans.push(pts[index]);
                        //console.log("line", pts[index]);
                    }
                }
            }
            else if (wheelCenter[i].length == 3) {
                //circle
                var d1 = distanceBetweenVectorsSquared(wheel, wheelCenter[i][0]);
                var d2 = distanceBetweenVectorsSquared(wheel, wheelCenter[i][1]);
                //ctx.beginPath();
                //ctx.strokeStyle = "#000000";
                //ctx.lineTo(wheelCenter[i][2][0], wheelCenter[i][2][1]);
                //ctx.arc(wheelCenter[i][2][0], wheelCenter[i][2][1], roverWheelRadius, 0, 2 * Math.PI);
                //ctx.stroke();
                if (d2 <= d * d && d * d <= d1 || d1 <= d * d && d * d <= d2) {
                    var pts = findIntersectionCircles(wheelCenter[i][2], roverWheelRadius, wheel, d);
                    //console.log('circles intersects:', pts);
                    if (pts.length == 1) {
                        if (back && pts[0][0] <= wheel[0] || !back && wheel[0] <= pts[0][0]) {
                            ans.push(pts[0]);
                        }
                    }
                    else if (pts.length == 2) {
                        if ((back && pts[0][0] <= wheel[0] || !back && wheel[0] <= pts[0][0]) && pts[0][1] >= Math.min(wheelCenter[i][0][1], wheelCenter[i][1][1])) {
                            ans.push(pts[0]);
                        }
                        if ((back && pts[1][0] <= wheel[0] || !back && wheel[0] <= pts[1][0]) && pts[1][1] >= Math.min(wheelCenter[i][0][1], wheelCenter[i][1][1])) {
                            ans.push(pts[1]);
                        }
                    }
                }
                //line
                var d1 = distanceBetweenVectorsSquared(wheel, wheelCenter[i][1]);
                var d2 = distanceBetweenVectorsSquared(wheel, wheelCenter[i + 1][0]);
                if (d2 <= d * d && d * d <= d1 || d1 <= d * d && d * d <= d2) {
                    var pts = findIntersectionLineCircle(wheelCenter[i][1], wheelCenter[i + 1][0], wheel, d);
                    if (pts.length == 1) {
                        if (back && pts[0][0] <= wheel[0] || !back && wheel[0] <= pts[0][0]) {
                            if (Math.abs(distanceBetweenVectors(wheelCenter[i][1], wheelCenter[i + 1][0]) - distanceBetweenVectors(pts[0], wheelCenter[i][1]) - distanceBetweenVectors(pts[0], wheelCenter[i + 1][0])) < EPS) {
                                ans.push(pts[0]);
                            }
                        }
                    }
                    else if (pts.length == 2) {
                        if (back && pts[0][0] <= wheel[0] || !back && wheel[0] <= pts[0][0]) {
                            if (Math.abs(distanceBetweenVectors(wheelCenter[i][1], wheelCenter[i + 1][0]) - distanceBetweenVectors(pts[0], wheelCenter[i][1]) - distanceBetweenVectors(pts[0], wheelCenter[i + 1][0])) < EPS) {
                                ans.push(pts[0]);
                            }
                        }
                        if (back && pts[1][0] <= wheel[0] || !back && wheel[0] <= pts[1][0]) {
                            if (Math.abs(distanceBetweenVectors(wheelCenter[i][1], wheelCenter[i + 1][0]) - distanceBetweenVectors(pts[1], wheelCenter[i][1]) - distanceBetweenVectors(pts[1], wheelCenter[i + 1][0])) < EPS) {
                                ans.push(pts[1]);
                            }
                        }
                        //var index = back ? (pts[0][0] < pts[1][0] ? 0 : 1) : (pts[0][0] < pts[1][0] ? 1 : 0);
                        //console.log(index);
                        //ans.push(pts[index]);
                    }
                }
            }
        }
        if (ans.length == 0) {
            //ans.push([wheel[0] - roverWheelDistance, wheel[1]]);
            ans.push(wheelCenter[0][0]);
        }
        ans = ans.sort((a, b) => a[1] >= b[1] ? -1 : 1)[0];
        return ans;
    }

    var checkIfPointOnWheelCenter = function (p, wheelCenter) {
        var y = findYByXFromWheelCenter(p[0], wheelCenter);
        return Math.abs(y - p[1]) < EPS;
    }

    var checkIfTwoIntervalsOverlap = function (a, b) {
        return Math.min(a[1], b[1]) - Math.max(a[0], b[0]);
    }

    var findSuspensionFromWheels = function (wheel1, wheel2) {
        var mid = wheel1.map((x, idx) => (x + wheel2[idx]) / 2);
        var l = Math.sqrt(roverLegLength * roverLegLength - roverWheelDistance * roverWheelDistance / 4);
        return findPointOnDistanceFromLine(mid, wheel2, l);
    }

    var shiftEpsilon = 1e-2;
    var suspensionsEPS = 1e-1;

    //console.log(linear().solve([[1, 2], [3, 4]], [1, 2]));

    var findAnotherSuspensionAndWheels = function (wheelCenter, suspension1, wheel1, wheel2) {
        var ans = [];
        var l = Math.sqrt(roverLegLength * roverLegLength - roverWheelDistance * roverWheelDistance / 4);

        for (var i = 0; i < wheelCenter.length - 1; i++) {
            if (wheelCenter[i].length == 1) {
                if (checkIfTwoIntervalsOverlap([wheelCenter[i][0][0], wheelCenter[i + 1][0][0]], [suspension1[0] - roverSuspensionsDistance - roverLegLength, suspension1[0] + roverLegLength]) > 0) {
                    //var wheel4 = wheelCenter[i][0];
                    var vec = [wheelCenter[i + 1][0][0] - wheelCenter[i][0][0], wheelCenter[i + 1][0][1] - wheelCenter[i][0][1]];
                    var n = normaVector(vec);
                    var dist = 0;
                    while (dist <= n) {
                        var wheel4 = wheelCenter[i][0].map((x, idx) => x + vec[idx] * dist / n);
                        var wheel3 = findAnotherWheelByDistance(wheel4, wheelCenter, roverWheelDistance, false);//.sort((a, b) => a[1] >= b[1] ? -1 : 1)[0];
                        //console.log(wheel3);
                        var suspension2 = findSuspensionFromWheels(wheel3, wheel4);
                        //console.log(wheel3, wheel4, suspension2);
                        //tmpWheel2.sort((a, b) => a[1] >= b[1] ? -1 : 1)[0];
                        //console.log(distanceBetweenVectors(suspension1, suspension2));
                        if (Math.abs(distanceBetweenVectors(suspension1, suspension2) - roverSuspensionsDistance) < suspensionsEPS) {
                            ans.push([wheel3, wheel4, suspension2]);
                            //break;
                        }
                        dist += shiftEpsilon;
                    }
                }
            }
            else if (wheelCenter[i].length == 3) {
                //circle
                if (checkIfTwoIntervalsOverlap([wheelCenter[i][0][0], wheelCenter[i][1][0]], [suspension1[0] - roverSuspensionsDistance - roverLegLength, suspension1[0] + roverLegLength]) > 0) {
                    var angle1 = Math.PI - angleBetweenVectors2([-roverWheelRadius, 0], [wheelCenter[i][0][0] - wheelCenter[i][2][0], wheelCenter[i][0][1] - wheelCenter[i][2][1]]);
                    var angle2 = Math.PI - angleBetweenVectors2([-roverWheelRadius, 0], [wheelCenter[i][1][0] - wheelCenter[i][2][0], wheelCenter[i][1][1] - wheelCenter[i][2][1]]);
                    //console.log(angle1, angle2);
                    //console.log(shiftEpsilon / roverWheelRadius);
                    while (angle1 >= angle2) {
                        //console.log(angle1, angle2);
                        var wheel4 = [roverWheelRadius * Math.cos(angle1) + wheelCenter[i][2][0], roverWheelRadius * Math.sin(angle1) + wheelCenter[i][2][1]];
                        var wheel3 = findAnotherWheelByDistance(wheel4, wheelCenter, roverWheelDistance, false);//.sort((a, b) => a[1] >= b[1] ? -1 : 1)[0];
                        var suspension2 = findSuspensionFromWheels(wheel3, wheel4);
                        //console.log(wheel4);
                        //console.log(distanceBetweenVectors(suspension1, suspension2));
                        if (Math.abs(distanceBetweenVectors(suspension1, suspension2) - roverSuspensionsDistance) < suspensionsEPS) {
                            ans.push([wheel3, wheel4, suspension2]);
                            //break;
                        }
                        angle1 -= shiftEpsilon / roverWheelRadius;
                    }
                }
                //line
                if (checkIfTwoIntervalsOverlap([wheelCenter[i][1][0], wheelCenter[i + 1][0][0]], [suspension1[0] - roverSuspensionsDistance - roverLegLength, suspension1[0] + roverLegLength]) > 0) {
                    //var wheel4 = wheelCenter[i][0];
                    var vec = [wheelCenter[i + 1][0][0] - wheelCenter[i][1][0], wheelCenter[i + 1][0][1] - wheelCenter[i][1][1]];
                    var n = normaVector(vec);
                    var dist = 0;
                    while (dist <= n) {
                        var wheel4 = wheelCenter[i][1].map((x, idx) => x + vec[idx] * dist / n);
                        var wheel3 = findAnotherWheelByDistance(wheel4, wheelCenter, roverWheelDistance, false);//.sort((a, b) => a[1] >= b[1] ? -1 : 1)[0];
                        var suspension2 = findSuspensionFromWheels(wheel3, wheel4);
                        //console.log(wheel3, wheel4, suspension2);
                        //tmpWheel2.sort((a, b) => a[1] >= b[1] ? -1 : 1)[0];
                        //console.log(distanceBetweenVectors(suspension1, suspension2));
                        if (Math.abs(distanceBetweenVectors(suspension1, suspension2) - roverSuspensionsDistance) < suspensionsEPS) {
                            ans.push([wheel3, wheel4, suspension2]);
                            //break;
                        }
                        dist += shiftEpsilon;
                    }
                }
            }
        }
        if (ans.length == 0) {
            //ans.push([[suspension1[0] - roverSuspensionsDistance + roverWheelDistance / 2, suspension1[1] - l], [suspension1[0] - roverSuspensionsDistance - roverWheelDistance / 2, suspension1[1] - l], [suspension1[0] - roverSuspensionsDistance, suspension1[1]]]);
            var wheel4 = wheelCenter[0][0];
            var wheel3 = findAnotherWheelByDistance(wheel4, wheelCenter, roverWheelDistance, false);
            ans.push([wheel3, wheel4, findSuspensionFromWheels(wheel3, wheel4)]);
        }
        //console.log(ans);
        return ans;
    }

    //var filterResFinding = function (resFinding) {
    //    var ans = [];
    //    for (var i = 0; i < resFinding.length; i++) {
    //        if ()
    //    }
    //}

    var checkIfPointOnLine = function (p, a, b) {
        return Math.abs((p[0] - a[0]) * (b[1] - a[1]) + (p[1] - a[1]) * (a[0] - b[0])) < EPS;
    }

    var checkIfPointOnInterval = function (p, a, b) {
        var d1 = distanceBetweenVectors(p, a);
        var d2 = distanceBetweenVectors(p, b);
        var d = distanceBetweenVectors(a, b);
        return Math.abs(d - d1 - d2) < EPS;
    }

    var findYByXFromPath = function (x, path) {
        for (var i = 0; i < path.length - 1; i++) {
            if (path[i][0] <= x && x <= path[i + 1][0]) {
                //console.log("check1", findYByXFromLine(x, path[i], path[i + 1]));
                return findYByXFromLine(x, path[i], path[i + 1]);
            }
        }
        //console.log("check2");
        return 0;
    }

    var checkIfPointOnPath = function (p, path) {
        //console.log(findYByXFromPath(p[0], path));
        return Math.abs(findYByXFromPath(p[0], path) - p[1]) < EPS;
    }

    var findSurfaceByWheel = function (wheel, wheelCenter, path) {
        var ans = [];
        for (var i = 0; i < wheelCenter.length - 1; i++) {
            if (wheelCenter[i].length == 1) {
                if (checkIfPointOnInterval(wheel, wheelCenter[i][0], wheelCenter[i + 1][0])) {
                    ans.push(findPointOnDistanceFromLine(wheel, wheelCenter[i + 1][0], -roverWheelRadius));
                }
            }
            else if (wheelCenter[i].length == 3) {
                //circle
                if (wheelCenter[i][0][0] <= wheel[0] && wheel[0] <= wheelCenter[i][1][0] || wheelCenter[i][1][0] <= wheel[0] && wheel[0] <= wheelCenter[i][0][0]) {
                    ans.push(wheelCenter[i][2]);
                }
                //line
                if (checkIfPointOnInterval(wheel, wheelCenter[i][1], wheelCenter[i + 1][0])) {
                    ans.push(findPointOnDistanceFromLine(wheel, wheelCenter[i + 1][0], -roverWheelRadius));
                }
            }
        }
        if (ans.length == 0) {
            ans.push([0, 0]);
        }
        //console.log(ans, ans.filter(x => checkIfPointOnPath(x, path)));
        ans = ans.filter(x => checkIfPointOnPath(x, path));
        if (ans.length == 0) {
            ans.push([0, 0]);
        }
        return ans;
    }

    //var findNormSurface = function (surf, path) {
    //    var ans = [];
    //    for (var i = 0; i < path.length - 1; i++) {
    //        if (checkIfPointOnInterval(surf, path[i], path[i + 1])) {
    //            if (distanceBetweenVectors(surf, path[i]) < EPS) {
    //            }
    //            else if (distanceBetweenVectors(surf, path[i + 1]) < EPS) {
    //            }
    //        }
    //    }
    //}

    var sigmoid = function (x, k = 1) {
        return 1 / (1 + Math.exp(-x * k));
    }

    var area = function (a_x, a_y, b_x, b_y, c_x, c_y) {
        return (b_x - a_x) * (c_y - a_y) - (b_y - a_y) * (c_x - a_x);
    }

    var intersect_1 = function (a, b, c, d) {
        if (a > b) b = [a, a = b][0];
        if (c > d) d = [c, c = d][0];
        return Math.max(a, c) <= Math.min(b, d);
    }

    var checkIntersectionSegSeg = function (a_x, a_y, b_x, b_y, c_x, c_y, d_x, d_y) {
        return intersect_1(a_x, b_x, c_x, d_x) * intersect_1(a_y, b_y, c_y, d_y) * (area(a_x, a_y, b_x, b_y, c_x, c_y) * area(a_x, a_y, b_x, b_y, d_x, d_y) <= 0) * (area(c_x, c_y, d_x, d_y, a_x, a_y) * area(c_x, c_y, d_x, d_y, b_x, b_y) <= 0);
    }

    var workingContext = function () {
        var path = roverBackForwardPath();
        var pos = roverContextPosition();
        var simplePath = findSimplifiedPath(path);
        //console.log(simplePath);
        var wheelCenter = findWheelCenter(simplePath);
        //console.log(wheelCenter);
        //console.log(wheelCenter.length);
        //wheelCenter = fixWheelCenter(wheelCenter);
        //console.log(wheelCenter.length);
        //wheelCenter.sort((a, b) => a[0][0] < b[0][0]);
        //console.log(pos);s
        //console.log(wheelCenter);

        var h = findYByXFromWheelCenter(pos[0], wheelCenter);
        var wheel1 = [pos[0], h];

        //var tmpWheel2 = findAnotherWheelByDistance(wheel1, wheelCenter, roverWheelDistance, true);

        //console.log(tmpWheel2);
        //var wheel2 = tmpWheel2[0];
        //console.log(tmpWheel2.sort((a, b) => a[1] <= b[1]));
        var wheel2 = findAnotherWheelByDistance(wheel1, wheelCenter, roverWheelDistance, true);

        //var mid = wheel1.map((x, idx) => (x + wheel2[idx]) / 2);
        //var l = Math.sqrt(roverLegLength * roverLegLength - roverWheelDistance * roverWheelDistance / 4);
        var suspension1 = findSuspensionFromWheels(wheel1, wheel2);

        var resFinding = findAnotherSuspensionAndWheels(wheelCenter, suspension1, wheel1, wheel2);

        //console.log(resFinding.length);
        //resFinding = resFinding.filter(x => checkIfPointOnWheelCenter(x[0], wheelCenter) && checkIfPointOnWheelCenter(x[1], wheelCenter));
        //console.log(resFinding.length);

        var bestResFinding = resFinding.sort((a, b) => a[1][0] <= b[1][0] ? -1 : 1)[0];
        //var bestResFinding = [[0, 0], [1, 1], [2, 2]];

        //console.log(resFinding);
        //var wheel3 = resFinding[0][0];
        //var wheel4 = resFinding[0][1];
        //var suspension2 = resFinding[0][2];

        var wheel3 = bestResFinding[0];
        var wheel4 = bestResFinding[1];
        var suspension2 = bestResFinding[2];

        var surf1 = findSurfaceByWheel(wheel1, wheelCenter, simplePath)[0];
        var surf2 = findSurfaceByWheel(wheel2, wheelCenter, simplePath)[0];
        var surf3 = findSurfaceByWheel(wheel3, wheelCenter, simplePath)[0];
        var surf4 = findSurfaceByWheel(wheel4, wheelCenter, simplePath)[0];

        var alpha = Math.PI - angleBetweenVectors2([-1.0, 0.0], [suspension1[0] - suspension2[0], suspension1[1] - suspension2[1]]);
        //console.log(alpha);

        var centerMass = suspension1.map((x, idx) => (x + suspension2[idx]) / 2);

        var R1 = surf1.map((x, idx) => x - centerMass[idx]);
        var R2 = surf2.map((x, idx) => x - centerMass[idx]);
        var R3 = surf3.map((x, idx) => x - centerMass[idx]);
        var R4 = surf4.map((x, idx) => x - centerMass[idx]);

        var A1 = [[elasticity, 0], [0, elasticity]];
        var A2 = [[elasticity, 0], [0, elasticity]];
        var A3 = [[elasticity, 0], [0, elasticity]];
        var A4 = [[elasticity, 0], [0, elasticity]];

        //console.log(wheelCenter.map(x => x[0][0]), Math.min.apply(Math, wheelCenter.map(x => x[0][0])));
        //ctx.arc()
        //console.log(simplePath);
        //console.log(simplePath.length, wheelCenter.length);
        //simplePath.map(x => [x[0], x[1] + contextScale])
        //"#000000", "#ff0000", "#007700", "#1b98ee"
        //lineWidth * 0.1, lineWidth * 0., lineWidth * 1.5, lineWidth * 1.5

        var A = [ // N_1_x, N_1_y, N_2_x, N_2_y, N_3_x, N_3_y, N_4_x, N_4_y, Delta_1_x, Delta_1_y, Delta_2_x, Delta_2_y, Delta_3_x, Delta_3_y, Delta_4_x, Delta_4_y, delta_x, delta_y, gamma
            [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // sum(N_i)+P=M w (x)
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // sum(N_i)+P=M w (y)
            [1, 0, 0, 0, 0, 0, 0, 0, A1[1][0] * Math.sin(alpha) - A1[0][0] * Math.cos(alpha), A1[1][1] * Math.sin(alpha) - A1[0][1] * Math.cos(alpha), 0, 0, 0, 0, 0, 0, 0, 0, 0], // N_1 = T A_1 Delta_1 (x)
            [0, 1, 0, 0, 0, 0, 0, 0, - A1[0][0] * Math.sin(alpha) - A1[1][0] * Math.cos(alpha), - A1[0][1] * Math.sin(alpha) - A1[1][1] * Math.cos(alpha), 0, 0, 0, 0, 0, 0, 0, 0, 0], // N_1 = T A_1 Delta_1 (y)
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, A2[1][0] * Math.sin(alpha) - A2[0][0] * Math.cos(alpha), A2[1][1] * Math.sin(alpha) - A2[0][1] * Math.cos(alpha), 0, 0, 0, 0, 0, 0, 0], // N_2 = T A_2 Delta_2 (x)
            [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, - A2[0][0] * Math.sin(alpha) - A2[1][0] * Math.cos(alpha), - A2[0][1] * Math.sin(alpha) - A2[1][1] * Math.cos(alpha), 0, 0, 0, 0, 0, 0, 0], // N_2 = T A_2 Delta_2 (y)
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, A3[1][0] * Math.sin(alpha) - A3[0][0] * Math.cos(alpha), A3[1][1] * Math.sin(alpha) - A3[0][1] * Math.cos(alpha), 0, 0, 0, 0, 0], // N_3 = T A_3 Delta_3 (x)
            [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, - A3[0][0] * Math.sin(alpha) - A3[1][0] * Math.cos(alpha), - A3[0][1] * Math.sin(alpha) - A3[1][1] * Math.cos(alpha), 0, 0, 0, 0, 0], // N_3 = T A_3 Delta_3 (y)
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, A4[1][0] * Math.sin(alpha) - A4[0][0] * Math.cos(alpha), A4[1][1] * Math.sin(alpha) - A4[0][1] * Math.cos(alpha), 0, 0, 0], // N_4 = T A_4 Delta_4 (x)
            [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, - A4[0][0] * Math.sin(alpha) - A4[1][0] * Math.cos(alpha), - A4[0][1] * Math.sin(alpha) - A4[1][1] * Math.cos(alpha), 0, 0, 0], // N_4 = T A_4 Delta_4 (y)
            [0, 0, 0, 0, 0, 0, 0, 0, Math.cos(alpha), - Math.sin(alpha), 0, 0, 0, 0, 0, 0, 1, 0, - R1[0] * Math.sin(alpha) - R1[1] * Math.cos(alpha)], // delta + T T R_1 + T Delta_1 = surf_1 (x)
            [0, 0, 0, 0, 0, 0, 0, 0, Math.sin(alpha), Math.cos(alpha), 0, 0, 0, 0, 0, 0, 0, 1, R1[0] * Math.cos(alpha) - R1[1] * Math.sin(alpha)], // delta + T T R_1 + T Delta_1 = surf_1 (y)
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, Math.cos(alpha), - Math.sin(alpha), 0, 0, 0, 0, 1, 0, - R2[0] * Math.sin(alpha) - R2[1] * Math.cos(alpha)], // delta + T T R_2 + T Delta_2 = surf_2 (x)
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, Math.sin(alpha), Math.cos(alpha), 0, 0, 0, 0, 0, 1, R2[0] * Math.cos(alpha) - R2[1] * Math.sin(alpha)], // delta + T T R_2 + T Delta_2 = surf_2 (y)
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, Math.cos(alpha), - Math.sin(alpha), 0, 0, 1, 0, - R3[0] * Math.sin(alpha) - R3[1] * Math.cos(alpha)], // delta + T T R_3 + T Delta_3 = surf_3 (x)
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, Math.sin(alpha), Math.cos(alpha), 0, 0, 0, 1, R3[0] * Math.cos(alpha) - R3[1] * Math.sin(alpha)], // delta + T T R_3 + T Delta_3 = surf_3 (y)
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, Math.cos(alpha), - Math.sin(alpha), 1, 0, - R4[0] * Math.sin(alpha) - R4[1] * Math.cos(alpha)], // delta + T T R_4 + T Delta_4 = surf_4 (x)
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, Math.sin(alpha), Math.cos(alpha), 0, 1, R4[0] * Math.cos(alpha) - R4[1] * Math.sin(alpha)], // delta + T T R_4 + T Delta_4 = surf_4 (y)
            [- R1[0] * Math.sin(alpha) - R1[1] * Math.cos(alpha), R1[0] * Math.cos(alpha) - R1[1] * Math.sin(alpha), - R2[0] * Math.sin(alpha) - R2[1] * Math.cos(alpha), R2[0] * Math.cos(alpha) - R2[1] * Math.sin(alpha), - R3[0] * Math.sin(alpha) - R3[1] * Math.cos(alpha), R3[0] * Math.cos(alpha) - R3[1] * Math.sin(alpha), - R4[0] * Math.sin(alpha) - R4[1] * Math.cos(alpha), R4[0] * Math.cos(alpha) - R4[1] * Math.sin(alpha), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // sum( T R x N ) = 0
        ];

        var b = [
            0,
            roverMass * gravityAcceleration,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            surf1[0] - R1[0] * Math.cos(alpha) + R1[1] * Math.sin(alpha),
            surf1[1] - R1[0] * Math.sin(alpha) - R1[1] * Math.cos(alpha),
            surf2[0] - R2[0] * Math.cos(alpha) + R2[1] * Math.sin(alpha),
            surf2[1] - R2[0] * Math.sin(alpha) - R2[1] * Math.cos(alpha),
            surf3[0] - R3[0] * Math.cos(alpha) + R3[1] * Math.sin(alpha),
            surf3[1] - R3[0] * Math.sin(alpha) - R3[1] * Math.cos(alpha),
            surf4[0] - R4[0] * Math.cos(alpha) + R4[1] * Math.sin(alpha),
            surf4[1] - R4[0] * Math.sin(alpha) - R4[1] * Math.cos(alpha),
            0
        ];

        var dynamic = solveLinearSystem(A, b);

        var N1 = [dynamic[0], dynamic[1]];
        var N2 = [dynamic[2], dynamic[3]];
        var N3 = [dynamic[4], dynamic[5]];
        var N4 = [dynamic[6], dynamic[7]];

        var Delta_1 = [dynamic[8], dynamic[9]];
        var Delta_2 = [dynamic[10], dynamic[11]];
        var Delta_3 = [dynamic[12], dynamic[13]];
        var Delta_4 = [dynamic[14], dynamic[15]];
        var Delta = [dynamic[16], dynamic[17]];

        var new_gamma = dynamic[18];

        var NP1 = normalizeVector([wheel1[0] - surf1[0], wheel1[1] - surf1[1]]);
        var NP2 = normalizeVector([wheel2[0] - surf2[0], wheel2[1] - surf2[1]]);
        var NP3 = normalizeVector([wheel3[0] - surf3[0], wheel3[1] - surf3[1]]);
        var NP4 = normalizeVector([wheel4[0] - surf4[0], wheel4[1] - surf4[1]]);

        NP1 = [[NP1[1], -NP1[0]], NP1];
        NP2 = [[NP2[1], -NP2[0]], NP2];
        NP3 = [[NP3[1], -NP3[0]], NP3];
        NP4 = [[NP4[1], -NP4[0]], NP4];

        var invert1 = [[NP1[0][0], -NP1[0][1]], [-NP1[1][0], NP1[1][1]]];
        var invert2 = [[NP2[0][0], -NP2[0][1]], [-NP2[1][0], NP2[1][1]]];
        var invert3 = [[NP3[0][0], -NP3[0][1]], [-NP3[1][0], NP3[1][1]]];
        var invert4 = [[NP4[0][0], -NP4[0][1]], [-NP4[1][0], NP4[1][1]]];

        var N1_t = invert1[0][0] * N1[0] + invert1[0][1] * N1[1];
        var N1_n = invert1[1][0] * N1[0] + invert1[1][1] * N1[1];
        var N2_t = invert2[0][0] * N2[0] + invert2[0][1] * N2[1];
        var N2_n = invert2[1][0] * N2[0] + invert2[1][1] * N2[1];
        var N3_t = invert3[0][0] * N3[0] + invert3[0][1] * N3[1];
        var N3_n = invert3[1][0] * N3[0] + invert3[1][1] * N3[1];
        var N4_t = invert4[0][0] * N4[0] + invert4[0][1] * N4[1];
        var N4_n = invert4[1][0] * N4[0] + invert4[1][1] * N4[1];

        NP1[0] = NP1[0].map(x => x * 30);
        NP1[1] = NP1[1].map(x => x * 30);
        NP2[0] = NP2[0].map(x => x * 30);
        NP2[1] = NP2[1].map(x => x * 30);
        NP3[0] = NP3[0].map(x => x * 30);
        NP3[1] = NP3[1].map(x => x * 30);
        NP4[0] = NP4[0].map(x => x * 30);
        NP4[1] = NP4[1].map(x => x * 30);

        N1 = normalizeVector(N1).map(x => x * 30);
        N2 = normalizeVector(N2).map(x => x * 30);
        N3 = normalizeVector(N3).map(x => x * 30);
        N4 = normalizeVector(N4).map(x => x * 30);

        var checkIntersection = 0;

        for (var i = 0; i < simplePath.length - 1; i++) {
            var a_x = simplePath[i][0];
            var a_y = simplePath[i][1];
            var b_x = simplePath[i + 1][0];
            var b_y = simplePath[i + 1][1];
            var c_x = suspension1[0];
            var c_y = suspension1[1];
            var kernelWidth = 50.0;
            var vec = [suspension1[0] - suspension2[0], suspension1[1] - suspension2[1]];
            var n = normaVector(vec);
            var vec = vec.map(x => x / n);
            var d_x = suspension1[0] + vec[0] * kernelWidth;
            var d_y = suspension1[1] + vec[1] * kernelWidth;
            //ctx.lineTo(suspensions[0][0] + vec[0] * kernelWidth, suspensions[0][1] + vec[1] * kernelWidth);
            checkIntersection += checkIntersectionSegSeg(a_x, a_y, b_x, b_y, c_x, c_y, d_x, d_y);
        }

        var lineWidth = 2 / contextScale;

        drawContext([
            [simplePath, "line", lineWidth * 1.0, "#000000"],
            [wheelCenter, "wheelCenter", lineWidth * 0.2, "#ff0000"],
            [simplePath, "scatter", lineWidth * 1.5, "#007700"],
            [wheelCenter, "wheelCenterScatter", lineWidth * 1.5, "#1b98ee"]],
            //[tmpWheel2, "scatter", lineWidth * 3, "#ff00ff"]],
            pos, [wheel1, wheel2, wheel3, wheel4], [suspension1, suspension2], [surf1, surf2, surf3, surf4], [N1, N2, N3, N4], [NP1, NP2, NP3, NP4], lineWidth);

        document.getElementById('info2').innerHTML =
            `pos: ${pos.map(x => x.toFixed(3))}
wheel_1: ${wheel1.map(x => x.toFixed(3))}
wheel_2: ${wheel2.map(x => x.toFixed(3))}
wheel_3: ${wheel3.map(x => x.toFixed(3))}
wheel_4: ${wheel4.map(x => x.toFixed(3))}
roverWheelDistance: ${roverWheelDistance.toFixed(3)}
d(w_1, w_2): ${distanceBetweenVectors(wheel1, wheel2).toFixed(3)}
d(w_3, w_4): ${distanceBetweenVectors(wheel3, wheel4).toFixed(3)}
roverSuspensionsDistance: ${roverSuspensionsDistance.toFixed(3)}
d(s_1, s_2): ${distanceBetweenVectors(suspension1, suspension2).toFixed(3)}`;
        document.getElementById('info2').innerHTML = "";
        //surf1: ${surf1.map(x => x.toFixed(3))}
        //surf2: ${surf2.map(x => x.toFixed(3))}
        //surf3: ${surf3.map(x => x.toFixed(3))}
        //surf4: ${surf4.map(x => x.toFixed(3))}`;


        var danger_1 = elasticity * Math.abs(N1_n) - Math.abs(N1_t);
        var danger_2 = elasticity * Math.abs(N2_n) - Math.abs(N2_t);
        var danger_3 = elasticity * Math.abs(N3_n) - Math.abs(N3_t);
        var danger_4 = elasticity * Math.abs(N4_n) - Math.abs(N4_t);

        var condition_check_1 = danger_1 <= 0.0; // > - непроскальзывает, <= - проскальзывает
        var condition_check_2 = danger_2 <= 0.0;
        var condition_check_3 = danger_3 <= 0.0;
        var condition_check_4 = danger_4 <= 0.0;

        //console.log(condition_check_1);
        //console.log(condition_check_2);
        //console.log(condition_check_3);
        //console.log(condition_check_4);

        var danger_norm_1 = Math.sqrt((elasticity * Math.abs(N1_n)) ** 2 + Math.abs(N1_t) ** 2);
        var danger_norm_2 = Math.sqrt((elasticity * Math.abs(N2_n)) ** 2 + Math.abs(N2_t) ** 2);
        var danger_norm_3 = Math.sqrt((elasticity * Math.abs(N3_n)) ** 2 + Math.abs(N3_t) ** 2);
        var danger_norm_4 = Math.sqrt((elasticity * Math.abs(N4_n)) ** 2 + Math.abs(N4_t) ** 2);

        var root_danger = 5;

        var danger_level_1 = Math.pow((1 - danger_1 / danger_norm_1) / 2, 1 / root_danger);
        var danger_level_2 = Math.pow((1 - danger_2 / danger_norm_2) / 2, 1 / root_danger);
        var danger_level_3 = Math.pow((1 - danger_3 / danger_norm_3) / 2, 1 / root_danger);
        var danger_level_4 = Math.pow((1 - danger_4 / danger_norm_4) / 2, 1 / root_danger);

        //var danger_level_1 = sigmoid(-danger_1, 1e-2);
        //var danger_level_2 = sigmoid(-danger_2, 1e-2);
        //var danger_level_3 = sigmoid(-danger_3, 1e-2);
        //var danger_level_4 = sigmoid(-danger_4, 1e-2);

        var danger_level_1 = Math.abs(N1_t) / (Math.abs(N1_n) * elasticity);
        var danger_level_2 = Math.abs(N2_t) / (Math.abs(N2_n) * elasticity);
        var danger_level_3 = Math.abs(N3_t) / (Math.abs(N3_n) * elasticity);
        var danger_level_4 = Math.abs(N4_t) / (Math.abs(N4_n) * elasticity);

        var general_danger_level = Math.max(danger_level_1, danger_level_2, danger_level_3, danger_level_4);

        document.getElementById("info3").innerHTML =
            `k|N1_n| - |N1_t|: ${danger_1.toFixed(3)} > 0 ${condition_check_1}
k|N2_n| - |N2_t|: ${danger_2.toFixed(3)} > 0 ${condition_check_2}
k|N3_n| - |N3_t|: ${danger_3.toFixed(3)} > 0 ${condition_check_3}
k|N4_n| - |N4_t|: ${danger_4.toFixed(3)} > 0 ${condition_check_4}
non-slippage: ${Boolean(condition_check_1 + condition_check_2 + condition_check_3 + condition_check_4)}
level_1: ${(danger_level_1 * 100).toFixed(3)}%
level_2: ${(danger_level_2 * 100).toFixed(3)}%
level_3: ${(danger_level_3 * 100).toFixed(3)}%
level_4: ${(danger_level_4 * 100).toFixed(3)}%`;

        //document.getElementById("info3").innerHTML = `проскальзывание: `;
        //document.getElementById("info3").style.color = 'red';
        document.getElementById("info3").innerHTML =
            `проскальзывание: <div style="display: inline; color: ${condition_check_1 + condition_check_2 + condition_check_3 + condition_check_4 ? "red" : "green"}">${condition_check_1 + condition_check_2 + condition_check_3 + condition_check_4 ? "да" : "нет"}</div>
уровень опасности первого    колеса: <div style="display: inline; color: ${danger_level_1 < 1.0 ? "green" : "red"}">${(danger_level_1 * 100).toFixed(3)}%</div>
уровень опасности второго    колеса: <div style="display: inline; color: ${danger_level_2 < 1.0 ? "green" : "red"}">${(danger_level_2 * 100).toFixed(3)}%</div>
уровень опасности третьего   колеса: <div style="display: inline; color: ${danger_level_3 < 1.0 ? "green" : "red"}">${(danger_level_3 * 100).toFixed(3)}%</div>
уровень опасности четвертого колеса: <div style="display: inline; color: ${danger_level_4 < 1.0 ? "green" : "red"}">${(danger_level_4 * 100).toFixed(3)}%</div>
пересечение: <div style="display: inline; color: ${checkIntersection ? "red" : "green"}">${checkIntersection ? "да" : "нет"}</div>`;
        //document.getElementById("info3").innerHTML = '<div style="color: red;">Красный текст</div>';
        //delta_1: ${Delta_1.map(x => x.toFixed(3))}
        //delta_2: ${Delta_2.map(x => x.toFixed(3))}
        //delta_3: ${Delta_3.map(x => x.toFixed(3))}
        //delta_4: ${Delta_4.map(x => x.toFixed(3))}
        //delta: ${Delta.map(x => x.toFixed(3))}
        //`;

        return [general_danger_level, Delta_1, Delta_2, Delta_3, Delta_4, Delta];
    }

    var workingContextResult = workingContext();
    var general_danger_level = workingContextResult[0];
    //console.log(wheel1);


    //drawContext([findWheelCenter(roverBackForwardPath())], roverContextPosition());

    //console.log(roverBackForwardPath(), roverContextPosition());

    //findWheelCenter(roverBackForwardPath());

    //var pth = findPath(roverPosition, roverTargetPosition, roverSpeed);
    //var forw = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];
    ////console.log(pth);
    //var cnv2Array = [];
    //for (var i = 0; i < pth.length; i++) {
    //    //console.log();
    //    cnv2Array.push([pth[i][2] * forw[2] + pth[i][0] * forw[0], pth[i][0] * forw[2] - pth[i][2] * forw[0]]);
    //    //cnv2Array.push([mathCalc.euclidNorm([pth[i][0], pth[i][2]]), pth[i][1]]);
    //}
    //console.log(pth);
    //console.log(cnv2Array);

    //var check = [[1.0, 1.0, -1.0], [1.0, -1.0, -1.0], [-1.0, 1.0, -1.0], [-1.0, -1.0, -1.0], [0, 0, 0]];
    //for (var i = 0; i < check.length; i++) {
    //    console.log(check[i]);
    //    var res = glMatrix.vec4.fromValues(check[i][0], check[i][1], check[i][2], 1.0);
    //    glMatrix.vec4.transformMat4(
    //        res,
    //        res,
    //        MVP(modelMatrix, viewMatrix, projMatrix)
    //    );
    //    var screenX = (1 + res[0] / res[2]) * canvas.width / 2;
    //    var screenY = (1 - res[1] / res[2]) * canvas.height / 2;
    //    console.log(screenX, screenY);
    //}

    //var res = glMatrix.vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    //glMatrix.vec4.transformMat4(
    //    res,
    //    res,
    //    MVP(modelMatrix, viewMatrix, projMatrix)
    //);
    //console.log(res)

    //var result = glMatrix.vec4.fromValues(targetPosition[0], targetPosition[1], targetPosition[2], 1.0);
    //glMatrix.vec4.transformMat4(result, result, TranslateRotateRotateTranslate(0.0, 0.0));
    //targetPosition = [result[0], result[1], result[2]];

    //var onMouseMove = function (event) {
    //    //console.log(event.movementX, event.movementY);
    //    var angleX = event.movementY / 100;
    //    var angleY = event.movementX / 100;
    //    var forwardTrans = glMatrix.mat4.create();
    //    var backwardTrans = glMatrix.mat4.create();
    //    var rotateByX = glMatrix.mat4.create();
    //    var rotateByY = glMatrix.mat4.create();
    //    glMatrix.mat4.translate(forwardTrans, forwardTrans, cameraPosition);
    //    glMatrix.mat4.rotate(rotateByX, rotateByX, angleX, [1, 0, 0]);
    //    glMatrix.mat4.rotate(rotateByY, rotateByY, angleY, [0, 1, 0]);
    //    glMatrix.mat4.translate(backwardTrans, backwardTrans, cameraPosition.map(x => -x));
    //    var wholeTrans = glMatrix.mat4.create();
    //    glMatrix.mat4.multiply(wholeTrans, rotateByX, forwardTrans);
    //    glMatrix.mat4.multiply(wholeTrans, rotateByY, wholeTrans);
    //    glMatrix.mat4.multiply(wholeTrans, backwardTrans, wholeTrans);
    //    var result = glMatrix.vec4.fromValues(targetPosition[0], targetPosition[1], targetPosition[2], 1.0);
    //    glMatrix.vec4.transformMat4(result, result, wholeTrans);
    //    //console.log(result);
    //    targetPosition = [result[0], result[1], result[2]];
    //    //console.log(targetPosition);
    //}


    var onKeyDown = function (event) {
        //console.log(event.key);

        //event.preventDefault();
        //console.log(event.key);

        switch (event.key) {
            case 'w':
                //console.log('w');
                //var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
                var c = cameraPosition;
                //console.log(c);
                cameraPosition = mathCalc.findPointOnSegment(cameraPosition, targetPosition, cameraSpeed);
                targetPosition = targetPosition.map((num, idx) => num + cameraPosition[idx] - c[idx]);
                //console.log(c);
                //targetPosition = mathCalc.findPointOnSegment(targetPosition, t, cameraSpeed);
                //var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);
                break;
            case 'a':
                //console.log('a');
                //var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
                var c = cameraPosition;
                cameraPosition = mathCalc.findPointOnOrtSegment(cameraPosition, targetPosition, cameraSpeed);
                targetPosition = targetPosition.map((num, idx) => num + cameraPosition[idx] - c[idx]);
                //targetPosition = mathCalc.findPointOnOrtSegment(targetPosition, t, cameraSpeed);

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);
                break;
            case 's':
                //console.log('s');
                //var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
                var c = cameraPosition;
                cameraPosition = mathCalc.findPointOnSegment(cameraPosition, targetPosition, -cameraSpeed);
                targetPosition = targetPosition.map((num, idx) => num + cameraPosition[idx] - c[idx]);
                //targetPosition = mathCalc.findPointOnSegment(targetPosition, t, -cameraSpeed);

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);
                break;
            case 'd':
                //console.log('d');
                //var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
                var c = cameraPosition;
                cameraPosition = mathCalc.findPointOnOrtSegment(cameraPosition, targetPosition, -cameraSpeed);
                //console.log(cameraPosition);
                targetPosition = targetPosition.map((num, idx) => num + cameraPosition[idx] - c[idx]);
                //targetPosition = mathCalc.findPointOnOrtSegment(targetPosition, t, -cameraSpeed);
                //console.log(targetPosition); w

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);
                break;
            case ' ':
                //console.log('space');
                cameraPosition[1] += cameraSpeed;
                targetPosition[1] += cameraSpeed;

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);
                break;
            case 'Shift':
                //console.log('shift');
                cameraPosition[1] -= cameraSpeed;
                targetPosition[1] -= cameraSpeed;

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);
                break;
            case 'ArrowUp':
                //var t = roverTargetPosition.map((num, idx) => 2 * num - roverPosition[idx]);
                var r = roverPosition;
                var f = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, roverSpeed);
                var trig = findTriangle(f[0], f[2]);
                var h = 0.0;
                //console.log(trig);
                if (0 <= trig[0] && trig[0] < fieldWidth && 0 <= trig[1] && trig[1] < fieldHeight && 0 <= trig[2] && trig[2] < fieldWidth && 0 <= trig[3] && trig[3] < fieldHeight && 0 <= trig[4] && trig[4] < fieldWidth && 0 <= trig[5] && trig[5] < fieldHeight) {
                    var x0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1]];
                    var y0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 1];
                    var z0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 2];
                    var x1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3]];
                    var y1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 1];
                    var z1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 2];
                    var x2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5]];
                    var y2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 1];
                    var z2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 2];
                    h = mathCalc.pointOnTriangle(f[0], f[2], x0, y0, z0, x1, y1, z1, x2, y2, z2);
                }
                //else {
                //    var h = f[1];
                //}
                //console.log(x0, y0, z0, x1, y1, z1, x2, y2, z2);
                //console.log(f[0], f[2]);
                //console.log(h);
                roverPosition = [f[0], h, f[2]];
                roverTargetPosition = [roverTargetPosition[0] + f[0] - r[0], h, roverTargetPosition[2] + f[2] - r[2]];
                //roverPosition = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, roverSpeed);
                //roverTargetPosition = roverTargetPosition.map((num, idx) => num + roverPosition[idx] - r[idx]);
                //console.log(r);
                //roverTargetPosition = mathCalc.findPointOnSegment(roverTargetPosition, t, roverSpeed);

                for (var i = 0; i < roverVerticesLength; i++) {
                    boxVertices[offset * 6 * 2 + 6 * i] += f[0] - r[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 1] += h - r[1];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] += f[2] - r[2];
                    //console.log(r);
                }
                //console.log(r);

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                //roverBackForwardPath();
                //drawContext(roverBackForwardPath(), roverContextPosition());
                workingContextResult = workingContext();
                general_danger_level = workingContextResult[0];


                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation1, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                gl.vertexAttribPointer(
                    positionAttribLocation2, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                break;
            case 'ArrowDown':
                //var t = roverTargetPosition.map((num, idx) => 2 * num - roverPosition[idx]);
                //var r = roverPosition;
                //roverPosition = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, -roverSpeed);
                //roverTargetPosition = roverTargetPosition.map((num, idx) => num + roverPosition[idx] - r[idx]);
                //roverTargetPosition = mathCalc.findPointOnSegment(roverTargetPosition, t, -roverSpeed);

                var r = roverPosition;
                var f = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, -roverSpeed);
                var trig = findTriangle(f[0], f[2]);
                var h = 0.0;

                if (0 <= trig[0] && trig[0] < fieldWidth && 0 <= trig[1] && trig[1] < fieldHeight && 0 <= trig[2] && trig[2] < fieldWidth && 0 <= trig[3] && trig[3] < fieldHeight && 0 <= trig[4] && trig[4] < fieldWidth && 0 <= trig[5] && trig[5] < fieldHeight) {
                    var x0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1]];
                    var y0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 1];
                    var z0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 2];
                    var x1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3]];
                    var y1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 1];
                    var z1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 2];
                    var x2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5]];
                    var y2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 1];
                    var z2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 2];
                    h = mathCalc.pointOnTriangle(f[0], f[2], x0, y0, z0, x1, y1, z1, x2, y2, z2);
                }
                //else {
                //    var h = f[1];
                //}

                roverPosition = [f[0], h, f[2]];
                roverTargetPosition = [roverTargetPosition[0] + f[0] - r[0], h, roverTargetPosition[2] + f[2] - r[2]];

                for (var i = 0; i < roverVerticesLength; i++) {
                    //boxVertices[offset * 6 * 2 + 6 * i] += roverPosition[0] - r[0];
                    //boxVertices[offset * 6 * 2 + 6 * i + 2] += roverPosition[2] - r[2];
                    boxVertices[offset * 6 * 2 + 6 * i] += f[0] - r[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 1] += h - r[1];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] += f[2] - r[2];
                }

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                //var pth = findPath(roverPosition, roverTargetPosition, roverSpeed);
                //var forw = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];
                ////console.log(pth);
                //var cnv2Array = [];
                //for (var i = 0; i < pth.length; i++) {
                //    //console.log();
                //    cnv2Array.push([pth[i][2] * forw[2] + pth[i][0] * forw[0], pth[i][0] * forw[2] - pth[i][2] * forw[0]]);
                //    //cnv2Array.push([mathCalc.euclidNorm([pth[i][0], pth[i][2]]), pth[i][1]]);
                //}
                ////console.log(pth);
                //console.log(cnv2Array);

                //roverBackForwardPath();
                //drawContext(roverBackForwardPath(), roverContextPosition());
                workingContextResult = workingContext();
                general_danger_level = workingContextResult[0];

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation1, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                gl.vertexAttribPointer(
                    positionAttribLocation2, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                break;
            case 'ArrowRight':
                //var t = roverTargetPosition;
                //console.log(t);
                var res_1 = mathCalc.shiftRotateShift([roverTargetPosition[0], roverTargetPosition[2]], [roverPosition[0], roverPosition[2]], roverSensitivity);
                //roverTargetPosition[0] = roverPosition[0] + (t[0] - roverPosition[0]) * Math.cos(roverSensitivity) - (t[2] - roverPosition[2]) * Math.sin(roverSensitivity);
                //console.log(t);
                //roverTargetPosition[2] = roverPosition[2] + (t[0] - roverPosition[0]) * Math.sin(roverSensitivity) + (t[2] - roverPosition[2]) * Math.cos(roverSensitivity);
                roverTargetPosition[0] = res_1[0];
                roverTargetPosition[2] = res_1[1];

                for (var i = 0; i < roverVerticesLength; i++) {
                    //var x = boxVertices[offset * 6 * 2 + 6 * i];
                    //var y = boxVertices[offset * 6 * 2 + 6 * i + 2];
                    var res_2 = mathCalc.shiftRotateShift([boxVertices[offset * 6 * 2 + 6 * i], boxVertices[offset * 6 * 2 + 6 * i + 2]], [roverPosition[0], roverPosition[2]], roverSensitivity);
                    boxVertices[offset * 6 * 2 + 6 * i] = res_2[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] = res_2[1];
                    //boxVertices[offset * 6 * 2 + 6 * i] = roverPosition[0] + (x - roverPosition[0]) * Math.cos(roverSensitivity) - (y - roverPosition[2]) * Math.sin(roverSensitivity);
                    //boxVertices[offset * 6 * 2 + 6 * i + 2] = roverPosition[2] + (x - roverPosition[0]) * Math.sin(roverSensitivity) + (y - roverPosition[2]) * Math.cos(roverSensitivity);
                }

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                //var pth = findPath(roverPosition, roverTargetPosition, roverSpeed);
                //var forw = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];
                ////console.log(pth);
                //var cnv2Array = [];
                //for (var i = 0; i < pth.length; i++) {
                //    //console.log();
                //    cnv2Array.push([pth[i][2] * forw[2] + pth[i][0] * forw[0], pth[i][0] * forw[2] - pth[i][2] * forw[0]]);
                //    //cnv2Array.push([mathCalc.euclidNorm([pth[i][0], pth[i][2]]), pth[i][1]]);
                //}
                ////console.log(pth);
                //console.log(cnv2Array);

                //roverBackForwardPath();
                //drawContext(roverBackForwardPath(), roverContextPosition());
                workingContextResult = workingContext();
                general_danger_level = workingContextResult[0];

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation1, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                gl.vertexAttribPointer(
                    positionAttribLocation2, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                break;
            case 'ArrowLeft':
                //var t = roverTargetPosition;
                //roverTargetPosition[0] = roverPosition[0] + (t[0] - roverPosition[0]) * Math.cos(roverSensitivity) + (t[2] - roverPosition[2]) * Math.sin(roverSensitivity);
                //roverTargetPosition[2] = roverPosition[2] - (t[0] - roverPosition[0]) * Math.sin(roverSensitivity) + (t[2] - roverPosition[2]) * Math.cos(roverSensitivity);
                var res_1 = mathCalc.shiftRotateShift([roverTargetPosition[0], roverTargetPosition[2]], [roverPosition[0], roverPosition[2]], -roverSensitivity);
                roverTargetPosition[0] = res_1[0];
                roverTargetPosition[2] = res_1[1];

                for (var i = 0; i < roverVerticesLength; i++) {
                    var res_2 = mathCalc.shiftRotateShift([boxVertices[offset * 6 * 2 + 6 * i], boxVertices[offset * 6 * 2 + 6 * i + 2]], [roverPosition[0], roverPosition[2]], -roverSensitivity);
                    boxVertices[offset * 6 * 2 + 6 * i] = res_2[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] = res_2[1];
                    //var x = boxVertices[offset * 6 * 2 + 6 * i];
                    //var y = boxVertices[offset * 6 * 2 + 6 * i + 2];
                    //boxVertices[offset * 6 * 2 + 6 * i] = roverPosition[0] + (x - roverPosition[0]) * Math.cos(roverSensitivity) + (y - roverPosition[2]) * Math.sin(roverSensitivity);
                    //boxVertices[offset * 6 * 2 + 6 * i + 2] = roverPosition[2] - (x - roverPosition[0]) * Math.sin(roverSensitivity) + (y - roverPosition[2]) * Math.cos(roverSensitivity);
                }

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                //var pth = findPath(roverPosition, roverTargetPosition, roverSpeed);
                //var forw = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];
                ////console.log(pth);
                //var cnv2Array = [];
                //for (var i = 0; i < pth.length; i++) {
                //    //console.log();
                //    cnv2Array.push([pth[i][2] * forw[2] + pth[i][0] * forw[0], pth[i][0] * forw[2] - pth[i][2] * forw[0]]);
                //    //cnv2Array.push([mathCalc.euclidNorm([pth[i][0], pth[i][2]]), pth[i][1]]);
                //}
                ////console.log(pth);
                //console.log(cnv2Array);

                //roverBackForwardPath();
                //drawContext(roverBackForwardPath(), roverContextPosition());
                workingContextResult = workingContext();
                general_danger_level = workingContextResult[0];

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation1, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                gl.vertexAttribPointer(
                    positionAttribLocation2, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                break;

        }

        //event.preventDefault();

        //if (event.key == 'w') {
        //    var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
        //    cameraPosition = mathCalc.findPointOnSegment(cameraPosition, targetPosition, cameraSpeed);
        //    targetPosition = mathCalc.findPointOnSegment(targetPosition, t, cameraSpeed);
        //}
        //if (event.key == 'a') {
        //    var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
        //    cameraPosition = mathCalc.findPointOnOrtSegment(cameraPosition, targetPosition, cameraSpeed);
        //    targetPosition = mathCalc.findPointOnOrtSegment(targetPosition, t, cameraSpeed);
        //}
        //if (event.key == 's') {
        //    var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
        //    cameraPosition = mathCalc.findPointOnSegment(cameraPosition, targetPosition, -cameraSpeed);
        //    targetPosition = mathCalc.findPointOnSegment(targetPosition, t, -cameraSpeed);
        //}
        //if (event.key == 'd') {
        //    var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
        //    cameraPosition = mathCalc.findPointOnOrtSegment(cameraPosition, targetPosition, -cameraSpeed);
        //    targetPosition = mathCalc.findPointOnOrtSegment(targetPosition, t, -cameraSpeed);
        //}
        //if (event.key == ' ') {
        //    cameraPosition[1] += cameraSpeed;
        //    targetPosition[1] += cameraSpeed;
        //}
        //if (event.key == 'Shift') {
        //    cameraPosition[1] -= cameraSpeed;
        //    targetPosition[1] -= cameraSpeed;
        //}

    }

    var onKeyDownRoverMode = function (event) {
        //console.log(event.key);

        //event.preventDefault();
        //console.log(event.key);

        switch (event.key) {

            case 'ArrowUp':
                //var t = roverTargetPosition.map((num, idx) => 2 * num - roverPosition[idx]);
                var r = roverPosition;
                var f = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, roverSpeed);
                var trig = findTriangle(f[0], f[2]);
                var h = 0.0;
                //console.log(trig);
                if (0 <= trig[0] && trig[0] < fieldWidth && 0 <= trig[1] && trig[1] < fieldHeight && 0 <= trig[2] && trig[2] < fieldWidth && 0 <= trig[3] && trig[3] < fieldHeight && 0 <= trig[4] && trig[4] < fieldWidth && 0 <= trig[5] && trig[5] < fieldHeight) {
                    var x0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1]];
                    var y0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 1];
                    var z0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 2];
                    var x1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3]];
                    var y1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 1];
                    var z1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 2];
                    var x2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5]];
                    var y2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 1];
                    var z2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 2];
                    h = mathCalc.pointOnTriangle(f[0], f[2], x0, y0, z0, x1, y1, z1, x2, y2, z2);
                }
                //else {
                //    var h = f[1];
                //}
                //console.log(x0, y0, z0, x1, y1, z1, x2, y2, z2);
                //console.log(f[0], f[2]);
                //console.log(h);
                roverPosition = [f[0], h, f[2]];
                roverTargetPosition = [roverTargetPosition[0] + f[0] - r[0], h, roverTargetPosition[2] + f[2] - r[2]];

                cameraPosition = [f[0], h + 2 * roverScale + roverCameraShift, f[2]];
                targetPosition = [roverTargetPosition[0], h + 2 * roverScale + roverCameraShift, roverTargetPosition[2]];

                cameraPitch = 0.0;

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);

                //roverPosition = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, roverSpeed);
                //roverTargetPosition = roverTargetPosition.map((num, idx) => num + roverPosition[idx] - r[idx]);
                //console.log(r);
                //roverTargetPosition = mathCalc.findPointOnSegment(roverTargetPosition, t, roverSpeed);

                for (var i = 0; i < roverVerticesLength; i++) {
                    boxVertices[offset * 6 * 2 + 6 * i] += f[0] - r[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 1] += h - r[1];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] += f[2] - r[2];
                    //console.log(r);
                }
                //console.log(r);

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                //roverBackForwardPath();
                //drawContext(roverBackForwardPath(), roverContextPosition());
                workingContextResult = workingContext();
                general_danger_level = workingContextResult[0];

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation1, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                gl.vertexAttribPointer(
                    positionAttribLocation2, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                break;
            case 'ArrowDown':
                //var t = roverTargetPosition.map((num, idx) => 2 * num - roverPosition[idx]);
                //var r = roverPosition;
                //roverPosition = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, -roverSpeed);
                //roverTargetPosition = roverTargetPosition.map((num, idx) => num + roverPosition[idx] - r[idx]);
                //roverTargetPosition = mathCalc.findPointOnSegment(roverTargetPosition, t, -roverSpeed);

                var r = roverPosition;
                var f = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, -roverSpeed);
                var trig = findTriangle(f[0], f[2]);
                var h = 0.0;

                if (0 <= trig[0] && trig[0] < fieldWidth && 0 <= trig[1] && trig[1] < fieldHeight && 0 <= trig[2] && trig[2] < fieldWidth && 0 <= trig[3] && trig[3] < fieldHeight && 0 <= trig[4] && trig[4] < fieldWidth && 0 <= trig[5] && trig[5] < fieldHeight) {
                    var x0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1]];
                    var y0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 1];
                    var z0 = boxVertices[6 * fieldHeight * trig[0] + 6 * trig[1] + 2];
                    var x1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3]];
                    var y1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 1];
                    var z1 = boxVertices[6 * fieldHeight * trig[2] + 6 * trig[3] + 2];
                    var x2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5]];
                    var y2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 1];
                    var z2 = boxVertices[6 * fieldHeight * trig[4] + 6 * trig[5] + 2];
                    h = mathCalc.pointOnTriangle(f[0], f[2], x0, y0, z0, x1, y1, z1, x2, y2, z2);
                }
                //else {
                //    var h = f[1];
                //}

                roverPosition = [f[0], h, f[2]];
                roverTargetPosition = [roverTargetPosition[0] + f[0] - r[0], h, roverTargetPosition[2] + f[2] - r[2]];

                cameraPosition = [f[0], h + 2 * roverScale + roverCameraShift, f[2]];
                targetPosition = [roverTargetPosition[0], h + 2 * roverScale + roverCameraShift, roverTargetPosition[2]];

                cameraPitch = 0.0;

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);

                for (var i = 0; i < roverVerticesLength; i++) {
                    //boxVertices[offset * 6 * 2 + 6 * i] += roverPosition[0] - r[0];
                    //boxVertices[offset * 6 * 2 + 6 * i + 2] += roverPosition[2] - r[2];
                    boxVertices[offset * 6 * 2 + 6 * i] += f[0] - r[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 1] += h - r[1];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] += f[2] - r[2];
                }

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                //var pth = findPath(roverPosition, roverTargetPosition, roverSpeed);
                //var forw = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];
                ////console.log(pth);
                //var cnv2Array = [];
                //for (var i = 0; i < pth.length; i++) {
                //    //console.log();
                //    cnv2Array.push([pth[i][2] * forw[2] + pth[i][0] * forw[0], pth[i][0] * forw[2] - pth[i][2] * forw[0]]);
                //    //cnv2Array.push([mathCalc.euclidNorm([pth[i][0], pth[i][2]]), pth[i][1]]);
                //}
                ////console.log(pth);
                //console.log(cnv2Array);

                //roverBackForwardPath();
                //drawContext(roverBackForwardPath(), roverContextPosition());
                workingContextResult = workingContext();
                general_danger_level = workingContextResult[0];

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation1, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                gl.vertexAttribPointer(
                    positionAttribLocation2, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                break;
            case 'ArrowRight':
                //var t = roverTargetPosition;
                //console.log(t);
                var res_1 = mathCalc.shiftRotateShift([roverTargetPosition[0], roverTargetPosition[2]], [roverPosition[0], roverPosition[2]], roverSensitivity);
                //roverTargetPosition[0] = roverPosition[0] + (t[0] - roverPosition[0]) * Math.cos(roverSensitivity) - (t[2] - roverPosition[2]) * Math.sin(roverSensitivity);
                //console.log(t);
                //roverTargetPosition[2] = roverPosition[2] + (t[0] - roverPosition[0]) * Math.sin(roverSensitivity) + (t[2] - roverPosition[2]) * Math.cos(roverSensitivity);
                roverTargetPosition[0] = res_1[0];
                roverTargetPosition[2] = res_1[1];

                for (var i = 0; i < roverVerticesLength; i++) {
                    //var x = boxVertices[offset * 6 * 2 + 6 * i];
                    //var y = boxVertices[offset * 6 * 2 + 6 * i + 2];
                    var res_2 = mathCalc.shiftRotateShift([boxVertices[offset * 6 * 2 + 6 * i], boxVertices[offset * 6 * 2 + 6 * i + 2]], [roverPosition[0], roverPosition[2]], roverSensitivity);
                    boxVertices[offset * 6 * 2 + 6 * i] = res_2[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] = res_2[1];
                    //boxVertices[offset * 6 * 2 + 6 * i] = roverPosition[0] + (x - roverPosition[0]) * Math.cos(roverSensitivity) - (y - roverPosition[2]) * Math.sin(roverSensitivity);
                    //boxVertices[offset * 6 * 2 + 6 * i + 2] = roverPosition[2] + (x - roverPosition[0]) * Math.sin(roverSensitivity) + (y - roverPosition[2]) * Math.cos(roverSensitivity);
                }

                //console.log(cameraPosition);
                cameraPosition = [roverPosition[0], roverPosition[1] + 2 * roverScale + roverCameraShift, roverPosition[2]];
                //console.log(cameraPosition);
                //console.log(targetPosition[1]);
                //cameraPosition = roverPosition;

                targetPosition[0] = res_1[0];
                targetPosition[1] = cameraPosition[1];
                targetPosition[2] = res_1[1];

                cameraPitch = 0.0;

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                //var pth = findPath(roverPosition, roverTargetPosition, roverSpeed);
                //var forw = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];
                ////console.log(pth);
                //var cnv2Array = [];
                //for (var i = 0; i < pth.length; i++) {
                //    //console.log();
                //    cnv2Array.push([pth[i][2] * forw[2] + pth[i][0] * forw[0], pth[i][0] * forw[2] - pth[i][2] * forw[0]]);
                //    //cnv2Array.push([mathCalc.euclidNorm([pth[i][0], pth[i][2]]), pth[i][1]]);
                //}
                ////console.log(pth);
                //console.log(cnv2Array);

                //roverBackForwardPath();
                //drawContext(roverBackForwardPath(), roverContextPosition());
                workingContextResult = workingContext();
                general_danger_level = workingContextResult[0];

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation1, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                gl.vertexAttribPointer(
                    positionAttribLocation2, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                break;
            case 'ArrowLeft':
                //var t = roverTargetPosition;
                //roverTargetPosition[0] = roverPosition[0] + (t[0] - roverPosition[0]) * Math.cos(roverSensitivity) + (t[2] - roverPosition[2]) * Math.sin(roverSensitivity);
                //roverTargetPosition[2] = roverPosition[2] - (t[0] - roverPosition[0]) * Math.sin(roverSensitivity) + (t[2] - roverPosition[2]) * Math.cos(roverSensitivity);
                var res_1 = mathCalc.shiftRotateShift([roverTargetPosition[0], roverTargetPosition[2]], [roverPosition[0], roverPosition[2]], -roverSensitivity);
                roverTargetPosition[0] = res_1[0];
                roverTargetPosition[2] = res_1[1];

                for (var i = 0; i < roverVerticesLength; i++) {
                    var res_2 = mathCalc.shiftRotateShift([boxVertices[offset * 6 * 2 + 6 * i], boxVertices[offset * 6 * 2 + 6 * i + 2]], [roverPosition[0], roverPosition[2]], -roverSensitivity);
                    boxVertices[offset * 6 * 2 + 6 * i] = res_2[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] = res_2[1];
                    //var x = boxVertices[offset * 6 * 2 + 6 * i];
                    //var y = boxVertices[offset * 6 * 2 + 6 * i + 2];
                    //boxVertices[offset * 6 * 2 + 6 * i] = roverPosition[0] + (x - roverPosition[0]) * Math.cos(roverSensitivity) + (y - roverPosition[2]) * Math.sin(roverSensitivity);
                    //boxVertices[offset * 6 * 2 + 6 * i + 2] = roverPosition[2] - (x - roverPosition[0]) * Math.sin(roverSensitivity) + (y - roverPosition[2]) * Math.cos(roverSensitivity);
                }

                cameraPosition = [roverPosition[0], roverPosition[1] + 2 * roverScale + roverCameraShift, roverPosition[2]];


                targetPosition[0] = res_1[0];
                targetPosition[1] = cameraPosition[1];
                targetPosition[2] = res_1[1];

                cameraPitch = 0.0;

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.useProgram(program1);
                gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
                gl.useProgram(program2);
                gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                //var pth = findPath(roverPosition, roverTargetPosition, roverSpeed);
                //var forw = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];
                ////console.log(pth);
                //var cnv2Array = [];
                //for (var i = 0; i < pth.length; i++) {
                //    //console.log();
                //    cnv2Array.push([pth[i][2] * forw[2] + pth[i][0] * forw[0], pth[i][0] * forw[2] - pth[i][2] * forw[0]]);
                //    //cnv2Array.push([mathCalc.euclidNorm([pth[i][0], pth[i][2]]), pth[i][1]]);
                //}
                ////console.log(pth);
                //console.log(cnv2Array);

                //roverBackForwardPath();
                //drawContext(roverBackForwardPath(), roverContextPosition());
                workingContextResult = workingContext();
                general_danger_level = workingContextResult[0];

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation1, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                gl.vertexAttribPointer(
                    positionAttribLocation2, //Attribute location
                    3, //number of elements per attribute
                    gl.FLOAT, //type of elements
                    gl.FALSE, //normalize
                    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                    0 //offset from the beginning of a single vertex to this attribute
                );//important2
                break;

        }
    }

    var onMouseMove = function (event) {
        //event.preventDefault();
        //console.log(event.movementX, event.movementY);
        //cameraPhi += event.movementX;
        //if (cameraPhi >= 2 * Math.PI) {
        //    cameraPhi = 2 * Math.PI;
        //}
        //else if (cameraPhi < 0)
        //if (cameraPhi + event.movementX / 10000 >= 2 * Math.PI) {
        //    cameraPhi += event.movementX / 10000 - 2 * Math.PI;
        //}
        //else if (cameraPhi + event.movementX / 10000 < 0) {
        //    cameraPhi -= 2 * Math.PI + event.movementX / 10000;
        //}
        //cameraTheta += event.movementY / 10000;
        //if (cameraTheta <= )

        //cameraYaw += event.movementX / 100;
        //cameraPitch += event.movementY / 100;

        var yaw = -event.movementX * cameraSensitivity; // from 0 to 360 but without limits
        var prevYaw = cameraYaw;
        cameraYaw += yaw;

        var pitch = event.movementY * cameraSensitivity;
        var prevPitch = cameraPitch;
        cameraPitch += pitch;

        if (cameraPitch > pitchLock) {
            pitch = pitchLock - prevPitch;
            cameraPitch = pitchLock;
        }

        if (cameraPitch < -pitchLock) {
            pitch = -pitchLock - prevPitch;
            cameraPitch = -pitchLock;
        }

        //pitch = 0;

        //var pitch = 0.0;

        //if (event.movementY > 0) {
        //    pitch = Math.min(event.movementY * cameraSensitivity, pitchLock - cameraPitch);
        //    cameraPitch = Math.min(pitchLock, cameraPitch + event.movementY * cameraSensitivity);
        //}

        //else if (event.movementY < 0) {
        //    pitch = Math.max(event.movementY * cameraSensitivity, -cameraPitch - pitchLock);
        //    cameraPitch = Math.max(-pitchLock, cameraPitch + event.movementY * cameraSensitivity);
        //}


        //var pitch = event.movementY * cameraSensitivity; // must be from -pi/2 to pi/2 excluding

        //cameraYaw += yaw;

        //document.getElementById('information').innerHTML = `yaw: ${Math.round(yaw)}\npitch: ${Math.round(pitch)}\ncameraYaw: ${Math.round(cameraYaw)}\ncameraPitch: ${Math.round(cameraPitch)}\n\n`;

        //if (cameraPitch + pitch > pitchLock) {
        //    pitch = pitchLock - cameraPitch;
        //    cameraPitch = pitchLock;
        //}

        //70 + 30 > 89
        //pitch = 89 - 70 = 19
        //cameraPitch = 89

        //else if (cameraPitch + pitch < -pitchLock) {
        //    pitch = -pitchLock - cameraPitch;
        //    cameraPitch = -pitchLock;
        //}

        //-70 + (-30) < -89
        //pitch = -89 - (-70) = -19
        //cameraPitch = -89

        //else {
        //    cameraPitch += pitch
        //}

        //document.getElementById('information').innerHTML = `yaw: ${Math.round(yaw)}\npitch: ${Math.round(pitch)}\ncameraYaw: ${Math.round(cameraYaw)}\ncameraPitch: ${Math.round(cameraPitch)}\n`;
        //document.getElementById('information').innerHTML = `cameraYaw: ${Math.round(cameraYaw)} cameraPitch: ${Math.round(cameraPitch)}\n`;
        //if (cameraPitch > pitchLock) {
        //    alert('cameraPitch more than pitchLock');
        //}



        //if (event.movementY > 0) {
        //    pitch = Math.min(70, event.movementY * cameraSensitivity);
        //}
        //else {
        //    pitch = Math.max(-70, event.movementY * cameraSensitivity);
        //}
        //cameraYaw += yaw;
        //cameraPitch += pitch;
        //console.log('before', yaw, pitch, cameraYaw, cameraPitch);
        //document.getElementById('information').innerHTML = `${Math.round(yaw)}\n${Math.round(pitch)}\n${Math.round(cameraYaw)}\n${Math.round(cameraPitch)}\n\n`;

        //if (cameraYaw >= 360) {
        //    cameraYaw -= 360;
        //}

        //if (cameraYaw < 0) {
        //    cameraYaw += 360;
        //}

        //if (cameraPitch > pitchLock) {
        //    cameraPitch = pitchLock;
        //    pitch = 0;
        //}

        //if (cameraPitch < -pitchLock) {
        //    cameraPitch = -pitchLock;
        //    pitch = 0;
        //}

        //console.log('after', yaw, pitch, cameraYaw, cameraPitch);
        //document.getElementById('information').innerHTML += `${Math.round(yaw)}\n${Math.round(pitch)}\n${Math.round(cameraYaw)}\n${Math.round(cameraPitch)}\n\n`;

        var result = glMatrix.vec4.fromValues(targetPosition[0], targetPosition[1], targetPosition[2], 1.0);
        glMatrix.vec4.transformMat4(
            result,
            result,
            TranslateRotateRotateTranslate(
                cameraPosition,
                targetPosition,
                glMatrix.glMatrix.toRadian(yaw),
                glMatrix.glMatrix.toRadian(pitch)
                //mathCalc.toRadians(yaw),
                //mathCalc.toRadians(pitch)
            )
        );
        targetPosition = [result[0], result[1], result[2]];

        //var check = [targetPosition[0] - cameraPosition[0], targetPosition[1] - cameraPosition[1], targetPosition[2] - cameraPosition[2]];
        //document.getElementById('information').innerHTML += `forward vector: ${check.map(x => x.toFixed(3))}\nort vector: ${mathCalc.findOrtVector(check).map(x => x.toFixed(3))}\n`;
        //document.getElementById('information').innerHTML += `camPos: ${cameraPosition.map(x => x.toFixed(3))}\n`;
        //console.log(event.movementX, event.movementY, cameraYaw, cameraPitch, targetPosition, cameraPosition);

        //viewMatrix = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
        gl.useProgram(program1);
        gl.uniformMatrix4fv(matViewUniformLocation1, gl.FALSE, viewMatrix);
        gl.useProgram(program2);
        gl.uniformMatrix4fv(matViewUniformLocation2, gl.FALSE, viewMatrix);

        //event.preventDefault();
    }

    var onMouseDownMoveUp = function (event) {
        if (changingPoint >= 0) {
            //console.log(event.movementY * dragSensitivity);
            boxVertices[changingPoint + 1] -= event.movementY * dragSensitivity * MODEL_SCALE;
            boxVertices[changingPoint + 6 * offset + 1] -= event.movementY * dragSensitivity * MODEL_SCALE;
            //console.log(minHeight, maxHeight);
            //maxHeight = Math.max(maxHeight, boxVertices[changingPoint + 1]);
            //minHeight = Math.min(minHeight, boxVertices[changingPoint + 1]);

            //var tmpMaxHeight = -Infinity;
            //var tmpMinHeight = Infinity;

            maxHeight = -Infinity;
            minHeight = Infinity;


            for (var i = 0; i < fieldWidth * fieldHeight; i++) {
                maxHeight = Math.max(maxHeight, boxVertices[6 * i + 1]);
                minHeight = Math.min(minHeight, boxVertices[6 * i + 1]);
            }

            gl.useProgram(program1);
            gl.uniform1f(maxHeightUniformLocation, maxHeight);
            gl.uniform1f(minHeightUniformLocation, minHeight);

            //boxVertices[changingPoint + 3] = boxVertices[changingPoint + 1] / MODEL_SCALE;
            //boxVertices[changingPoint + 4] = boxVertices[changingPoint + 1] / MODEL_SCALE;
            //boxVertices[changingPoint + 5] = boxVertices[changingPoint + 1] / MODEL_SCALE;

            //if (event.movementY >= 0) {
            //    boxVertices[changingPoint + 3] = Math.max(boxVertices[changingPoint + 3] - event.movementY * dragSensitivity / MODEL_SCALE, 0.0);
            //    boxVertices[changingPoint + 4] = Math.max(boxVertices[changingPoint + 4] - event.movementY * dragSensitivity / MODEL_SCALE, 0.0);
            //    boxVertices[changingPoint + 5] = Math.max(boxVertices[changingPoint + 5] - event.movementY * dragSensitivity / MODEL_SCALE, 0.0);
            //}
            //else {
            //    boxVertices[changingPoint + 3] = Math.min(boxVertices[changingPoint + 3] - event.movementY * dragSensitivity / MODEL_SCALE, 1.0);
            //    boxVertices[changingPoint + 4] = Math.min(boxVertices[changingPoint + 4] - event.movementY * dragSensitivity / MODEL_SCALE, 1.0);
            //    boxVertices[changingPoint + 5] = Math.min(boxVertices[changingPoint + 5] - event.movementY * dragSensitivity / MODEL_SCALE, 1.0);
            //}
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
            gl.vertexAttribPointer(
                positionAttribLocation1, //Attribute location
                3, //number of elements per attribute
                gl.FLOAT, //type of elements
                gl.FALSE, //normalize
                6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                0 //offset from the beginning of a single vertex to this attribute
            );//important2
            gl.vertexAttribPointer(
                positionAttribLocation2, //Attribute location
                3, //number of elements per attribute
                gl.FLOAT, //type of elements
                gl.FALSE, //normalize
                6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                0 //offset from the beginning of a single vertex to this attribute
            );//important2
        }
    }

    var onMouseDown = function (event) {
        canvas.addEventListener('mousemove', onMouseDownMoveUp, false);
        var temp_distance = Math.pow(SCREEN_EPSILON, 2) + 1
        if (event.button == 0) {
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            if (x >= 0 && x <= canvas.clientWidth && y >= 0 && y <= canvas.clientHeight) {
                //console.log(`tap: ${x}, ${y}`);
                for (var i = 0; i < fieldWidth; i++) {
                    for (var j = 0; j < fieldHeight; j++) {
                        //console.log(boxVertices[6 * (i * fieldHeight + j)], boxVertices[6 * (i * fieldHeight + j) + 1], boxVertices[6 * (i * fieldHeight + j) + 2]);
                        var res = glMatrix.vec4.fromValues(
                            boxVertices[6 * (i * fieldHeight + j)],
                            boxVertices[6 * (i * fieldHeight + j) + 1],
                            boxVertices[6 * (i * fieldHeight + j) + 2],
                            1.0
                        );
                        glMatrix.vec4.transformMat4(
                            res,
                            res,
                            MVP(modelMatrix, viewMatrix, projMatrix)
                        );
                        //console.log(`not norm ${res}`);
                        //glMatrix.vec4.normalize(res, res); //try normalize
                        //console.log(`norm ${res}`);
                        //res = res / res[3];
                        var screenX = (1 + res[0] / res[2]) * canvas.clientWidth / 2;
                        var screenY = (1 - res[1] / res[2]) * canvas.clientHeight / 2;
                        //console.log(`res screen: ${screenX}, ${screenY}`);
                        if (screenX >= 0 && screenX <= canvas.clientWidth && screenY >= 0 && screenY <= canvas.clientHeight) {
                            //console.log(pointInsideCircle(screenX, screenY, x, y));
                            if (pointInsideCircle(screenX, screenY, x, y)) {
                                //console.log(`res screen double: ${screenX}, ${screenY}`);

                                if (distance2(screenX, screenY, x, y) < temp_distance) {
                                    changingPoint = 6 * (i * fieldHeight + j);
                                    temp_distance = distance2(screenX, screenY, x, y);
                                }

                                //console.log(`model ${modelMatrix}`);
                                //console.log(`view ${viewMatrix}`);
                                //console.log(`proj ${projMatrix}`);

                                //boxVertices[6 * (i * fieldHeight + j) + 1] += 3;
                                //boxVertices[6 * (i * fieldHeight + j + offset) + 1] += 3;

                                //console.log(6 * (i * fieldHeight + j) + 1);
                                //console.log(boxVertices);
                                //var boxVertexBufferObject = gl.createBuffer();
                                //gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
                                //gl.bufferSubData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), box)
                                //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.DYNAMIC_DRAW);

                                //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1

                                //var boxIndexBufferObject = gl.createBuffer();
                                //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
                                //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

                                //var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');//name from shader program
                                //var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');//name from shader program

                                //gl.vertexAttribPointer(
                                //    positionAttribLocation, //Attribute location
                                //    3, //number of elements per attribute
                                //    gl.FLOAT, //type of elements
                                //    gl.FALSE, //normalize
                                //    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
                                //    0 //offset from the beginning of a single vertex to this attribute
                                //);//important2
                            }
                        }
                        //console.log(res);
                        //if (res[2] >= 0) {
                        //    var screenX = (1 + res[0] / res[2]) * canvas.width / 2;
                        //    var screenY = (1 - res[1] / res[2]) * canvas.height / 2;
                        //    if (screenX >= 0 && screenX < canvas.width && screenY >= 0 && screenY < canvas.height) {
                        //        console.log(screenX, screenY);
                        //    }
                        //}
                    }
                }
                //for (var i = 0; i < 3; i++) {
                //    var res = glMatrix.vec4.fromValues(i * (2 * x / canvas.width - 1), i * (1 - 2 * y / canvas.height), i, 1.0);
                //    glMatrix.vec4.transformMat4(
                //        res,
                //        res,
                //        InverseMVP(modelMatrix, viewMatrix, projMatrix)
                //    );
                //    console.log(`${res[0]}, ${res[2]}, ${res[1]}`);
                //}
                //var check = [[1.0, 1.0, -1.0], [1.0, -1.0, -1.0], [-1.0, 1.0, -1.0], [-1.0, -1.0, -1.0], [0, 0, 0]];
                //for (var i = 0; i < check.length; i++) {
                //    console.log(check[i]);
                //    var res = glMatrix.vec4.fromValues(check[i][0], check[i][1], check[i][2], 1.0);
                //    glMatrix.vec4.transformMat4(
                //        res,
                //        res,
                //        MVP(modelMatrix, viewMatrix, projMatrix)
                //    );
                //    var screenX = (1 + res[0] / res[2]) * canvas.width / 2;
                //    var screenY = (1 - res[1] / res[2]) * canvas.height / 2;
                //      console.log(screenX, screenY);
                //}
                //canvas.addEventListener('mousemove', onMouseDownMoveUp, false);
            }
        }
        //canvas.removeEventListener('mousemove', onMouseDownMoveUp, false);
    }

    var onMouseUp = function (event) {
        canvas.removeEventListener('mousemove', onMouseDownMoveUp, false);
        changingPoint = -1;
    }



    //canvas.onclick = function () {
    //    canvas.requestPointerLock();
    //}
    //press f to free camera mode
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);

    document.addEventListener(
        'keydown',
        function (event) {
            if (event.key == 'f') {
                canvas.requestPointerLock();
                canvas.removeEventListener('mousedown', onMouseDown, false);
                canvas.removeEventListener('mouseup', onMouseUp, false);
                document.removeEventListener('keydown', onKeyDownRoverMode, false);
                roverMode = false;
            }
            if (event.key == 'r') {
                document.addEventListener('keydown', onKeyDownRoverMode, false);
                //document.removeEventListener('pointerlockchange', lockStatusChange, false);
                document.removeEventListener('keydown', onKeyDown, false);
                canvas.removeEventListener('mousemove', onMouseMove, false);
                roverMode = true;
            }
            if (event.key == 'i') {
                inference();
            }
        },
        false
    );

    document.addEventListener('pointerlockchange', lockStatusChange, false);

    function lockStatusChange() {
        if (document.pointerLockElement === canvas) {
            //document.addEventListener("mousemove", updateCirclePosition, false);
            document.addEventListener('keydown', onKeyDown, false);
            canvas.addEventListener('mousemove', onMouseMove, false);
        }
        else {
            //document.removeEventListener("mousemove", updateCirclePosition, false);
            document.removeEventListener('keydown', onKeyDown, false);
            canvas.removeEventListener('mousemove', onMouseMove, false);
            canvas.addEventListener('mousedown', onMouseDown, false);
            canvas.addEventListener('mouseup', onMouseUp, false);
            document.removeEventListener('keydown', onKeyDownRoverMode, false);
            roverMode = false;
        }
    }

    //console.log("check");
    var bttnScreen_1 = document.getElementsByName("Screen 1")[0];
    //console.log(bttn);
    bttnScreen_1.addEventListener("click", function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.href = canvas.toDataURL("image/png", 1.0);
        console.log(a.href);
        a.download = "canvas-image.png";
        a.click();
        document.body.removeChild(a);
    });

    var bttnScreen_2 = document.getElementsByName("Screen 2")[0];
    //console.log(bttn);
    bttnScreen_2.addEventListener("click", function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.href = canvas2.toDataURL("image/png", 1.0);
        console.log(a.href);
        a.download = "canvas-image.png";
        a.click();
        document.body.removeChild(a);
    });

    var bttnScreen_3 = document.getElementsByName("Screen 3")[0];
    //console.log(bttn);
    bttnScreen_3.addEventListener("click", function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.href = canvas3.toDataURL("image/png", 1.0);
        console.log(a.href);
        a.download = "canvas-image.png";
        a.click();
        document.body.removeChild(a);
    });

    var bttnScreen_4 = document.getElementsByName("Screen 4")[0];
    //console.log(bttn);
    bttnScreen_4.addEventListener("click", function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.href = canvas4.toDataURL("image/png", 1.0);
        console.log(a.href);
        a.download = "canvas-image.png";
        a.click();
        document.body.removeChild(a);
    });

    var SoftMaxArgMax = function (array, image_size = 256) {
        result = [];
        for (var i = 0; i < image_size; i++) {
            for (var j = 0; j < image_size; j++) {
                soft = [array[i * image_size + j],
                array[image_size * image_size * 1 + i * image_size + j],
                array[image_size * image_size * 2 + i * image_size + j],
                array[image_size * image_size * 3 + i * image_size + j]
                ];
                expsoft = soft.map(x => Math.exp(x));
                sum = expsoft.reduce((a, b) => a + b, 0);
                sftmax = expsoft.map(x => x / sum);
                //console.log(sftmax.indexOf(Math.max(...sftmax)));
                result.push(sftmax.indexOf(Math.max(...sftmax)));
            }
        }
        //console.log(result);
        return result;
    }

    //var sfam = SoftMaxArgMax();

    var draw_mask = function (result, image_size = 256) {
        var colors = { 0: [0, 0, 0], 1: [255, 0, 0], 2: [0, 255, 0], 3: [0, 0, 255] };
        for (var i = 0; i < image_size; i++) {
            for (var j = 0; j < image_size; j++) {
                value = result[i * image_size + j];
                //console.log(`rgb(${colors[value].join(',')})`)
                mask_ctx.fillStyle = `rgb(${colors[value].join(',')})`;
                mask_ctx.fillRect(j, i, 1, 1);
            }
        }
    }

    var calculateSuggestion = function (result, image_size) {
        var left_pixels = 0;
        var right_pixels = 0;
        for (var i = 0; i < image_size; i++) {
            for (var j = 0; j < Math.floor(image_size / 2); j++) {
                value = result[i * image_size + j];
                if (value == 2 || value == 3) {
                    left_pixels++;
                }
            }
        }
        for (var i = 0; i < image_size; i++) {
            for (var j = Math.floor(image_size / 2); j < image_size; j++) {
                value = result[i * image_size + j];
                if (value == 2 || value == 3) {
                    right_pixels++;
                }
            }
        }
        return left_pixels >= right_pixels ? 'повернуть направо' : 'повернуть налево';
    }

    //for (var i = 0; i < 256; i++) {
    //    for (var j = 0; j < 256; j++) {
    //        value = sfam[i * 256 + j];
    //        //console.log(`rgb(${colors[value].join(',')})`)
    //        mask_ctx.fillStyle = `rgb(${colors[value].join(',')})`;
    //        mask_ctx.fillRect(j, i, 1, 1);
    //    }
    //}

    //console.log(gl.drawingBufferHeight, gl.drawingBufferWidth);

    var canvas_fake = document.createElement('canvas');

    canvas_fake.width = canvas.width;
    canvas_fake.height = canvas.height;

    var ctx_fake = canvas_fake.getContext('2d');

    //console.log(canvas_fake.width, canvas.height, (canvas_fake.width - canvas_fake.height) / 2, (canvas_fake.width + canvas_fake.height) / 2);

    var suggestion = '';

    //const session = new onnx.InferenceSession

    //ort.env.wasm.numThreads = 1;
    //ort.env.wasm.simd = false;

    //const session = new ort.InferenceSession

    async function inference(image_size = 256) {
        try {
            //console.log('check');
            //const session = await new ort.InferenceSession.create("./onnx_model_5.onnx");
            //console.log(session);
            //const session = await ort.InferenceSession.create("./onnx_model_7.onnx",
            //    { executionProviders: ['wasm'] }
            //);
            //console.log(session);
            //    { executionProviders: ["wasm"] });
            //console.log(session);
            //const data = Float32Array.from({ length: 1 * 3 * 256 * 256 }, () => Math.random());
            //const tensor = new ort.Tensor('float32', data, [1, 3, 256, 256]);
            //console.log(data);
            //console.log(tensor);
            //const feeds = { a: tensor };
            //const result = await session.run({ "input.1": tensor });
            //console.log(result);

            //const output = new ort.Tensor('float32', result[2230].cpuData, result[2230].dims);
            //console.log(output);
            //console.log(output.softmax(axis = 1));
            //return session;
            //console.log(canvas.width, canvas.height);

            //var imgData = gl.getImageData(0, 0, canvas.width, canvas.height);

            //var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
            //gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);


            //console.log(pixels);

            const session = ortSession;

            ctx_fake.drawImage(gl.canvas, 0, 0);

            //var src_1 = cv.matFromArray(gl.drawingBufferWidth, gl.drawingBufferHeight, cv.CV_8UC1, pixels);

            var imgData = ctx_fake.getImageData(0, 0, canvas_fake.width, canvas_fake.height);
            //var imgData = ctx_fake.getImageData((canvas_fake.width - canvas_fake.height) / 2, 0, canvas_fake.height, canvas_fake.height);

            var src_1 = cv.matFromImageData(imgData);

            //console.log(src_1);

            var src_2 = new cv.Mat();
            cv.cvtColor(src_1, src_2, cv.COLOR_RGBA2RGB, 0);
            ////console.log(d);
            //
            var src_3 = new cv.Mat();
            var dsize = new cv.Size(image_size, image_size);
            cv.resize(src_2, src_3, dsize, 0, 0, cv.INTER_AREA);
            //
            cv.imshow(canvas3, src_3);

            //console.log(src_3);

            var image = src_3.data;

            src_1.delete();
            src_2.delete();
            src_3.delete();

            //console.log(image);
            //console.log(image[0] - 100);

            //256 * 256 * 3

            var mean = [0.3848, 0.3846, 0.3848];
            var std = [0.1290, 0.1290, 0.1290];

            var norm_image = Array.from({ length: image_size * image_size * 3 }, () => 0.0);

            for (var i = 0; i < image.length; i += 3) {
                norm_image[Math.floor(i / 3)] = (image[i] - mean[0] * 255) / (std[0] * 255);
                norm_image[image_size * image_size + Math.floor(i / 3)] = (image[i + 1] - mean[1] * 255) / (std[1] * 255);
                norm_image[image_size * image_size * 2 + Math.floor(i / 3)] = (image[i + 2] - mean[2] * 255) / (std[2] * 255);
            }

            //console.log(norm_image);

            const data = new Float32Array(norm_image);

            const tensor = new ort.Tensor('float32', data, [1, 3, image_size, image_size]);

            console.log('check');

            const logits = await session.run({ "input.1": tensor });

            //console.log(logits);

            const result = SoftMaxArgMax(logits[session.outputNames[0]].cpuData, image_size);

            //console.log(result);

            draw_mask(result, image_size);

            suggestion = calculateSuggestion(result, image_size);

            //console.log(data);

            //console.log(norm_image);

            //rgbArray = [];
            //for (var i = 0; i < imgData.data.length; i += 4) {
            //    rgbArray.push(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]);
            //}
            //console.log(rgbArray);

            //image = new ort.Tensor('float32', rgbArray, [1, 256, 256, 3]);

        } catch (e) {
            document.write(`failed to inference ONNX model: ${e}.`);
        }
    }

    //const model = getSession();
    //
    //var inference = function (model) {
    //    console.log(model);
    //}

    var bttnInference = document.getElementsByName("Inference")[0];
    //console.log(bttn);
    bttnInference.addEventListener("click", function () {
        //inference(model);
        inference(256);
    });

    //document.addEventListener('keydown', (e) => onKeyDown(e), false);
    //document.addEventListener('mousemove', (e) => onMouseMove(e), false);
    //
    // Main render loop
    //
    //gl.lineWidth(5);
    //console.log(gl.getParameter(gl.LINE_WIDTH));
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    //var angle = 0;


    //async function test() {
    //    const sess = new onnx.InferenceSession();
    //    await sess.loadModel('onnx_model.onnx');
    //    console.log('check');
    //}
    //
    //test();
    //console.log('check');
    //console.log(ort);

    //inference(model);

    function loop() {

        //console.log('check');

        //var btn = document.getElementById("btn");
        //btn.addEventListener("click", function () {
        //    var a = document.createElement("a");
        //    document.body.appendChild(a);
        //    a.href = canvas.toDataURL();
        //    console.log(a.href);
        //    a.download = "canvas-image.png";
        //    a.click();
        //    document.body.removeChild(a);
        //});

        var check1 = [targetPosition[0] - cameraPosition[0], targetPosition[1] - cameraPosition[1], targetPosition[2] - cameraPosition[2]];
        var check2 = [roverTargetPosition[0] - roverPosition[0], roverTargetPosition[1] - roverPosition[1], roverTargetPosition[2] - roverPosition[2]];

        var i = Math.floor(roverPosition[0] / (MODEL_SCALE * SQRT32));
        var j = Math.floor(roverPosition[2] / MODEL_SCALE);

        var res_i = roverPosition[0] - i * MODEL_SCALE * SQRT32;
        var res_j = roverPosition[2] - j * MODEL_SCALE;

        if (i % 2 == 0) {
            if (res_i - 2 * SQRT32 * res_j > 0) {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j - 1;
                var i_3 = i + 1;
                var j_3 = j;
            }
            else if (res_i - 2 * SQRT32 * (MODEL_SCALE - res_j) > 0) {
                var i_1 = i;
                var j_1 = j + 1;
                var i_2 = i + 1;
                var j_2 = j;
                var i_3 = i + 1;
                var j_3 = j + 1;
            }
            else {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j;
                var i_3 = i;
                var j_3 = j + 1;
            }
        }
        else {
            if (res_i - SQRT32 * (MODEL_SCALE - 2 * res_j) < 0) {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j;
                var i_3 = i;
                var j_3 = j - 1;
            }
            else if (res_i - SQRT32 * (2 * res_j - MODEL_SCALE) < 0) {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j + 1;
                var i_3 = i;
                var j_3 = j + 1;
            }
            else {
                var i_1 = i;
                var j_1 = j;
                var i_2 = i + 1;
                var j_2 = j;
                var i_3 = i + 1;
                var j_3 = j + 1;
            }
        }

        document.getElementById('information').innerHTML =
            `danger level: ${(general_danger_level * 100).toFixed(3)}%
cameraYaw: ${cameraYaw.toFixed(1)}
cameraPitch: ${cameraPitch.toFixed(1)}
camera: ${cameraPosition.map(x => x.toFixed(3))}
camera forward: ${check1.map(x => x.toFixed(3))} ${mathCalc.euclidNorm(check1).toFixed(3)}
rover: ${roverPosition.map(x => x.toFixed(3))}
rover forward: ${check2.map(x => x.toFixed(3))} ${mathCalc.euclidNorm(check2).toFixed(3)}
scale: ${MODEL_SCALE}
maxHeight: ${maxHeight.toFixed(3)}
minHeight: ${minHeight.toFixed(3)}
roverMode: ${roverMode}
suggestion: turn on ${suggestion}`;

        document.getElementById('information').innerHTML =
            `уровень опасности: <div style="display: inline; color: ${general_danger_level < 1.0 ? "lightgreen" : "coral"}">${(general_danger_level * 100).toFixed(3)}%</div>
планетоход: ${roverPosition.map(x => x.toFixed(3))}
направление: ${check2.map(x => x.toFixed(3))}
предложение: ${suggestion}`;
        //document.getElementById('information').innerHTML =


        //i: ${ i } j: ${ j }
        //res_i: ${ res_i.toFixed(3) } res_j: ${ res_j.toFixed(3) }
        //i_1: ${ i_1 } j_1: ${ j_1 }
        //i_2: ${ i_2 } j_2: ${ j_2 }
        //i_3: ${ i_3 } j_3: ${ j_3 }

        //box: ${ boxVertices[6 * fieldHeight * i + 6 * j].toFixed(3) }, ${ boxVertices[6 * fieldHeight * i + 6 * j + 1].toFixed(3) }, ${ boxVertices[6 * fieldHeight * i + 6 * j + 2].toFixed(3) }

        //console.log(text);
        //document.getElementById('information').innerHTML

        //document.getElementById('information').innerHTML += `forward vector: ${check.map(x => x.toFixed(3))}\nort vector: ${mathCalc.findOrtVector(check).map(x => x.toFixed(3))}\n`;
        //document.getElementById('information').innerHTML += `camPos: ${cameraPosition.map(x => x.toFixed(3))}\n`;

        //console.log(roverPosition);
        //console.log(roverTargetPosition);
        //var i = Math.floor(roverPosition[0] / (MODEL_SCALE * SQRT32));
        //var j = Math.floor(roverPosition[2] / MODEL_SCALE - (i % 2) / 2);
        //var j_2 = Math.floor(roverPosition[2] / MODEL_SCALE);
        //console.log([i, j], [i, j + 1], [i + 1, j + 0.5], [i + 1, j + 1.5]);
        //Math.floor(roverPosition[2] * 2 / MODEL_SCALE)
        //console.log(i, j);
        //console.log(boxVertices[6 * i * fieldHeight]);
        //console.log(boxVertices[6 * i * fieldHeight + 6 * j]);

        //console.log(document.pointerLockElement);
        //console.log(mathCalc.toDegrees(cameraYaw), mathCalc.toDegrees(cameraPitch));

        //viewMatrix = glMatrix.mat4.create();
        //glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
        //gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

        //gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        //gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        //console.log(targetPosition, cameraPosition);
        //gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        //angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        //glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
        //glMatrix.mat4.rotate(viewMatrix, viewMatrix, angle, [0, 1, 0]);
        //gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        //glMatrix.mat4.translate(modelMatrix, identityMatrix, [-0.5, -0.5, 0]);
        //sequence of matrix for transformations like A * B * vec must be fun(A) and then fun(B)
        //glMatrix.mat4.rotate(modelMatrix, identityMatrix, angle, [1, 1, 1]);
        //glMatrix.mat4.translate(modelMatrix, modelMatrix, [-0.5, 0.5, 0]);
        //gl.uniformMatrix4fv(matModelUniformLocation, gl.FALSE, modelMatrix);
        //console.log(cameraPosition, cameraSpeed);
        //var result = glMatrix.vec4.fromValues(targetPosition[0], targetPosition[1], targetPosition[2], 1.0);
        //glMatrix.vec4.transformMat4(result, result, TranslateRotateRotateTranslate(0, 0));
        //targetPosition = [result[0], result[1], result[2]];

        //gl.clearColor(0, 0.3, 0.3, 0.3);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //check
        //var boxVertexBufferObject = gl.createBuffer();
        //gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1

        //var boxIndexBufferObject = gl.createBuffer();
        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
        //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

        //var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');//name from shader program
        //var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');//name from shader program
        //gl.vertexAttribPointer(
        //    positionAttribLocation, //Attribute location
        //    3, //number of elements per attribute
        //    gl.FLOAT, //type of elements
        //    gl.FALSE, //normalize
        //    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        //    0 //offset from the beginning of a single vertex to this attribute
        //);//important2
        //gl.vertexAttribPointer(
        //    colorAttribLocation, //Attribute location
        //    3, //number of elements per attribute
        //    gl.FLOAT, //type of elements
        //    gl.FALSE, //normalize
        //    6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        //    3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
        //);

        //gl.enableVertexAttribArray(positionAttribLocation);
        //gl.enableVertexAttribArray(colorAttribLocation);

        //tell opengl state machine which program should be active
        //gl.useProgram(program);
        //check

        var indexType = gl.UNSIGNED_INT;
        //console.log(gl.sizeInBytes(gl.FLOAT));

        gl.useProgram(program2); //program1
        gl.drawElements(gl.TRIANGLES, trianglesLength, indexType, 0);
        gl.useProgram(program2);
        //gl.drawElements(gl.LINES, linesLength, indexType, 4 * trianglesLength); //multiple by indexType size in bytes: uint is 32 bits -> 4 bytes
        gl.drawElements(gl.TRIANGLES, roverLength, indexType, 4 * (trianglesLength + linesLength));
        //gl.lineWidth(1.0);
        gl.drawElements(gl.LINES, roverLinesLength, indexType, 4 * (trianglesLength + linesLength + roverLength));
        //gl.lineWidth(0.1);
        //gl.drawElements(gl.LINES, linesLength, gl.UNSIGNED_SHORT, 20);

        //gl.drawElements(gl.TRIANGLES, 6, indexType, 4 * (trianglesLength + linesLength + roverLength + roverLinesLength));
        //gl.drawElements(gl.LINES, 8, indexType, 4 * (trianglesLength + linesLength + roverLength + roverLinesLength + 6));

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

InitDemo();