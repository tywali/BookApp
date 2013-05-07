function combinUrl(url1, url2){
    if (!url2) return url1;
    
    url2 = url2.trim();
    // 最后一个字符如果是"/"，去掉，避免被认为路径是目录
    if (url2.substr(url2.length - 1, 1) == "/"){
        url2 = url2.substr(0, url2.length - 1);
    }
    // 以http://开头，则自带的就是全路径，不需要补全
    if (url2.substr(0, 7) == "http://"){
        return url2;
    }
    // 以/开头，是绝对路径，需要从网站的根目录算起
    if (url2.substr(0, 1) == "/"){
        var pos = url1.indexOf("/", 8);
        url1 = url1.substr(0, pos);
    }
    url1 = url1 + url2;
    return url1;
}

function saveAs(blob, filename) {
    var type = blob.type;
    var force_saveable_type = 'application/octet-stream';

    // 强制下载，而非在浏览器中打开
    if (type && type != force_saveable_type) { 
        var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
        blob = slice.call(blob, 0, blob.size, force_saveable_type);
    }

    var url = URL.createObjectURL(blob);
    var save_link = document.createElement('a');
    save_link.style.visibility = "hidden";
    save_link.href = url;
    save_link.download = filename;
    document.body.appendChild(save_link);
    // 触发链接的click事件，对于低版本浏览器，需使用下面注释的代码触发
    // 下列代码（包括注释的代码），均不能在Chrome的后台页面中正常执行，只能第一次载入时执行成功
    save_link.click();
    //var event = document.createEvent('MouseEvents');
    //event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    //event.initEvent("click", true, true);
    //save_link.dispatchEvent(event);
    //URL.revokeObjectURL(url);
    document.body.removeChild(save_link);
}

function createJSONObj(sor) {
    return JSON.parse(JSON.stringify(sor));
}

function getSelectText() {
    var selectTxt = null;
    // 标准浏览器支持的方法
    if (window.getSelection) {
        selectTxt=window.getSelection();
    }
    // IE浏览器支持的方法
    else if (document.selection) {
        selectTxt=document.selection.createRange().text;
    }
    return selectTxt;
}
