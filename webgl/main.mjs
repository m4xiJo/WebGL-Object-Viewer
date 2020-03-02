import { WebGLCore, Actions } from './modules/webglcore.mjs';
import { SpecButtons, WheelScroll, MouseMove } from './modules/guicore.mjs';
import { Loader } from './modules/fileloader.mjs';
import { Memory } from './modules/memory.mjs';

(async() => {
  let loader = await new Loader();
  let config = JSON.parse(await loader.loadFile("webgl/config.json"));
  let memory = await new Memory();
  config = memory.loadData("slot1", config);
  let buttons = new SpecButtons(config, memory);
  new WheelScroll(config);
  new MouseMove(config);

  let vShader = await loader.loadFile("webgl/shaders/vertex.glsl").catch(console.error);
  let fShader = await loader.loadFile("webgl/shaders/fragment.glsl").catch(console.error);
  let mesh = await loader.loadMesh("fixtures/json/Suzanne/Suzanne.json").catch(console.error);
  let texture = await loader.loadFile("fixtures/json/Suzanne/textures/Suzanne_tex.png").catch(console.error);
  let webgl = await new Actions(vShader, fShader, mesh, texture);
  let startTime = new Date().getTime();

  let fpsCount = 0;
  window.onfocus = () => {
    startTime = new Date().getTime();
    fpsCount = 0;
  };
  document.getElementsByClassName("stats")[0].innerText = "V: " + mesh.vertex.length + " F: 0 T: 0";

  function main() {
    //console.log(config.core.positions.zoomRatio);
    webgl.gl.clearColor(0.8, 0.8, 0.8, 1.0);
    webgl.gl.clear(webgl.gl.DEPTH_BUFFER_BIT | webgl.gl.COLOR_BUFFER_BIT);
    webgl.checkAspectRatio();
    webgl.lightingToggle(config.modes.lightingMode.currstate);
    webgl.viewModeToggle(config.modes.viewMode.currstate);
    webgl.zooming(config.core.positions.zoomRatio);
    webgl.rotation(config.core.positions.angleX, config.core.positions.angleY, config.modes.rotateMode.currstate);
    let currentTime = new Date().getTime();
    document.getElementsByClassName("FPS")[0].innerText = parseInt(fpsCount / (currentTime - startTime) * 1000);
    fpsCount++;
    requestAnimationFrame(main);
  }
requestAnimationFrame(main);
})();
