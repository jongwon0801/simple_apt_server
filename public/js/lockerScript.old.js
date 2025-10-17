var previous_cabinet; // 이전에 클릭했던 캐비닛
var path;   // 파일 경로(이름)
var entire_width, entire_height;
var label_color="orange";   // 라벨 색깔
var border_color="white", cabinet_color="grey"; // 캐비닛 테두리, 캐비닛 색상
var parent_area="body";

var cabinetColor;
function Set_LabelColor(color)
{
    label_color=color;
}

function Set_CabinetColor(color, b_color)
{
    cabinet_color=color;
    border_color=b_color;
}

function cabinetClick(event)    // 캐비닛을 클릭했을때, 호출되는 콜백함수.
{
    if(previous_cabinet)    // 이전에 클릭했던 캐비닛이 있는가?
        $(previous_cabinet).css('opacity', 1);  // 이전에 클릭했던 캐비닛의 표시효과를 제거한다.

    $(event).css('opacity', 0.5);
    previous_cabinet=event; // 그리고 현재 클릭이 발생한 캐비닛 객체를 저장해둔다.
    if(lockerCallback)
        lockerCallback($(event).data('locker'));
    //return json_data.cabinet[$(event).attr("col")].box[$(event).attr("row")];
}
var lockerCallback;
function CabinetClickListener(fn)
{
    lockerCallback=fn;
    //$(".cabinet_panel").on("click", fn);
}

