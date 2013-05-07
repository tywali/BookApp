
var GridView = function(options) {
    var grid;
    var prevCell = null;

    var init = function(options) {
        grid = options.table;
    };

    var addAction = function(node, name){
        var img = $("<img />");
        img.attr("src", "images/" + name + ".png");
        img.attr("action", name);
        node.append(img);
        node.addClass("action");
    };

    this.showData = function(dataList) {
        var oFragment = $("<fragment></fragment>");
        for (var i = 0; i < dataList.length; i++){
            var record = dataList[i];
            var row = $("<tr></tr>");
            var ths = $(grid).find("thead th");
            $(ths).each(function(){
                var fieldName = $(this).attr("fieldid");
                var node = $("<td></td>");
                var cell = node;//$(node).find("a");
                if (fieldName){
                    $(cell).text(record[fieldName]);
                }
                else{
                    fieldName = $(this).attr("action");
                    addAction(node, fieldName);
                }
                $(row).append(node);
            });
            row[0].record = record;
            oFragment.append(row);
        }
        $(grid).append(oFragment.find("tr"));
    };

    this.clear = function(){
        $(grid).find("tbody").empty();
    };
    
    this.getRowData = function(node){
        var tag;
        do {
            node = $(node).parent();
            tag = $(node)[0].tagName;
        } while(tag != "TR");
        var row = node;
        var data =  $(row)[0].record;
        return data;
    };

    this.getColName = function(node) {
        node = $(node);
        var index = node.index();
        var th = $(grid).find("th:eq(" + index + ")");
        var fieldid = th.attr("fieldid");
        return fieldid;
    }

    this.getRowCount = function() {
        return $(grid).find("tbody tr").length;
    };

    this.getColCount = function() {
        return $(grid).find("thead th").length;
    };

    this.insertRow = function(row) {
        var rowNode = $("<tr></tr>");
        var ths = $(grid).find("thead th");
        $(ths).each(function() {
            var fieldName = $(this).attr("fieldid");
            var node = $("<td></td>");
            var cell = node;
            if (!fieldName){
                fieldName = $(this).attr("action");
                addAction(node, fieldName);
            }
            $(rowNode).append(node);
        });

        var rowCount = this.getRowCount();
        if (row <= 0 || row > rowCount) {
            $(grid).append(rowNode);
            row = rowCount;
        }
        else {
            row--;
            var insRow = $(grid).find("tbody tr").get(row);
            $(insRow).before(rowNode);
        }
        editCell($(rowNode).find("td")[0], 0);
    };

    var acceptText = function(text) {
        if (prevCell){
            $(prevCell).text(text);
        }
    };

    var editCell = function(cellObj) {
        var index = $(cellObj).index();
        var colTitleObj = $(grid).find("th:eq(" + index + ")");
        var width = $(cellObj).css("width");
        var input = $("#gridInput");
        acceptText(input.val());
        var text = $(cellObj).text();
        var font = $(cellObj).css("font");
        $(cellObj).text("");
        width = parseInt(width.replace("px", "")) - parseInt($(cellObj).css("padding-left").replace("px", ""));
        width = width + "px";
        input.css("width", width);
        input.css("float", "left");
        input.css("font", font);
        input.css("display", "block");
        input.val(text);
        $(cellObj).append(input);
        width = parseInt(width.replace("px", "")) + parseInt($(cellObj).css("padding-left").replace("px", ""));
        width = width + "px";
        $(cellObj).css("width", width);
        input.focus();
    };

    this.clicked = function(node) {
        var origNode = node;
        var tag, band;
        while (1){
            tag = $(node)[0].tagName;
            if (!tag) {
                band = null;
                break;
            }
            if (tag == "TABLE") {
                if ($(grid).attr("id") == $(node).attr("id")){
                    break;
                }
            }
            else if (tag == "TBODY") {
                band = "detail"
            }
            node = $(node).parent();
        }

        if (tag && band == "detail") {
            tag = $(origNode)[0].tagName;
            if (tag == "TD") {
                editCell(origNode);
                prevCell = origNode;
            }
        }
        else {
            var input = $("#gridInput");
            var node = $(input).parent();
            $("body").append(input);
            input.css("display", "none");
            acceptText(input.val());
            prevCell = null;
        }
        return tag;
    };
    
    init(options);
};
