var shift = false;
var ctrl = false;
var alt = false;
var space = false;
$(document).on("keydown", function (event) {
    if (event.which == 16) {
        shift = true;
    } else if (event.which == 17) {
        ctrl = true;
    } else if (event.which == 18) {
        alt = true;
    } else if (event.which == 32) {
        undo(selectedPointList, lastSelectedGroupId);
    } else if (event.which == 192) {    
        addNewObject('polygon');
    }
}).on("keyup", function (event) {
    shift = false;
    ctrl = false;
    alt = false;
});
$(document).bind('mousewheel DOMMouseScroll', function (event) {
      if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
          if (ctrl == false && alt == false) {
              //actionWheel(data_parr, false, shift);
          }
          return false;
      } else {
          if (ctrl == false && alt == false) {
            // actionWheel(data_parr, true, shift);
          }
          return false;
      }
  });
$(document).bind('mousewheel DOMMouseScroll', function (event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
			zoomIn();
			return false;
		} else {
			zoomOut();
			return false;
		}
	});
