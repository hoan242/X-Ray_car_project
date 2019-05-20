var opasity = { 'all':'','person':'','upper body':'','head':'','face':'','right eye':'','right_eye':'','left_eye':'','upper_lip':'','lower_lip':'','left_fist':'','right_fist':'',};
var arrType = {
	'TYPE_A': 'A',
	'TYPE_B': 'B',
	'TYPE_C': 'C',
	'TYPE_D': 'D',
	'TYPE_E': 'E',
}
 for (var key in arrType) {
    if(window.location.href.indexOf(key)>-1){
      typeOp = arrType[key]
    }
  }
//var typeOp="A";window.location.href.indexOf("TYPE_C")>-1?typeOp="C":window.location.href.indexOf("TYPE_B")>-1&&(typeOp="B");
function set_value(t){var a=$(t).val();$("#objEnter").val(a),$("#attributes").focus(),$("#objEnter").focus();for(var o in opasity)o==a&&(opasity[o]="opasity")}
function set_attr(id){var getVal = $(id).val();$("#attributes").val(getVal);$("#attributes").focus(); }
function HTMLattributesBox(attList) { return '<textarea name="attributes" id="attributes" type="text" style="height:1em; width: 100%" tabindex="0" title="">'+attList+'</textarea>';};
function HTMLobjectBox(obj_name) {
  var submit,html_str="";if(html_str+='<input name="objEnter" id="objEnter" type="text" style="width:220px;" tabindex="0" value="'+obj_name+'" title=""',html_str+=' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13){',""==obj_name?(video_mode?html_str+='main_media.SubmitObject()};if(c==27) main_handler.WhatIsThisObjectDeleteButton();" ':html_str+='main_handler.SubmitQuery()};if(c==27)main_handler.WhatIsThisObjectDeleteButton();" ',submit="main_handler.SubmitQuery();"):(video_mode?html_str+='main_media.SubmitEditObject()};" ':html_str+='main_handler.SubmitEditLabel()};" ',submit="main_handler.SubmitEditLabel();"),"..."==object_choices)html_str+="/>";else{html_str+='list="datalist1" />',html_str+='<datalist id="datalist1"><select style="display:none">';for(var i=0;i<object_choices.length;i++)html_str+='<option value="'+object_choices[i]+'">'+object_choices[i]+"</option>"
  var icons = {
    'all':'fas fa-people-carry', 
    'person':'fas fa-child', 
    'upper body': 'fas fa-user',
    'head': 'fas fa-user-circle',
    'face': 'fas fa-smile',
    'right eye': 'fas fa-eye',
    'right_eye': 'fas fa-eye',
    'left_eye': 'fas fa-eye',
    'upper_lip': 'fas fa-chevron-circle-up',
    'lower_lip': 'fas fa-chevron-circle-down',
    'right_fist': 'far fa-hand-point-right',
    'left_fist': 'far fa-hand-point-left',
  };
  
  var elType_a = {
    'all': 'all', 
    'person':'person', 
    'upper body': 'upperBody',
    'br': '',
    'head': 'head',
    'face': 'face',
    'br2': '',
    'right_eye': 'right eye',
    'left_eye': 'left eye',
    'right_fist': 'right fist',
    'left_fist': 'left fist',
    'br3': '',
    'upper_lip': 'upper lip',
    'lower_lip': 'lower lip',
    
  };
  var elType_b = {
    'all': 'all', 
    'person':'person', 
    'upper body': 'upperBody',
  };
  var elType_c = {
    'all': 'all', 
    'br3': '',
    'head': 'head',
    'face': 'face',
    'br': '',
    'right eye': 'right eye',
    'left_eye': 'left eye',
    'br2': '',
    'upper_lip': 'upper lip',
    'lower_lip': 'lower lip',
   }
  var elType_e = {
    'all': 'all', 
    'head':'head', 
    'face': 'face',
  };
  switch (typeOp) {
   case 'E':
      myArray = elType_e;
      break;
    case 'C':
      myArray = elType_c;
      break;
   case 'B':
      myArray = elType_b;
      break;
    default:
      myArray = elType_a;
  }
 
  var button_conten = '<div id="button_id">';
  for (var key in myArray) {
    if(key == 'br'|| key =='br2' || key =='br3'){
      button_conten += '<p></p>';
    }else{
      button_conten += '<button class="'+key +' '+ opasity[key]+'" value="'+key+'" onclick="set_value(this);'+submit+'" ><i class="'+icons[key]+'"></i> <span>'+ myArray[key] +'</span></button>';
    }
  }
  button_conten += '</div>';
  html_str += '</select></datalist>';
  html_str += '<div class="attributes"><button class="attr add" value="add" onclick="set_attr(this);" ><i class="fas fa-plus-circle"></i> add</button><button class="attr del" value="del" onclick="set_attr(this);" ><i class="fas fa-trash-alt"></i> del</button></div>';
  html_str += button_conten;
  
  }
  return html_str;
}