function DrawCabinet()
{
    
    width=$(parent_area).width();    // width of web browser.
    height=$(parent_area).height();  // height of web browser.

    
    var sumOfWidth=0;   // 전체 사물함의 너비
    var sumOfHeight=0;  // 전체 사물함의 높이
    var cursor_width=0, cursor_height=0;    // 현재까지 그린 영역의 위치값을 저장하고 있는다.
    var temp_height=0, temp_width=0;    // 수직, 수평 정렬을 위해서 필요한 변수. (fitting된 값)
    var min_height=width*100;

    for(var i=0;i<data.cabinet.length;i++)  // calculate sum of entire cabinet width and height.
    {
        var tempSum=0;
        

        for(var j=0;j<data.cabinet[i].box.length;j++)
        {
            if(j ==0 ) 
                sumOfWidth+=data.cabinet[i].box[j].width;
            tempSum+=data.cabinet[i].box[j].height;

            if(min_height>data.cabinet[i].box[j].height)    // 가장 작은 캐비닛의 높이의 non-fitting 값을 찾아낸다.
                min_height=data.cabinet[i].box[j].height;
        }

        if(tempSum>sumOfHeight)
            sumOfHeight=tempSum;
        
        tempSum=0;
    }

    min_height=(min_height*height)/sumOfHeight; // 가장 작은 캐비닛의 높이 값을 fitting 시킨다.

    if(sumOfWidth>=sumOfHeight) // 전체 사물함의 너비가 fitting 될때, 수평정렬한다.
    {
        temp_height=(width*sumOfHeight)/sumOfWidth;
        cursor_height+=(height-temp_height)/2;
    }
    else    // 전체 사물함의 높이가 fitting 될때, 수직정렬한다.
    {
        temp_width=(height*sumOfWidth)/sumOfHeight;
        cursor_width+=(width-temp_width)/2;
    }

    sumOfHeight+=min_height;    // 전체 사물함의 높이가 fitting 되었으므로 그려질 사물함의 높이를 늘린다. =

    for(var i=0;i<data.cabinet.length;i++)    // place "div" tag as role of cabinet.
    {
        var min_realWidth=width*100;    // 라벨의 너비를 위한 변수.
        var min_realHeight=height*100;  // 라벨의 높이를 위한 변수.
        //var addedWidth=0;
        //var vHeight=0;
        for(var j=0;j<data.cabinet[i].box.length;j++)
        {
            var realWidth;  // real cabinet width after fit.
            var realHeight; // real cabinet height after fit.
            var top;
            var bottom;
            var left;
            var right;
            var item = data.cabinet[i].box[j];
            //if(addedWidth==0){
            //        vHeight += item.height;
            //}
            //var a = (item.width*width)/sumOfWidth;
            if(sumOfWidth>=sumOfHeight)  // 전체 사물함의 너비에 fitting 시킨다.
            {
                realWidth=(item.width*width)/sumOfWidth;  // 1:2=x:6 의 공식에 맞게 구한다.
                realHeight=(realWidth*item.height)/item.width;
            }
            else    // 전체 사물함의 높이에 fitting 시킨다.
            {
                realHeight=(item.height*height)/sumOfHeight;  // 1:2=x:6 의 공식에 맞게 구한다.
                realWidth=(realHeight*item.width)/item.height;
            }

            if(min_realWidth>realWidth)
                min_realWidth=realWidth;

            if(min_realHeight>realHeight)
                min_realHeight=realHeight;

            bottom=cursor_height;   // cabinet의 top 위치를 지정한다.
            top=height-(bottom+realHeight);  //cabinet의 bottom 위치를 지정한다.

            top=height-(bottom+realHeight)

            left=cursor_width;   // cabinet의 left 위치를 지정한다.
            right=width-(left+realWidth);   // cabinet의 right 위치를 지정한다.

            var lockStatus="";
            var thingStatus = "";
            if(item.closed){
                lockStatus= "<div style='position:absolute;right:0px; bottom:0px;'><i class='fa fa-lock fa-lg'></i></div>";
            }
            if(item.usage=='B'){
                thingStatus= "<div style='position:absolute;right:0px; bottom:0px;'><i class='fa fa-bath fa-lg'></i></div>";
            }
            /*
            var cmcName="d";

            if(item.kind=='B'){
                if(item.closed){
                    
                    if(item.status=="A"){
                        cmcName+="-take";
                    }else if(item.status=="B"){
                        cmcName+="-save";
                    }
                    cmcName+="-open";
                }
            }*/
            
        var cmcName="cabinet_panel";
            panel = $("<div class='"+cmcName+"' style='position:absolute; margin:0.1%; cursor:pointer;' onclick='cabinetClick(this);'>"+data.cabinet[i].box[j].label+lockStatus+thingStatus+"</div>")
            panel.css("top", top+"px");
            panel.css("bottom", bottom+"px");
            panel.css("left", left+"px");
            panel.css("right", right+"px");
            panel.css("background-color",cabinetColor[data.cabinet[i].box[j].status.charCodeAt(0)-65]);
            
            //panel.css("background-color", cabinet_color);
            panel.css("border", "5px solid "+border_color);

            panel.data('locker', data.cabinet[i].box[j]);

            cursor_height+=realHeight;
            $(parent_area).append(panel);
            if(addedWidth == 500) {
                addedWidth=0;
            }
        }

        $(parent_area).append("<div id='"+data.cabinet[i].label+"' style='position:absolute; text-align:center; margin-bottom:0.1%; padding-top:0.1%;'>"+data.cabinet[i].label+"</div>");
        $('#'+data.cabinet[i].label).css("bottom", cursor_height+"px");
        $('#'+data.cabinet[i].label).css("top", "0px");
        $('#'+data.cabinet[i].label).css("left", cursor_width+"px");
        $('#'+data.cabinet[i].label).css("right", width-(cursor_width+min_realWidth)+"px");
        $('#'+data.cabinet[i].label).css("color", label_color);

        cursor_width+=realWidth;

        if(temp_height!=0)
            cursor_height=(height-temp_height)/2;
        else
            cursor_height=0;
    }
    
    
}

function init_viewport(j_data, parent, cc,width, height)
{
    data = j_data;
    parent_area = typeof parent !== 'undefined' ? parent : 'body';
    entire_width= typeof width !== 'undefined' ? document.getElementById(parent).style.width : width+'px';
    entire_height=typeof height !== 'undefined' ? document.getElementById(parent).style.height: height+'px';

    $(parent_area).css('position', "relative");
    $(parent_area).css('width', entire_width);
    $(parent_area).css('height', entire_height);
    cabinetColor=cc;
    DrawCabinet();
}