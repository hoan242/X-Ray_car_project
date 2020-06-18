
    // 사용 자료 구조
    class HNode {
        //default constructor
        constructor(id, type, data, parent, isChecked = false) {
            this.id = id;
            this.type = type;
            this.data = data;
            this.parent = parent;
            this.isChecked = isChecked
            this.child = [];
        }
    }
    class Hierarchy {
        constructor() {
            this.root = null;
            this.size = 0;
        }
        /**
         * 너비우선 탐색을 이용하여 주어진 id를 가진 노드를 반환하는 함수
         * @param id 탐색할 id
         * @returns {HNode} 탐색된 HNode
         */
        searchById(id) {
            if (this.root === null)
                return null;
            let currNode;
            let queue = [];
            queue.push(this.root);
            while (queue.length > 0) {
                currNode = queue.shift();
                if (currNode.id === id) // 탐색 성공
                    return currNode;
                else {
                    for (let i = 0; i < currNode.child.length; ++i)
                        queue.push(currNode.child[i]);
                }
            }
            return null;
        }

        /**
         * 주어진 id의 자식노드를 반환하는 함수
         * 너비우선탐색 활용
         * @param id 부모노드의 id
         * @returns {[]} 자식노드 리스트
         */
        getChildrenById(id) {
            let targetNode = this.searchById(id);
            if (targetNode===null)
                return [];
            let childList = [];
            let currNode;
            let queue = [];
            queue.push(targetNode);
            while (queue.length > 0) {
                currNode = queue.shift();
                childList.push(currNode.id);
                for (let i=0; i<currNode.child.length; ++i)
                    queue.push(currNode.child[i]);
            }
            return childList;
        }

        /**
         * 부모 노드의 id를 받아 자식값으로 새로운 노드를 삽입하는 함수
         * @param parentId 노드를 넣을 부모노드의 id값
         * @param node 삽입할 노드
         * @returns {boolean} 삽입 성공시 true, 실패시 false
         */
        insert(parentId, node) {
            if (this.root === null) {
                this.root = node;
                return true;
            }
            let tempNode = this.searchById(node.id);
            // 기존에 있는 node일때
            if (tempNode!==null) {
                tempNode.data = node.data;
                tempNode.type = node.type;
                return true;
            }
            let parent = this.searchById(parentId);
            // 해당하는 parent가 없을 때
            if (parentId !== -1 && parent === null)
                return false;
            if (attribute[parent.type] > attribute[node.type]) {
                console.log("Can't insert child sub-attribute(add, del) into root type");
                return false;
            }
            else {
                node.parent = parentId;
                parent.child.push(node);
                this.size++;
                return true;
            }
        }

        /**
         * 주어진 HNode 를 지정된 위치로 이동하는 함수
         * @param targetId 이동될 노드의 id
         * @param destId 목적지 노드의 id
         * @returns {boolean} 이동 성공시 true, 실패시 false
         */
        move(targetId, destId) {
            if (this.root === null)
                return false;
            let targetNode = this.remove(targetId);
            if (targetNode!==null) {
                if (this.insert(destId, targetNode)) {
                    return true;
                }
                else {
                    this.insert(targetNode.parent, targetNode);
                    return false;
                }
            }
            return false;
        }

        /**
         * 주어진 HNode 를 제거하는 함수
         * @param targetId 제거할 HNode 의 id
         */
        remove(targetId) {
            let targetNode = this.searchById(targetId);
            if (targetNode === null)
                return targetNode;
            else if (targetNode.parent!==null) {
                let parentNode = this.searchById(targetNode.parent);
                parentNode.child = parentNode.child.filter(child => child.id !== targetId);
            }
            else {// 최상단 노드일때(부모노드가 없을때)
                this.root = null;
            }
            return targetNode;
        }
        /**
         * category structure 구조를 json 형식으로 만들어주는 함수
         */
        makeStructure() {
            if (this.root === null) {
                return [];
            }
            let hnode = this.root;
            let result = [];
            let queue = [];
            let visitIds = [];

            let addCount = 0;
            let addList = [];
            let delCount = 0;
            let delList = [];

            queue.push(hnode);

            while(queue.length > 0) {
                let nodeObj = queue.shift();
                // 포인트 가져오기
                if (nodeObj.type !== 'GROUP') {
                    let point = polygonLayer.findOne(node => {
                        return node.id() === nodeObj.id && node.getClassName()==='Group'
                    }).findOne('Line').points();

                    let tempPoint = [];
                    for (let k = 0; k < point.length / 2; k++) {
                        tempPoint.push((point[2 * k] + layerSTDLocation_X) / zoomLevel * widthRate);
                        tempPoint.push((point[2 * k + 1] + layerSTDLocation_Y) / zoomLevel * heightRate);
                    }
                    result.push({
                        "id": nodeObj.id,
                        "parentId": nodeObj.parent,
                        "object_no": objectNoDict[nodeObj.data],
                        "name": nodeObj.data,
                        "points": tempPoint,
                        "objectType": nodeObj.type
                    })
                }
                visitIds.push(nodeObj.id);
                let children = nodeObj.child;
                for (let i = 0; i < children.length; i++) {
                    if (!visitIds.includes(children[i].id)) {
                        visitIds.push(children[i].id);
                        queue.push(children[i]);
                    }
                }
            }
            return result;
        }

        /**
         * 오브젝트-리스트의 값을 보여주기 위해 깊이우선탐색으로 순회하는 함수
         * 재귀로 구현
         * @returns {String} 순회 결과로 나온 html 문자열
         */
        DFSTraversal() {
            if (this.root === null) {
                return "";
            }
            let result = "";
            //깊이 탐색
            let curr = this.root;
            result = this.DFSTraversalRecursion(curr, result, 0);
            return result;
        }
        DFSTraversalRecursion(hnode, result, level) {
            let textDecorate;
            let group = polygonLayer.findOne(node => {
                return hnode.id === node.id() && node.getClassName() === 'Group'
            });
            if (typeof (group)=="undefined") {
                result += "<ul class='ul-object'>";
                textDecorate = "text-decoration:none";
            }
            else if (group.name()==="directory") {
                result += "<ul class='ul-directory'>";
                textDecorate = "text-decoration:none";
            }
            else {
                result += "<ul class='ul-object'>";
                if (!group.isVisible())
                    textDecorate = "text-decoration:line-through";
                else
                    textDecorate = "text-decoration:none";
            }
            if (attribute[hnode.type] === 0) {
                result += "<li style='margin-left: " + level*12 +"px'><a class='category' draggable='true' ondrop='drop(event)' ondragover='allowDrop(event)' ondragstart='dragStart(event)'" +
                    "id=" + hnode.id + " style='" + textDecorate + "'>" + hnode.data + "</a></li>";
            }
            else if (hnode.type==='BBOX' || attribute[hnode.type] > 1) {
                result += "<li style='margin-left: " + level*12 +"px'><a class='category' draggable='true' ondrop='drop(event)' ondragover='allowDrop(event)' ondragstart='dragStart(event)'" +
                    "id=" + hnode.id + " style='" + textDecorate + "'>" + hnode.data + " (" + hnode.type + ")</a><button class='btn-edit'><img src=\"/dcamp/resources/img/edit-on.png\" alt=\"edit\"></button><button class='btn-del'><img src=\"/dcamp/resources/img/delete-on.png\" alt=\"edit\"></button>" +
                    "<input type=\"checkbox\" class=\"rejectCheckBox\" name=\"rejectObject\" data-obj=\"" + hnode.data + " (" + hnode.type + ")\"" + (hnode.isChecked ? "checked=\"checked\"" : "") + "></li>";
            }
            else {
                result += "<li style='margin-left: " + level*12 + "px'><a class='category' draggable='true' ondrop='drop(event)' ondragover='allowDrop(event)' ondragstart='dragStart(event)' " +
                    "id=" + hnode.id + " style='" +textDecorate + "'>" + hnode.data + "</a><button class='btn-edit'><img src=\"/dcamp/resources/img/edit-on.png\" alt=\"edit\"></button><button class='btn-del'><img src=\"/dcamp/resources/img/delete-on.png\" alt=\"edit\"></button></a>" +
                    "<input type=\"checkbox\" class=\"rejectCheckBox\" name=\"rejectObject\" data-obj=\"" + hnode.data + " (" + hnode.type + ")\"" + (hnode.isChecked ? "checked=\"checked\"" : "") + "></li>";
            }
            if (hnode.child.length < 1) {
                result += "</ul>";
                return result;
            }
            for (let i = 0; i < hnode.child.length; ++i)
                result = this.DFSTraversalRecursion(hnode.child[i], result, level+1);
            return result;
        }
    }

    // Field
    const MAXIMUM_WIDTH = 1000;  // 이미지 최대 너비
    const MAXIMUM_HEIGHT = 700; // 이미지 최대 높이
    const OPACITY_IN = 0.7; // opacity 최대
    const OPACITY_OUT = 0.3; // opacity 최소
    const ZOOM_RATE = 1.2;
    const MAX_HISTORY_SIZE = 10;
    const MOVE_UnitX = 30;
    const MOVE_UnitY = 30;
    // 색상 정보
    const fillColorList = ['#FFBB00', '#ABF200', '#26FFED', '#7655DB', '#5F00FF', '#FFE400','#0054FF']; //polygon 색상값
    // const fillColorList = ['#1DDB16']; //polygon 색상값
    const strokeColorList = ['#FF5E00', '#1DDB16', '#3DB7CC', '#5F00FF', '#FF007F', '#FFBB00', '#0100FF'];  //line 색상값
    // const strokeColorList = ['#1DDB16'];  //line 색상값
    const undefinedColor = {'stroke': 'FF0000'};
    /**
     * 오브젝트의 우선순위 변수
     * GROUP: 0, 오브젝트들의 그룹
     * ROOT, BBOX: 1, 오브젝트
     * ADD, DEL: 2, Attribute 타입
     * @type {{GROUP: number, ROOT: number, ADD: number, DEL: number}}
     */
    const attribute = {
        GROUP: 0,
        ROOT: 1,
        BBOX: 1,
        ADD: 2,
        DEL: 2,
    };

    let totalZoomRate = 1;
    let selectedPointList = [];
    let currPoint, prePoint;
    let currGroupId;
    let layerSTDLocation_X = 0;
    let layerSTDLocation_Y = 0;
    let imgWidth = 1;
    let imgHeight = 1;
    let isDrawEnd = true;
    let color_index = 0;
    let objectNoDict = {};
    let lastSelectedGroupId;
    let keyState = {
        'ctrl':false,
        'alt': false,
        'mousedown': false,
        'delete': false,
        'shift': false,
        'z': false
    };
    let zoomLevel = 1;
    let selectGroupId;
    let lastGroupId = 0;
    let rate;
    let history = [];

    let hierarchy = new Hierarchy();
    hierarchy.insert(-1, new HNode(-1, 'GROUP', 'root', null)); // Hierarchy 초기값

    imgWidth = 2048;
    imgHeight = 1536;

    // 이미지 크기 조정
    if (imgWidth > MAXIMUM_WIDTH || imgHeight > MAXIMUM_HEIGHT) {
        if (imgWidth > imgHeight) {
            rate = MAXIMUM_WIDTH / imgWidth;
            imgHeight = imgHeight * rate;
            imgWidth = MAXIMUM_WIDTH;
        }
        else {
            rate = MAXIMUM_HEIGHT / imgHeight;
            imgWidth = imgWidth * rate;
            imgHeight = MAXIMUM_HEIGHT;
        }
    }
    let widthRate = 2048;
    widthRate /= imgWidth;
    let heightRate = 1536;
    heightRate /= imgHeight;

    // 통신 관련 함수
    let setImageObjectMap = function(imgNo, json, callback){
        $.getJSON("setImageObjectMap.ajax",{"imgNo":imgNo,"json":json},function(resultObj){
            if(resultObj.ajaxResult.status==="success"){
                callback(resultObj);
            }else{
                alert("error");
                return false;
            }
        });
    };

    let setImgPointsJson = function(imgNo, json, callback){
        $.post("setImgPointsJson.ajax",{"imgNo":imgNo,"json":json},function(resultObj){
            if(resultObj.ajaxResult.status==="success"){
                callback(resultObj);
            }else{
                alert("error");
                return false;
            }
        }, "json");
    };

    let getImageObjectMap = function(imgNo, callback){
        $.getJSON("getImageObjectMap.ajax",{"img_no":imgNo},function(resultObj){
            if(resultObj.ajaxResult.status==="success"){
                callback(resultObj);
            }else{
                alert("error");
                return false;
            }
        });
    };

    let getObjectListByImgNo = function(imgNo, callback){
        $.getJSON("getObjectListByImgNo.ajax",{"img_no":imgNo},function(resultObj){
            if(resultObj.ajaxResult.status==="success"){
                callback(resultObj);
            }else{
                alert("error");
                return false;
            }
        });
    };

    getObjectListByImgNo(1258, function(resultObj){
        let data = resultObj.ajaxResult.data;
        let html = "";
        let objNo, object_eng_nm;
        for (let i = 0; i < data.length; i++) {
            objNo = data[i].object_no;
            object_eng_nm = data[i].object_eng_nm;
            objectNoDict[object_eng_nm] = objNo;
            html += "<option data-objectno='"+objNo+"'>"+object_eng_nm+"</option>";
        }
        $("#object-name").html(html);
    });

    // 다이얼로그 관련 함수
    /**
     * Attribute 다이얼로그에서 저장을 위한 다이얼로그 창을 띄우는 함수
     */
    function popUpAttributeDialogue() {
        let objectTypeName = polygonLayer.findOne("#" + lastSelectedGroupId).name();
        if (objectTypeName === 'rectangle') {
            $('#select-attribute').find('option').remove();
            $('#select-attribute').append(new Option('BBOX', 'BBOX'))
        }
        else {
            $('#select-attribute').find('option').remove();
            $('#select-attribute').append(new Option('ROOT', 'ROOT'))
            $('#select-attribute').append(new Option('ADD', 'ADD'));
            $('#select-attribute').append(new Option('DEL', 'DEL'));
        }
        $("#my-dialog, #dialog-background").toggle();
    }

    /**
     * Attribute 다이얼로그 창을 닫는 함수
     */
    function closeDialogue() {
        $("#my-dialog, #dialog-background").toggle();
    }

    /**
     * Attribute 다이얼로그 창에서 객체를 삭제하는 함수
     */
    function deleteAttribute() {
        deleteGroup(lastSelectedGroupId);
        reloadObjectList();
        categoryFunction();
        polygonLayer.batchDraw();
        $("#my-dialog, #dialog-background").toggle();
    }

    /**
     * Attribute 정보를 저장하는 함수
     */
    function saveAttribute() {
        let value0 = $('#object-name').val();
        let value1 = $('#select-attribute').val();
        if (value0!=='') {
            let rect, poly, points;
            if (!lastSelectedGroupId.includes("tmp"))
                lastSelectedGroupId = Number(lastSelectedGroupId);
            let newNode = new HNode(lastSelectedGroupId, value1, value0, -1);
            hierarchy.insert(-1, newNode);
            let children = hierarchy.getChildrenById(newNode.id);
            for (let i=0; i<children.length; ++i) {
                hierarchy.searchById(children[i]).data = newNode.data;
                rect = polygonLayer.getChildren(function (node) {
                    return node.id() === children[i] && node.name() === 'rectangle'
                })[0];
                if (typeof (rect) !== 'undefined') {
                    let text = rect.findOne('Text');
                    let bbox = rect.findOne('Rect');
                    text.text(newNode.data);
                    text.stroke(strokeColorList[color_index % strokeColorList.length]);
                    text.visible(false);
                    bbox.stroke(strokeColorList[color_index++ % strokeColorList.length]);
                    bbox.opacity(0.5);
                    points = [bbox.x(), bbox.y(), bbox.width(), bbox.height()];
                }
                poly = polygonLayer.getChildren(function (node) {
                    return node.id() === children[i] && node.name() === 'polygon'
                })[0];
                if (typeof (poly) !== 'undefined') {
                    let line =  poly.getChildren(function (node) {
                        return node.getClassName()==='Line'
                    })[0];
                    line.stroke(strokeColorList[color_index % strokeColorList.length]);
                    line.fill(fillColorList[color_index++ % fillColorList.length]);
                    line.opacity(0.3);
                    points = line.points();
                }
                let tempPoint = [];
                for (let k = 0; k < points.length / 2; k++) {
                    tempPoint.push((points[2 * k] + layerSTDLocation_X) / zoomLevel * widthRate);
                    tempPoint.push((points[2 * k + 1] + layerSTDLocation_Y) / zoomLevel * heightRate);
                }
                let result = [{
                    "id": 'null',
                    "parentId": -1,
                    "object_no": objectNoDict[newNode.data],
                    "name": newNode.data,
                    "points": tempPoint,
                    "objectType": newNode.type
                }]
                let imgNo = $("#imgNo").val();
                setImageObjectMap(imgNo, JSON.stringify(result), function(resultObj){
                    let newId = resultObj.ajaxResult.data;
                    let node = hierarchy.searchById(lastSelectedGroupId)
                    node.id = newId;
                    polygonLayer.findOne("#" + lastSelectedGroupId).id(newId);
                    reloadObjectList();
                    categoryFunction();
                    // polygonLayer.batchDraw();
                });
            }
            reloadObjectList();
            categoryFunction();
            polygonLayer.batchDraw();
        }
        $("#my-dialog, #dialog-background").toggle();
    }

    // 오브젝트-리스트 관련 함수
    /**
     * 오브젝트-리스트를 재호출(reload) 하는 함수
     */
    function reloadObjectList() {
        let objectList = $('#div-objectList');
        let html = hierarchy.DFSTraversal();
        objectList.empty();
        objectList.append(html);
        $('.btn-edit').dblclick(function () {
            if (isDrawEnd) {
                lastSelectedGroupId = $(this).siblings().attr('id');
                popUpAttributeDialogue();
            }
        });
        $('.btn-del').dblclick(function () {
            let groupId = parseInt($(this).siblings().attr('id'));
            deleteGroup(groupId);
            reloadObjectList();
            categoryFunction();
            polygonLayer.batchDraw();
        })
    }

    /**
     * 오브젝트-리스트의 기능을 재설정 하는 함수
     */
    function categoryFunction() {
        let category = $(".category");
        category.mouseover(function (event) {
            let targetGroupId = event.target.id;
            if (targetGroupId < 0)  //return if group is root
                return;
            let group = polygonLayer.findOne("#" + targetGroupId);
            if (typeof (group)==="undefined")
                throw "Invalid group id";
            let groupList = [group];
            let childGroupIdList = hierarchy.getChildrenById(group.id());
            for (let i=0; i<childGroupIdList.length; ++i) {
                groupList.push(polygonLayer.findOne(node => {
                    return node.id() === childGroupIdList[i] && node.getClassName()==='Group'
                }));
            }
            for (let i = 0; i < groupList.length; i++) {
                if (hierarchy.searchById(groupList[i].id()).data !== "undefined") {
                    if (groupList[i].name() === 'polygon') {
                        groupList[i].findOne('Line').opacity(0.7);
                    }
                    else if (groupList[i].name() === 'rectangle') {
                        groupList[i].findOne('Rect').opacity(1);
                        groupList[i].findOne('Text').visible(true);
                    }
                }
            }
            polygonLayer.batchDraw();
        });
        category.mouseout(function (event) {
            let targetGroupId = event.target.id;
            if (targetGroupId < 0)  // return if group is root
                return;
            let group = polygonLayer.findOne("#" + targetGroupId);
            if (typeof (group)==="undefined")
                throw "Invalid group id";
            let groupList = [group];
            let childGroupIdList = hierarchy.getChildrenById(group.id());
            for (let i=0; i<childGroupIdList.length; ++i) {
                groupList.push(polygonLayer.findOne(node => {
                    return node.id() === childGroupIdList[i] && node.getClassName()==='Group'
                }));
            }
            for (let i = 0; i < groupList.length; i++) {
                if (groupList[i].name()==='polygon' && hierarchy.searchById(groupList[i].id()).data!=='undefined') {
                    if (!groupList[i].findOne('Circle').draggable()) {
                        groupList[i].findOne('Line').opacity(0.3);
                    }
                }
                else if (groupList[i].name()==='rectangle' && hierarchy.searchById(groupList[i].id()).data!=='undefined') {
                    groupList[i].findOne('Rect').opacity(0.5);
                    groupList[i].findOne('Text').visible(false);
                }
            }
            polygonLayer.batchDraw();
        });
        category.click(function (event) {
            let targetGroupId = event.target.id
            let group = polygonLayer.findOne("#" + targetGroupId);
            let child = group.getChildren()[0];
            setDrag(child);
            lastSelectedGroupId = group.id();
            polygonLayer.batchDraw();
        });
        category.dblclick(function (event) {
            let targetGroupId = event.target.id;
            let group = polygonLayer.findOne("#" + targetGroupId);
            if (typeof (group)==="undefined" || group.name()==="directory")
                return ;
            if (group.isVisible()) {
                $(event.target).css('text-decoration', 'line-through');
                group.hide();
            }
            else {
                $(event.target).css('text-decoration','none');
                group.show();
            }
            polygonLayer.batchDraw();
        });
    }

    /**
     * Group(BBOX)에 point를 추가하는 함수
     * @param group point를 추가할 그룹
     * @param x 추가할 point의 x좌표
     * @param y 추가할 point의 y좌표
     * @param name point의 이름 (ex. rightUp, leftDown ...)
     * @return Konva.Group point가 추가된 Group
     */
    function addRectPoint(group, x, y, name) {
        let anchor = new Konva.Circle({
            x: x,
            y: y,
            fill: '#FFFFFF',
            radius: 6,
            opacity: 0.5,
            draggable: false,
            name: name,
            dragBoundFunc: function (pos) {
                let newX = pos.x < imageLayer.width() ? pos.x : imageLayer.width();
                newX = pos.x > 0 ? pos.x : 0;
                let newY = pos.y < imageLayer.height() ? pos.y : imageLayer.height();
                newY = pos.y > 0 ? pos.y : 0;
                return {x: newX, y: newY}
            }
        });
        anchor.hide();
        anchor.on('mouseover', function (event) {
            let target = event.target;
            target.stroke('#000000');
            target.strokeWidth(3);
            stage.container().style.cursor = 'pointer';
            polygonLayer.batchDraw();
        });
        anchor.on('mouseout', function (event) {
            let target = event.target;
            target.strokeWidth(0);
            stage.container().style.cursor = 'default';
            polygonLayer.batchDraw();
        });
        anchor.on('dragmove', function (event) {
            let target = event.target.getParent();
            let pointLeftUp = target.findOne('.leftUp');
            let pointRightDown = target.findOne('.rightDown');
            let pointLeftDown = target.findOne('.leftDown');
            let pointRightUp = target.findOne('.rightUp');
            let rect = target.findOne('Rect');
            let text = target.findOne('Text');
            if (event.target.name()==='leftUp' || event.target.name()==='rightDown') {
                pointLeftDown.x(pointLeftUp.getPosition().x);
                pointLeftDown.y(pointRightDown.getPosition().y);
                pointRightUp.x(pointRightDown.getPosition().x);
                pointRightUp.y(pointLeftUp.getPosition().y);
            }
            else {
                pointLeftUp.x(pointLeftDown.getPosition().x);
                pointRightDown.y(pointLeftDown.getPosition().y);
                pointRightDown.x(pointRightUp.getPosition().x);
                pointLeftUp.y(pointRightUp.getPosition().y);
            }
            if (pointRightDown.getPosition().x - pointLeftUp.getPosition().x < 0) {
                rect.x(pointRightDown.getPosition().x);
                rect.width(pointLeftUp.getPosition().x - pointRightDown.getPosition().x);
            }
            else {
                rect.x(pointLeftUp.getPosition().x);
                rect.width(pointRightDown.getPosition().x - pointLeftUp.getPosition().x);
            }
            if (pointRightDown.getPosition().y - pointLeftUp.getPosition().y < 0) {
                rect.y(pointRightDown.getPosition().y);
                rect.height(pointLeftUp.getPosition().y - pointRightDown.getPosition().y);
            }
            else {
                rect.y(pointLeftUp.getPosition().y);
                rect.height(pointRightDown.getPosition().y - pointLeftUp.getPosition().y);
            }
            text.x(rect.x() + 3);
            text.y(rect.y() + 3);
            isDrawEnd = true;
            dragBox.visible(false);
            dragBoxLayer.batchDraw();
            polygonLayer.batchDraw();
        });
        group.add(anchor);
        return group;
    }


    /**
     * polygon type group 에 점타입을 추가하는 함수
     * @param group 점이 추가될 그룹
     * @param x 점의 x좌표
     * @param y 점의 y좌표
     * @param draggable
     * @returns Konva.Group 값이 추가된 그룹
     **/
    function addPolyPoint(group, x, y, draggable=false, name=null) {
        let anchor = new Konva.Circle({
            x: x,
            y: y,
            name: name,
            fill: '#FF0000',
            radius: 6,
            opacity: 0.5,
            draggable: draggable,
            dragBoundFunc: function (pos) {
                let newX = pos.x < imageLayer.width() ? pos.x : imageLayer.width();
                newX = pos.x > 0 ? pos.x : 0;
                let newY = pos.y < imageLayer.height() ? pos.y : imageLayer.height();
                newY = pos.y > 0 ? pos.y : 0;
                return {x: newX, y: newY}
            }
        });
        anchor.on('click', function () {
            if (anchor.name()==='first') {
                isDrawEnd = true;
                lastSelectedGroupId = anchor.getParent().id();
                polygonLayer.findOne('#' + lastSelectedGroupId).findOne('.first').name("");
                history = []
                // 끝났을 경우 다이얼로그 창 띄우기
                popUpAttributeDialogue();
            }
        });
        anchor.on('mouseover', function (event) {
            let target = event.target;
            if (isDrawEnd || target.name() !== 'first') {
                if (target.name() !== 'selected') {
                    target.stroke('#47C83E');
                    target.strokeWidth(3);
                    target.opacity(0.7);
                }
            }
            else {
                target.stroke('#47C83E');
                target.strokeWidth(3);
                target.opacity(1);
            }
            stage.container().style.cursor = 'pointer';
            polygonLayer.batchDraw();
        });
        anchor.on('mouseout', function (event) {
            let target = event.target;
            if (isDrawEnd || target.name() !== 'first') {
                if (target.name() !== 'selected') {
                    target.strokeWidth(0);
                    target.opacity(0.3);
                }
            }
            else {
                target.stroke('#47C83E');
                target.strokeWidth(3);
                target.opacity(0.7);
            }
            stage.container().style.cursor = 'default';
            polygonLayer.batchDraw();
        });
        anchor.on('dragmove', function (event) {
            let target = event.target;
            // 최대치를 넘어갈 시 최대값으로 대체
            target.x(Math.min(target.x(), imgWidth));
            target.y(Math.min(target.y(), imgHeight));
            let targetGroup = target.getParent();
            let line = targetGroup.findOne('Line');
            let pointList = [];
            let circleList = targetGroup.find('Circle');
            for (let i = 0; i < circleList.length; ++i) {
                pointList.push(circleList[i].x());
                pointList.push(circleList[i].y());
            }
            line.points(pointList);
            dragBox.visible(false);
            dragBoxLayer.batchDraw();
            polygonLayer.batchDraw();
        });
        group.add(anchor);
        return group;
    }


    /**
     * 그룹에 선을 추가하는 함수
     * @param group 선이 추가될 그룹
     * @returns Konva.Group 값이 추가된 그룹
     */
    function addLine(group) {
        let anchor = new Konva.Line({
            stroke: '#FF0000',
            strokeWidth: 5,
            opacity: 0.3,
        });
        anchor.on('mouseover', function () {
            if (isDrawEnd && hierarchy.searchById(group.id()).data!=="undefined") {
                this.opacity(0.7);
                polygonLayer.batchDraw();
            }
        });
        anchor.on('mouseout', function () {
            if (isDrawEnd && hierarchy.searchById(group.id()).data!=="undefined") {
                this.opacity(0.3);
                polygonLayer.batchDraw();
            }
        });
        anchor.on('click', function (event) {
            // Draw 상태가 끝났고 이동중이 아닌 경우에만 이벤트 작동
            if (isDrawEnd && !keyState.shift) {
                let targetGroupId = event.target.getParent().id();
                let group = polygonLayer.findOne("#" + targetGroupId);
                // 선택된 Group을 최상단으로 변경
                let indexList = [];
                let groupList = polygonLayer.find('Group');
                groupList.each(function (g) {
                    indexList.push(g.getZIndex());
                });
                group.setZIndex(Math.max.apply(null, indexList)); // 최상단으로 변경

                let child = group.getChildren()[0];
                setDrag(child);
                lastSelectedGroupId = group.id();
                polygonLayer.batchDraw();
            }
        });
        group.add(anchor);
        return group;
    }
    /**
     * 선택한 개체를 수정상태로 변경하는 함수
     */
    function setDrag(target) {
        function setGroupFunction(target) {
            let parentTarget = target.getParent();
            let groupList = polygonLayer.find('Group');
            let indexList = [];
            groupList.each(function (g) {
                indexList.push(g.getZIndex());
            });
            parentTarget.getZIndex(Math.max.apply(null, indexList)); // 최상단으로 변경
            selectGroupId = parentTarget.id();
            let circleList = parentTarget.find('Circle');
            if (parentTarget.name()==='polygon' && hierarchy.searchById(target.parent.id()).data !== "undefined") {
                if (!circleList[0].draggable()) {
                    target.opacity(0.7);
                    target.on('mouseout', function () {
                        this.opacity(0.7);
                    });
                } else {
                    target.opacity(0.3);
                    target.on('mouseout', function () {
                        this.opacity(0.3);
                    });
                }
            }
            if (parentTarget.name()==='Rect' && hierarchy.searchById(target.parent.id()).data !== "undefined") {
                if (!circleList[0].draggable()) {
                    target.opacity(1);
                    target.on('mouseout', function () {
                        this.opacity(1);
                    });
                } else {
                    target.opacity(0.5);
                    target.on('mouseout', function () {
                        this.opacity(0.5);
                    });
                }
            }
            for (let i = 0; i < circleList.length; ++i) {
                circleList[i].draggable(!circleList[i].draggable());
                if (circleList[i].visible())
                    circleList[i].hide();
                else
                    circleList[i].show();
            }
        }
        function clearGroupFunction(target) {
            if (target.name()==='polygon' && hierarchy.searchById(target.id()).data !== "undefined") {
                let line = target.findOne('Line');
                line.opacity(0.3);
                line.on('mouseout', function () {
                    this.opacity(0.3);
                });
            }
            let circleList = target.find('Circle');
            for (let i=0; i<circleList.length; ++i) {
                circleList[i].draggable(false);
                circleList[i].hide();
            }
        }
        setGroupFunction(target);
        let groupList = polygonLayer.getChildren(function (node) {
            return node.getClassName()==='Group' && node.id() !== target.getParent().id()
        });
        groupList.each(function (g) {
            clearGroupFunction(g)
        });
    }

    function addRect(group) {
        let anchor = new Konva.Rect({
            stroke: '#FF0000',
            strokeWidth: 3,
            dash: [10, 5]
        });
        group.add(anchor);
        let text = new Konva.Text({
            fontSize: 20,
            fontFamily: 'Calibri',
            stroke: anchor.stroke(),
        });
        group.add(text);
        return group;
    }

    let validDrop;
    function dragStart(event) {
        validDrop = false;
        event.dataTransfer.setData("data", event.target.id);
        event.dropEffect = "move";
    }
    function allowDrop(event) {
        event.preventDefault();
    }
    function drop(event) {
        event.preventDefault();
        validDrop = true;
        let targetId = parseInt(event.dataTransfer.getData("data"));

        let destId = parseInt(event.target.id);
        if (hierarchy.move(targetId, destId)) {
            let data = hierarchy.searchById(destId).data;
            let targetNode = hierarchy.searchById(targetId);
            // ROOT Node가 아닐경우(ADD 또는 DEL) 부모노드의 data로 변경
            if (targetNode.type !== "ROOT" && data !== 'root')
                targetNode.data = data;
            let destGroup = polygonLayer.findOne('#' + destId);
            let targetGroup = polygonLayer.findOne('#' + targetId);

            if (targetNode.type === "BBOX") {
                if (typeof (destGroup) === "undefined") {
                    targetNode.data = "undefined";
                    let rect = targetGroup.findOne("Rect");
                    let text = targetGroup.findOne("Text");
                    rect.stroke('#FF0000');
                    rect.opacity(1);
                    text.text("undefined");
                    text.stroke('#FF0000');
                    text.opacity(1);
                } else {
                    let color = destGroup.findOne("Line").stroke();
                    targetGroup.findOne("Rect").stroke(color);
                    targetGroup.findOne("Text").stroke(color);
                    targetGroup.findOne("Text").text(data);
                }
            }
            reloadObjectList();
            categoryFunction();
            polygonLayer.batchDraw();
        }
    }
    function addPoint() {
        if (selectedPointList.length < 1)
            return;
        if (isDrawEnd && selectedPointList[lastSelectedGroupId].length!==2)
            return;
        let group = polygonLayer.findOne(node => {
            return node.id() === lastSelectedGroupId && node.getClassName()==='Group'
        });
        group = addPolyPoint(group, (selectedPointList[lastSelectedGroupId][0].x()+selectedPointList[lastSelectedGroupId][1].x())/2,
            (selectedPointList[lastSelectedGroupId][0].y()+selectedPointList[lastSelectedGroupId][1].y())/2, true);
        let circleList = group.find('Circle');
        let newCircle = circleList[circleList.length-1];
        let line = group.findOne('Line');
        let tmp = [];
        group.removeChildren();
        group.add(line);
        let indexCount;
        for (let i = 0; i < circleList.length-1; i++) {
            if(selectedPointList[lastSelectedGroupId].includes(circleList[i])) {
                if (tmp.length > 0) {
                    circleList[i].name('');
                    circleList[i].opacity(0.3);
                    tmp.push(newCircle);
                    tmp.push(circleList[i]);
                    if (i - indexCount > 1) {
                        for (let j = tmp.length-1; j >= 0; --j)
                            group.add(tmp[j]);
                    }
                    else {
                        for (let j = 0; j < tmp.length; ++j)
                            group.add(tmp[j]);
                    }
                }
                else {
                    circleList[i].name('');
                    circleList[i].opacity(0.3);
                    tmp.push(circleList[i]);
                    indexCount = i;
                }
            }
            else
                group.add(circleList[i])
        }
        let pointList = [];
        circleList = group.find('Circle');
        for (let i = 0; i < circleList.length; ++i) {
            pointList.push(circleList[i].getPosition().x);
            pointList.push(circleList[i].getPosition().y);
        }
        line.points(pointList);
        selectedPointList = [];
        polygonLayer.batchDraw();
    }

    function deletePoint(groupId, selectedPointList) {
        if (selectedPointList.length <= 0)
            return;
        let group = polygonLayer.findOne('#' + groupId)
        for (let i = 0; i < selectedPointList[group.id()].length; i++)
            selectedPointList[group.id()][i].destroy();
        let line = group.findOne('Line');
        let circleList = group.find('Circle');
        let pointList = [];
        for (let i = 0; i < circleList.length; ++i) {
            pointList.push(circleList[i].x());
            pointList.push(circleList[i].y());
        }
        if (pointList.length > 0)
            line.points(pointList);
        else {
            let children = hierarchy.getChildrenById(group.id());
            for (let i=0; i<children.length; ++i)
                hierarchy.remove(children[i])
            if (children.length > 0) {
                let groupList = polygonLayer.find(node => {
                    return children.includes(node.id()) && node.getClassName()==='Group'
                });
                for (let i = 0; i < groupList.length; i++)
                    groupList[i].destroy();
            }
            else    // hierarchy 에 등록이 안된 group 일 때
                polygonLayer.findOne('#' + group.id()).destroy();
            reloadObjectList();
            categoryFunction();
        }
        polygonLayer.batchDraw();
    }

    // 키보드 키 입력 관련 기능 (단축키)
    $(document).keydown(function (event) {
        if (event.altKey) { // alt-key 가 눌렸을때
            keyState.alt = true;
        }
        else if(event.shiftKey) {
            keyState.shift = true;
        }
        // 점 추가(a key)
        else if(event.keyCode === 65) {
            addPoint();
        }
        // 점 삭제(delete-key || backspace-key)
        else if(event.keyCode === 46 || event.keyCode === 8) {
            keyState.delete = true;
            deletePoint(lastSelectedGroupId, selectedPointList);
        }
        // 실행취소(ctrl + z)
        else if(event.ctrlKey && event.keyCode === 90) {
            undo();
        }
        // 방향키
        // else if (event.keyCode === 37) {
        //     event.preventDefault();
        //     moveLeft(MOVE_UnitX, MOVE_UnitY)
        // }
        // else if (event.keyCode === 38) {
        //     event.preventDefault();
        //     moveDown(MOVE_UnitX, MOVE_UnitY)
        // }
        // else if (event.keyCode === 39) {
        //     event.preventDefault();
        //     moveRight(MOVE_UnitX, MOVE_UnitY);
        // }
        // else if (event.keyCode === 40) {
        //     event.preventDefault();
        //     moveUp(MOVE_UnitX, MOVE_UnitY)
        // }
        return true;
    });
    // 입력키 초기화
    $(document).keyup(function (event) {
        for (let key in keyState)
            keyState[key] = false;
    });

    STAGE_WIDTH = 1100;
    STAGE_HEIGHT = 500;
    // Konva layer 초기화
    let stage = new Konva.Stage({
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        container: 'konva-container'
    });
    stage.getContainer().style.border = '2px solid red';
    stage.getContainer().style.fill = 'gray';

    // let stage = new Konva.Stage({
    //     width: imgWidth,
    //     height: imgHeight,
    //     container: 'konva-container',
    // });

    let polygonLayer = new Konva.Layer();


    stage.on('click', function() {
        if (keyState.shift)
            return;
        let group = polygonLayer.findOne('#' + currGroupId);
        if (typeof (group) === 'undefined') { // 어떤 segmentation 타입도 선택되지 않았을때 (scroll lock)
            return;
        }
        if (group.name() === 'polygon') {
            let line = group.findOne('Line');
            if (!isDrawEnd) {
                currPoint = this.getPointerPosition();

                // 처음 추가되는 점이면 name을 first로 표시
                if (history.length < 1) {
                    group = addPolyPoint(group, currPoint.x, currPoint.y, null, 'first');
                    let firstCircle = group.findOne('.first');
                    firstCircle.opacity(1);
                }
                else {
                    group = addPolyPoint(group, currPoint.x, currPoint.y);
                }
                let circles = group.getChildren();
                let lastCreateCircleId = circles[circles.length - 1]._id;
                if (history.length < MAX_HISTORY_SIZE)
                    history.push(lastCreateCircleId);
                else {
                    history.shift();
                    history.push(lastCreateCircleId);
                }

                let pointList = [];
                let circleList = group.find('Circle');
                for (let i = 0; i < circleList.length; ++i) {
                    pointList.push(circleList[i].getPosition().x);
                    pointList.push(circleList[i].getPosition().y);
                }
                line.points(pointList);
                line.opacity(1);
            } else if (!line.closed()) {
                line.closed(true);
                // line.stroke(strokeColorList[color_index % strokeColorList.length]);
                // line.fill(fillColorList[(color_index++) % fillColorList.length]);
                let circleList = group.find('Circle');
                circleList.each(function (c) {
                    c.hide();
                });
            }
        }
        polygonLayer.batchDraw();
    });
    stage.on('mousedown', function () {
        prePoint = this.getPointerPosition();
        keyState.mousedown = true;
        for (let sp in selectedPointList) {
            for (let i=0; i<selectedPointList[sp].length; ++i) {
                let target = selectedPointList[sp][i];
                target.strokeWidth(0);
                target.opacity(0.3);
                target.name('');
            }
        }
        selectedPointList = [];
        dragBoxLayer.batchDraw();
    });
    stage.on('mouseup', function () {
        keyState.mousedown = false;
        dragBox.visible(false);
        dragBoxLayer.batchDraw();
        currPoint = this.getPointerPosition();
        let tmpPoint = this.getPointerPosition();
        (tmpPoint.x > imgWidth) ? currPoint.x = imgWidth : currPoint.x = tmpPoint.x;
        (tmpPoint.y > imgHeight) ? currPoint.y = imgHeight : currPoint.y = tmpPoint.y;
        if (keyState.alt) {
            selectedPointList = selectPoint(currPoint, prePoint);
        }

        let group = polygonLayer.findOne(node => {
            return node.id() === currGroupId && node.getClassName()==='Group';
        });
        if (typeof (group) === 'undefined') { // 어떤 segmentation 타입도 선택되지 않았을때 (scroll lock)
            return;
        }
        if(group.name() === 'rectangle' && !isDrawEnd) {
            currPoint = this.getPointerPosition();
            let pointLeftUp, pointRightDown;
            pointLeftUp = {'x': Math.min(prePoint.x, currPoint.x), 'y': Math.min(prePoint.y, currPoint.y)};
            pointRightDown = {'x': Math.max(prePoint.x, currPoint.x), 'y': Math.max(prePoint.y, currPoint.y)};
            group = addRectPoint(group, pointLeftUp.x, pointLeftUp.y, 'leftUp');
            group = addRectPoint(group, pointRightDown.x, pointLeftUp.y, 'rightUp');
            group = addRectPoint(group, pointLeftUp.x, pointRightDown.y, 'leftDown');
            group = addRectPoint(group, pointRightDown.x, pointRightDown.y, 'rightDown');
            let rect = group.findOne('Rect');
            let text = group.findOne('Text');
            rect.x(pointLeftUp.x);
            rect.y(pointLeftUp.y);
            rect.width(pointRightDown.x - pointLeftUp.x);
            rect.height(pointRightDown.y - pointLeftUp.y);
            text.x(rect.x() + 3);
            text.y(rect.y() + 3);
            // text.text('undefined');
            isDrawEnd = true;

            // 끝났을 경우 다이얼로그 창 띄우기
            lastSelectedGroupId = group.id();
            popUpAttributeDialogue();
        }
        reloadObjectList();
        categoryFunction();
        polygonLayer.batchDraw();
    });
    stage.on('mousemove', function () {
        currPoint = this.getPointerPosition();
        if (keyState.shift && keyState.mousedown) {
            if (prePoint.x >= currPoint.x)
                moveRight((prePoint.x - currPoint.x) / 2, (prePoint.y - currPoint.y) / 2);
            else if (prePoint.x < currPoint.x)
                moveLeft((prePoint.x - currPoint.x) / 2, (prePoint.y - currPoint.y) / 2);
            if (prePoint.y >= currPoint.y)
                moveUp((prePoint.x - currPoint.x) / 2, (prePoint.y - currPoint.y) / 2);
            else if (prePoint.y < currPoint.y)
                moveDown((prePoint.x - currPoint.x) / 2, (prePoint.y - currPoint.y) / 2);
            prePoint = currPoint;
            return;
        }
        else if (keyState.mousedown) {
            // 범위가 넘어가면 최대값으로 대체
            let tmpPoint = this.getPointerPosition();
            (tmpPoint.x > imgWidth) ? currPoint.x = imgWidth : currPoint.x = tmpPoint.x;
            (tmpPoint.y > imgHeight) ? currPoint.y = imgHeight : currPoint.y = tmpPoint.y;
            // 드래그-박스(drag-box) 그리기
            dragBox.x(prePoint.x);
            dragBox.y(prePoint.y);
            dragBox.width(currPoint.x - prePoint.x);
            dragBox.height(currPoint.y - prePoint.y);
            dragBox.visible(true);
        }
        dragBoxLayer.batchDraw();
    });

    /**
     * 주어진 범위에 있는 point(Konva.Circle)를 반환하는 함수
     * @param startPoint 시작점
     * @param endPoint 끝점
     * @returns [] 범위안의 point 값
     */
    function selectPoint(startPoint, endPoint) {
        // let tmpList;
        let selectedCircleList = {};
        let pointLeftUp, pointRightDown;
        pointLeftUp = {'x': Math.min(startPoint.x, endPoint.x), 'y': Math.min(startPoint.y, endPoint.y)};
        pointRightDown = {'x': Math.max(startPoint.x, endPoint.x), 'y': Math.max(startPoint.y, endPoint.y)};
        let totalGroup = polygonLayer.find(node => {
            return node.getClassName() === 'Group' && node.isVisible() && selectGroupId === node.id() && node.name()==='polygon'
        });
        totalGroup.each(function (group) {
            let target = group.find(node => {
                return node.getClassName() === 'Circle' && (node.x() > pointLeftUp.x && node.x() < pointRightDown.x) && (node.y() > pointLeftUp.y && node.y() < pointRightDown.y);
            });
            selectedCircleList[group.id()] = [];
            target.each(function (t) {
                t.opacity(1);
                t.name('selected');
                selectedCircleList[group.id()].push(t);
            })
        });
        return selectedCircleList;
    }
    // Drag-Box Layer
    let dragBox = new Konva.Rect({x: 0, y: 0, width: 0, height: 0, stroke: '#BDBDBD', dash: [2,2]});
    dragBox.listening(false); // Stop drag_box catching our mouse event
    let dragBoxLayer = new Konva.Layer();
    dragBoxLayer.add(dragBox);



    let points_json = [];
    getImageObjectMap(1258, function(resultObj){
        let data = resultObj['ajaxResult']['data'];
        points_json = [];
        for (let i=0; i<data.length; ++i ) {
            if (data[i]['points_json']!=='') {
                let dictItem = {};
                let points = data[i]['points_json'].replace('[', '').replace(']', '').split(',').map(Number);
                dictItem['id'] = data[i]['iom_no'];
                dictItem['name'] = data[i]['object_eng_nm']
                dictItem['parentId'] = data[i]['piom_no'];
                dictItem['objectType'] = data[i]['object_type'];
                dictItem['points'] = points;
                dictItem['isChecked'] = (data[i]['reject_chk_yn'] === 'Y' ? true : false);
                points_json.push(dictItem);
            }
        }
        imageLoad(initialLoad);
    });

    let imageLayer = new Konva.Layer();
    let imageObj;

    /**
     * 웹페이지 로드 시 초기값을 로드하는 함수
     */
    function initialLoad() {
        let dataList = [];
        for (let p = 0; p < points_json.length; p++) {
            dataList.push(points_json[p]);
        }
        while (dataList.length > 0) {
            let data = dataList.shift();
            if (data.objectType !== 'BBOX') {
                let points = [];
                for (let j=0; j<data.points.length / 2; ++j) {
                    points.push(data.points[2 * j] / widthRate);
                    points.push(data.points[2 * j + 1] / heightRate);
                }
                let newGroup = addGroup('polygon', data.id, data.parentId, data.objectType, data.name, data.isChecked);
                if (newGroup === null) {
                    dataList.push(data);
                    continue;
                }
                for (let j = 0; j < points.length / 2; j++) {
                    addPolyPoint(newGroup, points[2 * j], points[2 * j + 1]);
                }
                let line = newGroup.findOne('Line');
                line.points(points);
                line.closed(true);
                rootColor = strokeColorList[color_index % strokeColorList.length];
                line.stroke(rootColor);
                line.fill(fillColorList[(color_index++) % fillColorList.length]);
                let circleList = newGroup.find('Circle');
                for (let j = 0; j < circleList.length; ++j) {
                    circleList[j].hide();
                }
            }
            else {
                let newGroup = addGroup('rectangle', data.id, data.parentId, data.objectType, data.name, data.isChecked);
                newGroup = addRect(newGroup);

                let rect = newGroup.findOne('Rect');
                let text = newGroup.findOne('Text');
                rect.x(data.points[0] / widthRate);
                rect.y(data.points[1] / heightRate);
                rect.width(data.points[2] / widthRate);
                rect.height(data.points[3] / heightRate);
                rect.opacity(0.5);
                let boxColor = strokeColorList[color_index++ % strokeColorList.length];
                rect.stroke(boxColor);
                text.x(rect.x() + 3);
                text.y(rect.y() + 3);
                text.text(data.name);
                text.visible(false);
                text.stroke(boxColor);
                newGroup = addRectPoint(newGroup, rect.x(), rect.y(), 'leftUp');
                newGroup = addRectPoint(newGroup, rect.x() + rect.width(), rect.y(), 'rightUp');
                newGroup = addRectPoint(newGroup, rect.x(), rect.y() + rect.height(), 'leftDown');
                newGroup = addRectPoint(newGroup, rect.x() + rect.width(), rect.y() + rect.height(), 'rightDown');
            }
        }
        reloadObjectList();
        categoryFunction();
        polygonLayer.batchDraw();
    }

    function imageLoad(callback) {
        imageObj = new Image();
        imageObj.onload = function() {
            const background = new Konva.Image({
                x: 0,
                y: 0,
                image: imageObj,
                height: imgHeight,
                width: imgWidth,
            });
            imageLayer.add(background);
            stage.add(imageLayer, polygonLayer, dragBoxLayer);
        };
        imageObj.src = "/dcamp/data/Images/155/1258.jpg";
        callback();
    }
	
	$(document).bind('mousewheel DOMMouseScroll', function (event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
			zoomIn();
			return false;
		} else {
			zoomOut();
			return false;
		}
	});
	
	
    function zoomIn() {
        let groups = polygonLayer.find('Group');
        let centerPoint_X = layerSTDLocation_X;
        let centerPoint_Y = layerSTDLocation_Y;
        for (let i=0; i<groups.length; ++i) {
            if (groups[i].name()==='polygon') {
                let circles = groups[i].find('Circle');
                let newCirclePoints = [];
                circles.each(function (c) {
                    c.x((c.x() + layerSTDLocation_X) * ZOOM_RATE - centerPoint_X);
                    c.y((c.y() + layerSTDLocation_Y) * ZOOM_RATE - centerPoint_Y);
                    newCirclePoints.push(c.x());
                    newCirclePoints.push(c.y());
                });
                let line = groups[i].findOne('Line');
                line.points(newCirclePoints);
            }
            else if (groups[i].name() === 'rectangle') {
                let rect = groups[i].findOne('Rect');
                let text = groups[i].findOne('Text');
                rect.x((rect.x() + layerSTDLocation_X) * ZOOM_RATE - centerPoint_X);
                rect.y((rect.y() + layerSTDLocation_Y) * ZOOM_RATE - centerPoint_Y);
                rect.width(rect.width() * ZOOM_RATE);
                rect.height(rect.height() * ZOOM_RATE);
                text.x(rect.x() + 3);
                text.y(rect.y() + 3);
                let circles = groups[i].find('Circle');
                circles.each(function (c) {
                    c.x((c.x() + layerSTDLocation_X) * ZOOM_RATE - centerPoint_X);
                    c.y((c.y() + layerSTDLocation_Y) * ZOOM_RATE - centerPoint_Y);
                });
            }
        }
        layerSTDLocation_X = centerPoint_X;
        layerSTDLocation_Y = centerPoint_Y;

        imageLayer.position({x: -layerSTDLocation_X, y: -layerSTDLocation_Y});
        zoomLevel *= ZOOM_RATE;
        imageLayer.scale({
            x:zoomLevel,
            y:zoomLevel
        });
        totalZoomRate *= ZOOM_RATE;
        imgWidth *= ZOOM_RATE;
        imgHeight *= ZOOM_RATE;
        imageLayer.batchDraw();
        polygonLayer.batchDraw();
    }

    function zoomOut() {
        if (zoomLevel <= 1) {
            return;
        }
        let centerPoint_X = layerSTDLocation_X;
        let centerPoint_Y = layerSTDLocation_Y;

        let groups = polygonLayer.find('Group');
        for (let i = 0; i < groups.length; ++i) {
            if (groups[i].name()==='polygon') {
                let circles = groups[i].getChildren(function (node) {
                    return node.getClassName() === 'Circle'
                });
                let newCirclePoint = [];
                circles.each(function (c) {
                    c.x((c.x() + layerSTDLocation_X) / ZOOM_RATE - centerPoint_X);
                    c.y((c.y() + layerSTDLocation_Y) / ZOOM_RATE - centerPoint_Y);
                    newCirclePoint.push(c.x());
                    newCirclePoint.push(c.y());
                });
                let line = groups[i].findOne('Line');
                line.points(newCirclePoint);
            }
            else if (groups[i].name() === 'rectangle') {
                let rect = groups[i].getChildren(function (node) {
                    return node.getClassName()==='Rect'
                })[0];
                let text = groups[i].getChildren(function (node) {
                    return node.getClassName()==='Text'
                })[0];
                rect.x((rect.x() + layerSTDLocation_X) / ZOOM_RATE - centerPoint_X);
                rect.y((rect.y() + layerSTDLocation_Y) / ZOOM_RATE - centerPoint_Y);
                rect.width(rect.width() / ZOOM_RATE);
                rect.height(rect.height() / ZOOM_RATE);
                text.x(rect.x() + 3);
                text.y(rect.y() + 3);
                let circles = groups[i].find('Circle');
                circles.each(function (c) {
                    c.x((c.x() + layerSTDLocation_X) / ZOOM_RATE - centerPoint_X);
                    c.y((c.y() + layerSTDLocation_Y) / ZOOM_RATE - centerPoint_Y);
                });
            }
        }
        totalZoomRate /= ZOOM_RATE;
        imgWidth /= ZOOM_RATE;
        imgHeight /= ZOOM_RATE;

        layerSTDLocation_X = centerPoint_X;
        layerSTDLocation_Y = centerPoint_Y;
        imageLayer.position({x: -layerSTDLocation_X, y: -layerSTDLocation_Y});
        zoomLevel /= ZOOM_RATE;
        imageLayer.scale({
            x: zoomLevel,
            y: zoomLevel
        });
        imageLayer.batchDraw();
        polygonLayer.batchDraw();
    }

    function moveRight(moveUnitX, moveUnitY) {
        moveUnitX = Math.abs(moveUnitX);
        layerSTDLocation_X += moveUnitX;
        if (layerSTDLocation_X + imageLayer.width() > imgWidth) {
            layerSTDLocation_X -= moveUnitX;
            return;
        }
        imageLayer.x(-layerSTDLocation_X);
        let groups = polygonLayer.find('Group');
        for (let i=0; i<groups.length; ++i) {
            if (groups[i].name()==='polygon') {
                let circles = groups[i].find('Circle');
                let newCirclePoints = [];
                circles.each(function (c) {
                    c.x(c.x() - moveUnitX);
                    newCirclePoints.push(c.x());
                    newCirclePoints.push(c.y());
                });
                let line = groups[i].findOne('Line');
                line.points(newCirclePoints);
            }
            else if (groups[i].name()==='rectangle') {
                let rect = groups[i].findOne('Rect');
                let text = groups[i].findOne('Text');
                rect.x(rect.x() - moveUnitX);
                text.x(rect.x() + 3);
                let circles = groups[i].find('Circle');
                circles.each(function (c) {
                    c.x(c.x() - moveUnitX);
                });
            }
        }
        imageLayer.batchDraw();
        polygonLayer.batchDraw();
    }

    function moveLeft(moveUnitX, moveUnitY) {
        moveUnitX = Math.abs(moveUnitX);
        layerSTDLocation_X -= moveUnitX;
        if (layerSTDLocation_X < 0) {
            layerSTDLocation_X += moveUnitX;
            return;
        }
        imageLayer.x(-layerSTDLocation_X);
        let groups = polygonLayer.find('Group');
        for (let i=0; i<groups.length; ++i) {
            if (groups[i].name()==='polygon') {
                let circles = groups[i].find('Circle');
                let newCirclePoints = [];
                circles.each(function (c) {
                    c.x(c.x() + moveUnitX);
                    newCirclePoints.push(c.x());
                    newCirclePoints.push(c.y());
                });
                let line = groups[i].findOne('Line');
                line.points(newCirclePoints);
            }
            else if (groups[i].name()==='rectangle') {
                let rect = groups[i].findOne('Rect');
                let text = groups[i].findOne('Text');
                rect.x(rect.x() + moveUnitX);
                text.x(rect.x() + 3);
                let circles = groups[i].find('Circle');
                circles.each(function (c) {
                    c.x(c.x() + moveUnitX);
                });
            }
        }
        imageLayer.batchDraw();
        polygonLayer.batchDraw();
    }

    function moveUp(moveUnitX, moveUnitY) {
        moveUnitX = Math.abs(moveUnitY);
        layerSTDLocation_Y += moveUnitY;
        if (layerSTDLocation_Y + imageLayer.height() > imgHeight) {
            layerSTDLocation_Y -= moveUnitY;
            return;
        }
        imageLayer.y(-layerSTDLocation_Y);
        let groups = polygonLayer.find('Group');
        for (let i=0; i<groups.length; ++i) {
            if (groups[i].name()==='polygon') {
                let circles = groups[i].find('Circle');
                let newCirclePoints = [];
                circles.each(function (c) {
                    c.y(c.y() - moveUnitY);
                    newCirclePoints.push(c.x());
                    newCirclePoints.push(c.y());
                });
                let line = groups[i].findOne('Line');
                line.points(newCirclePoints);
            }
            else if (groups[i].name()==='rectangle') {
                let rect = groups[i].findOne('Rect');
                let text = groups[i].findOne('Text');
                rect.y(rect.y() - moveUnitX);
                text.y(rect.y() + 3);
                let circles = groups[i].find('Circle');
                circles.each(function (c) {
                    c.y(c.y() - moveUnitY);
                });
            }
        }
        imageLayer.batchDraw();
        polygonLayer.batchDraw();
    }

    function moveDown(moveUnitX, moveUnitY) {
        moveUnitY = Math.abs(moveUnitY);
        layerSTDLocation_Y -= moveUnitY;
        if (layerSTDLocation_Y < 0) {
            layerSTDLocation_Y += moveUnitY;
            return;
        }
        imageLayer.y(-layerSTDLocation_Y);
        let groups = polygonLayer.find('Group');
        for (let i=0; i<groups.length; ++i) {
            if (groups[i].name()==='polygon') {
                let circles = groups[i].find('Circle');
                let newCirclePoints = [];
                circles.each(function (c) {
                    c.y(c.y() + moveUnitY);
                    newCirclePoints.push(c.x());
                    newCirclePoints.push(c.y());
                });
                let line = groups[i].findOne('Line');
                line.points(newCirclePoints);
            }
            else if (groups[i].name()==='rectangle') {
                let rect = groups[i].findOne('Rect');
                let text = groups[i].findOne('Text');
                rect.y(rect.y() + moveUnitX);
                text.y(rect.y() + 3);
                let circles = groups[i].find('Circle');
                circles.each(function (c) {
                    c.y(c.y() + moveUnitY);
                });
            }
        }
        imageLayer.batchDraw();
        polygonLayer.batchDraw();
    }

    /**
     * 이전 작업으로 돌아가는 함수
     **/
    function undo() {
        if (history.length > 1) {
            let delItem = {};
            let delGroupId = 'tmp' + (lastGroupId-1);
            let lastCircleId = history.pop()
            delItem[delGroupId] = [polygonLayer.findOne(node => {
                return node._id === lastCircleId;
            })];
            deletePoint(delGroupId, delItem);
        }
    }

    function addNewObject(type) {
        if (!isDrawEnd)
            return;
        addGroup(type, 'tmp' + lastGroupId++, -1, 'ROOT', 'undefined')
        isDrawEnd = false;
    }

    /**
     * 주어진 Group을 삭제하는 함수
     * @param groupId 삭제할 group의 id
     */
    function deleteGroup(groupId) {
        let group = polygonLayer.getChildren(function (node) {
            return node.getClassName()==='Group' && node.id() === groupId
        });
        let children = hierarchy.getChildrenById(groupId);
        for (let i=0; i<children.length; ++i) {
            hierarchy.remove(children[i])
        }
        if (children.length > 0) {
            let groupList = polygonLayer.find(node => {
                return children.includes(node.id())
            });
            for (let i = 0; i < groupList.length; i++) {
                groupList[i].destroy();
            }
        }
        group.destroy();
        hierarchy.remove(groupId);
    }

    /**
     * 주어진 Group을 생성하는 함수
     * @param type 그룹 타입(polygon, rectangle)
     * @param id 생성할 id, null일 경우 자동 생성
     * @param parentNodeId 생성할 그룹의 부모 그룹의 id
     * @param subset 생성할 그룹의 서브타입 (ex. ROOT, ADD, DEL, BBOX)
     * @param tag 생성할 그룹의 서브 네임 (ex. undefined)
     * @return {*|Konva.Group|null|Konva.Group}
     */
    function addGroup(type, id, parentNodeId, subset, tag, isChecked = false) {
        let newGroup = new Konva.Group();
        newGroup.id(id);
        if (type === 'polygon') {
            newGroup.name('polygon');
            newGroup = addLine(newGroup);
            if (id === null)
                id = newGroup.id();
            if (hierarchy.insert(parentNodeId, new HNode(id, subset, tag, -1, isChecked))) {
                polygonLayer.add(newGroup);
                currGroupId = newGroup.id();
                return newGroup;
            }
        }
        else if (type ==='rectangle') {
            newGroup.name('rectangle');
            newGroup = addRect(newGroup);
            if (hierarchy.insert(parentNodeId, new HNode(id, subset, tag, -1, isChecked))) {
                polygonLayer.add(newGroup);
                currGroupId = newGroup.id();
                return newGroup;
            }
        }
        return null;
    }
