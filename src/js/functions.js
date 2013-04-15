function combinUrl(url1, url2){
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
