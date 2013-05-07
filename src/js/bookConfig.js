
$(document).ready(function() {
    var ruleView = new GridView({
            "table": "table"
        });


    $(document).click(function(event){
        var data = event.target;
        ruleView.clicked(data);
        if (data.tagName == "BUTTON"){
            return;
        }
        /*
        if (data.tagName == "TD"){
            gridCellEdit(data);
        }
        else if(data.tagName == "INPUT") {
            return;
        }
        else if (data.tagName == "BUTTON"){
            return;
        }
        else {
            var input = $("#gridInput");
            $("body").append(input);
            input.css("display", "none");
            gridSetCellText(input.val());
            prevNode = null;
        }
        */
    });

    $("#addRule").click(function(event){
        ruleView.insertRow(1);
        event.stopPropagation();
    });
});
