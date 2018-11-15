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

let runWebGL  = function () {
  let canvas = document.getElementsByClassName("viewport")[0];
  let gl = canvas.getContext("webgl");

  if (!gl) {
      console.log("WebGL is not supported, trying Experimental WebGL...");
      gl = canvas.getContext("experimental-webgl");
      (!gl) ? alert("Couldn't initialize WebGL, this might be because your browser is doesn't support it!") : console.log("loaded Experimental WebGL!");
  }

  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

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

  let program = gl.createProgram();
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
  let boxVertices = [
    // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.0, 0.0, 1.0,
		-1.0, 1.0, 1.0,    0.0, 0.0, 1.0,
		1.0, 1.0, 1.0,     0.0, 0.0, 1.0,
		1.0, 1.0, -1.0,    0.0, 0.0, 1.0,

		// Left
		-1.0, 1.0, 1.0,    0.0, 1.0, 0.0,
		-1.0, -1.0, 1.0,   0.0, 1.0, 0.0,
		-1.0, -1.0, -1.0,  0.0, 1.0, 0.0,
		-1.0, 1.0, -1.0,   0.0, 1.0, 0.0,

		// Right
		1.0, 1.0, 1.0,    1.0, 0.0, 0.0,
		1.0, -1.0, 1.0,   1.0, 0.0, 0.0,
		1.0, -1.0, -1.0,  1.0, 0.0, 0.0,
		1.0, 1.0, -1.0,   1.0, 0.0, 0.0,

		// Front
		1.0, 1.0, 1.0,    1.0, 1.0, 0.0,
		1.0, -1.0, 1.0,   1.0, 1.0, 0.0,
		-1.0, -1.0, 1.0,  1.0, 1.0, 0.0,
		-1.0, 1.0, 1.0,   1.0, 1.0, 0.0,

		// Back
		1.0, 1.0, -1.0,   0.0, 1.0, 1.0,
		1.0, -1.0, -1.0,  0.0, 1.0, 1.0,
		-1.0, -1.0, -1.0, 0.0, 1.0, 1.0,
		-1.0, 1.0, -1.0,  0.0, 1.0, 1.0,

		// Bottom
		-1.0, -1.0, -1.0, 1.0, 0.0, 1.0,
		-1.0, -1.0, 1.0,  1.0, 0.0, 1.0,
		1.0, -1.0, 1.0,   1.0, 0.0, 1.0,
		1.0, -1.0, -1.0,  1.0, 0.0, 1.0,
];

  let boxIndices = [
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

  let boxVertexBufferObj = gl.createBuffer(); //GPU buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObj);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  let boxIndexBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObj);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  let posAttrLocation = gl.getAttribLocation(program, "vertPosition");
  let colorAttrLocation = gl.getAttribLocation(program, "vertColor");

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

  let matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  let matViewUniformLocation = gl.getUniformLocation(program, "mView");
  let matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  let projMatrix = new Float32Array(16);
  let viewMatrix = new Float32Array(16);
  let worldMatrix = new Float32Array(16);

  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -6], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  let xRotationMatrix = new Float32Array(16);
  let yRotationMatrix = new Float32Array(16);
  let identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);

  let angleY = 0;
  let angleX = 0;
  let zoomRatio = -5;
  let mouseMoveX = 0;
  let mouseMoveY = 0;
  let fpsCounter = document.getElementsByClassName("FPS")[0];
  let startTime = new Date().getTime();
  let currentTime;
  let frameCounter = 0;

  //GUI Events
  document.getElementsByClassName("viewport")[0].addEventListener('mousemove', inputMoveListen = function (move) {
    if (move.clientX && move.buttons == 1) {
      angleX += ((move.clientX - mouseMoveX) * 0.01)
    }
    if (move.clientY && move.buttons == 1) {
      angleY -= ((move.clientY - mouseMoveY) * 0.01);
    }
    mouseMoveX = move.clientX;
    mouseMoveY = move.clientY;
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
    }
    else if (click.target.className === "btnZoomIn") {
      (zoomSlider.value <= 100 && zoomSlider.value <= 90) ? zoomSlider.value -= (-10) : zoomSlider.value = 100;
    }

    else if (click.target.className === "topView") {
      angleY = -1.6;
      angleX = 0;
    }

    else if (click.target.className === "xView") {
      angleY = 0;
      angleX = -1.6;
    }

    else if (click.target.className === "yView") {
      angleY = 0;
      angleX = 0;
    }

    else if (click.target.className === "btnFullScreen") {
      let element = document.getElementsByClassName("workArea")[0];
      if (!window.fullScreen) {
        if (element.requestFullscreen) { element.requestFullscreen(); return; }
        if (element.mozRequestFullScreen) { element.mozRequestFullScreen(); return; }
        if (element.webkitRequestFullscreen) { element.webkitRequestFullscreen(); return; }
        if (element.msRequestFullscreen) { element.msRequestFullscreen(); return; }
      }
      if (window.fullScreen) {
        if (document.exitFullscreen) { document.exitFullscreen(); return; }
        if (document.mozCancelFullScreen) { document.mozCancelFullScreen(); return; }
        if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); return; }
        if (document.msExitFullscreen) { document.msExitFullscreen(); return; }
      }
    }
  }, false);

  // Render update loop
  let updateLoop = function () {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    //angleX = performance.now() / 6000 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angleX, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angleY, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    currentTime = new Date().getTime();
    fpsCounter.innerText = parseInt(frameCounter / (currentTime - startTime) * 1000);
    frameCounter++;
    requestAnimationFrame(updateLoop);
  }
  requestAnimationFrame(updateLoop);
}
