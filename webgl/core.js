function runWebGL(meshPath, adPath, nbPath, smPath, grPath) {

  // Prepare Vertex shader
  let vertexShader = [
    "precision mediump float;",
    "attribute vec3 vertPosition;",
    "attribute vec2 vertTexCoord;",
    "varying vec2 fragTexCoord;",
    "uniform mat4 mWorld;",
    "uniform mat4 mView;",
    "uniform mat4 mProj;",
    "void main() {",
        "fragTexCoord = vertTexCoord;",
        "gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
    "}",
  ].join("");

  // Prepare Fragment shader
  let fragmentShader = [
    "precision mediump float;",
    "varying vec2 fragTexCoord;",
    "uniform sampler2D sampler;",
    "void main() {",
      "gl_FragColor = texture2D(sampler, fragTexCoord);",
    "}",
  ].join("");

  // Load Mesh
  loadFile(meshPath, function(meshErr, meshObj) {
    if (meshErr) console.error("Error getting mesh! " + meshErr);
    else {
      let meshVertex = meshObj.meshes[0].vertices;
      let meshIndex = [].concat.apply([], meshObj.meshes[0].faces);
      let texCoords  = meshObj.meshes[0].texturecoords[0];
      // Load Albedo/Diffuse
      loadFile(adPath, function(adErr, adObj) {
        if (adErr) console.error("Error getting mesh Albedo/Diffuse! " + adErr);
        else {
          adPath = adObj;
          // Load Normal/Bump
          loadFile(nbPath, function(nbErr, nbObj) {
            if (nbErr) console.error("Error getting mesh Normal/Bump map! " + nbErr + " Skipping...");
            else nbPath = nbObj;
          });
          // Load Specular/Metallic
          loadFile(smPath, function(smErr, smObj) {
            if (smErr) console.error("Error getting mesh Specual/Metallic map! Skipping..." + smErr + " Skipping...");
            else smPath = smObj;
          });
          // Load Glossy/Rough
          loadFile(grPath, function(grErr, grObj) {
            if (grErr) console.error("Error getting mesh Glossy/Roughness map! Skipping..." + grErr + " Skipping...");
            else grPath = grObj;
          });
          execWebGL(vertexShader, fragmentShader, meshVertex, meshIndex, texCoords, adPath, nbPath, smPath, grPath);
        }
      });
    }
  });
}

// File loader
function loadFile(url, callback) {
  // Load mesh files
  if (url.match(/\.(json|obj|dae|blend|fbx|3ds|max)/g)) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    if (url.match (/\.(json|obj|dae)/g)) { // If non binary asset
      request.setRequestHeader("Content-Type", "text/plain");
      request.onload = function () {
        if (request.status < 200 || request.status > 299) callback("Error: Status " + request.status + " on resource " + url);
        else callback(null, JSON.parse(request.responseText));
      }
    }
    else if (url.match (/\.(blend|fbx|3ds|max)/g)) { // If binary asset
      request.responseType = "arraybuffer";
      request.onload = function () {
        if (request.status < 200 || request.status > 299) callback("Error: Status " + request.status + " on resource " + url);
        else callback(null, request.response);
      }
    }
    request.send();
  }

  //Load textures
  else if (url.match(/\.(jpg|jpeg|png|bmp|gif)/g)) {
    let texture = new Image();
    texture.onload = function () {
      callback(null, texture);
    }
    texture.src = url;
  }
  else {
      callback("Unreconginzed file format!");
  }
}

