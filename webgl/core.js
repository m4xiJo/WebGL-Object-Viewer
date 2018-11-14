var vShaderInstruct = [
  "precision mediump float;",
  "",
  "attribute vec2 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "",
  "void main()",
  "{",
  " fragColor = vertColor;",
  " gl_Position = vec4(vertPosition, 0.0, 1.0);",
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
  console.log("WebGL function ran!");
  var canvas = document.getElementById("viewport");
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
  var triVerts = [
    // X, Y,    R, G, B.
    0.0, 0.5,   1.0, 0.0, 0.0,
    -0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, -0.5,  0.0, 0.0, 1.0
  ];

  var triVertexBufferObj = gl.createBuffer(); //GPU buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triVertexBufferObj);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triVerts), gl.STATIC_DRAW);

  var posAttrLocation = gl.getAttribLocation(program, "vertPosition");
  var colorAttrLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    posAttrLocation, //Location of attribute
    2, //Number of elements per attribute
    gl.FLOAT, //Type of elements
    gl.FALSE, //Normalized?
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );

  gl.vertexAttribPointer(
    colorAttrLocation, //Location of attribute
    3, //Number of elements per attribute
    gl.FLOAT, //Type of elements
    gl.FALSE, //Normalized?
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
    2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(posAttrLocation);
  gl.enableVertexAttribArray(colorAttrLocation);

  // Render update loop
  var updateLoop = function () {
    render();
    update();
  }

  //Draw a static triangle
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
