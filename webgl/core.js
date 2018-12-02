function runWebGL(meshPath, adPath, nbPath, smPath, grPath, emPath) {
  // Prepare Vertex shader
  let vertexShader = [
    "precision mediump float;",
    "attribute vec3 vertPosition;",
    "attribute vec2 vertTexCoord;",
    "attribute vec3 vertNormal;",
    "varying vec2 fragTexCoord;",
    "varying vec3 fragNormal;",
    "uniform mat4 world;",
    "uniform mat4 view;",
    "uniform mat4 proj;",
    "void main() {",
        "fragTexCoord = vertTexCoord;",
        "fragNormal = (world * vec4(vertNormal, 0.0)).xyz;",
        "gl_Position = proj * view * world * vec4(vertPosition, 1.0);",
    "}",
  ].join("");

  // Prepare Fragment shader
  let fragmentShader = [
    "precision mediump float;",
    "struct directionalLight {",
      "vec3 direction;",
      "vec3 color;",
		"};",
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
						// Load Specular/Metallic
	          loadFile(smPath, function(smErr, smObj) {
	            if (smErr) console.error("Error getting mesh Specual/Metallic map! Skipping..." + smErr + " Skipping...");
	            else smPath = smObj;
							// Load Glossy/Rough
		          loadFile(grPath, function(grErr, grObj) {
		            if (grErr) console.error("Error getting mesh Glossy/Roughness map! Skipping..." + grErr + " Skipping...");
		            else grPath = grObj;
								// Load Emissive
								loadFile(emPath, function(emErr, emObj) {
									if (emErr) console.error("Error getting mesh Emissive map! Skipping..." + emErr + " Skipping...");
									else emPath = emObj;
									execWebGL(vertexShader, fragmentShader, meshVertex, meshIndex, meshTexCoords, meshNormals, adPath, nbPath, smPath, grPath, emPath);
								});
		          });
	          });
          });
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

