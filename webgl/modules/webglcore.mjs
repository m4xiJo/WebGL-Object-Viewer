import { Maths } from './maths.mjs';
var maths = new Maths;

export class WebGLCore {
  constructor(vShader, fShader, mesh, texture) {
    this.canvas = document.getElementsByClassName("viewport")[0];
    this.gl = this.canvas.getContext("webgl2");
    if (!this.gl) return alert("Couldn't initialize WebGL, this might be because your browser doesn't support it!");
    this.canvas.width = this.canvas.clientWidth, this.canvas.height = this.canvas.clientHeight;
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.frontFace(this.gl.CCW);
    this.gl.cullFace(this.gl.BACK);
    this.vShader = vShader, this.fShader = fShader, this.mesh = mesh, this.texture = texture;
    this.compVshader = this.createShader("vertex", this.vShader);
    this.compFshader = this.createShader("fragment", this.fShader);
    this.program = this.createProgram(this.compVshader, this.compFshader);
    this.meshVertexBufferObj = this.bindGPUbuffer("float32", this.mesh.vertex);
    this.texCoordBufferObj = this.bindGPUbuffer("float32", this.mesh.texcoords);
    this.meshIndexBufferObj = this.bindGPUbuffer("uint16", this.mesh.index);
    this.meshNormalBufferObj = this.bindGPUbuffer("float32", this.mesh.normals);
    this.posAttrLocation = this.setupAttributes(this.meshVertexBufferObj, this.program, "vertPosition", 3, 3);
    this.texCoordAttrLocation = this.setupAttributes(this.texCoordBufferObj, this.program, "vertTexCoord", 2, 2);
    this.normalAttrLocation = this.setupAttributes(this.meshNormalBufferObj, this.program, "vertNormal", 3, 3);
    this.world = this.createWorld(this.program, "world");
    this.proj = this.createProjection(this.program, "proj");
    this.view = this.createView(this.program, "view");
    this.xRotationMatrix = new Float32Array(16);
    this.yRotationMatrix = new Float32Array(16);
    this.identityMatrix = new Float32Array(16);
    this.light = this.createLighting(this.program);
    this.meshTexture = this.createTexture(this.texture);
    mat4.identity(this.identityMatrix);
  }

  createShader(sType, sCode) {
    let shader;
    if (sType == "vertex") shader = this.gl.createShader(this.gl.VERTEX_SHADER);
    else if (sType == "fragment") shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    else return console.error("No shader type was set!");
    this.gl.shaderSource(shader, sCode);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) return console.error("ERROR failed to compile Vertex Shader", this.gl.getShaderInfoLog(shader));
    return shader;
  }

  createProgram(vShader, fShader) {
    let program = this.gl.createProgram();
    this.gl.attachShader(program, vShader);
    this.gl.attachShader(program, fShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) return console.error("ERROR failed to link this.program!", this.gl.getProgramInfoLog(program));
    this.gl.validateProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.VALIDATE_STATUS)) return console.error("ERROR validating this.program!", this.gl.getProgramInfoLog(program));
    return program;
  }

  bindGPUbuffer(arrType, buffData) {
    let bufferObj = this.gl.createBuffer();
    if (arrType == "uint16") {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, bufferObj);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(buffData), this.gl.STATIC_DRAW);
    }
    else if (arrType == "float32")  {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferObj);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(buffData), this.gl.STATIC_DRAW);
    }
    else return console.error("No array type was set!");
    return bufferObj;
  }

  setupAttributes(buffObj, program, name, size, offsetMp) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffObj);
    let attribLoc = this.gl.getAttribLocation(program, name);
    this.gl.vertexAttribPointer(attribLoc, size, this.gl.FLOAT, this.gl.FALSE, offsetMp * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(attribLoc);
    return attribLoc;
  }

  createWorld(program, uniformName) {
    this.gl.useProgram(program);
    let matWorldUniformLocation = this.gl.getUniformLocation(program, uniformName);
    let worldMatrix = new Float32Array(16);
    mat4.identity(worldMatrix);
    this.gl.uniformMatrix4fv(matWorldUniformLocation, this.gl.FALSE, worldMatrix);
    return {worldMatrix: worldMatrix, worldUniformLoc: matWorldUniformLocation};
  }

  createView(program, uniformName) {
    this.gl.useProgram(program);
    let matViewUniformLocation = this.gl.getUniformLocation(program, uniformName);
    let viewMatrix = new Float32Array(16);
    mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
    this.gl.uniformMatrix4fv(matViewUniformLocation, this.gl.FALSE, viewMatrix);
    return {viewMatrix: viewMatrix, viewUniformLoc: matViewUniformLocation};
  }

  createProjection(program, uniformName) {
    this.gl.useProgram(program);
    let matProjUniformLocation = this.gl.getUniformLocation(program, uniformName);
    let projMatrix = new Float32Array(16);
    mat4.perspective(projMatrix, maths.toRadian(45), this.canvas.clientWidth / this.canvas.clientHeight, 1, 2000);
    this.gl.uniformMatrix4fv(matProjUniformLocation, this.gl.FALSE, projMatrix);
    return {projMatrix: projMatrix, projUniformLoc: matProjUniformLocation};
  }

  createLighting(program) {
    this.gl.useProgram(program);
    let ambLightIntensityUniformLocation = this.gl.getUniformLocation(program, "ambientLightIntensity");
    let sunlightDirUniformLocation = this.gl.getUniformLocation(program, "sun.direction");
    let sunlightIntUniformLocation = this.gl.getUniformLocation(program, "sun.color");
    //this.this.gl.uniform3f(this.ambLightIntensityUniformLocation, 0.2, 0.2, 0.2);
    this.gl.uniform3f(sunlightDirUniformLocation, -3.0, 4.0, 1.0);
    //this.this.gl.uniform3f(this.sunlightIntUniformLocation, 1.0, 1.0, 1.0);
    return {ambLightIntUniformLoc: ambLightIntensityUniformLocation, sunDirUniformLoc: sunlightDirUniformLocation, sunIntUniformLoc: sunlightIntUniformLocation};
  }

  createTexture(texture) {
    let meshTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, meshTexture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return meshTexture;
  }

  checkAspectRatio() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }
}

