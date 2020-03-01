export class WheelScroll {
  constructor(config) {
    this.config = config;
    this.isScrolling = null;
    this.scrollEl = document.getElementsByClassName("zoomSlider")[0];
    this.config.core.positions.zoomRatio = this.scrollEl.value;
    this.scrollEvent = document.addEventListener("wheel", (scroll) => {
      this.scrolled(scroll);
    }, false);
  }

  scrolled(scroll) {
    if (this.config.core.positions.zoomRatio < 0) return;
    if (this.config.core.positions.zoomRatio > 100) return;
    let scrollArea =  scroll.target.className || click.target.id;
    if (scroll.deltaY && (scroll.target.className === "viewport" || scroll.target.className === "workArea")) {
      this.scrollEl.value -= scroll.deltaY * 0.6;
      if (scroll.deltaY < 0) scroll.target.style.cursor = "zoom-in";
      if (scroll.deltaY > 0) scroll.target.style.cursor = "zoom-out";
        this.isScrolling = window.setTimeout(() => {
          scroll.target.style.cursor = null;
        }, 100);
      window.clearTimeout(this.isScrolling);
      this.config.core.positions.zoomRatio = this.scrollEl.value;
    }
  }
}

export class MouseMove {
  constructor(config) {
    this.config = config;
    this.scrollEvent = document.addEventListener("mousemove", (move) => {
      this.moved(move);
    }, false);
  }

  moved(move) {
    if (move.clientX && move.buttons == 1) this.config.core.positions.angleX += ((move.clientX - this.config.core.positions.mouseMoveX) * 0.01);
    if (move.clientY && move.buttons == 1) this.config.core.positions.angleY -= ((move.clientY - this.config.core.positions.mouseMoveY) * 0.01);
    this.config.core.positions.mouseMoveX = move.clientX;
    this.config.core.positions.mouseMoveY = move.clientY;
    if (move.clientX && move.buttons == 2) {
      move.target.style.cursor = "move";
      window.clearTimeout(this.config.core.positions.isMoving);
      this.config.core.positions.isMoving = setTimeout(() => { move.target.style.cursor = null; }, 50);
      return this.config;
    }
  }
}

export class SpecButtons {
  constructor(config) {
    this.config = config;
    this.loadStates();
    this.clickEvent = document.addEventListener("click", (click) => {
      if (click.button == 0) this.pressed(click);
    }, false);
  }

  loadStates() {
    for (let mode in this.config.modes) {
      let currentState = this.config.modes[mode].state;
      let icons = this.config.modes[mode].icons;
      let object = document.getElementsByClassName(mode)[0] || document.getElementById(mode);
      if(object) object.value = String.fromCharCode(icons[currentState]);
    }
  }

  pressed(click) {
    let buttonid = click.target.className || click.target.id;
    let button = document.getElementsByClassName(buttonid)[0] || document.getElementById(buttonid) || null;
    if(button == null) throw "Element was not found!";
    let currentState = this.config.modes[buttonid].state;
    let allStates = this.config.modes[buttonid].states;
    let statesLenth = this.config.modes[buttonid].states.length;
    if(currentState < statesLenth - 1) currentState = allStates[currentState + 1];
    else currentState = 0;
    let icon = this.config.modes[buttonid].icons[currentState] || "X";
    click.target.value = String.fromCharCode(icon);
    this.config.modes[buttonid].state = currentState;
    return this.config;
  }
}

class Modals {
  constuctor() {
  }

