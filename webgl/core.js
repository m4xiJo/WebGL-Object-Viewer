var vShaderInstruct = [
  "precision mediump float;",
  "",
  "attribute vec3 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "uniform mat4 mWorld;",
  "uniform mat4 mView;",
  "uniform mat4 mProj;",
  "",
  "void main()",
  "{",
  " fragColor = vertColor;",
  " gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
  "}"
].join("\n");

var fShaderInstruct = [
  "precision mediump float;",
  "",
  "varying vec3 fragColor;",
  "void main()",
  "{",
  " gl_FragColor = vec4(fragColor, 1.0);",
  "}"
].join("\n");

var runWebGL  = function () {
  var canvas = document.getElementsByClassName("viewport")[0];
  var gl = canvas.getContext("webgl");

  if (!gl) {
      console.log("WebGL is not supported, trying Experimental WebGL...");
      gl = canvas.getContext("experimental-webgl");
      (!gl) ? alert("Couldn't initialize WebGL, this might be because your browser is doesn't support it!") : console.log("loaded Experimental WebGL!");
  }

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vShaderInstruct);
  gl.shaderSource(fragmentShader, fShaderInstruct);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("ERROR failed to compile Vertex Shader", gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("ERROR failed to compile Fragment Shader", gl.getShaderInfoLog(fragmentShader));
    return;
  }

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR failed to link program!", gl.getProgramInfoLog(program));
    return;
  }
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
    return;
  }

  //Create a buffer
  var boxVertices = [
    // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
];

  var boxIndices = [
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
];

  var boxVertexBufferObj = gl.createBuffer(); //GPU buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObj);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  var boxIndexBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObj);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  var posAttrLocation = gl.getAttribLocation(program, "vertPosition");
  var colorAttrLocation = gl.getAttribLocation(program, "vertColor");

  gl.vertexAttribPointer(
    posAttrLocation, // Location of attribute
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // Normalized?
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );

  gl.vertexAttribPointer(
    colorAttrLocation, // Location of attribute
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // Normalized?
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(posAttrLocation);
  gl.enableVertexAttribArray(colorAttrLocation);
  gl.useProgram(program); //Tell which program is active

  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  var projMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var worldMatrix = new Float32Array(16);

  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -6], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  var xRotationMatrix = new Float32Array(16);
  var yRotationMatrix = new Float32Array(16);
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);

  var angleY = 0;
  var angleX = 0;
  var zoomRatio = -5;
  var mouseMoveX = 0;
  var mouseMoveY = 0;
  let fpsCounter = document.getElementsByClassName("FPS")[0];
  let startTime = new Date();
  let currentTime = new Date();
  let frameCounter = 0;

  //GUI Events
  document.getElementsByClassName("viewport")[0].addEventListener('mousemove', inputMoveListen = function (move) {
    if (move.clientX && move.buttons == 1) {
      mouseMoveX = move.clientX - mouseMoveX;
      angleX = (mouseMoveX * 0.02).toFixed(1);
      //console.log((mouseMoveX * 0.02).toFixed(1));
    }
    if (move.clientY && move.buttons == 1) {
      mouseMoveY = move.clientY - mouseMoveY;
      angleY = -Math.abs((mouseMoveY * 0.02).toFixed(1));
      //console.log(mouseMoveY * 0.02);
    }
  }, false);

  document.addEventListener('wheel', inputScrollListen = function (scroll) {
    let zoomSlider = document.getElementsByClassName("zoomSlider")[0];
    if (scroll.deltaY && (scroll.target.className === "viewport" || scroll.target.className === "workArea")) {
      zoomSlider.value -= scroll.deltaY * 0.6;
    }
  }, false);

  document.addEventListener('click', inputClickListen = function (click) {
    let zoomSlider = document.getElementsByClassName("zoomSlider")[0];
    if (click.target.className === "btnZoomOut") {
      (zoomSlider.value >= 0 && zoomSlider.value >= 10) ? zoomSlider.value -= 10 : zoomSlider.value = 1;
      console.log(zoomSlider.value);
    }
    else if (click.target.className === "btnZoomIn") {
      (zoomSlider.value <= 100 && zoomSlider.value <= 90) ? zoomSlider.value -= (-10) : zoomSlider.value = 100;
      console.log(zoomSlider.value);
    }
  }, false);

  // Render update loop
  var updateLoop = function () {
    //angle = performance.now() / 6000 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angleX, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angleY, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    //console.log(angle);

    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    currentTime = new Date();
    frameCounter++;
    fpsCounter.innerText = parseInt(frameCounter / (currentTime.getTime() - startTime.getTime()) * 1000);

    requestAnimationFrame(updateLoop);
  }
  requestAnimationFrame(updateLoop);
}
