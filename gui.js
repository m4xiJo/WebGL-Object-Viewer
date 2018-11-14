document.addEventListener("DOMContentLoaded", function(e) {
    document.addEventListener('wheel', inputScrollListen = function (scroll) {
      let zoomSlider = document.getElementById("zoomSlider");
      if (scroll.deltaY && (scroll.target.id === "viewport" || scroll.target.id === "workArea")) {
        zoomSlider.value -= scroll.deltaY * 0.6;
      }
    }, false);

    document.addEventListener('click', inputClickListen = function (click) {
      let zoomSlider = document.getElementById("zoomSlider");
      if (click.target.id === "btnZoomOut") {
        (zoomSlider.value >= 0 && zoomSlider.value >= 10) ? zoomSlider.value -= 10 : zoomSlider.value = 1;
        console.log(zoomSlider.value);
      }
      else if (click.target.id === "btnZoomIn") {
        (zoomSlider.value <= 100 && zoomSlider.value <= 90) ? zoomSlider.value -= (-10) : zoomSlider.value = 100;
        console.log(zoomSlider.value);
      }
    }, false);
});
