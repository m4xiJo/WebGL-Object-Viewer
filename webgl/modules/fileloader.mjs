export class Loader {
  constructor() {
    this.meshObj, this.meshVertex, this.meshIndex, this.meshTexCoords, this.meshNormals;
    this.albDiff, this.normBump, this.specMetal, this.glossRough, this.emissive;

  }

  async loadFile(url) {
    return await new Promise((resolve, reject) => {
      if (url == null) return reject("URL was NULL!");
      if (url.match(/\.(glsl|json|obj|dae|blend|fbx|3ds|max)/g)) { // Load mesh files
        let request = new XMLHttpRequest();
        request.open('GET', url + "?" + Math.random(), true);
        if (url.match(/\.(glsl|json|obj|dae|png)/g)) { // If non binary asset
          request.setRequestHeader("Content-Type", "text/plain");
          request.onload = function() {
            if (request.status < 200 || request.status > 299) reject("Error: Status " + request.status + " on resource " + url);
            else resolve(request.responseText);
          }
        }
        else if (url.match(/\.(blend|fbx|3ds|max)/g)) { // If binary asset
          request.responseType = "arraybuffer";
          request.onload = function() {
            toggleLoader();
            if (request.status < 200 || request.status > 299) reject("Error: Status " + request.status + " on resource " + url);
            else resolve(request.response);
          }
        }
        request.send();
      }
      else if (url.match(/\.(jpg|jpeg|png|bmp|gif)/g)) {
        let texture = new Image();
        texture.onload = function() {
          resolve(texture);
        }
        texture.src = url;
      }
      else reject("Not a suitable file format!");
    });
  }

  async loadMesh(meshPath) {
    return await new Promise(async(resolve, reject) => {
      await this.loadFile(meshPath).then((out) => {
        out = JSON.parse(out);
        let meshIndex = [];
        let data = {
          vertex: out.meshes[0].vertices,
          index: meshIndex.concat.apply([], out.meshes[0].faces),
          texcoords: out.meshes[0].texturecoords[0],
          normals: out.meshes[0].normals
        }
        resolve(data);
      }).catch((err) => {
        reject("Failed to load mesh! " + err);
      });
    });
  }

  async loadAlbDiff(adPath) {
    return await new Promise(async(resolve, reject) => {
      await this.loadFile(adPath).then((out) => {
        resolve(out);
      }).catch((err) => {
        reject("Failed to load Albedo/Diffuse map! " + err);
      });
    });
  }

  async loadNormBump(nbPath) {
    return await new Promise(async(resolve, reject) => {
      await this.loadFile(nbPath).then((out) => {
        resolve(out);
      }).catch((err) => {
        reject("Failed to load Normal/Bump map! " + err);
      });
    });
  }

  async loadSpecMetal(smPath) {
    return await new Promise(async(resolve, reject) => {
      await this.loadFile(smPath).then((out) => {
        resolve(out);
      }).catch((err) => {
        reject("Failed to load Specular/Metallic map! " + err);
      });
    });
  }

  async loadGlossRough(grPath) {
    return await new Promise(async(resolve, reject) => {
      await this.loadFile(grPath).then((out) => {
        resolve(out);
      }).catch((err) => {
        reject("Failed to load Glossiness/Roughness map! " + err);
      });
    });
  }

  async loadEmissive(ePath) {
    return await new Promise(async(resolve, reject) => {
      await this.loadFile(ePath).then((out) => {
        resolve(out);
      }).catch((err) => {
        reject("Failed to load Emissive map! " + err);
      });
    });
  }

  async init() {
    this.meshObj = await this.loadMesh(this.meshObj);
    this.albDiff = await this.loadAlbDiff(this.albDiff);
    this.normBump = await this.loadNormBump(this.normBump);
    this.specMetal = await this.loadSpecMetal(this.specMetal);
    this.glossRough = await this.loadGlossRough(this.glossRough);
    this.emissive = await this.loadEmissive(this.emissive);
  }
}
