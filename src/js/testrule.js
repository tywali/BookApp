var TestRuleView = function(){
    var bookParaser = new BookParaser();
    this.receiveMessage =function(message){
        this[message.type](message.param);
    };

    this.showDir = function(book, content){
        //dir = bookParaser.getFirstDir(content.data);
        //book.bookmarkChart = dir.text;
        //book.bookmarkChartUrl = book.chartRootUrl + dir.url;
        //book.bookmarkChartUrl = combinUrl(book.chartRootUrl, dir.url);
        var dir = bookParaser.getDir(content.data);
        //book.bookname = dir.bookname;
        //book.author = dir.author;
        var br = $("<br />");
        var bookname = $("<span></span>");
        $(bookname).text("书名：" + dir.bookname);
        var author = $("<span></span>");
        $(author).text("作者：" + dir.author);
        $("div#result").empty();
        $("div#result").append(bookname);
        $("div#result").append(br);
        $("div#result").append(author);
        for (var i = 0; i < dir.items.length; i++){
            br = $("<br />");
            $("div#result").append(br);
            $("div#result").append(dir.items[i]);
        }
    };

    this.addChart = function(url, data){
        var result = bookParaser.parseResponse(url, data);
        $("div#result").empty();
        $("div#result").html(result.content);
    };
};

$(document).ready(function() {
    var testRuleView = new TestRuleView();
    var dirRefresh = new DirRefresh({"callback": testRuleView.showDir});
    $("button#dir").click(function(){
        var url = $("input").val();
        var book = {"chartRootUrl": url};
        dirRefresh.getBookDir(book);
    });

    $("button#content").click(function(){
        var url = $("input").val();
        // 设置接收到的内容的字符集，防止乱码
        $.ajaxSetup({
            'beforeSend': function(xhr) {
                xhr.overrideMimeType('text/html; charset=gb2312');
            },
        });
        $.get(url, function(data, status, xhr) {
            if (status == "success") {
                testRuleView.addChart(url, data);
            }
        });
    });
});
