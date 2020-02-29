import { GUIEvents } from './modules/guicore.mjs';
import { GUIButtons } from './modules/guicore.mjs';
import { Loader } from './modules/fileloader.mjs';
import { Statesaver } from './modules/statesaver.mjs';
import { WebGLCore } from './modules/webglcore.mjs';
import { Actions } from './modules/webglcore.mjs';

//Main
(async() => {
  let loader = await new Loader();
  //Load defalt configuration sheet
  let config = JSON.parse(await loader.loadFile("webgl/config.json"));
  let statesaver = await new Statesaver();
  config.modes.lightingMode.state = 1;
  statesaver.saveData("slot1", config.modes);
  config = statesaver.loadData("slot1", config);

  let vShader = await loader.loadFile("webgl/shaders/vertex.glsl").catch(console.error);
  let fShader = await loader.loadFile("webgl/shaders/fragment.glsl").catch(console.error);
  let mesh = await loader.loadMesh("fixtures/json/Suzanne/Suzanne.json").catch(console.error);
  let texture = await loader.loadFile("fixtures/json/Suzanne/textures/Suzanne_tex.png").catch(console.error);
  let webgl = new WebGLCore(vShader, fShader, mesh, texture);
  webgl.initialize();
  let actions = new Actions();
  let startTime = new Date().getTime();

  function main() {
      webgl.gl.clearColor(0.8, 0.8, 0.8, 1.0);
      webgl.gl.clear(webgl.gl.DEPTH_BUFFER_BIT | webgl.gl.COLOR_BUFFER_BIT);
      webgl.checkAspectRatio();
      webgl.lightingToggle(config.modes.lightingMode.state);
      webgl.rotationToggle(config, config.modes.autoRotate.state);
      webgl.viewModeToggle(config.modes.viewMode.state);
      let currentTime = new Date().getTime();
      document.getElementsByClassName("FPS")[0].innerText = parseInt(config.core.fpsViewer.fpsCount / (currentTime - startTime) * 1000);
      config.core.fpsViewer.fpsCount++;
      requestAnimationFrame(main);
      //console.log(canvas.clientHeight / canvas.clientWidth * canvas.clientWidth);
  }
requestAnimationFrame(main);
})();


//new Loader().loadFile(null);
