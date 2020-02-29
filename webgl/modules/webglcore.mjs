import { Maths } from './maths.mjs';
var maths = new Maths;

export class WebGLCore {
  constructor(config, canvas, vShaderCode, fShaderCode, meshVertecies, meshTexCoords, meshIndecies, meshNormals, texture_ad) {
    //Initialize and configure WebGL
    this.config = config;
    this.vShaderCode = vShaderCode;
    this.fShaderCode = fShaderCode;
    this.meshVertecies = meshVertecies;
    this.meshTexCoords = meshTexCoords;
    this.meshIndecies = meshIndecies;
    this.meshNormals = meshNormals;
    this.texure_ad = texture_ad;
    //console.log(this.texture);
    this.canvas = document.getElementsByClassName("viewport")[0];
    this.gl = this.canvas.getContext("webgl2");
    if (!this.gl) return alert("Couldn't initialize WebGL, this might be because your browser doesn't support it!");

    // Configure WebGL
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.frontFace(this.gl.CCW);
    this.gl.cullFace(this.gl.BACK);

    // Create shaders
    this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

    //Define shader source
    this.gl.shaderSource(this.vertexShader, vShaderCode);
    this.gl.shaderSource(this.fragmentShader, fShaderCode);

    // Compile vertex shader
    this.gl.compileShader(this.vertexShader);
    if (!this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS)) return console.error("ERROR failed to compile Vertex Shader", this.gl.getShaderInfoLog(this.vertexShader));

    // Compile fragment shader
    this.gl.compileShader(this.fragmentShader);
    if (!this.gl.getShaderParameter(this.fragmentShader, this.gl.COMPILE_STATUS)) return console.error("ERROR failed to compile Fragment Shader", this.gl.getShaderInfoLog(this.fragmentShader));

