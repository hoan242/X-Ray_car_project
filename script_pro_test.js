function RenderObjectList() {
    // If object list has been rendered, then remove it:
    var scrollPos = $("#anno_list").scrollTop();
    if ($('#anno_list').length) {
        $('#anno_list').remove();
    }

    var html_str = '<div class="object_list" id="anno_list" style="border:0px solid black;z-index:0;" ondrop="drop(event, -1)" ondragenter="return dragEnter(event)" ondragover="return dragOver(event)">';

    var Npolygons = LMnumberOfObjects(LM_xml);
    var NundeletedPolygons = 0;

    // Count undeleted objects:
    for (var ii = 0; ii < Npolygons; ii++) {
        if (!parseInt(LMgetObjectField(LM_xml, ii, 'deleted'))) {
            NundeletedPolygons++;
        }
    }

    // Get parts tree
    var tree = getPartsTree();

    // Create DIV
    if (showImgName) {
        html_str += '<p><b>Image name: ' + imgName + '</b></p>';
    }
    //html_str += '<b>Polygons in this image ('+ NundeletedPolygons +')</b>';
    //html_str += '<button  onclick="StartPolygon();ClosePolygon(); main_handler.ClonePolygon();" > <span>Clone Polygon</span></button>';
    html_str += '<button class="polygon test" type="button" onclick="GetPoits(1);" > <span>Clone Test</span></button>';
    html_str += '<button class="polygon" type="button"  onclick="GetPoits();" > <span>Clone Polygon</span></button>';
    html_str += '<button  onclick="CopyPolygon(1);" >Add Wheel</button>';
    html_str += '<button  onclick="CopyPolygon(2);" >1/2 Wheel</button>';
    html_str += '<button id="zoomin" class="labelBtnDraw" type="button" title="Zoom In" onclick="javascript:main_media.Zoom(1.15)"><img src="Icons/zoomin.png" width="28" height="38" /></button>';
    html_str += '<button id="zoomout" class="labelBtnDraw" type="button" title="Zoom Out" onclick="javascript:main_media.Zoom(1.0/1.15)"><img src="Icons/zoomout.png" width="28" height="38" /></button>';
    html_str += '<button xmlns="http://www.w3.org/1999/xhtml" id="erase" class="labelBtnDraw" type="button" title="Delete last segment" onclick="main_handler.EraseSegment()">';
    html_str += '<img src="Icons/erase.png" width="28" height="38" />         </button>';

    //html_str += '<p style="font-size:10px;line-height:100%"><a ' + 'onmouseover="main_canvas.ShadePolygons();" ' + 'onmouseout="main_canvas.RenderAnnotations();"> Reveal unlabeled pixels </a></p>';
    // Create "hide all" button:
    if (IsHidingAllPolygons) {
        html_str += '<p style="font-size:10px;line-height:100%"><a id="show_all_button" href="javascript:ShowAllPolygons();">Show all polygons</a></p>';
    } else {
        IsHidingAllPolygons = false;
        html_str += '<p style="font-size:10px;line-height:100%"><a id="hide_all_button" href="javascript:HideAllPolygons();">Hide all polygons</a></p>';
    }

    // Add parts-of drag-and-drop functionality:
    if (use_parts) {
        //html_str += '<p style="font-size:10px;line-height:100%" ondrop="drop(event, -1)" ondragenter="return dragEnter(event)" ondragover="return dragOver(event)">Drag a tag on top of another one to create a part-of relationship.</p>';
    }
    html_str += '<ol>';

    // Show list (of non-deleted objects)
    for (var i = 0; i < Npolygons; i++) {
        // get part level and read objects in the order given by the parts tree
        if (use_parts) {
            var ii = tree[0][i];
            var level = tree[1][i];
        } else {
            var ii = i;
            var level = 0;
        }

        var isDeleted = parseInt(LMgetObjectField(LM_xml, ii, 'deleted'));
        var is_currently_shown = true;

        if (is_currently_shown && (((ii < num_orig_anno) && ((view_Existing && !isDeleted) || (isDeleted && view_Deleted))) || ((ii >= num_orig_anno) && (!isDeleted || (isDeleted && view_Deleted))))) {
            // change the left margin as a function of part level

            html_str += '<div class="objectListLink" id="LinkAnchor' + ii + '" style="z-index:1; margin-left:' + (level * 1.5) + 'em" ';

            if (use_parts) {
                // define drag events (but only if the tool is allowed to use parts)
                html_str += 'draggable="true" ondragstart="drag(event, ' + ii + ')" ' +
                        'ondragend="dragend(event, ' + ii + ')" ' +
                        'ondrop="drop(event, ' + ii + ')" ' +
                        'ondragenter="return dragEnter(event)" ' +
                        'ondragover="return dragOver(event)">';
            }

            // change the icon for parts
            if (level == 0) {
                // if it is not a part, show square
                html_str += '<li>';
            } else {
                // if it is a part, use part style
                html_str += '<li class="children_tree">';
            }

            // show object name:
            html_str += '<a class="objectListLink"  id="Link' + ii + '" ' +
                    'href="javascript:main_handler.AnnotationLinkClick(' + ii + ');" ' +
                    'onmouseover="main_handler.AnnotationLinkMouseOver(' + ii + ');" ' +
                    'onmouseout="main_handler.AnnotationLinkMouseOut();" ';

            if (use_parts) {
                html_str += 'ondrop="drop(event, ' + ii + ')" ' +
                        'ondragend="dragend(event, ' + ii + ')" ' +
                        'ondragenter="return dragEnter(event)" ' +
                        'ondragover="return dragOver(event)"';
            }

            if (isDeleted) {
                html_str += ' style="color:#888888"><b>';
            } else {
                html_str += '>';
            }

            var obj_name = LMgetObjectField(LM_xml, ii, 'name');
            if (obj_name.length == 0 && !draw_anno) {
                html_str += '<i>[ Please enter name ]</i>';
            } else {
                html_str += obj_name;
            }

            if (isDeleted)
                html_str += '</b>';
            html_str += '</a>';

            var attributes = LMgetObjectField(LM_xml, ii, 'attributes');
            if (attributes.length > 0) {
                html_str += ' (' + attributes + ')';
            }

            html_str += '</li></div>';
        }
    }

    html_str += '</ol><p><br/></p></div>';

    // Attach annotation list to 'anno_anchor' DIV element:
    $('#anno_anchor').append(html_str);
    $('#Link' + add_parts_to).css('font-weight', 700); //
    $('#anno_list').scrollTop(scrollPos);
}
function CopyPolygon(type) {
   
    var polygons = [];
    if(type == 1){
        polygons.push('515.6765106523379,163.24796380090498 519.0775098981901,176.4268358785822 516.5267604638009,191.73133248491706 510.14988687782807,198.95845588235295 501.2222638574661,203.20970493966817 491.0192661199095,204.48507965686275 481.2413932880845,200.23383059954753 474.86451970211164,192.15645739064857 471.0383955505279,178.55246040723983 471.0383955505279,168.34946266968328 474.86451970211164,159.8469645550528 480.816268382353,153.04496606334843 488.04339177978886,150.06909172322776 493.9951404600302,148.79371700603318 499.94688914027154,148.79371700603318 508.02426234917044,153.04496606334843 513.1257612179487,158.1464649321267');
        
    }else{
        
        polygons.push('466.4742633345766,35.61357702349869 471.56191719507643,35.295598657217454 478.5574412532637,36.56751212234241 484.28105184632597,40.701230883998505 489.05072734054454,47.06079820962327 491.2765759045132,55.32823573293547 491.2765759045132,60.41588959343528 446.12364789257737,60.41588959343528 446.12364789257737,55.32823573293547 448.0315180902648,48.332711674748225 452.1652368519209,42.927079447967174 458.52480417754566,38.47538232002984');
    }
    for (var i = 0; i < polygons.length; i++) {

        var draw_x = [];
        var draw_y = [];
        var polygon = polygons[i];
        var points = polygon.split(" ");
        for (var ii = 0; ii < (points.length - 1); ii++) {
            var point = points[ii];
            var pointxy = point.split(",");
//            var xs = (LEFT + 1700 - pointxy[0]) * 3.068;
            draw_x.push(pointxy[0] * 3.068);
            draw_y.push(pointxy[1] * 3.068);

        }


        StartPolygon();
        ClosePolygon();
        main_handler.ClonePolygon(draw_x, draw_y, 'wheel', '');
       
    }


}
function GetPoits(test) {
    var polygons = [];
    $('#myCanvas_bg polygon').each(function () {
        polygons.push($(this).attr("points"));
    });
    var namePolygon = [];
    $('#myCanvas_bg title').each(function () {
        namePolygon.push($(this).text());

    });
    var name = $('#anno_list ol li a').map(function () {
        return  $(this).text();


    });
    var attrs = $('#anno_list ol li').map(function () {
        var res_final;
        var res = $(this).text();
        var n = res.search("_");
        if (n > 0) {

            var attr_1 = res.split("(");
            var attr_2 = attr_1[1].split(")");
            if (attr_2[0].search("01_") > 0) {
                res_final = attr_2[0].replace('01_', '02_');

            } else if (attr_2[0].search("02_") > 0) {
                res_final = attr_2[0].replace('02_', '01_');
            }
        } else if (res.search("01") > 0) {
            res_final = '02';
        } else {
            res_final = '01';
        }

        return res_final;

    });

//    console.log(name);
//    console.log(attrs);

    var arrayAttr = [];
    for (var i = 0; i < name.length; i++) {

        if (name[i] !== 'index-center' && name[i] !== 'index-top') {
            arrayAttr.push(attrs[i]);
        }
    }

    for (var i = 0; i < polygons.length; i++) {

        var draw_x = [];
        var draw_y = [];
        var polygon = polygons[i];
        var points = polygon.split(" ");
        for (var ii = 0; ii < (points.length - 1); ii++) {
            var point = points[ii];
            var pointxy = point.split(",");
            var xs = (LEFT + 1700 - pointxy[0]) * 3.068;
            draw_x.push(xs);
            draw_y.push(pointxy[1] * 3.068);

        }


        StartPolygon();
        ClosePolygon();
        main_handler.ClonePolygon(draw_x, draw_y, namePolygon[i], arrayAttr[i]);
        if (i == test) {
            break;
        }
    }
}