function execWebGL(vertexShaderCode, fragmentShaderCode, meshVertecies, meshIndecies, meshTexCoords, texture_ad, texture_nb, texture_sm, texture_gr) {
  //Initialize and configure WebGL
  let canvas = document.getElementsByClassName("viewport")[0];
  let gl = canvas.getContext("webgl");

  if (!gl) {
      console.log("WebGL is not supported, trying Experimental WebGL...");
      gl = canvas.getContext("experimental-webgl");
      (!gl) ? alert("Couldn't initialize WebGL, this might be because your browser doesn't support it!") : console.log("loaded Experimental WebGL!");
  }

  // Configure WebGL
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  // Create shaders
  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  //Define shader source
  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.shaderSource(fragmentShader, fragmentShaderCode);

  // Compile vertex shader
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("ERROR failed to compile Vertex Shader", gl.getShaderInfoLog(vertexShader));
    return;
  }

  // Compile fragment shader
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("ERROR failed to compile Fragment Shader", gl.getShaderInfoLog(fragmentShader));
    return;
  }

  // Create program & validate it
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

  //GPU buffer
  let meshVertexBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, meshVertexBufferObj);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshVertecies), gl.STATIC_DRAW);

  let texCoordBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferObj);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshTexCoords), gl.STATIC_DRAW);

  let meshIndexBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshIndexBufferObj);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(meshIndecies), gl.STATIC_DRAW);

  //// Setup attributes ////
  gl.bindBuffer(gl.ARRAY_BUFFER, meshVertexBufferObj);
  let posAttrLocation = gl.getAttribLocation(program, "vertPosition");
  // Location of attribute, Number of elements per attribute, Type of elements, Normalized?, Size of individual vertex, Offset from the beginning of a single vertex to this attribute
  gl.vertexAttribPointer(posAttrLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(posAttrLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferObj);
  let texCoordAttrLocation = gl.getAttribLocation(program, "vertTexCoord");
  // Location of attribute, Number of elements per attribute, Type of elements, Normalized?, Size of individual vertex, Offset from the beginning of a single vertex to this attribute
  gl.vertexAttribPointer(texCoordAttrLocation, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(texCoordAttrLocation);

  //Tell which program is active
  gl.useProgram(program);

  let matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  let matViewUniformLocation = gl.getUniformLocation(program, "mView");
  let matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  let projMatrix = new Float32Array(16);
  let viewMatrix = new Float32Array(16);
  let worldMatrix = new Float32Array(16);

  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -6], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 1, 2000);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  let xRotationMatrix = new Float32Array(16);
  let yRotationMatrix = new Float32Array(16);
  let identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);

  //// Global variables ////
  let angleY = 0;
  let angleX = 0;
  let zoomRatio = 0;
  let mouseMoveX = 0;
  let mouseMoveY = 0;
  let autoRotate = true;
  let fpsCounter = document.getElementsByClassName("FPS")[0];
  let startTime = new Date().getTime();
  let currentTime;
  let frameCounter = 0;
  let isScrolling;
  let isMoving;
  let viewGrid = true;
  let lightingMode = 1;
  let viewMode = 1;

  window.onfocus = function() {
    startTime = new Date().getTime();
    frameCounter = 0;
  };

  //// Create Textures ////
  // Albedo/Diffuse
  let meshTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, meshTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_ad);
  gl.bindTexture(gl.TEXTURE_2D, null);

  // Normal/Bump

  // Specular/Metallic

  // Glossy/Rough

  //// Render update loop ////
  let updateLoop = function () {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    (autoRotate) ? angleX = performance.now() / 6000 * Math.PI : null;
		mat4.rotate(yRotationMatrix, identityMatrix, angleX, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angleY, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, meshTexture);
    gl.activeTexture(gl.TEXTURE0);
    gl.drawElements(gl.TRIANGLES, meshIndecies.length, gl.UNSIGNED_SHORT, 0);
    currentTime = new Date().getTime();
    fpsCounter.innerText = parseInt(frameCounter / (currentTime - startTime) * 1000);
    frameCounter++;
    requestAnimationFrame(updateLoop);
  }
  requestAnimationFrame(updateLoop);
  //// GUI Events ////
  document.getElementsByClassName("viewport")[0].addEventListener('mousemove', inputMoveListen = function (move) {
    if (move.clientX && move.buttons == 1) {
      angleX += ((move.clientX - mouseMoveX) * 0.01)
    }
    if (move.clientY && move.buttons == 1) {
      angleY -= ((move.clientY - mouseMoveY) * 0.01);
    }
    mouseMoveX = move.clientX;
    mouseMoveY = move.clientY;

    if (move.clientX && move.buttons == 2)
      move.target.style.cursor = "move";
        window.clearTimeout(isMoving);
        isMoving = setTimeout(function() {
          move.target.style.cursor = null;
        }, 50);
  }, false);

  document.addEventListener('wheel', inputScrollListen = function (scroll) {
    let zoomSlider = document.getElementsByClassName("zoomSlider")[0];
    if (scroll.deltaY && (scroll.target.className === "viewport" || scroll.target.className === "workArea")) {
      zoomSlider.value -= scroll.deltaY * 0.6;
      if (scroll.deltaY < 0) scroll.target.style.cursor = "zoom-in";
      if (scroll.deltaY > 0) scroll.target.style.cursor = "zoom-out";
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(function() {
        scroll.target.style.cursor = null;
      }, 200);
    }
  }, false);

  document.addEventListener('click', inputClickListen = function (click) {
    let zoomSlider = document.getElementsByClassName("zoomSlider")[0];
    if (click.target.className === "btnZoomOut" && click.button == 0) {
      (zoomSlider.value >= 0 && zoomSlider.value >= 10) ? zoomSlider.value -= 10 : zoomSlider.value = 1;
    }
    else if (click.target.className === "btnZoomIn" && click.button == 0) {
      (zoomSlider.value <= 100 && zoomSlider.value <= 90) ? zoomSlider.value -= (-10) : zoomSlider.value = 100;
    }

    else if (click.target.className === "topView" && click.button == 0) {
      angleY = -1.6;
      angleX = 0;
    }

    else if (click.target.className === "xView" && click.button == 0) {
      angleY = 0;
      angleX = -1.6;
    }

    else if (click.target.className === "yView" && click.button == 0) {
      angleY = 0;
      angleX = 0;
    }

    else if (click.target.className === "viewMode" && click.button == 0) {
      let values = ["0xE3A2", "0xE22A", "0xE3F4"];
      let handleIndex = values.indexOf("0x" + click.target.value.charCodeAt(0).toString(16).toUpperCase()) + 1;
      if ((values.indexOf("0x" + click.target.value.charCodeAt(0).toString(16).toUpperCase()) + 1) >= values.length) handleIndex = 0;
      switch (handleIndex) {
        case 0:
          click.target.value = String.fromCharCode("0xE3A2");
          break;
        case 1:
          click.target.value = String.fromCharCode("0xE22A");
          break;
        case 2:
          click.target.value = String.fromCharCode("0xE3F4");
          break;
      }
    }

    else if (click.target.className === "btnGrid" && click.button == 0) {
      (click.target.value !== String.fromCharCode("0xE3EB")) ? click.target.value = String.fromCharCode("0xE3EB") : click.target.value = String.fromCharCode("0xE3EC");
    }

    else if (click.target.className === "btnSyncViewport" && click.button == 0) {
      (click.target.value !== String.fromCharCode("0xE628")) ? click.target.value = String.fromCharCode("0xE628") : click.target.value = String.fromCharCode("0xE627");
    }

    else if (click.target.className === "litUnlit" && click.button == 0) {
      (click.target.value !== String.fromCharCode("0xE25F")) ? click.target.value = String.fromCharCode("0xE25F") : click.target.value = String.fromCharCode("0xE90F");
    }

    else if (click.target.className === "btnRotation" && click.button == 0) {
      autoRotate ^= true;
      (click.target.value !== String.fromCharCode("0xE036")) ? click.target.value = String.fromCharCode("0xE036") : click.target.value = String.fromCharCode("0xE84D");
    }

    else if (click.target.className === "close" && click.button == 0) {
      click.target.parentElement.style.visibility = "hidden";
      click.target.parentElement.style.opacity = 0;
    }

    else if (click.target.classList[0] === "btnWarnings" && click.button == 0) {
      if (click.target.value !== String.fromCharCode("0xE86C")) {
        click.target.value = String.fromCharCode("0xE86C");
        click.target.classList.remove("error");
        click.target.classList.add("ok");
        document.getElementsByClassName("modal")[0].style.visibility = "visible";
        document.getElementsByClassName("modal")[0].style.opacity = 1;
        document.getElementsByClassName("title")[0].innerText = "Mesh validation report";
      }
      else {
        click.target.value = String.fromCharCode("0xE002");
        click.target.classList.remove("ok");
        click.target.classList.add("error");
      }
    }

    else if (click.target.className === "btnFullScreen" && click.button == 0) {
      (click.target.value !== String.fromCharCode("0xE5D1")) ? click.target.value = String.fromCharCode("0xE5D1") : click.target.value = String.fromCharCode("0xE5D0");
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
}

//// Parsers ////
function parse3DS() {

}

function parseBLEND() {

}

function parseDAE() {

}

function parseOBJ() {

}

function parseMAX() {

}

function parseFBX() {

}