    // Create this.program & validate it
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) return console.error("ERROR failed to link this.program!", this.gl.getProgramInfoLog(this.program));
    this.gl.validateProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) return console.error("ERROR validating this.program!", this.gl.getProgramInfoLog(this.program));

    // GPU buffer
    this.meshVertexBufferObj = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.meshVertexBufferObj);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.meshVertecies), this.gl.STATIC_DRAW);

    this.texCoordBufferObj = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBufferObj);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.meshTexCoords), this.gl.STATIC_DRAW);

    this.meshIndexBufferObj = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.meshIndexBufferObj);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.meshIndecies), this.gl.STATIC_DRAW);

    this.meshNormalBufferObj = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.meshNormalBufferObj);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.meshNormals), this.gl.STATIC_DRAW);

    //// Setup attributes ////
    // Location of attribute, Number of elements per attribute, Type of elements, Normalized?, Size of individual vertex, Offset from the beginning of a single vertex to this attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.meshVertexBufferObj);
    this.posAttrLocation = this.gl.getAttribLocation(this.program, "vertPosition");
    this.gl.vertexAttribPointer(this.posAttrLocation, 3, this.gl.FLOAT, this.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(this.posAttrLocation);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBufferObj);
    this.texCoordAttrLocation = this.gl.getAttribLocation(this.program, "vertTexCoord");
    this.gl.vertexAttribPointer(this.texCoordAttrLocation, 2, this.gl.FLOAT, this.gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(this.texCoordAttrLocation);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.meshNormalBufferObj);
    this.normalAttrLocation = this.gl.getAttribLocation(this.program, "vertNormal");
    this.gl.vertexAttribPointer(this.normalAttrLocation, 3, this.gl.FLOAT, this.gl.TRUE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(this.normalAttrLocation);

    // Tell which this.program is active
    this.gl.useProgram(this.program);
    this.matWorldUniformLocation = this.gl.getUniformLocation(this.program, "world");
    this.matViewUniformLocation = this.gl.getUniformLocation(this.program, "view");
    this.matProjUniformLocation = this.gl.getUniformLocation(this.program, "proj");

    this.projMatrix = new Float32Array(16);
    this.viewMatrix = new Float32Array(16);
    this.worldMatrix = new Float32Array(16);

    mat4.identity(this.worldMatrix);
    mat4.lookAt(this.viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(this.projMatrix, maths.toRadian(45), this.canvas.clientWidth / this.canvas.clientHeight, 1, 2000);

    this.gl.uniformMatrix4fv(this.matWorldUniformLocation, this.gl.FALSE, this.worldMatrix);
    this.gl.uniformMatrix4fv(this.matViewUniformLocation, this.gl.FALSE, this.viewMatrix);
    this.gl.uniformMatrix4fv(this.matProjUniformLocation, this.gl.FALSE, this.projMatrix);

    this.xRotationMatrix = new Float32Array(16);
    this.yRotationMatrix = new Float32Array(16);

    // Lighting
    this.gl.useProgram(this.program);
    this.ambLightIntensityUniformLocation = this.gl.getUniformLocation(this.program, "ambientLightIntensity");
    this.sunlightDirUniformLocation = this.gl.getUniformLocation(this.program, "sun.direction");
    this.sunlightIntUniformLocation = this.gl.getUniformLocation(this.program, "sun.color");
    //this.gl.uniform3f(this.ambLightIntensityUniformLocation, 0.2, 0.2, 0.2);
    this.gl.uniform3f(this.sunlightDirUniformLocation, 3.0, 4.0, -2.0);
    //this.gl.uniform3f(this.sunlightIntUniformLocation, 1.0, 1.0, 1.0);

    //Identity matrix
    this.identityMatrix = new Float32Array(16);
    mat4.identity(this.identityMatrix);

    this.meshTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshTexture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture_ad);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);

    //requestAnimationFrame(this.updateLoop);
  }

  lighting() {

  }

  createTexture() {
      let meshTexture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, meshTexture);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture_ad);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  updateLoop() {
      //this.canvas.width = this.canvas.clientWidth;
      //this.canvas.height = this.canvas.clientHeight;
      if (this.config.modes.autoRotate.state == 1) this.config.core.positions.angleX = performance.now() / 6000 * Math.PI;
      if (this.config.modes.lightingMode.state == 1) {
        this.gl.uniform3f(this.ambLightIntensityUniformLocation, 0.2, 0.2, 0.2);
        this.gl.uniform3f(this.sunlightIntUniformLocation, 1.0, 1.0, 1.0);
      } else {
        this.gl.uniform3f(this.ambLightIntensityUniformLocation, 1.0, 1.0, 1.0);
        this.gl.uniform3f(this.sunlightIntUniformLocation, 0.0, 0.0, 0.0);
      }

      mat4.rotate(this.yRotationMatrix, this.identityMatrix, this.config.core.positions.angleX, [0, 1, 0]);
      mat4.rotate(this.xRotationMatrix, this.identityMatrix, this.config.core.positions.angleY, [1, 0, 0]);
      mat4.mul(this.worldMatrix, this.yRotationMatrix, this.xRotationMatrix);
      this.gl.uniformMatrix4fv(this.matWorldUniformLocation, this.gl.FALSE, this.worldMatrix);
      this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
      this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);

      if (this.config.modes.viewMode.state == 0) {
        this.gl.drawElements(this.gl.TRIANGLES, this.meshIndecies.length, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      } else if (this.config.modes.viewMode.state == 1) {
        this.gl.drawElements(this.gl.LINES, this.meshIndecies.length, this.gl.UNSIGNED_SHORT, 0);
      } else if (this.config.modes.viewMode.state == 2) {
        this.gl.drawElements(this.gl.TRIANGLES, this.meshIndecies.length, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshTexture);
        //this.gl.activeTexture(this.gl.TEXTURE0);
      }
      this.config.core.time.currentTime = new Date().getTime();
      //this.config.core.fpsViewer.fpsViewerObj.innerText = parseInt(this.config.core.fpsViewer.fpsCount / (this.config.core.time.currentTime - this.config.core.time.startTime) * 1000);
      this.config.core.fpsViewer.fpsCount++;
      requestAnimationFrame(this.updateLoop.bind(this));
      //console.log(canvas.clientHeight / canvas.clientWidth * canvas.clientWidth);
  }
}
