import { WebGLCore, Actions } from './modules/webglcore.mjs';
import { SpecButtons, WheelScroll, MouseMove } from './modules/guicore.mjs';
import { Loader } from './modules/fileloader.mjs';
import { Statesaver } from './modules/statesaver.mjs';

(async() => {
  let loader = await new Loader();
  let config = JSON.parse(await loader.loadFile("webgl/config.json"));
  let statesaver = await new Statesaver();
  config.modes.lightingMode.state = 1;
  statesaver.saveData("slot1", config.modes);
  config = statesaver.loadData("slot1", config);
  new SpecButtons(config);
  new WheelScroll(config);
  new MouseMove(config);

  let vShader = await loader.loadFile("webgl/shaders/vertex.glsl").catch(console.error);
  let fShader = await loader.loadFile("webgl/shaders/fragment.glsl").catch(console.error);
  let mesh = await loader.loadMesh("fixtures/json/Suzanne/Suzanne.json").catch(console.error);
  let texture = await loader.loadFile("fixtures/json/Suzanne/textures/Suzanne_tex.png").catch(console.error);
  let webgl = await new Actions(vShader, fShader, mesh, texture);
  let startTime = new Date().getTime();

  function main() {
    //console.log(config.core.positions.zoomRatio);
    webgl.gl.clearColor(0.8, 0.8, 0.8, 1.0);
    webgl.gl.clear(webgl.gl.DEPTH_BUFFER_BIT | webgl.gl.COLOR_BUFFER_BIT);
    webgl.checkAspectRatio();
    webgl.lightingToggle(config.modes.lightingMode.state);
    webgl.viewModeToggle(config.modes.viewMode.state);
    webgl.zooming(config.core.positions.zoomRatio);
    webgl.rotation(config.core.positions.angleX, config.core.positions.angleY, config.modes.autoRotate.state);
    let currentTime = new Date().getTime();
    document.getElementsByClassName("FPS")[0].innerText = parseInt(config.core.fpsViewer.fpsCount / (currentTime - startTime) * 1000);
    config.core.fpsViewer.fpsCount++;
    requestAnimationFrame(main);
  }
requestAnimationFrame(main);
})();
