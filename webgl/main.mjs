import { GUIEvents } from './modules/guicore.mjs';
import { GUIButtons } from './modules/guicore.mjs';
import { Loader } from './modules/fileloader.mjs';
import { Storage } from './modules/storageman.mjs';
import { WebGLCore } from './modules/webglcore.mjs';

//Main
(async() => {
  let loader = await new Loader();
  let config = JSON.parse(await loader.loadFile("webgl/config.json"));
  let vertexShader = await loader.loadFile("webgl/shaders/vertex.glsl").catch(console.error);
  let fragmentShader = await loader.loadFile("webgl/shaders/fragment.glsl").catch(console.error);
  //let mesh = await loader.loadMesh("https://m4xijo.github.io/webgl-view/fixtures/json/Suzane/Suzanne.json").then(console.log).catch(console.error);
  let mesh = await loader.loadMesh("fixtures/json/Suzanne/Suzanne.json").catch(console.error);
  let texture = await loader.loadFile("fixtures/json/Suzanne/textures/Suzanne_tex.png").catch(console.error);
  let webgl = new WebGLCore(config, null, vertexShader, fragmentShader, mesh.vertex, mesh.texcoords, mesh.index, mesh.normals, texture);
  await webgl.updateLoop();
})();


//new Loader().loadFile(null);