  modifyColor(color, percent) {
    if (color.match(/#/g)) color = color.replace('#', '');
    let num = parseInt(color, 16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, B = (num >> 8 & 0x00FF) + amt, G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
  }

  showNotification(text, time, color, percent) {
    clearTimeout(this.config.core.time.timer);
    document.getElementsByClassName("notyTitle")[0].innerText = text;
    document.getElementsByClassName("notification")[0].setAttribute("style", "animation: fadein " + time + "s; background: " + color + "; border-bottom: 1px solid " + modifyColor(color, percent));
    this.config.core.time.timer = setTimeout(() => {
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
}


//
// export class GUIButtons extends GUIEvents {
//   constructor(config) {
//     this.litBtn = document.getElementsByClassName("btnLitUnlit")[0];
//     this.viewBtn = document.getElementsByClassName("btnViewMode")[0];
//     this.gridBtn = document.getElementsByClassName("btnGrid")[0];
//     this.autorotateBtn = document.getElementsByClassName("btnRotation")[0];
//     this.workflowBtn = document.getElementsByClassName("btnWorkflow")[0];
//     this.mappaneBtn = document.getElementsByClassName("mapPane")[0];
//     this.shadingBtn = document.getElementsByClassName("btnShading")[0];
//     this.scaleBtn = document.getElementsByClassName("btnScale")[0];
//     this.animationpanBtn = document.getElementsByClassName("btnAnimationPane")[0];
//     this.animationPane = document.getElementsByClassName("animationPane")[0];
//     this.syncBtn = document.getElementsByClassName("btnSyncViewport")[0];
//     this.warningsBtn = document.getElementsByClassName("btnWarnings")[0];
//     this.fpsCounter = document.getElementsByClassName("FPS")[0];
//     this.statsField = document.getElementsByClassName("stats")[0];
//   }
//
//   litBtn(click) {
//       console.log(this);
//       if (this.config.modes.lightingMode.state == 0) {
//         click.target.value = String.fromCharCode(this.config.modes.lightingMode.icons[1]);
//         this.config.modes.lightingMode.state = 1;
//         showNotification("Set to Lit mode", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       } else if (this.config.modes.lightingMode.state == 1) {
//         click.target.value = String.fromCharCode(this.config.modes.lightingMode.icons[0]);
//         config.modes.lightingMode.state = 0;
//         showNotification("Set to Unlit mode", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       }
//       //saveData("userData", config.modes);
//   }
//
//   viewBtn(elem) {
//       switch (this.config.modes.viewMode.state) {
//         case 0:
//           click.target.value = String.fromCharCode(this.config.modes.viewMode.icons[1]);
//           this.config.modes.viewMode.state = 1;
//           showNotification("Wireframe view", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//           break;
//         case 1:
//           click.target.value = String.fromCharCode(this.config.modes.viewMode.icons[2]);
//           this.config.modes.viewMode.state = 2;
//           showNotification("Textured view", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//           break;
//         case 2:
//           click.target.value = String.fromCharCode(this.config.modes.viewMode.icons[0]);
//           this.config.modes.viewMode.state = 0;
//           showNotification("Solid view", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//           break;
//       }
//       saveData("userData", this.config.modes);
//   }
//
//   gridBtn(elem) {
//       if (this.config.modes.viewGrid.state == 1) {
//         click.target.value = String.fromCharCode(this.config.modes.viewGrid.icons[0]);
//         this.config.modes.viewGrid.state = 0;
//         showNotification("Grid OFF", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       } else if (this.config.modes.viewGrid.state == 0) {
//         click.target.value = String.fromCharCode(this.config.modes.viewGrid.icons[1]);
//         this.config.modes.viewGrid.state = 1;
//         showNotification("Grid ON", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       }
//       saveData("userData", this.config.modes);
//   }
//
//   autorotateBtn(elem) {
//       if (this.config.modes.autoRotate.state == 1) {
//         click.target.value = String.fromCharCode(this.config.modes.autoRotate.icons[0]);
//         this.config.modes.autoRotate.state = 0;
//         showNotification("Auto 3D Rotation stopped", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       } else if (this.config.modes.autoRotate.state == 0) {
//         click.target.value = String.fromCharCode(this.config.modes.autoRotate.icons[1]);
//         this.config.modes.autoRotate.state = 1;
//         showNotification("Auto 3D Rotation resumed", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       }
//       saveData("userData", this.config.modes);
//   }
//
//   workflowBtn(elem) {
//       if (this.config.modes.mapPane.state == 0) {
//         click.target.value = String.fromCharCode(this.config.modes.mapPane.icons[1]);
//         this.config.modes.mapPane.state = 1;
//         this.config.modes.mapPane.panelObj.classList.remove("hidden");
//         showNotification("Maps pane shown", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       } else if (this.config.modes.mapPane.state == 1) {
//         click.target.value = String.fromCharCode(this.config.modes.mapPane.icons[0]);
//         this.config.modes.mapPane.state = 0;
//         this.config.modes.mapPane.panelObj.classList.add("hidden");
//         showNotification("Maps pane hidden", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       }
//       saveData("userData", this.config.modes);
//   }
//
//   shadingBtn(elem) {
//       if (this.config.modes.shadingMode.state == 1) {
//         click.target.value = String.fromCharCode(this.config.modes.shadingMode.icons[0]);
//         this.config.modes.shadingMode.state = 0;
//         showNotification("Swithed to flat shading", 2, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       } else if (this.config.modes.shadingMode.state == 0) {
//         click.target.value = String.fromCharCode(this.config.modes.shadingMode.icons[1]);
//         this.config.modes.shadingMode.state = 1;
//         showNotification("Swithed to smooth shading", 2, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       }
//       saveData("userData", this.config.modes);
//   }
//
//   scaleBtn(elem) {
//       switch (this.config.modes.objScale.state) {
//         case 0:
//           click.target.value = String.fromCharCode(this.config.modes.objScale.icons[1]);
//           this.config.modes.objScale.state = 1;
//           showNotification("Changed to Millimeters", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//           break;
//         case 1:
//           click.target.value = String.fromCharCode(this.config.modes.objScale.icons[2]);
//           this.config.modes.objScale.state = 2;
//           showNotification("Changed to Centimeters", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//           break;
//         case 2:
//           click.target.value = String.fromCharCode(this.config.modes.objScale.icons[3]);
//           this.config.modes.objScale.state = 3;
//           showNotification("Changed to Meters", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//           break;
//         case 3:
//           click.target.value = String.fromCharCode(this.config.modes.objScale.icons[4]);
//           this.config.modes.objScale.state = 4;
//           showNotification("Changed to Inches", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//           break;
//         case 4:
//           click.target.value = String.fromCharCode(this.config.modes.objScale.icons[5]);
//           this.config.modes.objScale.state = 5;
//           showNotification("Changed to Feet", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//           break;
//         case 5:
//           click.target.value = String.fromCharCode(this.config.modes.objScale.icons[0]);
//           this.config.modes.objScale.state = 0;
//           showNotification("Changed to Yards", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//           break;
//       }
//       saveData("userData", this.config.modes);
//   }
//
//   animpaneBtn(elem) {
//       if (this.config.modes.animPane.state == 0) {
//         click.target.value = String.fromCharCode(this.config.modes.animPane.icons[1]);
//         this.config.modes.animPane.state = 1;
//         this.config.modes.animPane.panelObj.classList.remove("hidden");
//         showNotification("Animation pane shown", 2, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       } else if (this.config.modes.animPane.state == 1) {
//         click.target.value = String.fromCharCode(this.config.modes.animPane.icons[0]);
//         this.config.modes.animPane.state = 0;
//         this.config.modes.animPane.panelObj.classList.add("hidden");
//         showNotification("Animation pane hidden", 2, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       }
//       saveData("userData", this.config.modes);
//   }
//
//   syncBtn(elem) {
//       if (this.config.modes.syncViewports.state == 0) {
//         click.target.value = String.fromCharCode(ui.modes.syncViewports.icons[1]);
//         this.config.modes.syncViewports.state = 1;
//         showNotification("Viewport sync enabled", 2, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       } else if (this.config.modes.syncViewports.state == 1) {
//         click.target.value = String.fromCharCode(ui.modes.syncViewports.icons[0]);
//         this.config.modes.syncViewports.state = 0;
//         showNotification("Viewport sync disabled", 2, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       }
//       saveData("userData", this.config.modes);
//   }
//
//   helpBtn(elem) {
//       toggleModalWindow("Help menu", "<b>Coming soon!</b>\n" + helpText, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//   }
//
//   warningsBtn(elem) {
//       if (this.config.modes.warnings.windowState == 0) {
//         click.target.value = String.fromCharCode(this.config.modes.warnings.icons[2]);
//         this.config.modes.warnings.windowState = 1;
//         //click.target.classList.remove("error");
//         //click.target.classList.add("ok");
//       } else if (this.config.modes.warnings.windowState == 1) {
//         click.target.value = String.fromCharCode(this.config.modes.warnings.icons[this.config.modes.warnings.warningsCode]);
//         this.config.modes.warnings.windowState = 0;
//         //click.target.classList.remove("ok");
//         //click.target.classList.add("error");
//       }
//       toggleModalWindow("Mesh validation report", "<b>The list bellow is just a placeholder!</b><li>Doubles detected!</li><li>N-gon limit exceeding!</li>", this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//   }
//
//   resetBtn(elem) {
//       showNotification("The view was reset to default", 2, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//   }
//
//   topviewBtn(elem) {
//       showNotification("Top view", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       this.config.core.positions.angleY = -1.6;
//       this.config.core.positions.angleX = 0;
//   }
//
//   xviewBtn(elem) {
//       showNotification("Front view", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       this.config.core.positions.angleY = 0;
//       this.config.core.positions.angleX = -1.6;
//   }
//
//   yviewBtn(elem) {
//       showNotification("Side view", 1, this.config.ui.colors.normal, this.config.ui.colors.colorMod);
//       this.config.core.positions.angleY = 0;
//       this.config.core.positions.angleX = 0;
//   }
//
//   zoomSlider(elem) {
//     let zoomSlider = document.getElementsByClassName("zoomSlider")[0];
//     if (click.target.className === "btnZoomOut" && click.button == 0) {
//       (zoomSlider.value >= 0 && zoomSlider.value >= 10) ? zoomSlider.value -= 10: zoomSlider.value = 1;
//     } else if (click.target.className === "btnZoomIn" && click.button == 0) {
//       (zoomSlider.value <= 100 && zoomSlider.value <= 90) ? zoomSlider.value -= (-10): zoomSlider.value = 100;
//     }
//   }
//
//   fullscreenBtn(elem) {
//       (click.target.value !== String.fromCharCode("0xE5D1")) ? click.target.value = String.fromCharCode("0xE5D1"): click.target.value = String.fromCharCode("0xE5D0");
//       let element = document.getElementsByClassName("workArea")[0];
//       if (!window.fullScreen) {
//         if (element.requestFullscreen) return element.requestFullscreen();
//         if (element.mozRequestFullScreen) return element.mozRequestFullScreen();
//         if (element.webkitRequestFullscreen) return element.webkitRequestFullscreen();
//         if (element.msRequestFullscreen) return element.msRequestFullscreen();
//       }
//       if (window.fullScreen) {
//         if (document.exitFullscreen) return document.exitFullscreen();
//         if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
//         if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
//         if (document.msExitFullscreen) return document.msExitFullscreen();
//       }
//   }
//
//   closeBtn(elem) {
//       click.target.parentElement.style.visibility = "hidden";
//       click.target.parentElement.style.opacity = 0;
//       this.config.modes.warnings.bind.value = String.fromCharCode(this.config.modes.warnings.icons[this.config.modes.warnings.warningsCode]);
//       this.config.modes.warnings.windowState = 0;
//   }
// }
