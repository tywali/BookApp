var chartFormat = {
	"rep": [
		["&amp;", "&"],
		["amp;", ""],
		["[wWｗＷ]{3}.*?[cCｃ][oOｏ][mMＭ]\d*[,]*", ""],
		["．ｃｏｍ", ""],
		["无错小说网不跳字", ""], ],
};

var chartReplKeys = [
	["十之**", "十之八九"],
	["十有**", "十有八九"],
	["强横**", "强横肉体"],
	["拟容**", "拟容大法"],
	["玄魔**", "玄魔大法"],
	["小**诀", "小云雨诀"],
	["一个**上半身", "一个赤裸上半身"],
	["，所不辞", "，在所不辞"],
	["战斗**", "战斗欲望"],
	["进取**", "进取欲望"],
	["半身**", "半身赤裸"],
	["经**力", "经大法力"],
	];

var pageFilter = {
	"bookname": {
		"find": ["h1.bname", "span.bigname", "h1"],
		"del": ["a"],
		"repl": [
			[" 全文阅读更新列表", ""], ],
	},

	"author": {
		"find": ["h3:contains('作者')", "div:contains('作者')"],
		"del": [""],
		"repl": [
			["&nbsp;", ""],
			["作者：", ""],
			["<.*", ""]
		],
	},

	"content": {
		"find": ["div#content", "#contents", "div#htmlContent"],
		"del": ["script", "img"],
	},

	"title": {
		"find": ["div#title", "h1"],
		"del": ["a"],
	},

	"next": {
		"find": ["a:contains('下一章')", "a:contains('下一页')"],
		"del": [],
	},

	"prev": {
		"find": ["a:contains('上一章')", "a:contains('上一页')"],
		"del": [],
	},

	"dir": {
		"find": ["span.c a", "div.dccss a", "li a"],
		"del": [],
	},

	"diritem": {
		"repl": [
			["[{（【].*?[求更补票].*", ""],
			["全文阅读", ""], ],
		"head": [
			["(?=第*[一二三四五六七八九十两123456789])", ""], ],
	},
};

function formatBook(content, rule) {
	var len = rule.length;
	for (var i = 0; i < len; i++) {
		var find = rule[i][0];
		var repl = rule[i][1];
		var regx = new RegExp(find, "g");
		content = content.replace(regx, repl);
	}
	return content;
}

var BookParaser = function() {
	var chartFormater = new BookFormat(chartReplKeys);

	var urlIsChart = function(url) {
		var pos = url.lastIndexOf("/");
		if (pos == (url.length - 1)) {
			return false;
		}
		return true;
	}

	var find = function(sornode, methord, cdn) {
		var content = null;
		if (sornode[methord]) {
			for (var i in cdn.find) {
				content = sornode[methord](cdn.find[i]);
				if (content.length > 0) {
					break;
				}
			}
		}
		return content;
	};

	var parase = function(sornode, parm) {
		var content;
		// 同级查找
		content = find(sornode, "next", parm);
		if (!content || content.length == 0) {
			//子元素查找
			content = find(sornode, "find", parm);
		}
		// 删除不需要的节点
		for (var i in parm.del) {
			var node = content.find(parm.del[i]);
			if (node.length > 0) {
				node.remove();
			}
		}
		return content;
	};

	var paraseChart = function(data, filter) {
		var chart = {
			"title": "",
			"content": "",
			"next": "",
			"prev": "",
			"root": "",
			"isChart": true,
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

	var paraseDir = function(srcnode) {
		var dir = {
			bookname: "",
			author: "",
			items: "",
		};
		var flag = true;
		// 查找书名
		dir.bookname = parase(srcnode, pageFilter.bookname);
		if (dir.bookname.length > 0) {
			dir.bookname = dir.bookname[0].innerHTML;
			dir.bookname = replaceString(pageFilter.bookname.repl, dir.bookname);
		}
		// 查找作者
		//dir.author = parase(srcnode, pageFilter.author);
		var author;
		var author1 = find(srcnode, "next", pageFilter.author);
		var author2 = find(srcnode, "find", pageFilter.author);
		if (author1.length > 0 && author2.length > 0) {
			author1 = author1[0].innerHTML;
			author2 = author2[0].innerHTML;
			author = (author1.length < author2.length) ? author1 : author2;
			author = replaceString(pageFilter.author.repl, author);
		}
		dir.author = author;

		// 查找目录列表
		dir.items = parase(srcnode, pageFilter.dir);

		return dir;
	};

	var getChartRoot = function(url) {
		var pos = url.lastIndexOf("/");
		return url.substr(0, pos + 1);
	};

	this.getDir = function(srcnode, index) {
		var bookdir = paraseDir($(srcnode));
		if (!index || index < 0) {
			return bookdir;
		}

		if (bookdir.items.length > 0) {
			if (index == "first") {
				index = 0;
			} else if (index == "last") {
				index = bookdir.items.length - 1;
			} else {
				index = parseInt(index);
			}
			var item = bookdir.items[index];
			formatTitle(item, pageFilter.diritem);
			var dir = {
				"url": "",
				"text": "",
			};
			dir.url = $(item).attr("href");
			dir.text = $(item).text();
			return dir;
		}
		return null;
	};

	this.getLastDir = function(srcnode) {
		try {
			var dir = this.getDir(srcnode, "last");
			if (dir.text == "") {
				var page = this.getDir(srcnode);
				dir = this.getDir(srcnode, page.items.length - 2);
			}
			return dir;
		} catch (err) {
			Log.log(err);
		}

		return null;
	};

	this.getFirstDir = function(srcnode) {
		return this.getDir(srcnode, "first");
	};

	this.parseResponse = function(url, data) {
		if (urlIsChart(url)) {
			var chart = paraseChart(data, pageFilter);
			chart.url = url;
			chart.root = getChartRoot(url);
			chart.next = combinUrl(chart.root, chart.next);
			chart.prev = combinUrl(chart.root, chart.prev);
			chart.content = formatBook(chart.content, chartFormat.rep);
			chart.content = chartFormater.format(chart.content);
			return chart;
		} else {
			var dir = {
				"isChart": false,
				"bookdir": "",
				"bookname": "",
				"author": "",
			};
			dir.bookdir = paraseDir($(data)).items;
			for (var i = 0; i < dir.bookdir.length; i++) {
				formatTitle(dir.bookdir[i], pageFilter.diritem);
			};
			return dir;
		}
	};

	var replaceString = function(fmt, text) {
		var find, repl, regx;
		for (var i = 0; i < fmt.length; i++) {
			find = fmt[i][0];
			repl = fmt[i][1];
			regx = new RegExp(find, "g");
			text = text.replace(regx, repl);
		}
		return text;
	};

	var formatTitle = function(node, rule) {
		if (!rule) {
			return node;
		}
		node = $(node);
		if (node.length == 0) {
			return node;
		}
		var text = node.html();
		var flag = 0;
		// 去掉前面无用的文字
		for (var i = 0; i < rule.head.length; i++) {
			var find = rule.head[i][0];
			var repl = rule.head[i][1];
			var regx = new RegExp(find, "g");
			var res = regx.exec(text);
			if (res) {
				if (res.index > 0) {
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