function execWebGL(vertexShaderCode, fragmentShaderCode, meshVertecies, meshIndecies, meshTexCoords, meshNormals, texture_ad, texture_nb, texture_sm, texture_gr, texture_em) {
	//// Global variables ////
	//UI configuration
	let helpText = "<p>Ea paulo intellegat omittantur sit, esse liber at qui, vix cu ludus volutpat. Cibo dicit nonumes has et, his ne lorem scripta scriptorem, sea ex oblique deseruisse argumentum. Eu dolorum consequuntur quo. Nonumy omnium pri ea. </p><p>Est ex recusabo delicata, imperdiet concludaturque id est. Option conclusionemque ne mei. Ex eam accumsan inimicus. Has nominavi voluptatum complectitur ad. Libris nemore ad qui, te his probo utroque. Eu meliore admodum eum. </p><p>Cu option feugiat dolorem per, per an tale legere. Oporteat vulputate cu eos, sonet virtute no mel. Eos altera animal oporteat et, id perfecto interpretaris qui. Putent dicunt maiorum an has, et duo atqui animal eligendi. Sale tamquam pericula quo eu, nostrud intellegat an est, ea usu vitae nominati. Dicam vocent dolorem pro ut, ea per iudico minimum, an simul aperiam malorum ius. Ei pro facer tritani, quodsi accusata eu qui. </p><p>Te mel dicant scribentur theophrastus, vis falli postulant constituam ad. Cum eu mnesarchum instructior. Malis putent petentium pro in, an est senserit elaboraret intellegebat, mei in mollis mediocritatem. Ad eum illud fugit. In suas homero nemore his. </p><p>Pro illum aliquip in, pri et affert iracundia. Simul melius nostrum eum ei, simul nostro invidunt qui in, ei omnium latine omittam duo. Pri an dicant lucilius aliquando, brute feugait adolescens pri eu, vel cu fabulas pertinacia. Mea noster delectus dignissim et, est ea illum intellegat. Epicurei philosophia id vim. </p><p>Oratio insolens ullamcorper ex has, ad ius solet ignota reprehendunt. Duo petentium erroribus at, quem nostrum ad his. Nam omnis posidonium ne, partem vocibus pri an, ius no nominati gubergren. Verear recteque philosophia ius cu, ad oblique propriae vel. </p><p>Vel dolor legendos salutandi et, vitae primis inimicus sed an. Ad sed omnis iracundia, facer nonumy saperet eu nec. Cu signiferumque mediocritatem vix. Vis id erant possim. In pro quidam labores. Ei sit oblique atomorum honestatis, quo mazim delicata cu, cu nibh graeci facilisi duo. </p><p>Ei vix magna malorum nominati. Hinc indoctum repudiare cu vix. Graeco vocent deseruisse nam eu. Ea cum suscipit elaboraret. At nulla tincidunt pri. </p><p>Ex pro consul sanctus, ea ullum ancillae facilisis pri. Ex pro quaeque honestatis, eam ad zril dictas, mei ponderum disputando id. Liber adversarium est te. Cibo impetus reprimique no quo, id eos viderer honestatis. Amet platonem consulatu ei cum, omnis assum eu est, vel cu suscipit facilisi. </p><p>Sea congue denique no, persius scaevola vel ne. Ut sit eius illum accusam, at volutpat abhorreant scriptorem per. Periculis theophrastus nec te, eam id commune omnesque, ius at mutat volumus nostrum. Vim stet impetus instructior ea, mei ea viderer torquatos. Et vero dicat timeam vis.</p>";

	let dataStorage = {
		ui: {
			colors: {
				normal: "#5c5c5c",
				success: "#036f00",
				warning: "#808d00",
				error: "#ba0000",
				colorMod: -20
			}
		},
		modes: {
			lightingMode: {
				state: 1,
				icons: ["0xe3a8", "0xe3aa"],
				bind: document.getElementsByClassName("btnLitUnlit")[0]
			},
			viewMode: {
				state: 2,
				icons: ["0xe3a2", "0xe228", "0xe421"],
				bind: document.getElementsByClassName("btnViewMode")[0]
			},
			viewGrid: {
				state: 0,
				icons: ["0xe3eb", "0xe3ec"],
				bind: document.getElementsByClassName("btnGrid")[0]
			},
			autoRotate: {
				state: 1,
				icons: ["0xe84d", "0xe036"],
				bind: document.getElementsByClassName("btnRotation")[0]
			},
			mapWorkflow: {
				state: 1,
				icons: ["0xe55b", "0xe55b", "0xe55b"],
				bind: document.getElementsByClassName("btnWorkflow")[0]
			},
			bumpNormal: {
				state: 1,
				icons: ["0xe80b", "0xe80b"],
				bind: document.getElementsByClassName("btnBumpNormal")[0]
			},
			shadingMode: {
				state: 1,
				icons: ["0xe3a4", "0xe3a5"],
				bind: document.getElementsByClassName("btnShading")[0]
			},
			emissiveMap: {
				state: 1,
				icons: ["0xe3c0", "0xe436"],
				bind: document.getElementsByClassName("btnEmissive")[0]
			},
			objScale: {
				state: 0,
				icons: ["0xe41c", "0xe41c", "0xe41c", "0xe41c", "0xe41c", "0xe41c"],
				bind: document.getElementsByClassName("btnScale")[0]
			},
			animPane: {
				state: 0,
				icons: ["0xe84e", "0xe566"],
				bind: document.getElementsByClassName("btnAnimationPane")[0]
			},
			syncViewports: {
				state: 0,
				icons: ["0xe628", "0xe627"],
				bind: document.getElementsByClassName("btnSyncViewport")[0]
			},
			warnings: {
				state: 0,
				windowState: 0,
				icons: ["0xe86c", "0xe002", "0xe417"],
				bind: document.getElementsByClassName("btnWarnings")[0],
				warnings: {},
				warningsCode: 0
			}
		},
		core: {
			helpText: helpText,
			time: {
				startTime: new Date().getTime(),
				currentTime: null,
				timer: null
			},
			fpsViewer: {
				fpsViewerObj: document.getElementsByClassName("FPS")[0],
				fpsCount: 0
			},
			meshInfo: {
				meshInfoObj: document.getElementsByClassName("stats")[0],
				meshInfoString: ""
			},
			positions: {
				angleY: 0,
				angleX: 0,
				zoomRatio: 0,
				mouseMoveX: 0,
				mouseMoveY: 0,
				isScrolling: null,
				isMoving: null
			},
			grid: {
				vertexData: "[1.0 1.0 0.0 -1.0 1.0 0.0 1.0 -1.0 0.0 -1.0 -1.0 0.0]",
			}
		}
	}

	loadData("userData"); //Call saved data load
	//Function to write data
	function saveData(slotName, data) {
		if (!localStorage.getItem(slotName)) localStorage.setItem(slotName, "null");
		let constructedData = {};
		for (item in data) {
			constructedData[item] = item;
			constructedData[item] = data[item].state;
		}
		localStorage.setItem(slotName, JSON.stringify(constructedData));
	}

	//Function to load data
	function loadData(slotName) {
		let loadedData = JSON.parse(localStorage.getItem(slotName));
		for (item in loadedData) {
			console.log(item);
			dataStorage.modes[item].state = loadedData[item];
		}
	}

	//Update button states on load
	for (mode in dataStorage.modes) {
		dataStorage.modes[mode].bind.value = String.fromCharCode(dataStorage.modes[mode].icons[dataStorage.modes[mode].state]);
	}

	// Reset FPS counter on focus
	window.onfocus = function() {
		dataStorage.core.time.startTime = new Date().getTime();
		dataStorage.core.fpsViewer.fpsCount = 0;
	};

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
		showNotification("ERROR! failed to compile Vertex Shader! See console!", 2, ui.colors.error, ui.colors.colorMod);
    return;
  }

  // Compile fragment shader
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("ERROR failed to compile Fragment Shader", gl.getShaderInfoLog(fragmentShader));
		showNotification("ERROR! failed to compile Fragment Shader! See console!", 2, ui.colors.error, ui.colors.colorMod);
    return;
  }

  // Create program & validate it
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR failed to link program!", gl.getProgramInfoLog(program));
		showNotification("ERROR! failed to link the program! See console!", 2, ui.colors.error, ui.colors.colorMod);
    return;
  }
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
		showNotification("Validation ERROR! See console!", 2, ui.colors.normal, ui.error.colorMod);
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

  let matWorldUniformLocation = gl.getUniformLocation(program, "world");
  let matViewUniformLocation = gl.getUniformLocation(program, "view");
  let matProjUniformLocation = gl.getUniformLocation(program, "proj");

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
	let meshNormalBump = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, meshNormalBump);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_nb);
	gl.bindTexture(gl.TEXTURE_2D, null);

  // Specular/Metallic
	let meshSpecMetal = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, meshSpecMetal);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_sm);
	gl.bindTexture(gl.TEXTURE_2D, null);

  // Glossy/Rough
	let meshGlossRough = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, meshGlossRough);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_gr);
	gl.bindTexture(gl.TEXTURE_2D, null);

	// Emissive
	let meshEmissive = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, meshEmissive);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_em);
	gl.bindTexture(gl.TEXTURE_2D, null);

  //// Render update loop ////
  let updateLoop = function () {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    if (dataStorage.modes.autoRotate.state == 1) dataStorage.core.positions.angleX = performance.now() / 6000 * Math.PI;
    if (dataStorage.modes.lightingMode.state == 1) {
      gl.uniform3f(ambLightIntensityUniformLocation, 0.2, 0.2, 0.2);
      gl.uniform3f(sunlightIntUniformLocation, 1.0, 1.0, 1.0);
    }
    else {
      gl.uniform3f(ambLightIntensityUniformLocation, 1.0, 1.0, 1.0);
      gl.uniform3f(sunlightIntUniformLocation, 0.0, 0.0, 0.0);
    }

		mat4.rotate(yRotationMatrix, identityMatrix, dataStorage.core.positions.angleX, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, dataStorage.core.positions.angleY, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, meshTexture);
    gl.activeTexture(gl.TEXTURE0);
    if (dataStorage.modes.viewMode.state == 0) gl.drawElements(gl.TRIANGLES, meshIndecies.length, gl.UNSIGNED_SHORT, 0);
    else if (dataStorage.modes.viewMode.state == 1) {
			gl.drawElements(gl.LINES, meshIndecies.length, gl.UNSIGNED_SHORT, 0);
		}
    else if (dataStorage.modes.viewMode.state == 2) {
			gl.drawElements(gl.TRIANGLES, meshIndecies.length, gl.UNSIGNED_SHORT, 0);
		}
    dataStorage.core.time.currentTime = new Date().getTime();
    dataStorage.core.fpsViewer.fpsViewerObj.innerText = parseInt(dataStorage.core.fpsViewer.fpsCount / (dataStorage.core.time.currentTime - dataStorage.core.time.startTime) * 1000);
    dataStorage.core.fpsViewer.fpsCount++;
    requestAnimationFrame(updateLoop);
  }
  requestAnimationFrame(updateLoop);

  //// GUI Events ////
  //Show notification
  function showNotification(text, time, color, percent) {
    clearTimeout(dataStorage.core.time.timer);
    document.getElementsByClassName("notyTitle")[0].innerText = text;
		document.getElementsByClassName("notification")[0].setAttribute("style", "animation: fadein " + time + "s; background: " + color + "; border-bottom: 1px solid " + modifyColor(color, percent));
    dataStorage.core.time.timer = setTimeout(function() {
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
      dataStorage.core.positions.angleX += ((move.clientX - dataStorage.core.positions.mouseMoveX) * 0.01)
    }
    if (move.clientY && move.buttons == 1) {
      dataStorage.core.positions.angleY -= ((move.clientY - dataStorage.core.positions.mouseMoveY) * 0.01);
    }
    dataStorage.core.positions.mouseMoveX = move.clientX;
    dataStorage.core.positions.mouseMoveY = move.clientY;

    if (move.clientX && move.buttons == 2)
      move.target.style.cursor = "move";
        window.clearTimeout(dataStorage.core.positions.isMoving);
        dataStorage.core.positions.isMoving = setTimeout(function() {
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
			if (dataStorage.modes.lightingMode.state == 0) {
				click.target.value = String.fromCharCode(dataStorage.modes.lightingMode.icons[1]);
				dataStorage.modes.lightingMode.state = 1;
				showNotification("Set to Lit mode", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			else if (dataStorage.modes.lightingMode.state == 1) {
				click.target.value = String.fromCharCode(dataStorage.modes.lightingMode.icons[0]);
				dataStorage.modes.lightingMode.state = 0;
				showNotification("Set to Unlit mode", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			saveData("userData", dataStorage.modes);
		}

		//Object view button click
		else if (click.target.className === "btnViewMode" && click.button == 0) {
			switch (dataStorage.modes.viewMode.state) {
				case 0:
					click.target.value = String.fromCharCode(dataStorage.modes.viewMode.icons[1]);
					dataStorage.modes.viewMode.state = 1;
					showNotification("Wireframe view", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
					break;
				case 1:
					click.target.value = String.fromCharCode(dataStorage.modes.viewMode.icons[2]);
					dataStorage.modes.viewMode.state = 2;
					showNotification("Textured view", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
					break;
				case 2:
					click.target.value = String.fromCharCode(dataStorage.modes.viewMode.icons[0]);
					dataStorage.modes.viewMode.state = 0;
					showNotification("Solid view", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
					break;
			}
			saveData("userData", dataStorage.modes);
		}

		//Grid toggle button click
		else if (click.target.className === "btnGrid" && click.button == 0) {
			if (dataStorage.modes.viewGrid.state == 1) {
				click.target.value = String.fromCharCode(dataStorage.modes.viewGrid.icons[0]);
				dataStorage.modes.viewGrid.state = 0;
				showNotification("Grid OFF", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			else if (dataStorage.modes.viewGrid.state == 0) {
				click.target.value = String.fromCharCode(dataStorage.modes.viewGrid.icons[1]);
				dataStorage.modes.viewGrid.state = 1;
				showNotification("Grid ON", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			saveData("userData", dataStorage.modes);
		}

		//Auto rotation on/off button click
		else if (click.target.className === "btnRotation" && click.button == 0) {
			if (dataStorage.modes.autoRotate.state == 1) {
				click.target.value = String.fromCharCode(dataStorage.modes.autoRotate.icons[0]);
				dataStorage.modes.autoRotate.state = 0;
				showNotification("Auto 3D Rotation stopped", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			else if (dataStorage.modes.autoRotate.state == 0) {
				click.target.value = String.fromCharCode(dataStorage.modes.autoRotate.icons[1]);
				dataStorage.modes.autoRotate.state = 1;
				showNotification("Auto 3D Rotation resumed", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			saveData("userData", dataStorage.modes);
		}

		//Switch workflow button
		else if (click.target.className === "btnWorkflow" && click.button == 0) {
			if (dataStorage.modes.mapWorkflow.state == 0) {
				click.target.value = String.fromCharCode(dataStorage.modes.mapWorkflow.icons[1]);
				dataStorage.modes.mapWorkflow.state = 1;
				showNotification("Swithed to: Diffuse, Specular, Glossy workflow", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			else if (dataStorage.modes.mapWorkflow.state == 1) {
				click.target.value = String.fromCharCode(dataStorage.modes.mapWorkflow.icons[0]);
				dataStorage.modes.mapWorkflow.state = 0;
				showNotification("Swithed to: Albedo, Metallic, Roughness workflow", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			saveData("userData", dataStorage.modes);
		}

		//Bump/Normal button toggle
		else if (click.target.className === "btnBumpNormal" && click.button == 0) {
			if (dataStorage.modes.bumpNormal.state == 0) {
				click.target.value = String.fromCharCode(dataStorage.modes.bumpNormal.icons[1]);
				dataStorage.modes.bumpNormal.state = 1;
				showNotification("Swithed to bump maps", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			else if (dataStorage.modes.bumpNormal.state == 1) {
				click.target.value = String.fromCharCode(dataStorage.modes.bumpNormal.icons[0]);
				dataStorage.modes.bumpNormal.state = 0;
				showNotification("Swithed to normal maps", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			saveData("userData", dataStorage.modes);
		}

		//Toggle Emissive maps
		else if (click.target.className === "btnEmissive" && click.button == 0) {
			if (dataStorage.modes.emissiveMap.state == 1) {
				click.target.value = String.fromCharCode(dataStorage.modes.emissiveMap.icons[0]);
				dataStorage.modes.emissiveMap.state = 0;
				showNotification("Emissive maps OFF", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			else if (dataStorage.modes.emissiveMap.state == 0) {
				click.target.value = String.fromCharCode(dataStorage.modes.emissiveMap.icons[1]);
				dataStorage.modes.emissiveMap.state = 1;
				showNotification("Emissive maps ON", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			saveData("userData", dataStorage.modes);
		}

		//Toggle shading button
		else if (click.target.className === "btnShading" && click.button == 0) {
			if (dataStorage.modes.shadingMode.state == 1) {
				click.target.value = String.fromCharCode(dataStorage.modes.shadingMode.icons[0]);
				dataStorage.modes.shadingMode.state = 0;
				showNotification("Swithed to flat shading", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			else if (dataStorage.modes.shadingMode.state == 0) {
				click.target.value = String.fromCharCode(dataStorage.modes.shadingMode.icons[1]);
				dataStorage.modes.shadingMode.state = 1;
				showNotification("Swithed to smooth shading", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			saveData("userData", dataStorage.modes);
		}

		//Toggle object scale
		else if (click.target.className === "btnScale" && click.button == 0) {
			switch (dataStorage.modes.objScale.state) {
				case 0:
					click.target.value = String.fromCharCode(dataStorage.modes.objScale.icons[1]);
					dataStorage.modes.objScale.state = 1;
					showNotification("Changed to Millimeters", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
					break;
				case 1:
					click.target.value = String.fromCharCode(dataStorage.modes.objScale.icons[2]);
					dataStorage.modes.objScale.state = 2;
					showNotification("Changed to Centimeters", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
					break;
				case 2:
					click.target.value = String.fromCharCode(dataStorage.modes.objScale.icons[3]);
					dataStorage.modes.objScale.state = 3;
					showNotification("Changed to Meters", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
					break;
				case 3:
					click.target.value = String.fromCharCode(dataStorage.modes.objScale.icons[4]);
					dataStorage.modes.objScale.state = 4;
					showNotification("Changed to Inches", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
					break;
				case 4:
					click.target.value = String.fromCharCode(dataStorage.modes.objScale.icons[5]);
					dataStorage.modes.objScale.state = 5;
					showNotification("Changed to Feet", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
					break;
				case 5:
					click.target.value = String.fromCharCode(dataStorage.modes.objScale.icons[0]);
					dataStorage.modes.objScale.state = 0;
					showNotification("Changed to Yards", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
					break;
			}
			saveData("userData", dataStorage.modes);
		}

		//Toggle animation pane
		else if (click.target.className === "btnAnimationPane" && click.button == 0) {
			if (dataStorage.modes.animPane.state == 0) {
				click.target.value = String.fromCharCode(dataStorage.modes.animPane.icons[1]);
				dataStorage.modes.animPane.state = 1;
				showNotification("Animation pane shown", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			else if (dataStorage.modes.animPane.state == 1) {
				click.target.value = String.fromCharCode(dataStorage.modes.animPane.icons[0]);
				dataStorage.modes.animPane.state = 0;
				showNotification("Animation pane hidden", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			saveData("userData", dataStorage.modes);
		}

		//Viewport syncronization button
		else if (click.target.className === "btnSyncViewport" && click.button == 0) {
			if (dataStorage.modes.syncViewports.state == 0) {
				click.target.value = String.fromCharCode(ui.modes.syncViewports.icons[1]);
				dataStorage.modes.syncViewports.state = 1;
				showNotification("Viewport sync enabled", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			else if (dataStorage.modes.syncViewports.state == 1) {
				click.target.value = String.fromCharCode(ui.modes.syncViewports.icons[0]);
				dataStorage.modes.syncViewports.state = 0;
				showNotification("Viewport sync disabled", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
			}
			saveData("userData", dataStorage.modes);
		}

		//Help button
		else if (click.target.className === "btnHelp" && click.button == 0) {
			toggleModalWindow("Help menu", "<b>Coming soon!</b>\n" + helpText, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
		}

		//View warnings
		else if (click.target.classList[0] === "btnWarnings" && click.button == 0) {
			if (dataStorage.modes.warnings.windowState == 0) {
				click.target.value = String.fromCharCode(dataStorage.modes.warnings.icons[2]);
				dataStorage.modes.warnings.windowState = 1;
				//click.target.classList.remove("error");
				//click.target.classList.add("ok");
			}
			else if (dataStorage.modes.warnings.windowState == 1) {
				click.target.value = String.fromCharCode(dataStorage.modes.warnings.icons[dataStorage.modes.warnings.warningsCode]);
				dataStorage.modes.warnings.windowState = 0;
				//click.target.classList.remove("ok");
				//click.target.classList.add("error");
			}
			toggleModalWindow("Mesh validation report", "<b>The list bellow is just a placeholder!</b><li>Doubles detected!</li><li>N-gon limit exceeding!</li>", dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
		}

		//// Right column buttons ////
		//Rest view to default
		else if (click.target.className === "btnResetView" && click.button == 0) {
			showNotification("The view was reset to default", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
		}

		//Top View button click
    else if (click.target.className === "btnTopView" && click.button == 0) {
      showNotification("Top view", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      dataStorage.core.positions.angleY = -1.6;
      dataStorage.core.positions.angleX = 0;
    }

		//Front view Button cLick
    else if (click.target.className === "btnXview" && click.button == 0) {
      showNotification("Front view", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      dataStorage.core.positions.angleY = 0;
      dataStorage.core.positions.angleX = -1.6;
    }

		//Side view button lcick
    else if (click.target.className === "btnYview" && click.button == 0) {
      showNotification("Side view", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      dataStorage.core.positions.angleY = 0;
      dataStorage.core.positions.angleX = 0;
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
			dataStorage.modes.warnings.bind.value = String.fromCharCode(dataStorage.modes.warnings.icons[dataStorage.modes.warnings.warningsCode]);
			dataStorage.modes.warnings.windowState = 0;
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