function StartPolygon() {
    draw_x = new Array();
    draw_y = new Array();
    if (!action_CreatePolygon)
        return;
    if (active_canvas != REST_CANVAS)
        return;

    // Write message to the console:
    console.log('LabelMe: Starting draw event...');

    // If we are hiding all polygons, then clear the main canvas:
    if (IsHidingAllPolygons) {
        for (var i = 0; i < main_canvas.annotations.length; i++) {
            main_canvas.annotations[i].hidden = true;
            main_canvas.annotations[i].DeletePolygon();
        }
    }

    // Lower opacity of rest of elements
    if (video_mode)
        $('#myCanvas_bg').css('opacity', 0.5);
    // Set active canvas:
    active_canvas = DRAW_CANVAS;
    if (video_mode)
        oVP.Pause();
    // Get (x,y) mouse click location and button.
    var x = 100;
    var y = 100;
//  var x = GetEventPosX(event);
//  var y = GetEventPosY(event);
//  var button = event.button;

    // If the user does not left click, then ignore mouse-down action.
//  if(button>1) return;

    // Move draw canvas to front:
    $('#draw_canvas').css('z-index', '0');
    $('#draw_canvas_div').css('z-index', '0');

    if (username_flag)
        submit_username();

    // Create new annotation structure:
    var numItems = $(LM_xml).children('annotation').children('object').length;
    draw_anno = new annotation(numItems);

    // Add first control point:
    draw_x.push(Math.round(x / main_media.GetImRatio()));
    draw_y.push(Math.round(y / main_media.GetImRatio()));

    // Draw polyline:
    draw_anno.SetDivAttach('draw_canvas');
    draw_anno.DrawPolyLine(draw_x, draw_y);

    // Set mousedown action to handle when user clicks on the drawing canvas:
    $('#draw_canvas_div').unbind();
    $('#draw_canvas_div').mousedown({obj: this}, function (e) {
        return DrawCanvasMouseDown(e.originalEvent);
    });
    if (bounding_box) {
        draw_anno.bounding_box = true;
        $('#draw_canvas_div').mousemove({obj: this}, function (e) {
            return DrawCanvasMouseMove(e.originalEvent);
        });

    }

    WriteLogMsg('*start_polygon');

}
function ClosePolygon() {
    if (active_canvas != DRAW_CANVAS)
        return;
    if (username_flag)
        submit_username();
    if ((object_choices != '...') && (object_choices.length == 1)) {
        main_handler.SubmitQuery();
        StopDrawEvent();
        return;
    }
    active_canvas = QUERY_CANVAS;

    // Move draw canvas to the back:
    document.getElementById('draw_canvas').style.zIndex = -2;
    document.getElementById('draw_canvas_div').style.zIndex = -2;

    // Remove polygon from the draw canvas:
    var anno = null;

    if (draw_anno) {
        console.log(draw_anno.first_point)
        draw_anno.DeletePolygon();
        anno = draw_anno;
        draw_anno = null;
    }
    // Move query canvas to front:
    document.getElementById('query_canvas').style.zIndex = 0;
    document.getElementById('query_canvas_div').style.zIndex = 0;

    // Set object list choices for points and lines:
    var doReset = SetObjectChoicesPointLine(draw_x.length);

    // Get location where popup bubble will appear:
    var pt = main_media.SlideWindow(Math.round(draw_x[0] * main_media.GetImRatio()), Math.round(draw_y[0] * main_media.GetImRatio()));

    // Make query popup appear.
    main_media.ScrollbarsOff();
    WriteLogMsg('*What_is_this_object_query');
    if (video_mode) {
        var html_str = "<b>Enter object name</b><br />";
        html_str += HTMLobjectBox("");

        if (use_attributes) {
            html_str += HTMLoccludedBox("");
            html_str += "<b>Enter attributes</b><br />";
            html_str += HTMLattributesBox("");
        }
        if (use_parts) {
            html_str += HTMLpartsBox("");
        }
        html_str += "<br />";

        // Done button:
        html_str += '<input type="button" value="Done" title="Press this button after you have provided all the information you want about the object." onclick="main_media.SubmitObject();" tabindex="0" />';

        // Undo close button:
        if (!bounding_box)
            html_str += '<input type="button" value="Undo close" title="Press this button if you accidentally closed the polygon. You can continue adding control points." onclick="UndoCloseButton();" tabindex="0" />';

        // Delete button:
        html_str += '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.WhatIsThisObjectDeleteButton();" tabindex="0" />';



        wait_for_input = 1;
        CreatePopupBubble(pt[0], pt[1], html_str, 'main_section');
    } else
        mkPopup(pt[0], pt[1]);

    // If annotation is point or line, then 
    if (doReset)
        object_choices = '...';

    // Render annotation:
    query_anno = anno;
    query_anno.SetDivAttach('query_canvas');
    FillPolygon(query_anno.DrawPolygon(main_media.GetImRatio(), draw_x, draw_y));
}