export class Actions extends WebGLCore {
  constructor(vShader, fShader, mesh, texture) {
    super(vShader, fShader, mesh, texture);
  }

  lightingToggle(state) {
    if(state == 1) {
      this.gl.uniform3f(this.light.ambLightIntUniformLoc, 0.2, 0.2, 0.2);
      this.gl.uniform3f(this.light.sunIntUniformLoc, 2.0, 2.0, 2.0);
    }
    if(state == 0) {
      this.gl.uniform3f(this.light.ambLightIntUniformLoc, 1.0, 1.0, 1.0);
      this.gl.uniform3f(this.light.sunIntUniformLoc, 0.0, 0.0, 0.0);
    }
  }

  rotationToggle(angleX, angleY, state) {

      mat4.rotate(this.yRotationMatrix, this.identityMatrix, angleX, [0, 1, 0]);
      mat4.rotate(this.xRotationMatrix, this.identityMatrix, angleY, [1, 0, 0]);
      mat4.mul(this.world.worldMatrix, this.yRotationMatrix, this.xRotationMatrix);
      this.gl.uniformMatrix4fv(this.world.worldUniformLoc, this.gl.FALSE, this.world.worldMatrix);
  }

  viewModeToggle(state)  {
    if(state == 0) {
      this.gl.drawElements(this.gl.TRIANGLES, this.mesh.index.length, this.gl.UNSIGNED_SHORT, 0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    } else if(state == 1) {
      this.gl.drawElements(this.gl.LINES, this.mesh.index.length, this.gl.UNSIGNED_SHORT, 0);
    }
    else if(state == 2) {
      this.gl.drawElements(this.gl.TRIANGLES, this.mesh.index.length, this.gl.UNSIGNED_SHORT, 0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.meshTexture);
      //gl.activeTexture(gl.TEXTURE0);
    }
  }

  zooming(zoomRatio) {
    //console.log(zoomRatio);
    mat4.lookAt(this.view.viewMatrix, [0, 0, zoomRatio], [0, 0, 0], [0, 1, 0]);
    this.gl.uniformMatrix4fv(this.view.viewUniformLoc, this.gl.FALSE, this.view.viewMatrix);
  }

  rotation(angleX, angleY, state) {
    if (state == 1) angleX = performance.now() / 6000 * Math.PI;
    mat4.rotate(this.yRotationMatrix, this.identityMatrix, angleX + 0, [0, 1, 0]);
    mat4.rotate(this.xRotationMatrix, this.identityMatrix, angleY + 300, [1, 0, 0]);
    mat4.mul(this.world.worldMatrix, this.yRotationMatrix, this.xRotationMatrix);
    this.gl.uniformMatrix4fv(this.world.worldUniformLoc, this.gl.FALSE, this.world.worldMatrix);
  }
}
