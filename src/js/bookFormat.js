var BookFormat = function(strKeys) {
    var tblRoot;

    var init = function(strKeys) {
        makeTree(strKeys);
    };

    var makeTree = function(arrKeys) {
        var tblCur = tblRoot = {};
        var key, c;

        for (var i = 0, n = arrKeys.length; i < n; i++) {
            key = arrKeys[i];
            for (var j = 0; j < key[0].length; j++) {
                c = key[0][j];
                //生成子节点
                if (c in tblCur) {
                    tblCur = tblCur[c];
                } else {
                    tblCur = tblCur[c] = {};
                }
            }
            tblCur.repl = key[1];
            tblCur.end = true;
            tblCur = tblRoot;
        }
    };

    this.format = function(content) {
        var tblCur, tblPrev = null;
        var i = 0;
        var n = content.length;
        var p, v, c;
        var arrMatch = [];
        var res = "";

        while (i < content.length) {
            tblCur = tblRoot;
            p = i;
            v = 0;

            while (1) {
                c = content.charAt(p++);
                tblCur = tblCur[c];
                if (!tblCur) {
                    i++;
                    break;
                }

                //找到匹配关键字
                if (tblCur.end) {
                    v = p;
                    tblPrev = tblCur;
                }
            }

            //最大匹配
            if (v) {
                var sorLen, desLen;
                sorLen = v - i + 1;
                desLen = tblPrev.repl.length;
                res = content.slice(v, content.length);
                content = content.slice(0, i - 1).concat(tblPrev.repl).concat(res);
                i = v - sorLen + desLen;
                tblPrev = null;
            }
        }

        return content;
    };

    init(strKeys);
};

function bookFormatTest() {
    var keys = [
        ["十有**", "十有八九"],
        ["十之**", "十之八九"],
        ["十有**的", "十有八九的"], 
        ["燃文阅读", ""],
        ];
    var fmt = new BookFormat(keys);
    var strSor = "嗯，燃文阅读十天，十有**就是他了，我已经了解了十之**了，十有**的把握搞定。";
    var strDes = "嗯，十天，十有八九就是他了，我已经了解了十之八九了，十有八九的把握搞定。";

    var find = fmt.format(strSor);
    if (find != strDes) {
        console.log("format error!");
        console.log("sor:" + strDes);
        console.log("des:" + find);
    }
}