function handler() {

    // *******************************************
    // Public methods:
    // *******************************************


    this.StartAddParts = function () {

        if (select_anno) {
            var anno_id = select_anno.anno_id;
            this.SubmitEditLabel();
            add_parts_to = anno_id;
        } else {
            var anno = this.SubmitQuery();
            add_parts_to = anno.anno_id;
        }
        $('#Link' + add_parts_to).css('font-weight', 700);
        console.log(anno);
    }

    this.StopAddParts = function () {
        if (select_anno)
            this.SubmitEditLabel();
        else
            this.SubmitQuery();
        $('#Link' + add_parts_to).css('font-weight', 400);
        add_parts_to = null;
    }

    // Handles when the user presses the delete button in response to
    // the "What is this object?" popup bubble.
    this.WhatIsThisObjectDeleteButton = function () {
        submission_edited = 0;
        this.QueryToRest();
        if (scribble_canvas.scribblecanvas)
            scribble_canvas.cleanscribbles();
    };

    // Submits the object label in response to the edit/delete popup bubble.
    this.SubmitEditLabel = function () {

        if (scribble_canvas.scribblecanvas) {
            scribble_canvas.annotationid = -1;
            scribble_canvas.cleanscribbles();
        }
        submission_edited = 1;
        var anno = select_anno;

        // object name
        old_name = LMgetObjectField(LM_xml, anno.anno_id, 'name');
        if (document.getElementById('objEnter'))
            new_name = RemoveSpecialChars(document.getElementById('objEnter').value);
        else
            new_name = RemoveSpecialChars(adjust_objEnter);

        var re = /[a-zA-Z0-9]/;
        if (!re.test(new_name)) {
            alert('Please enter an object name');
            return;
        }

        if (use_attributes) {
            // occlusion field
            if (document.getElementById('occluded'))
                new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
            else
                new_occluded = RemoveSpecialChars(adjust_occluded);

            // attributes field
            if (document.getElementById('attributes'))
                new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
            else
                new_attributes = RemoveSpecialChars(adjust_attributes);
        }

        StopEditEvent();

        // Insert data to write to logfile:
        if (editedControlPoints)
            InsertServerLogData('cpts_modified');
        else
            InsertServerLogData('cpts_not_modified');

        // Object index:
        var obj_ndx = anno.anno_id;

        // Pointer to object:

        // Set fields:
        LMsetObjectField(LM_xml, obj_ndx, "name", new_name);
        LMsetObjectField(LM_xml, obj_ndx, "automatic", "0");

        // Insert attributes (and create field if it is not there):
        LMsetObjectField(LM_xml, obj_ndx, "attributes", new_attributes);


        LMsetObjectField(LM_xml, obj_ndx, "occluded", new_occluded);

        // Write XML to server:
        WriteXML(SubmitXmlUrl, LM_xml, function () {
            return;
        });

        // Refresh object list:
        if (view_ObjList) {
            RenderObjectList();
            ChangeLinkColorFG(anno.GetAnnoID());
        }
    };

    // Handles when the user presses the delete button in response to
    // the edit popup bubble.
    this.EditBubbleDeleteButton = function () {
        var idx = select_anno.GetAnnoID();

        if ((IsUserAnonymous() || (!IsCreator(LMgetObjectField(LM_xml, idx, 'username')))) && (!IsUserAdmin()) && (idx < num_orig_anno) && !action_DeleteExistingObjects) {
            alert('You do not have permission to delete this polygon');
            return;
        }

        if (idx >= num_orig_anno) {
            global_count--;
        }

        submission_edited = 0;

        // Insert data for server logfile:
        old_name = LMgetObjectField(LM_xml, select_anno.anno_id, 'name');
        new_name = old_name;
        WriteLogMsg('*Deleting_object');
        InsertServerLogData('cpts_not_modified');

        // Set <deleted> in LM_xml:
        LMsetObjectField(LM_xml, idx, "deleted", "1");

        // Remove all the part dependencies for the deleted object
        removeAllParts(idx);

        // Write XML to server:
        WriteXML(SubmitXmlUrl, LM_xml, function () {
            return;
        });

        // Refresh object list:
        if (view_ObjList)
            RenderObjectList();
        selected_poly = -1;
        unselectObjects(); // Perhaps this should go elsewhere...
        StopEditEvent();
        if (scribble_canvas.scribblecanvas) {
            scribble_canvas.annotationid = -1;
            scribble_canvas.cleanscribbles();
        }
    };

    // Handles when the user clicks on the link for an annotation.
    this.AnnotationLinkClick = function (idx) {
        if (adjust_event)
            return;
        if (video_mode && LMgetObjectField(LM_xml, idx, 'x', oVP.getcurrentFrame()).length == 0) {
            // get frame that is closest

            var frames = LMgetObjectField(LM_xml, idx, 't');
            var id1 = -1;
            var id2 = frames.length;
            var i = 0;
            while (i < frames.length) {
                if (frames[i] >= oVP.getcurrentFrame())
                    id2 = Math.min(id2, i);
                else
                    id1 = Math.max(id1, i);
                i++;
            }
            if (id2 < frames.length)
                oVP.GoToFrame(frames[id2]);
            else
                oVP.GoToFrame(frames[id1]);
        }
        if (active_canvas == REST_CANVAS)
            StartEditEvent(idx, null);
        else if (active_canvas == SELECTED_CANVAS) {
            var anno_id = select_anno.GetAnnoID();
            if (edit_popup_open) {
                StopEditEvent();
                ChangeLinkColorBG(idx);
            }
            if (idx != anno_id) {
                if (video_mode)
                    oVP.HighLightFrames(LMgetObjectField(LM_xml, idx, 't'), LMgetObjectField(LM_xml, idx, 'userlabeled'));
                ChangeLinkColorFG(idx);
                StartEditEvent(idx, null);
            }
        }
    };

    // Handles when the user moves the mouse over an annotation link.
    this.AnnotationLinkMouseOver = function (a) {
        if (active_canvas != SELECTED_CANVAS && video_mode && LMgetObjectField(LM_xml, a, 'x', oVP.getcurrentFrame()).length == 0) {
            ChangeLinkColorFG(a);
            oVP.HighLightFrames(LMgetObjectField(LM_xml, a, 't'), LMgetObjectField(LM_xml, a, 'userlabeled'));
            selected_poly = a;
        } else if (active_canvas != SELECTED_CANVAS) {
            selectObject(a);
            console.log('select');
        }

    };

    // Handles when the user moves the mouse away from an annotation link.
    this.AnnotationLinkMouseOut = function () {

        if (active_canvas != SELECTED_CANVAS) {
            unselectObjects();
        }
    };

    // Handles when the user moves the mouse over a polygon on the drawing
    // canvas.
    this.CanvasMouseMove = function (event, pp) {
        var x = GetEventPosX(event);
        var y = GetEventPosY(event);
        if (IsNearPolygon(x, y, pp))
            selectObject(pp);
        else
            unselectObjects();
    };

    // Submits the object label in response to the "What is this object?"
    // popup bubble. THIS FUNCTION IS A MESS!!!!
    this.SubmitQuery = function () {
        var nn;
        var anno;

        // If the attributes are active, read the fields.
        if (use_attributes) {
            // get attributes (is the field exists)
            if (document.getElementById('attributes'))
                new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
            else
                new_attributes = "";

            // get occlusion field (is the field exists)
            if (document.getElementById('occluded'))
                new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
            else
                new_occluded = "";
        }

        if ((object_choices != '...') && (object_choices.length == 1)) {
            nn = RemoveSpecialChars(object_choices[0]);
            var re = /[a-zA-Z0-9]/;
            if (!re.test(nn)) {
                alert('Please enter an object name');
                return;
            }
            active_canvas = REST_CANVAS;

            // Move draw canvas to the back:
            document.getElementById('draw_canvas').style.zIndex = -2;
            document.getElementById('draw_canvas_div').style.zIndex = -2;

            // Remove polygon from the draw canvas:
            var anno = null;
            if (draw_anno) {
                draw_anno.DeletePolygon();
                anno = draw_anno;
                draw_anno = null;
            }
        } else {
            nn = RemoveSpecialChars(document.getElementById('objEnter').value);
            var re = /[a-zA-Z0-9]/;
            if (!re.test(nn)) {
                alert('Please enter an object name');
                return;
            }
            anno = this.QueryToRest();
        }


        // Update old and new object names for logfile:
        new_name = nn;
        old_name = nn;

        submission_edited = 0;
        global_count++;

        // Insert data for server logfile:
        InsertServerLogData('cpts_not_modified');

        // Insert data into XML:
        var html_str = '<object>';
        html_str += '<name>' + new_name + '</name>';
        html_str += '<deleted>0</deleted>';
        html_str += '<verified>0</verified>';
        if (use_attributes) {
            html_str += '<occluded>' + new_occluded + '</occluded>';
            html_str += '<attributes>' + new_attributes + '</attributes>';
        }
        html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
        var ts = GetTimeStamp();
        if (ts.length == 20)
            html_str += '<date>' + ts + '</date>';
        html_str += '<id>' + anno.anno_id + '</id>';
        if (bounding_box) {
            html_str += '<type>'
            html_str += 'bounding_box';
            html_str += '</type>'
        }
        if (anno.GetType() == 1) {


            /*************************************************************/
            /*************************************************************/
            // Scribble: Add annotation to LM_xml:
            html_str += '<segm>';
            html_str += '<username>' + username + '</username>';

            html_str += '<box>';
            html_str += '<xmin>' + scribble_canvas.object_corners[0] + '</xmin>';
            html_str += '<ymin>' + scribble_canvas.object_corners[1] + '</ymin>';
            html_str += '<xmax>' + scribble_canvas.object_corners[2] + '</xmax>';
            html_str += '<ymax>' + scribble_canvas.object_corners[3] + '</ymax>';
            html_str += '</box>';

            html_str += '<mask>' + scribble_canvas.image_name + '</mask>';

            html_str += '<scribbles>';
            html_str += '<xmin>' + scribble_canvas.image_corners[0] + '</xmin>';
            html_str += '<ymin>' + scribble_canvas.image_corners[1] + '</ymin>';
            html_str += '<xmax>' + scribble_canvas.image_corners[2] + '</xmax>';
            html_str += '<ymax>' + scribble_canvas.image_corners[3] + '</ymax>';
            html_str += '<scribble_name>' + scribble_canvas.scribble_name + '</scribble_name>';
            html_str += '</scribbles>';

            html_str += '</segm>';
            html_str += '</object>';
            $(LM_xml).children("annotation").append($(html_str));
            /*************************************************************/
            /*************************************************************/
        } else {
            html_str += '<polygon>';
            html_str += '<username>' + username + '</username>';
            for (var jj = 0; jj < draw_x.length; jj++) {
                html_str += '<pt>';
                html_str += '<x>' + draw_x[jj] + '</x>';
                html_str += '<y>' + draw_y[jj] + '</y>';
                html_str += '</pt>';
            }
            html_str += '</polygon>';
            html_str += '</object>';
            $(LM_xml).children("annotation").append($(html_str));
        }


        if (!LMgetObjectField(LM_xml, LMnumberOfObjects(LM_xml) - 1, 'deleted') || view_Deleted) {
            main_canvas.AttachAnnotation(anno);
            anno.RenderAnnotation('rest');
        }

        /*************************************************************/
        /*************************************************************/
        // Scribble: Clean scribbles.
        if (anno.GetType() == 1) {
            scribble_canvas.cleanscribbles();
            scribble_canvas.scribble_image = "";
            scribble_canvas.colorseg = Math.floor(Math.random() * 14);
        }
        /*************************************************************/
        /*************************************************************/

        if (add_parts_to != null)
            addPart(add_parts_to, anno.anno_id);
        // Write XML to server:
        WriteXML(SubmitXmlUrl, LM_xml, function () {
            return;
        });

        if (view_ObjList)
            RenderObjectList();

        var m = main_media.GetFileInfo().GetMode();
        if (m == 'mt') {
            document.getElementById('object_name').value = new_name;
            document.getElementById('number_objects').value = global_count;
            document.getElementById('LMurl').value = LMbaseurl + '?collection=LabelMe&mode=i&folder=' + main_media.GetFileInfo().GetDirName() + '&image=' + main_media.GetFileInfo().GetImName();
            if (global_count >= mt_N)
                document.getElementById('mt_submit').disabled = false;
        }
        return anno;
    };

    // Handles when we wish to change from "query" to "rest".
    this.QueryToRest = function () {
        active_canvas = REST_CANVAS;

        // Move query canvas to the back:
        document.getElementById('query_canvas').style.zIndex = -2;
        document.getElementById('query_canvas_div').style.zIndex = -2;

        // Remove polygon from the query canvas:
        if (query_anno)
            query_anno.DeletePolygon();
        var anno = query_anno;
        query_anno = null;

        CloseQueryPopup();
        main_media.ScrollbarsOn();

        return anno;
    };

    // Handles when the user presses a key while interacting with the tool.
    this.KeyPress = function (event) {
        // Delete event: 46 - delete key; 8 - backspace key
        if (((event.keyCode == 46) || (event.keyCode == 8)) && !wait_for_input && !edit_popup_open && !username_flag) {
            // Determine whether we are deleting a complete or partially
            // complete polygon.
            if (!main_handler.EraseSegment())
                DeleteSelectedPolygon();
        }
        // 27 - Esc key
        // Close edit popup if it is open.
        if (event.keyCode == 27 && edit_popup_open)
            StopEditEvent();
    };

    // Handles when the user erases a segment.
    this.EraseSegment = function () {
        if (draw_anno && !draw_anno.DeleteLastControlPoint()) {
            submission_edited = 0;
            StopDrawEvent();
        }
        return draw_anno;
    };

    // *******************************************
    // Private methods:
    // *******************************************

    this.ClonePolygon = function (draws_x, draws_y, annot, attr) {

        var draw_x = draws_x;
        var draw_y = draws_y;
//        console.log(res);
//        console.log(valxy);
//        console.log(draw_x);
//        console.log(draw_y);
        var nn;
        var anno;

        // If the attributes are active, read the fields.
        if (use_attributes) {
            // get attributes (is the field exists)
            if (document.getElementById('attributes'))
                new_attributes = attr;
            else
                new_attributes = "";

            // get occlusion field (is the field exists)
            if (document.getElementById('occluded'))
                new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
            else
                new_occluded = "";
//            alert('is Here ');
        }

        if ((object_choices != '...') && (object_choices.length == 1)) {
            nn = RemoveSpecialChars(object_choices[0]);
            var re = /[a-zA-Z0-9]/;
            if (!re.test(nn)) {
                alert('Please enter an object name');
                return;
            }
            active_canvas = REST_CANVAS;

            // Move draw canvas to the back:
            document.getElementById('draw_canvas').style.zIndex = -2;
            document.getElementById('draw_canvas_div').style.zIndex = -2;

            // Remove polygon from the draw canvas:
            var anno = null;
            if (draw_anno) {
                draw_anno.DeletePolygon();
                anno = draw_anno;
                draw_anno = null;
            }
        } else {
//            nn = RemoveSpecialChars(document.getElementById('objEnter').value);
            nn = annot;
            var re = /[a-zA-Z0-9]/;
            if (!re.test(nn)) {
                alert('Please enter an object name');
                return;
            }
            anno = this.QueryToRest();
        }


        // Update old and new object names for logfile:
        new_name = nn;
        old_name = nn;

        submission_edited = 0;
        global_count++;

        // Insert data for server logfile:
        InsertServerLogData('cpts_not_modified');

        // Insert data into XML:
        var html_str = '<object>';
        html_str += '<name>' + new_name + '</name>';
        html_str += '<deleted>0</deleted>';
        html_str += '<verified>0</verified>';
        if (use_attributes) {
            html_str += '<occluded>' + new_occluded + '</occluded>';
            html_str += '<attributes>' + new_attributes + '</attributes>';
        }
        html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
        var ts = GetTimeStamp();
        if (ts.length == 20)
            html_str += '<date>' + ts + '</date>';
        html_str += '<id>' + anno.anno_id + '</id>';
        if (bounding_box) {
            html_str += '<type>'
            html_str += 'bounding_box';
            html_str += '</type>'
        }
        if (anno.GetType() == 1) {


            /*************************************************************/
            /*************************************************************/
            // Scribble: Add annotation to LM_xml:
            html_str += '<segm>';
            html_str += '<username>' + username + '</username>';

            html_str += '<box>';
            html_str += '<xmin>' + scribble_canvas.object_corners[0] + '</xmin>';
            html_str += '<ymin>' + scribble_canvas.object_corners[1] + '</ymin>';
            html_str += '<xmax>' + scribble_canvas.object_corners[2] + '</xmax>';
            html_str += '<ymax>' + scribble_canvas.object_corners[3] + '</ymax>';
            html_str += '</box>';

            html_str += '<mask>' + scribble_canvas.image_name + '</mask>';

            html_str += '<scribbles>';
            html_str += '<xmin>' + scribble_canvas.image_corners[0] + '</xmin>';
            html_str += '<ymin>' + scribble_canvas.image_corners[1] + '</ymin>';
            html_str += '<xmax>' + scribble_canvas.image_corners[2] + '</xmax>';
            html_str += '<ymax>' + scribble_canvas.image_corners[3] + '</ymax>';
            html_str += '<scribble_name>' + scribble_canvas.scribble_name + '</scribble_name>';
            html_str += '</scribbles>';

            html_str += '</segm>';
            html_str += '</object>';
            $(LM_xml).children("annotation").append($(html_str));
            /*************************************************************/
            /*************************************************************/
        } else {
            html_str += '<polygon>';
            html_str += '<username>' + username + '</username>';
            for (var jj = 0; jj < draw_x.length; jj++) {
                html_str += '<pt>';
                html_str += '<x>' + draw_x[jj] + '</x>';
                html_str += '<y>' + draw_y[jj] + '</y>';
                html_str += '</pt>';
            }
            html_str += '</polygon>';
            html_str += '</object>';
            $(LM_xml).children("annotation").append($(html_str));
        }


        if (!LMgetObjectField(LM_xml, LMnumberOfObjects(LM_xml) - 1, 'deleted') || view_Deleted) {
            main_canvas.AttachAnnotation(anno);
            anno.RenderAnnotation('rest');
        }

        /*************************************************************/
        /*************************************************************/
        // Scribble: Clean scribbles.
        if (anno.GetType() == 1) {
            scribble_canvas.cleanscribbles();
            scribble_canvas.scribble_image = "";
            scribble_canvas.colorseg = Math.floor(Math.random() * 14);
        }
        /*************************************************************/
        /*************************************************************/

        if (add_parts_to != null)
            addPart(add_parts_to, anno.anno_id);
        // Write XML to server:
        WriteXML(SubmitXmlUrl, LM_xml, function () {
            return;
        });

        if (view_ObjList)
            RenderObjectList();

        var m = main_media.GetFileInfo().GetMode();
        if (m == 'mt') {
            document.getElementById('object_name').value = new_name;
            document.getElementById('number_objects').value = global_count;
            document.getElementById('LMurl').value = LMbaseurl + '?collection=LabelMe&mode=i&folder=' + main_media.GetFileInfo().GetDirName() + '&image=' + main_media.GetFileInfo().GetImName();
            if (global_count >= mt_N)
                document.getElementById('mt_submit').disabled = false;
        }
        return anno;
    };


}