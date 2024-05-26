var vertexShaderText =
    `
        precision mediump float;
        
        attribute vec3 vertPosition;
        attribute vec3 vertColor;
        varying vec3 fragColor;
        uniform mat4 mModel;
        uniform mat4 mView;
        uniform mat4 mProj;

        varying vec4 position;
        
        void main()
        {
            fragColor = vertColor;
            gl_Position = mProj * mView * mModel * vec4(vertPosition, 1.0);
            position = gl_Position;
        }
    `;


var fragmentShaderText =
    `
        precision mediump float;

        varying vec3 fragColor;

        //uniform float aspect;
        //uniform float border_width;
        //uniform float width;
        //uniform float height;

        varying vec4 position;

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
            gl_FragColor = vec4(fragColor, 1.0);
        }
    `;

function InitDemo() {
    console.log("It's working");
    //console.log(mathCalc.pointOnTriangle(0, 0, -3, 2, -1, -1, 2, 4, 3, 3, -1));
    var SQRT32 = Math.sqrt(3) / 2;
    var SCREEN_EPSILON = 20;
    var pointInsideCircle = function (px, py, x, y) {
        return Math.pow(x - px, 2) + Math.pow(y - py, 2) <= Math.pow(SCREEN_EPSILON, 2);
    };
    var distance2 = function (px, py, x, y) {
        return Math.pow(x - px, 2) + Math.pow(y - py, 2);
    };
    //console.log(mathCalc.ABRACADABRA);
    //console.log(mathCalc.findPointOnSegment([0, 1, 1], [1, 2, 3], 1));
    //console.log(mathCalc.findPointOnOrtSegment([0, 1, 1], [1, 2, 3], 1));
    //console.log(mathCalc.findPointOnOrtSegment([1, 2, 3], [2, 3, 5], 1));

    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    //gl.canvas.width = window.;
    //gl.canvas.height = 500;
    //console.log(canvas.width, canvas.height);
    //console.log(canvas.clientWidth, canvas.clientHeight);

    var CANVAS_SCALE = 1

    canvas.width = CANVAS_SCALE * canvas.clientWidth;
    canvas.height = CANVAS_SCALE * canvas.clientHeight;

    //console.log(canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //console.log(canvas.width, canvas.height);
    //console.log(canvas.clientWidth, canvas.clientHeight);


    if (!gl) {
        gl = canvas.getContext("experimental-webgl");
    }

    if (!gl) {
        alert("browser doesn't support webgl");
    }

    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;

    //gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    gl.clearColor(0, 0.3, 0.3, 0.3);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(2, 3);

    //gl.depthRange(0.2, 0.8);

    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW);
    //gl.cullFace(gl.BACK);

    //gl.lineWidth(5);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    //
    // Create buffer
    //

    var MODEL_SCALE = 10;

    var redHeight = 1.0;//1.0
    var greenHeight = 0.5;//0.5
    var blueHeight = 0.0;//0.0

    var boxVertices = [];

    var fieldWidth = 20;//20;
    var fieldHeight = 20;//20;

    for (var i = 0; i < fieldWidth; i++) {
        for (var j = 0; j < fieldHeight; j++) {
            //console.log(`${i * SQRT32}, ${j + (i % 2) / 2}`);
            var tmpHeight = Math.random();
            var tmpRed = 0.0;
            var tmpGreen = 0.0;
            var tmpBlue = 0.0;
            //console.log(tmpHeight);
            if (blueHeight <= tmpHeight && tmpHeight <= greenHeight) {
                tmpRed = 0.0;
                tmpGreen = (tmpHeight - blueHeight) / (greenHeight - blueHeight);
                tmpBlue = 1 - (tmpHeight - blueHeight) / (greenHeight - blueHeight);
            }
            if (greenHeight <= tmpHeight && tmpHeight <= redHeight) {
                tmpRed = (tmpHeight - greenHeight) / (redHeight - greenHeight);
                tmpGreen = 1 - (tmpHeight - greenHeight) / (redHeight - greenHeight);
                tmpBlue = 0.0;
            }
            if (tmpHeight < blueHeight) {
                tmpBlue = 1.0;
            }
            if (redHeight < tmpHeight) {
                tmpRed = 1.0;
            }
            //console.log(tmpRed, tmpGreen, tmpBlue);
            //boxVertices.push(MODEL_SCALE * i * SQRT32, MODEL_SCALE * tmpHeight, MODEL_SCALE * (j + (i % 2) / 2), tmpHeight, tmpHeight, tmpHeight);
            boxVertices.push(MODEL_SCALE * i * SQRT32, MODEL_SCALE * tmpHeight, MODEL_SCALE * (j + (i % 2) / 2), tmpRed, tmpGreen, tmpBlue);
            //boxVertices.push(MODEL_SCALE * i * SQRT32, MODEL_SCALE * tmpHeight, MODEL_SCALE * (j + (i % 2) / 2), Math.random(), Math.random(), Math.random());
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

    //cube rover
    boxVertices.push(1, 0, 1, 1.0, 0.0, 1.0);
    boxVertices.push(1, 0, -1, 1.0, 0.0, 1.0);
    boxVertices.push(-1, 0, 1, 1.0, 0.0, 1.0);
    boxVertices.push(-1, 0, -1, 1.0, 0.0, 1.0);
    boxVertices.push(1, 2, 1, 1.0, 0.0, 1.0);
    boxVertices.push(1, 2, -1, 1.0, 0.0, 1.0);
    boxVertices.push(-1, 2, 1, 1.0, 0.0, 1.0);
    boxVertices.push(-1, 2, -1, 1.0, 0.0, 1.0);
    //black lines
    boxVertices.push(1, 0, 1, 0.0, 0.0, 0.0);
    boxVertices.push(1, 0, -1, 0.0, 0.0, 0.0);
    boxVertices.push(-1, 0, 1, 0.0, 0.0, 0.0);
    boxVertices.push(-1, 0, -1, 0.0, 0.0, 0.0);
    boxVertices.push(1, 2, 1, 0.0, 0.0, 0.0);
    boxVertices.push(1, 2, -1, 0.0, 0.0, 0.0);
    boxVertices.push(-1, 2, 1, 0.0, 0.0, 0.0);
    boxVertices.push(-1, 2, -1, 0.0, 0.0, 0.0);

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

    boxIndices.push(2 * offset, 2 * offset + 1, 2 * offset + 2);
    boxIndices.push(2 * offset + 1, 2 * offset + 2, 2 * offset + 3);
    boxIndices.push(2 * offset + 4, 2 * offset + 5, 2 * offset + 6);
    boxIndices.push(2 * offset + 5, 2 * offset + 6, 2 * offset + 7);

    boxIndices.push(2 * offset, 2 * offset + 1, 2 * offset + 4);
    boxIndices.push(2 * offset + 1, 2 * offset + 4, 2 * offset + 5);
    boxIndices.push(2 * offset + 2, 2 * offset + 3, 2 * offset + 6);
    boxIndices.push(2 * offset + 3, 2 * offset + 6, 2 * offset + 7);

    boxIndices.push(2 * offset, 2 * offset + 2, 2 * offset + 4);
    boxIndices.push(2 * offset + 2, 2 * offset + 4, 2 * offset + 6);
    boxIndices.push(2 * offset + 1, 2 * offset + 3, 2 * offset + 5);
    boxIndices.push(2 * offset + 3, 2 * offset + 5, 2 * offset + 7);

    var roverLength = 3 * 12;

    boxIndices.push(2 * offset + 8, 2 * offset + 9);
    boxIndices.push(2 * offset + 10, 2 * offset + 11);
    boxIndices.push(2 * offset + 8, 2 * offset + 10);
    boxIndices.push(2 * offset + 9, 2 * offset + 11);

    boxIndices.push(2 * offset + 12, 2 * offset + 13);
    boxIndices.push(2 * offset + 14, 2 * offset + 15);
    boxIndices.push(2 * offset + 12, 2 * offset + 14);
    boxIndices.push(2 * offset + 13, 2 * offset + 15);

    boxIndices.push(2 * offset + 8, 2 * offset + 9);
    boxIndices.push(2 * offset + 12, 2 * offset + 13);
    boxIndices.push(2 * offset + 8, 2 * offset + 12);
    boxIndices.push(2 * offset + 9, 2 * offset + 13);

    boxIndices.push(2 * offset + 10, 2 * offset + 11);
    boxIndices.push(2 * offset + 14, 2 * offset + 15);
    boxIndices.push(2 * offset + 10, 2 * offset + 14);
    boxIndices.push(2 * offset + 11, 2 * offset + 15);

    boxIndices.push(2 * offset + 8, 2 * offset + 10);
    boxIndices.push(2 * offset + 12, 2 * offset + 14);
    boxIndices.push(2 * offset + 8, 2 * offset + 12);
    boxIndices.push(2 * offset + 10, 2 * offset + 14);

    boxIndices.push(2 * offset + 9, 2 * offset + 11);
    boxIndices.push(2 * offset + 13, 2 * offset + 15);
    boxIndices.push(2 * offset + 9, 2 * offset + 13);
    boxIndices.push(2 * offset + 11, 2 * offset + 15);

    var roverLinesLength = 2 * 24;

    boxIndices = new Float32Array(boxIndices);
    //console.log(boxIndices, typeof (boxIndices));

    //var linesLength = boxIndices.length - trianglesLength;
    //console.log(trianglesLength, linesLength);
    //console.log(Float32Array.BYTES_PER_ELEMENT);




    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');//name from shader program
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');//name from shader program
    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //normalize
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation, //Attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //normalize
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    //tell opengl state machine which program should be active
    gl.useProgram(program);
    //gl.viewport(0, 0, canvas.width, canvas.height);

    var matModelUniformLocation = gl.getUniformLocation(program, 'mModel');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    var modelMatrix = new Float32Array(16); // model(world)
    var viewMatrix = new Float32Array(16); // position(location and orientation) of camera
    var projMatrix = new Float32Array(16); // characteristics of camera
    glMatrix.mat4.identity(modelMatrix);
    //glMatrix.mat4.multiplyScalar(modelMatrix, modelMatrix, 10);
    //console.log(modelMatrix);
    glMatrix.mat4.identity(viewMatrix);
    var cameraPosition = [0, 2, 0];
    var cameraSpeed = 1.0;
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

    //console.log(boxVertices[1]);
    var roverPosition = [boxVertices[0], boxVertices[1], boxVertices[2]];
    var roverTargetPosition = [boxVertices[0] + 1, boxVertices[1], boxVertices[2]];

    for (var i = 0; i < 16; i++) {
        boxVertices[2 * 6 * offset + 6 * i + 1] += boxVertices[1];
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //normalize
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );//important2

    //console.log(roverPosition);
    //console.log(roverTargetPosition);
    var roverSpeed = 0.5;
    var roverSensitivity = 0.2;

    var aspectRatio = canvas.clientWidth / canvas.clientHeight;
    var borderWidth = 0.2;

    var aspectRationUniformLocation = gl.getUniformLocation(program, 'aspect');
    var borderWidthUniformLocation = gl.getUniformLocation(program, 'border_width');
    var widthUniformLocation = gl.getUniformLocation(program, 'width');
    var heightUniformLocation = gl.getUniformLocation(program, 'height');

    gl.uniform1f(aspectRationUniformLocation, aspectRatio);
    gl.uniform1f(borderWidthUniformLocation, borderWidth);
    gl.uniform1f(widthUniformLocation, canvas.clientWidth);
    gl.uniform1f(heightUniformLocation, canvas.clientHeight);

    glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
    //console.log(viewMatrix);
    //glMatrix.mat4.identity(viewMatrix);
    glMatrix.mat4.identity(projMatrix);
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(90), aspectRatio, 0.1, 200.0);

    gl.uniformMatrix4fv(matModelUniformLocation, gl.FALSE, modelMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

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
                gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
                break;
            case 'a':
                //console.log('a');
                //var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
                var c = cameraPosition;
                cameraPosition = mathCalc.findPointOnOrtSegment(cameraPosition, targetPosition, cameraSpeed);
                targetPosition = targetPosition.map((num, idx) => num + cameraPosition[idx] - c[idx]);
                //targetPosition = mathCalc.findPointOnOrtSegment(targetPosition, t, cameraSpeed);

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
                break;
            case 's':
                //console.log('s');
                //var t = targetPosition.map((num, idx) => 2 * num - cameraPosition[idx]);
                var c = cameraPosition;
                cameraPosition = mathCalc.findPointOnSegment(cameraPosition, targetPosition, -cameraSpeed);
                targetPosition = targetPosition.map((num, idx) => num + cameraPosition[idx] - c[idx]);
                //targetPosition = mathCalc.findPointOnSegment(targetPosition, t, -cameraSpeed);

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
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
                gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
                break;
            case ' ':
                //console.log('space');
                cameraPosition[1] += cameraSpeed;
                targetPosition[1] += cameraSpeed;

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
                break;
            case 'Shift':
                //console.log('shift');
                cameraPosition[1] -= cameraSpeed;
                targetPosition[1] -= cameraSpeed;

                glMatrix.mat4.lookAt(viewMatrix, cameraPosition, targetPosition, upVector);
                gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
                break;
            case 'ArrowUp':
                //var t = roverTargetPosition.map((num, idx) => 2 * num - roverPosition[idx]);
                var r = roverPosition;
                var f = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, roverSpeed);
                var trig = findTriangle(f[0], f[2]);
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
                    var h = mathCalc.pointOnTriangle(f[0], f[2], x0, y0, z0, x1, y1, z1, x2, y2, z2);
                }
                else {
                    var h = f[1];
                }
                //console.log(x0, y0, z0, x1, y1, z1, x2, y2, z2);
                //console.log(f[0], f[2]);
                //console.log(h);
                roverPosition = [f[0], h, f[2]];
                roverTargetPosition = [roverTargetPosition[0] + f[0] - r[0], h, roverTargetPosition[2] + f[2] - r[2]];
                //roverPosition = mathCalc.findPointOnSegment(roverPosition, roverTargetPosition, roverSpeed);
                //roverTargetPosition = roverTargetPosition.map((num, idx) => num + roverPosition[idx] - r[idx]);
                //console.log(r);
                //roverTargetPosition = mathCalc.findPointOnSegment(roverTargetPosition, t, roverSpeed);

                for (var i = 0; i < 16; i++) {
                    boxVertices[offset * 6 * 2 + 6 * i] += f[0] - r[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 1] += h - r[1];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] += f[2] - r[2];
                    //console.log(r);
                }
                //console.log(r);

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation, //Attribute location
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
                    var h = mathCalc.pointOnTriangle(f[0], f[2], x0, y0, z0, x1, y1, z1, x2, y2, z2);
                }
                else {
                    var h = f[1];
                }

                roverPosition = [f[0], h, f[2]];
                roverTargetPosition = [roverTargetPosition[0] + f[0] - r[0], h, roverTargetPosition[2] + f[2] - r[2]];

                for (var i = 0; i < 16; i++) {
                    //boxVertices[offset * 6 * 2 + 6 * i] += roverPosition[0] - r[0];
                    //boxVertices[offset * 6 * 2 + 6 * i + 2] += roverPosition[2] - r[2];
                    boxVertices[offset * 6 * 2 + 6 * i] += f[0] - r[0];
                    boxVertices[offset * 6 * 2 + 6 * i + 1] += h - r[1];
                    boxVertices[offset * 6 * 2 + 6 * i + 2] += f[2] - r[2];
                }

                //console.log(roverPosition);
                //console.log(roverTargetPosition);

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation, //Attribute location
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

                for (var i = 0; i < 16; i++) {
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

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation, //Attribute location
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

                for (var i = 0; i < 16; i++) {
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

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); //important1
                gl.vertexAttribPointer(
                    positionAttribLocation, //Attribute location
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
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

        //event.preventDefault();
    }

    var onMouseDownMoveUp = function (event) {
        if (changingPoint >= 0) {
            //console.log(event.movementY * dragSensitivity);
            boxVertices[changingPoint + 1] -= event.movementY * dragSensitivity;
            boxVertices[changingPoint + 6 * offset + 1] -= event.movementY * dragSensitivity;

            boxVertices[changingPoint + 3] = boxVertices[changingPoint + 1] / MODEL_SCALE;
            boxVertices[changingPoint + 4] = boxVertices[changingPoint + 1] / MODEL_SCALE;
            boxVertices[changingPoint + 5] = boxVertices[changingPoint + 1] / MODEL_SCALE;

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
                positionAttribLocation, //Attribute location
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
            }
            if (event.key == 'r') {

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
        }
    }

    //document.addEventListener('keydown', (e) => onKeyDown(e), false);
    //document.addEventListener('mousemove', (e) => onMouseMove(e), false);
    //
    // Main render loop
    //
    //gl.lineWidth(5);
    //console.log(gl.getParameter(gl.LINE_WIDTH));
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    var angle = 0;
    function loop() {

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
            `cameraYaw: ${cameraYaw.toFixed(1)}
cameraPitch: ${cameraPitch.toFixed(1)}
camera: ${cameraPosition.map(x => x.toFixed(3))}
camera forward: ${check1.map(x => x.toFixed(3))} ${mathCalc.euclidNorm(check1).toFixed(3)}
rover: ${roverPosition.map(x => x.toFixed(3))}
rover forward: ${check2.map(x => x.toFixed(3))} ${mathCalc.euclidNorm(check2).toFixed(3)}
i: ${i} j: ${j}
res_i: ${res_i.toFixed(3)} res_j: ${res_j.toFixed(3)}
i_1: ${i_1} j_1: ${j_1}
i_2: ${i_2} j_2: ${j_2}
i_3: ${i_3} j_3: ${j_3}`;
        //box: ${boxVertices[6 * fieldHeight * i + 6 * j].toFixed(3)}, ${boxVertices[6 * fieldHeight * i + 6 * j + 1].toFixed(3)}, ${boxVertices[6 * fieldHeight * i + 6 * j + 2].toFixed(3)}

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

        gl.clearColor(0, 0.3, 0.3, 0.3);
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

        gl.drawElements(gl.TRIANGLES, trianglesLength, gl.UNSIGNED_SHORT, 0);
        gl.drawElements(gl.LINES, linesLength, gl.UNSIGNED_SHORT, trianglesLength * 2);
        gl.drawElements(gl.TRIANGLES, roverLength, gl.UNSIGNED_SHORT, trianglesLength * 2 + linesLength * 2);
        gl.drawElements(gl.LINES, roverLinesLength, gl.UNSIGNED_SHORT, trianglesLength * 2 + linesLength * 2 + roverLength * 2);
        //gl.drawElements(gl.LINES, linesLength, gl.UNSIGNED_SHORT, 20);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}