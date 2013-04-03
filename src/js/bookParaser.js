var chartFormat = {
		"rep" : [
			["&amp;", "&"],
			["[wWｗＷ]{3}.*?[cCｃ][oOｏ][mMＭ]\d*[,]*", ""],
			["．ｃｏｍ", ""],
		],
	};

var pageFilter = {
 		"bookname" : {
			"find" : ["h1.bname", "h1"],
			"del" :  [""],
			"repl" : [
				[" 全文阅读更新列表", ""],
			],
 		},

 		"author" : {
			"find" : ["h3:contains('作者')", "div:contains('作者')"],
			"del" : [""],
			"repl" : [
				["作者：", ""],
			],
 		},

		"content" : {
			"find" : ["div#content", "#contents"],
			"del" : ["script"],
		},	
		
		"title" : {
			"find" : ["div#title", "h1"],
			"del" : ["a"],
		},
		
		"next" : {
			"find" : ["a:contains('下一章')", "a:contains('下一页')"],
			"del" : [],
 		},
 		
		"prev" : {
			"find" : ["a:contains('上一章')", "a:contains('上一页')"],
			"del" : [],
 		},
 		
 		"dir" : {
 			"find" : ["span.c a",  "div.dccss a"],
 			"del" : [],
 		},

 		"diritem" : {
 			"repl" : [
 				["[{（【].*?[求更补票].*", ""],
 				["全文阅读", ""],
 			],
 			"head" : [
 				["(?=第*[一二三四五六七八九十两123456789])", ""],
 			],
 		},
	};

function formatBook(content, rule){
	var len = rule.length;
	for (var i = 0; i < len; i++){
		var find = rule[i][0];
		var repl = rule[i][1];
		var regx = new RegExp(find, "g");
		content = content.replace(regx, repl);
	}
	return content;
}

var BookParaser = function(){
	var urlIsChart = function(url){
		var pos = url.lastIndexOf("/");
		if (pos == (url.length - 1)){
			return false;
		}
		return true;
	}

	var parase = function(sornode, parm){
		var content;
		//子元素查找
		for(var i in parm.find){
			content = sornode.find(parm.find[i]);
			if (content.length > 0){
				break;
			}
		}
		if (content.length == 0){
			// 同级查找
			for (var i in parm.find) {
				content = sornode.next(parm.find[i]);
				if (content.length > 0){
					break;
				}
			};
		}
		for(var i in parm.del){
			var node = content.find(parm.del[i]);
			if (node.length > 0){
				node.remove();
			}
		}
		return content; 
	};
	
	var paraseChart = function(data, filter){
		var chart = {
			"title" : "",
			"content" : "",
			"next" : "",
			"prev" : "",
			"root" : "",
			"isChart" : true,
		};
		var node = $(data);
		var title = parase(node, filter.title);
		formatTitle(title, pageFilter.diritem);
		chart.title = title.text();
		chart.content = parase(node, filter.content)[0].innerHTML;
		chart.next = parase(node, filter.next).attr("href");
		chart.prev = parase(node, filter.prev).attr("href");
		
		return chart;
	}
	
	var paraseDir = function(srcnode){
		var dir = {
			bookname : "",
			author : "",
			items : "",
		};
		dir.bookname = parase(srcnode, pageFilter.bookname);
		if (dir.bookname.length > 0){
			dir.bookname = dir.bookname[0].innerHTML;
			dir.bookname = replaceString(pageFilter.bookname.repl, dir.bookname);
		}
		dir.author = parase(srcnode, pageFilter.author);
		if (dir.author.length > 0){
			dir.author = dir.author[0].innerHTML;
			dir.author = replaceString(pageFilter.author.repl, dir.author);
		}
		dir.items = parase(srcnode, pageFilter.dir);

		return dir;
	};
	
	var getChartRoot = function(url){
		var pos = url.lastIndexOf("/");
		return url.substr(0, pos + 1);
	};
	
	this.getDir = function(srcnode, index){
		var bookdir = paraseDir($(srcnode));
		if (!index || index < 0){
			return bookdir;
		}

		if (bookdir.items.length > 0){
			if (index == "first"){
				index = 0;
			}
			else if (index == "last"){
				index = bookdir.items.length - 1;
			}
			else{
				index = parseInt(index);
			}
			var item = bookdir.items[index];
			formatTitle(item, pageFilter.diritem);
			var dir = {
				"url" : "",
				"text" : "",
			};
			dir.url = $(item).attr("href");
			dir.text = $(item).text();
			return dir;
		}
		return null;
	};
	
	this.getLastDir = function(srcnode){
		return this.getDir(srcnode, "last");
	};
	
	this.getFirstDir = function(srcnode){
		return this.getDir(srcnode, "first");
	};

	this.parseResponse = function(url, data){
		if (urlIsChart(url)){
			var chart = paraseChart(data, pageFilter);
			chart.url = url;
			chart.root = getChartRoot(url);
			chart.next = chart.root + chart.next;
			chart.prev = chart.root + chart.prev;
			chart.content = formatBook(chart.content, chartFormat.rep);
			return chart;
		}
		else{
			var dir = {
				"isChart" : false,
				"bookdir" : "",
				"bookname" : "",
				"author" : "",			
			};
			dir.bookdir = paraseDir($(data)).items;
			for (var i = 0; i < dir.bookdir.length; i++) {
				formatTitle(dir.bookdir[i], pageFilter.diritem);
			};
			return dir;
		}
	};

	var replaceString = function(fmt, text){
		var find, repl, regx;
		for (var i = 0; i < fmt.length; i++){
			find = fmt[i][0];
			repl = fmt[i][1];
			regx = new RegExp(find, "g");
			text = text.replace(regx, repl);
		}
		return text;
	};

	var formatTitle = function(node, rule){
		if (!rule){
			return node;
		}
		node = $(node);
		var text = node.html();
		var flag = 0;
		// 去掉前面无用的文字
		for (var i = 0; i < rule.head.length; i++) {
			var find = rule.head[i][0];
			var repl = rule.head[i][1];
			var regx = new RegExp(find, "g");
			var res = regx.exec(text);
			if (res){
				if (res.index > 0){
					text = text.substr(res.index);
				}
			}
		}

		// 去掉后面无用的文字
		text = replaceString(rule.repl, text);

		node.html(text);
		return node;
	}
};
