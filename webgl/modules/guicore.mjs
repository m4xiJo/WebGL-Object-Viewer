export class GUIButtons {
  constructor(elements) {
    this.litBtn = document.getElementsByClassName("btnLitUnlit")[0];
    this.viewBtn = document.getElementsByClassName("btnViewMode")[0];
    this.gridBtn = document.getElementsByClassName("btnGrid")[0];
    this.autorotateBtn = document.getElementsByClassName("btnRotation")[0];
    this.workflowBtn = document.getElementsByClassName("btnWorkflow")[0];
    this.mappaneBtn = document.getElementsByClassName("mapPane")[0];
    this.shadingBtn = document.getElementsByClassName("btnShading")[0];
    this.scaleBtn = document.getElementsByClassName("btnScale")[0];
    this.animationpanBtn = document.getElementsByClassName("btnAnimationPane")[0];
    this.animationPane = document.getElementsByClassName("animationPane")[0];
    this.syncBtn = document.getElementsByClassName("btnSyncViewport")[0];
    this.warningsBtn = document.getElementsByClassName("btnWarnings")[0];
    this.fpsCounter = document.getElementsByClassName("FPS")[0];
    this.statsField = document.getElementsByClassName("stats")[0];
  }

  litBtn(elem, config) {
      if (config.modes.lightingMode.state == 0) {
        click.target.value = String.fromCharCode(config.modes.lightingMode.icons[1]);
        config.modes.lightingMode.state = 1;
        showNotification("Set to Lit mode", 1, config.ui.colors.normal, config.ui.colors.colorMod);
      } else if (config.modes.lightingMode.state == 1) {
        click.target.value = String.fromCharCode(config.modes.lightingMode.icons[0]);
        config.modes.lightingMode.state = 0;
        showNotification("Set to Unlit mode", 1, config.ui.colors.normal, config.ui.colors.colorMod);
      }
      saveData("userData", config.modes);
  }

  viewBtn(elem) {
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

  gridBtn(elem) {
      if (dataStorage.modes.viewGrid.state == 1) {
        click.target.value = String.fromCharCode(dataStorage.modes.viewGrid.icons[0]);
        dataStorage.modes.viewGrid.state = 0;
        showNotification("Grid OFF", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      } else if (dataStorage.modes.viewGrid.state == 0) {
        click.target.value = String.fromCharCode(dataStorage.modes.viewGrid.icons[1]);
        dataStorage.modes.viewGrid.state = 1;
        showNotification("Grid ON", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      }
      saveData("userData", dataStorage.modes);
  }

  autorotateBtn(elem) {
      if (dataStorage.modes.autoRotate.state == 1) {
        click.target.value = String.fromCharCode(dataStorage.modes.autoRotate.icons[0]);
        dataStorage.modes.autoRotate.state = 0;
        showNotification("Auto 3D Rotation stopped", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      } else if (dataStorage.modes.autoRotate.state == 0) {
        click.target.value = String.fromCharCode(dataStorage.modes.autoRotate.icons[1]);
        dataStorage.modes.autoRotate.state = 1;
        showNotification("Auto 3D Rotation resumed", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      }
      saveData("userData", dataStorage.modes);
  }

  workflowBtn(elem) {
      if (dataStorage.modes.mapPane.state == 0) {
        click.target.value = String.fromCharCode(dataStorage.modes.mapPane.icons[1]);
        dataStorage.modes.mapPane.state = 1;
        dataStorage.modes.mapPane.panelObj.classList.remove("hidden");
        showNotification("Maps pane shown", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      } else if (dataStorage.modes.mapPane.state == 1) {
        click.target.value = String.fromCharCode(dataStorage.modes.mapPane.icons[0]);
        dataStorage.modes.mapPane.state = 0;
        dataStorage.modes.mapPane.panelObj.classList.add("hidden");
        showNotification("Maps pane hidden", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      }
      saveData("userData", dataStorage.modes);
  }

  shadingBtn(elem) {
      if (dataStorage.modes.shadingMode.state == 1) {
        click.target.value = String.fromCharCode(dataStorage.modes.shadingMode.icons[0]);
        dataStorage.modes.shadingMode.state = 0;
        showNotification("Swithed to flat shading", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      } else if (dataStorage.modes.shadingMode.state == 0) {
        click.target.value = String.fromCharCode(dataStorage.modes.shadingMode.icons[1]);
        dataStorage.modes.shadingMode.state = 1;
        showNotification("Swithed to smooth shading", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      }
      saveData("userData", dataStorage.modes);
  }

  scaleBtn(elem) {
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

  animpaneBtn(elem) {
      if (dataStorage.modes.animPane.state == 0) {
        click.target.value = String.fromCharCode(dataStorage.modes.animPane.icons[1]);
        dataStorage.modes.animPane.state = 1;
        dataStorage.modes.animPane.panelObj.classList.remove("hidden");
        showNotification("Animation pane shown", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      } else if (dataStorage.modes.animPane.state == 1) {
        click.target.value = String.fromCharCode(dataStorage.modes.animPane.icons[0]);
        dataStorage.modes.animPane.state = 0;
        dataStorage.modes.animPane.panelObj.classList.add("hidden");
        showNotification("Animation pane hidden", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      }
      saveData("userData", dataStorage.modes);
  }

  syncBtn(elem) {
      if (dataStorage.modes.syncViewports.state == 0) {
        click.target.value = String.fromCharCode(ui.modes.syncViewports.icons[1]);
        dataStorage.modes.syncViewports.state = 1;
        showNotification("Viewport sync enabled", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      } else if (dataStorage.modes.syncViewports.state == 1) {
        click.target.value = String.fromCharCode(ui.modes.syncViewports.icons[0]);
        dataStorage.modes.syncViewports.state = 0;
        showNotification("Viewport sync disabled", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      }
      saveData("userData", dataStorage.modes);
  }

  helpBtn(elem) {
      toggleModalWindow("Help menu", "<b>Coming soon!</b>\n" + helpText, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
  }

  warningsBtn(elem) {
      if (dataStorage.modes.warnings.windowState == 0) {
        click.target.value = String.fromCharCode(dataStorage.modes.warnings.icons[2]);
        dataStorage.modes.warnings.windowState = 1;
        //click.target.classList.remove("error");
        //click.target.classList.add("ok");
      } else if (dataStorage.modes.warnings.windowState == 1) {
        click.target.value = String.fromCharCode(dataStorage.modes.warnings.icons[dataStorage.modes.warnings.warningsCode]);
        dataStorage.modes.warnings.windowState = 0;
        //click.target.classList.remove("ok");
        //click.target.classList.add("error");
      }
      toggleModalWindow("Mesh validation report", "<b>The list bellow is just a placeholder!</b><li>Doubles detected!</li><li>N-gon limit exceeding!</li>", dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
  }

  resetBtn(elem) {
      showNotification("The view was reset to default", 2, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
  }

  topviewBtn(elem) {
      showNotification("Top view", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      dataStorage.core.positions.angleY = -1.6;
      dataStorage.core.positions.angleX = 0;
  }

  xviewBtn(elem) {
      showNotification("Front view", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      dataStorage.core.positions.angleY = 0;
      dataStorage.core.positions.angleX = -1.6;
  }

  yviewBtn(elem) {
      showNotification("Side view", 1, dataStorage.ui.colors.normal, dataStorage.ui.colors.colorMod);
      dataStorage.core.positions.angleY = 0;
      dataStorage.core.positions.angleX = 0;
  }

  zoomSlider(elem) {
    let zoomSlider = document.getElementsByClassName("zoomSlider")[0];
    if (click.target.className === "btnZoomOut" && click.button == 0) {
      (zoomSlider.value >= 0 && zoomSlider.value >= 10) ? zoomSlider.value -= 10: zoomSlider.value = 1;
    } else if (click.target.className === "btnZoomIn" && click.button == 0) {
      (zoomSlider.value <= 100 && zoomSlider.value <= 90) ? zoomSlider.value -= (-10): zoomSlider.value = 100;
    }
  }

  fullscreenBtn(elem) {
      (click.target.value !== String.fromCharCode("0xE5D1")) ? click.target.value = String.fromCharCode("0xE5D1"): click.target.value = String.fromCharCode("0xE5D0");
      let element = document.getElementsByClassName("workArea")[0];
      if (!window.fullScreen) {
        if (element.requestFullscreen) return element.requestFullscreen();
        if (element.mozRequestFullScreen) return element.mozRequestFullScreen();
        if (element.webkitRequestFullscreen) return element.webkitRequestFullscreen();
        if (element.msRequestFullscreen) return element.msRequestFullscreen();
      }
      if (window.fullScreen) {
        if (document.exitFullscreen) return document.exitFullscreen();
        if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
        if (document.msExitFullscreen) return document.msExitFullscreen();
      }
  }

  closeBtn(elem) {
      click.target.parentElement.style.visibility = "hidden";
      click.target.parentElement.style.opacity = 0;
      dataStorage.modes.warnings.bind.value = String.fromCharCode(dataStorage.modes.warnings.icons[dataStorage.modes.warnings.warningsCode]);
      dataStorage.modes.warnings.windowState = 0;
  }
}

export class GUIEvents extends GUIButtons {
  constructor() {
    document.getElementsByClassName("viewport")[0].addEventListener('mousemove', inputMoveListen(move), false);
    document.addEventListener('wheel', inputScrollListen(scroll), false);
    document.addEventListener('click', inputClickListen(click), false);
  }

  modifyColor(color, percent) {
    if (color.match(/#/g)) color = color.replace('#', '');
    let num = parseInt(color, 16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, B = (num >> 8 & 0x00FF) + amt, G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
  }

  showNotification(text, time, color, percent) {
    clearTimeout(dataStorage.core.time.timer);
    document.getElementsByClassName("notyTitle")[0].innerText = text;
    document.getElementsByClassName("notification")[0].setAttribute("style", "animation: fadein " + time + "s; background: " + color + "; border-bottom: 1px solid " + modifyColor(color, percent));
    dataStorage.core.time.timer = setTimeout(() => {
      document.getElementsByClassName("notification")[0].style.animation = null;
    }, time * 1000);
  }

  toggleModalWindow(title, content, color, percent) {
    if (document.getElementsByClassName("modal")[0].style.visibility !== "visible") {
      document.getElementsByClassName("modal")[0].setAttribute("style", "visibility: visible; opacity: 1;");
      document.getElementsByClassName("modalTitle")[0].innerText = title;
      document.getElementsByClassName("modalTitle")[0].setAttribute("style", "background:" + color + "; border-bottom: 1px solid " + this.modifyColor(color, percent));
      document.getElementsByClassName("modalContent")[0].innerHTML = content;
    } else {
      document.getElementsByClassName("modal")[0].setAttribute("style", "visibility: hidden; opacity: 0;");
      document.getElementsByClassName("modalTitle")[0].innerText = null;
      document.getElementsByClassName("modalContent")[0].innerHTML = null;
    }
  }

  inputMoveListen(move) {
      if (move.clientX && move.buttons == 1) dataStorage.core.positions.angleX += ((move.clientX - dataStorage.core.positions.mouseMoveX) * 0.01);
      if (move.clientY && move.buttons == 1) dataStorage.core.positions.angleY -= ((move.clientY - dataStorage.core.positions.mouseMoveY) * 0.01);
      dataStorage.core.positions.mouseMoveX = move.clientX;
      dataStorage.core.positions.mouseMoveY = move.clientY;
      if (move.clientX && move.buttons == 2)
        move.target.style.cursor = "move";
        window.clearTimeout(dataStorage.core.positions.isMoving);
        dataStorage.core.positions.isMoving = setTimeout(() => {
        move.target.style.cursor = null;
      }, 50);
  }

  inputScrollListen(scroll) {
      let zoomSlider = document.getElementsByClassName("zoomSlider")[0];
      if (scroll.deltaY && (scroll.target.className === "viewport" || scroll.target.className === "workArea")) {
        zoomSlider.value -= scroll.deltaY * 0.6;
        if (scroll.deltaY < 0) scroll.target.style.cursor = "zoom-in";
        if (scroll.deltaY > 0) scroll.target.style.cursor = "zoom-out";
        let isScrolling = null;
        if (isScrolling != null) {
          window.clearTimeout(isScrolling);
          isScrolling = null;
        }
        else {
          isScrolling = window.setTimeout(() => {
            scroll.target.style.cursor = null;
          }, 100);
        }
      }
  }

  inputClickListen(click) {
    if (click.target.className === "btnLitUnlit" && click.button == 0) litBtn(click);
    else if (click.target.className === "btnViewMode" && click.button == 0) viewBtn(click);
    else if (click.target.className === "btnGrid" && click.button == 0) gidBtn(click);
    else if (click.target.className === "btnRotation" && click.button == 0) autorotateBtn(click);
    else if (click.target.className === "btnWorkflow" && click.button == 0) workflowBtn(click);
    else if (click.target.className === "btnShading" && click.button == 0) shadingBtn(click);
    else if (click.target.className === "btnScale" && click.button == 0) scaleBtn(click);
    else if (click.target.className === "btnAnimationPane" && click.button == 0) animpaneBtn(click);
    else if (click.target.className === "btnSyncViewport" && click.button == 0) syncBtn(click);
    else if (click.target.className === "btnHelp" && click.button == 0) helpBtn(click);
    else if (click.target.classList[0] === "btnWarnings" && click.button == 0) warningsBtn(click);
    else if (click.target.className === "btnResetView" && click.button == 0) resetBtn(click);
    else if (click.target.className === "btnTopView" && click.button == 0) topviewBtn(click);
    else if (click.target.className === "btnXview" && click.button == 0) xviewBtn(click);
    else if (click.target.className === "btnYview" && click.button == 0) yviewBtn(click);
    else if (click.target.className === "btnFullScreen" && click.button == 0) fullscreenBtn(click);
    else if (click.target.className === "btnClose" && click.button == 0) closeBtn(click);
  }
}
