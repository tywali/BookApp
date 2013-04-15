var BookAction = function(){
    var addBook = function(formBook, callback){
        var name = $(formBook).find("#name").val();     //$("#form-addBook #name").val();
        var author = $(formBook).find("#author").val(); //$("#form-addBook #author").val();
        var url = $(formBook).find("#address").val();   //$("#form-addBook #address").val();
        callback({
            "bookname" : name,
            "author" : author,
            "chartRootUrl" : url,
        });
    };

    var editBook = function(){

    };
};
