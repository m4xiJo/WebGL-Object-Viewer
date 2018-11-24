var helpTextLoremIpsum = "<p>Ea paulo intellegat omittantur sit, esse liber at qui, vix cu ludus volutpat. Cibo dicit nonumes has et, his ne lorem scripta scriptorem, sea ex oblique deseruisse argumentum. Eu dolorum consequuntur quo. Nonumy omnium pri ea. </p><p>Est ex recusabo delicata, imperdiet concludaturque id est. Option conclusionemque ne mei. Ex eam accumsan inimicus. Has nominavi voluptatum complectitur ad. Libris nemore ad qui, te his probo utroque. Eu meliore admodum eum. </p><p>Cu option feugiat dolorem per, per an tale legere. Oporteat vulputate cu eos, sonet virtute no mel. Eos altera animal oporteat et, id perfecto interpretaris qui. Putent dicunt maiorum an has, et duo atqui animal eligendi. Sale tamquam pericula quo eu, nostrud intellegat an est, ea usu vitae nominati. Dicam vocent dolorem pro ut, ea per iudico minimum, an simul aperiam malorum ius. Ei pro facer tritani, quodsi accusata eu qui. </p><p>Te mel dicant scribentur theophrastus, vis falli postulant constituam ad. Cum eu mnesarchum instructior. Malis putent petentium pro in, an est senserit elaboraret intellegebat, mei in mollis mediocritatem. Ad eum illud fugit. In suas homero nemore his. </p><p>Pro illum aliquip in, pri et affert iracundia. Simul melius nostrum eum ei, simul nostro invidunt qui in, ei omnium latine omittam duo. Pri an dicant lucilius aliquando, brute feugait adolescens pri eu, vel cu fabulas pertinacia. Mea noster delectus dignissim et, est ea illum intellegat. Epicurei philosophia id vim. </p><p>Oratio insolens ullamcorper ex has, ad ius solet ignota reprehendunt. Duo petentium erroribus at, quem nostrum ad his. Nam omnis posidonium ne, partem vocibus pri an, ius no nominati gubergren. Verear recteque philosophia ius cu, ad oblique propriae vel. </p><p>Vel dolor legendos salutandi et, vitae primis inimicus sed an. Ad sed omnis iracundia, facer nonumy saperet eu nec. Cu signiferumque mediocritatem vix. Vis id erant possim. In pro quidam labores. Ei sit oblique atomorum honestatis, quo mazim delicata cu, cu nibh graeci facilisi duo. </p><p>Ei vix magna malorum nominati. Hinc indoctum repudiare cu vix. Graeco vocent deseruisse nam eu. Ea cum suscipit elaboraret. At nulla tincidunt pri. </p><p>Ex pro consul sanctus, ea ullum ancillae facilisis pri. Ex pro quaeque honestatis, eam ad zril dictas, mei ponderum disputando id. Liber adversarium est te. Cibo impetus reprimique no quo, id eos viderer honestatis. Amet platonem consulatu ei cum, omnis assum eu est, vel cu suscipit facilisi. </p><p>Sea congue denique no, persius scaevola vel ne. Ut sit eius illum accusam, at volutpat abhorreant scriptorem per. Periculis theophrastus nec te, eam id commune omnesque, ius at mutat volumus nostrum. Vim stet impetus instructior ea, mei ea viderer torquatos. Et vero dicat timeam vis.</p>";