$(window).keypress(function(e){
  " "!==e.key&&"Spacebar"!==e.key||(e.preventDefault(),main_handler.EraseSegment())
});
var a = window.location.href.split('image=');
var id = a[1].split('.jpg')[0]


function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
 
  document.body.removeChild(textArea);
}

function get_points(){
 
  var arrgs_point = $('#draw_canvas line');
  var dataStream ='{Delay 2}'+ '\r\n'+
			'{3 down}'+ '\r\n' +
			'{Delay 0.1}' + '\r\n' +
			'{3 up}' + '\r\n';
			
  if(arrgs_point.length == 0 ){
    points = $('#select_canvas polygon').attr('points');
    arrgs_point = points.split(' ');
	var i=0;
    arrgs_point.forEach(function(e) { 
		i++	
		x = e.split(',')[0];
		y = e.split(',')[1];
		x = Number(x)+LEFT;
		y = Number(y)+TOP;
		var point = x+','+y;
		if(i!=arrgs_point.length){
			dataStream += '{Delay 0.01}'+ '\r\n'+
			'{LMouse down ('+ point +')}'+ '\r\n'+
			'{Delay 0.01}'+ '\r\n'+
			'{LMouse up ('+ point +')}'+'\r\n';
	  }
    });
  }else{
    arrgs_point.each(function() {  
      x = $(this).attr('x1');
      y = $(this).attr('y1');
       x = Number(x)+LEFT;
       y = Number(y)+TOP;
      var point = x+','+ y;
      dataStream += '{Delay 0.01}'+ '\r\n'+
  		'{LMouse down ('+ point +')}'+ '\r\n'+
  		'{Delay 0.01}'+ '\r\n'+
  		'{LMouse up ('+ point +')}'+'\r\n';
    });
  }
  return dataStream;
}
//$('#anno_anchor').append('<a href="javascript:void(0)" id="dlbtn"><i class="fas fa-download"></i> Polygon</a> ');
$('#anno_anchor').append('<a href="javascript:void(0)" id="dlbtn"><i class="fas fa-download"></i> Polygon</a> ');
function FileSave(sourceText, fileIdentity) {
    var workElement = document.createElement("a");
    if ('download' in workElement) {
        workElement.href = "data:" + 'text/plain' + "charset=US-ASCII," + escape(sourceText);
        workElement.setAttribute("download", fileIdentity);
        document.body.appendChild(workElement);
        var eventMouse = document.createEvent("MouseEvents");
        eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        workElement.dispatchEvent(eventMouse);
        document.body.removeChild(workElement);
    } else throw 'File saving not supported for this browser';
}
$('#dlbtn').click(function(){
   //get_points();
 FileSave(get_points(), id + '.ams', 'text/plain');
});

$(document).keydown(function(e){
  if(49==e.which)main_media.Zoom(1.5);
  else if(50==e.which)main_media.Zoom(1/1.5);
  else if(51==e.which)main_media.Zoom("fitted"),HideAllPolygons(),copyTextToClipboard(id);
  else if(52==e.which)main_media.Zoom("fitted"),FileSave(get_points(), id + '.ams', 'text/plain');
  else if(87==e.which)HideAllPolygons();
  else if(81==e.which){"javascript:HideAllPolygons();"==$("#hide_all_button").attr("href")?HideAllPolygons():ShowAllPolygons()}
});