function runWebGL(meshPath, adPath, nbPath, smPath, grPath) {
  // Prepare Vertex shader
  let vertexShader = [
    "precision mediump float;",
    "attribute vec3 vertPosition;",
    "attribute vec2 vertTexCoord;",
    "attribute vec3 vertNormal;",
    "varying vec2 fragTexCoord;",
    "varying vec3 fragNormal;",
    "uniform mat4 mWorld;",
    "uniform mat4 mView;",
    "uniform mat4 mProj;",
    "void main() {",
        "fragTexCoord = vertTexCoord;",
        "fragNormal = (mWorld * vec4(vertNormal, 0.0)).xyz;",
        "gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
    "}",
  ].join("");

  // Prepare Fragment shader
  let fragmentShader = [
    "precision mediump float;",
    "struct directionalLight {",
      "vec3 direction;",
      "vec3 color;};",
    "varying vec2 fragTexCoord;",
    "varying vec3 fragNormal;",
    "uniform vec3 ambientLightIntensity;",
    "uniform directionalLight sun;",
    "uniform sampler2D sampler;",
    "void main() {",
      "vec3 surfaceNormal = normalize(fragNormal);",
      "vec3 normSunDir = normalize(sun.direction);",
      "vec4 texel = texture2D (sampler, fragTexCoord);",
      "vec3 lightIntensity = ambientLightIntensity + sun.color * max(dot(fragNormal, normSunDir), 0.0);",
      "gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);",
    "}",
  ].join("");

  // Load Mesh
  loadFile(meshPath, function(meshErr, meshObj) {
    if (meshErr) console.error("Error getting mesh! " + meshErr);
    else {
      let meshVertex = meshObj.meshes[0].vertices;
      let meshIndex = [].concat.apply([], meshObj.meshes[0].faces);
      let meshTexCoords  = meshObj.meshes[0].texturecoords[0];
      let meshNormals = meshObj.meshes[0].normals;
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
          execWebGL(vertexShader, fragmentShader, meshVertex, meshIndex, meshTexCoords, meshNormals, adPath, nbPath, smPath, grPath);
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
    request.open('GET', url + "?" + Math.random(), true);
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

function execWebGL(vertexShaderCode, fragmentShaderCode, meshVertecies, meshIndecies, meshTexCoords, meshNormals, texture_ad, texture_nb, texture_sm, texture_gr) {
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

  // GPU buffer
  let meshVertexBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, meshVertexBufferObj);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshVertecies), gl.STATIC_DRAW);

  let texCoordBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferObj);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshTexCoords), gl.STATIC_DRAW);

  let meshIndexBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshIndexBufferObj);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(meshIndecies), gl.STATIC_DRAW);

  let meshNormalBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, meshNormalBufferObj);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshNormals), gl.STATIC_DRAW);

  //// Setup attributes ////
  // Location of attribute, Number of elements per attribute, Type of elements, Normalized?, Size of individual vertex, Offset from the beginning of a single vertex to this attribute
  gl.bindBuffer(gl.ARRAY_BUFFER, meshVertexBufferObj);
  let posAttrLocation = gl.getAttribLocation(program, "vertPosition");
  gl.vertexAttribPointer(posAttrLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(posAttrLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferObj);
  let texCoordAttrLocation = gl.getAttribLocation(program, "vertTexCoord");
  gl.vertexAttribPointer(texCoordAttrLocation, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(texCoordAttrLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, meshNormalBufferObj);
  let normalAttrLocation = gl.getAttribLocation(program, "vertNormal");
  gl.vertexAttribPointer(normalAttrLocation, 3, gl.FLOAT, gl.TRUE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(normalAttrLocation);

  // Tell which program is active
  gl.useProgram(program);

  let matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  let matViewUniformLocation = gl.getUniformLocation(program, "mView");
  let matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  let projMatrix = new Float32Array(16);
  let viewMatrix = new Float32Array(16);
  let worldMatrix = new Float32Array(16);

  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -200], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 1, 2000);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  let xRotationMatrix = new Float32Array(16);
  let yRotationMatrix = new Float32Array(16);

  // Lighting
  gl.useProgram(program);
  var ambLightIntensityUniformLocation = gl.getUniformLocation(program, "ambientLightIntensity");
  var sunlightDirUniformLocation = gl.getUniformLocation(program, "sun.direction");
  var sunlightIntUniformLocation = gl.getUniformLocation(program, "sun.color");
  //gl.uniform3f(ambLightIntensityUniformLocation, 0.2, 0.2, 0.2);
  gl.uniform3f(sunlightDirUniformLocation, 3.0, 4.0, -2.0);
  //gl.uniform3f(sunlightIntUniformLocation, 1.0, 1.0, 1.0);

  let identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);

  //// Global variables ////
  let angleY = 0;
  let angleX = 0;
  let zoomRatio = 0;
  let mouseMoveX = 0;
  let mouseMoveY = 0;
  let fpsCounter = document.getElementsByClassName("FPS")[0];
  let startTime = new Date().getTime();
  let currentTime;
  let frameCounter = 0;

  //States
  let isScrolling;
  let isMoving;

  //Modes
  let autoRotate = true;
  let viewGrid = true;
  let lightingMode = 1;
  let viewMode = 2;
  let mapWorkflow = 1;
  let bumpNormal = 1;
  let shadingMode = 1;
	let emissiveMaps = true;
 	let objScale = 1;

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
    if (autoRotate) angleX = performance.now() / 6000 * Math.PI;
    if (lightingMode == 1) {
      gl.uniform3f(ambLightIntensityUniformLocation, 0.2, 0.2, 0.2);
      gl.uniform3f(sunlightIntUniformLocation, 1.0, 1.0, 1.0);
    }
    else {
      gl.uniform3f(ambLightIntensityUniformLocation, 1.0, 1.0, 1.0);
      gl.uniform3f(sunlightIntUniformLocation, 0.0, 0.0, 0.0);
    }

		mat4.rotate(yRotationMatrix, identityMatrix, angleX, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angleY, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, meshTexture);
    gl.activeTexture(gl.TEXTURE0);
    if (viewMode == 0) gl.drawElements(gl.TRIANGLES, meshIndecies.length, gl.UNSIGNED_SHORT, 0);
    else if (viewMode == 1) gl.drawElements(gl.LINES, meshIndecies.length, gl.UNSIGNED_SHORT, 0);
    else if (viewMode == 2) gl.drawElements(gl.TRIANGLES, meshIndecies.length, gl.UNSIGNED_SHORT, 0);
    currentTime = new Date().getTime();
    fpsCounter.innerText = parseInt(frameCounter / (currentTime - startTime) * 1000);
    frameCounter++;
    requestAnimationFrame(updateLoop);
  }
  requestAnimationFrame(updateLoop);

  //// GUI Events ////
  //Show notification
  // Colors
  let normal = "#5c5c5c";
  let success = "#036f00";
  let warning = "#808d00";
  let error = "#ba0000";
  let timer = null;

  function showNotification(text, time, color, percent, timeOut) {
    clearTimeout(timer);
    document.getElementsByClassName("notyTitle")[0].innerText = text;
		document.getElementsByClassName("notification")[0].setAttribute("style", "animation: fadein " + time + "s; background: " + color + "; border-bottom: 1px solid " + modifyColor(color, percent));
    timer = setTimeout(function() {
      document.getElementsByClassName("notification")[0].style.animation = null;
    }, time * 1000);
  }

  function toggleModalWindow (title, content, color, percent) {
    if (document.getElementsByClassName("modal")[0].style.visibility !== "visible") {
      document.getElementsByClassName("modal")[0].setAttribute("style", "visibility: visible; opacity: 1;");
      document.getElementsByClassName("modalTitle")[0].innerText = title;
			document.getElementsByClassName("modalTitle")[0].setAttribute("style", "background:" + color + "; border-bottom: 1px solid " + modifyColor(color, percent));
      document.getElementsByClassName("modalContent")[0].innerHTML = content;
    }
    else {
			document.getElementsByClassName("modal")[0].setAttribute("style", "visibility: hidden; opacity: 0;");
      document.getElementsByClassName("modalTitle")[0].innerText = null;
      document.getElementsByClassName("modalContent")[0].innerHTML = null;
    }
  }

  function modifyColor (color, percent) {
      if (color.match(/#/g)) color = color.replace('#','');
    	let num = parseInt(color, 16),
  		amt = Math.round(2.55 * percent),
  		R = (num >> 16) + amt,
  		B = (num >> 8 & 0x00FF) + amt,
  		G = (num & 0x0000FF) + amt;
  		return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
  }

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

	//Track click events
  document.addEventListener('click', inputClickListen = function (click) {

		//// Left column buttons ////
		//Lit/Unlit togle button cLick
		if (click.target.className === "btnLitUnlit" && click.button == 0) {
			if (lightingMode == 0) {
				click.target.value = String.fromCharCode("0xE25F");
				showNotification("Set to Lit mode", 1, normal, -20, null);
				lightingMode = 1;
			}
			else if (lightingMode == 1) {
				click.target.value = String.fromCharCode("0xE90F");
				showNotification("Set to Unlit mode", 1, normal, -20, null);
				lightingMode = 0;
			}
		}

		//Object view button click
		else if (click.target.className === "btnViewMode" && click.button == 0) {
			switch (viewMode) {
				case 0:
					click.target.value = String.fromCharCode("0xE22A");
					showNotification("Wireframe view", 1, normal, -20, null);
					viewMode = 1;
					break;
				case 1:
					click.target.value = String.fromCharCode("0xE3F4");
					showNotification("Textured view", 1, normal, -20, null);
					viewMode = 2;
					break;
				case 2:
					click.target.value = String.fromCharCode("0xE3A2");
					showNotification("Solid view", 1, normal, -20, null);
					viewMode = 0;
					break;
			}
		}

		//Grid toggle button click
		else if (click.target.className === "btnGrid" && click.button == 0) {
			if (viewGrid == true) {
				click.target.value = String.fromCharCode("0xE3EB")
				showNotification("Grid OFF", 1, normal, -20, null);
				viewGrid = false;
			}
			else if (viewGrid == false) {
				click.target.value = String.fromCharCode("0xE3EC");
				showNotification("Grid ON", 1, normal, -20, null);
				viewGrid = true;
			}
		}

		//Auto rotation on/off button click
		else if (click.target.className === "btnRotation" && click.button == 0) {

			if (autoRotate == true) {
				click.target.value = String.fromCharCode("0xE036");
				showNotification("Auto 3D Rotation stopped", 1, normal, -20, null);
				autoRotate = false;
			}
			else if (autoRotate == false) {
				click.target.value = String.fromCharCode("0xE84D");
				showNotification("Auto 3D Rotation resumed", 1, normal, -20, null);
				autoRotate = true;
			}
		}

		//Switch workflow button
		else if (click.target.className === "btnWorkflow" && click.button == 0) {
			if (mapWorkflow == 1) {
				mapWorkflow = 2;
				showNotification("Swithed to: Diffuse, Specular, Glossy workflow", 2, normal, -20, null);
			}
			else if (mapWorkflow == 2) {
				mapWorkflow = 1;
				showNotification("Swithed to: Albedo, Metallic, Roughness workflow", 2, normal, -20, null);
			}
		}

		//Bump/Normal button toggle
		else if (click.target.className === "btnBumpNormal" && click.button == 0) {
			if (bumpNormal == 1) {
				bumpNormal = 2;
				showNotification("Swithed to bump maps", 2, normal, -20, null);
			}
			else if (bumpNormal == 2) {
				bumpNormal = 1;
				showNotification("Swithed to normal maps", 2, normal, -20, null);
			}
		}

		//Toggle Emissive maps
		else if (click.target.className === "btnEmissive" && click.button == 0) {
			if (shadingMode == true) {
				shadingMode = false;
				showNotification("Emissive maps OFF", 1, normal, -20, null);
			}
			else if (shadingMode == false) {
				shadingMode = true;
				showNotification("Emissive maps ON", 1, normal, -20, null);
			}
		}

		//Toggle shading button
		else if (click.target.className === "btnShading" && click.button == 0) {
			if (shadingMode == 1) {
				shadingMode = 2;
				showNotification("Swithed to flat shading", 2, normal, -20, null);
			}
			else if (shadingMode == 2) {
				shadingMode = 1;
				showNotification("Swithed to smooth shading", 2, normal, -20, null);
			}
		}

		//Toggle object scale
		else if (click.target.className === "btnScale" && click.button == 0) {
			switch (objScale) {
				case 0:
					//click.target.value = String.fromCharCode("0xE22A");
					showNotification("Changed to Millimeters", 1, normal, -20, null);
					objScale = 1;
					break;
				case 1:
					showNotification("Changed to Centimeters", 1, normal, -20, null);
					objScale = 2;
					break;
				case 2:
					showNotification("Changed to Meters", 1, normal, -20, null);
					objScale = 3;
					break;
				case 3:
					showNotification("Changed to Inches", 1, normal, -20, null);
					objScale = 4;
					break;
				case 4:
					showNotification("Changed to Feet", 1, normal, -20, null);
					objScale = 5;
					break;
				case 5:
					showNotification("Changed to Yards", 1, normal, -20, null);
					objScale = 0;
					break;
			}
		}

		//Viewport syncronization button
		else if (click.target.className === "btnSyncViewport" && click.button == 0) {
			(click.target.value !== String.fromCharCode("0xE628")) ? click.target.value = String.fromCharCode("0xE628") : click.target.value = String.fromCharCode("0xE627");
		}

		//Help button
		else if (click.target.className === "btnHelp" && click.button == 0) {
			toggleModalWindow("Help menu", "<b>Coming soon!</b>\n" + helpTextLoremIpsum, normal, -20);
		}

		//View warnings
		else if (click.target.classList[0] === "btnWarnings" && click.button == 0) {
			if (click.target.value !== String.fromCharCode("0xE86C")) {
				click.target.value = String.fromCharCode("0xE86C");
				click.target.classList.remove("error");
				click.target.classList.add("ok");
			}
			else {
				click.target.value = String.fromCharCode("0xE002");
				click.target.classList.remove("ok");
				click.target.classList.add("error");
			}
			toggleModalWindow("Mesh validation report", "<b>The list bellow is just a placeholder!</b><li>Doubles detected!</li><li>N-gon limit exceeding!</li>", normal, -20);
		}

		//// Right column buttons ////
		//Top View button click
    else if (click.target.className === "btnTopView" && click.button == 0) {
      showNotification("Top view", 1, normal, -20, null);
      angleY = -1.6;
      angleX = 0;
    }

		//Front view Button cLick
    else if (click.target.className === "btnXview" && click.button == 0) {
      showNotification("Front view", 1, normal, -20, null);
      angleY = 0;
      angleX = -1.6;
    }

		//Side view button lcick
    else if (click.target.className === "btnYview" && click.button == 0) {
      showNotification("Side view", 1, normal, -20, null);
      angleY = 0;
      angleX = 0;
    }

		//Zoom buttons
		let zoomSlider = document.getElementsByClassName("zoomSlider")[0];
    if (click.target.className === "btnZoomOut" && click.button == 0) {
      (zoomSlider.value >= 0 && zoomSlider.value >= 10) ? zoomSlider.value -= 10 : zoomSlider.value = 1;
    }
    else if (click.target.className === "btnZoomIn" && click.button == 0) {
      (zoomSlider.value <= 100 && zoomSlider.value <= 90) ? zoomSlider.value -= (-10) : zoomSlider.value = 100;
    }

		//Full screen button
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

		//// Modal window related ////
		//Modal close button
    else if (click.target.className === "btnClose" && click.button == 0) {
      click.target.parentElement.style.visibility = "hidden";
      click.target.parentElement.style.opacity = 0;
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
