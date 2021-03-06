Date.prototype.format = function(fmt) { //author: meizz
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

function postInit() {
	bookManager.postInit();
};

function refreshDir() {
	bookManager.refreshDir();
}

var BookManager = function(options) {
	//var background = chrome.extension.getBackgroundPage();
	var bookCache;
	var dirRefresher;
	var bookView;
	var bookParaser;
	var updateNum = 0;

	var init = function(options) {
		bookCache = new BookCache();

		dirRefresher = new DirRefresh({
			"callback": updateDir,
		});

		bookParaser = new BookParaser();
		setTimeout("postInit()", 500);
	};

	this.postInit = function() {
		if (bookCache.isOpenOver()) {
			refreshDir();
		} else {
			setTimeout("postInit()", 500);
		}
	};

	var sendViewMessage = function(type, param) {
		if (bookView) {
			bookView.receiveMessage({
				"type": type,
				"param": param,
			});
		}
	};

	this.retrieveBook = function(url, book) {
		if (url) {
			// 设置接收到的内容的字符集，防止乱码
			$.ajaxSetup({
				'beforeSend': function(xhr) {
					xhr.overrideMimeType('text/html; charset=gb2312');
				},
			});
			$.get(url, function(data, status, xhr) {
				if (status == "success") {
					var result = bookParaser.parseResponse(url, data);
					if (result.isChart) {
						var chart = result;
						sendViewMessage("addChart", chart);
						book.bookmarkChart = chart.title;
						book.bookmarkChartUrl = this.url;
						var books = bookCache.updateBook(book);
						sendViewMessage("showBookShelf", books);
					} else {
						if (book.bookname) {
							sendViewMessage("showDir", result.bookdir);
						} else {

						}
					}
				}
			});
		};
	};

	var updateDir = function(book, content) {
		var dir;
		if (book.bookmarkChart == null) {
			dir = bookParaser.getFirstDir(content.data);
			book.bookmarkChart = dir.text;
			//book.bookmarkChartUrl = book.chartRootUrl + dir.url;
			book.bookmarkChartUrl = combinUrl(book.chartRootUrl, dir.url);
			dir = bookParaser.getDir(content.data);
			book.bookname = dir.bookname;
			book.author = dir.author;
		}

		var dt = new Date();
		var dtfmt = "yyyy年MM月dd日";
		dir = bookParaser.getLastDir(content.data);
		//dir.url = book.chartRootUrl + dir.url;
		dir.url = combinUrl(book.chartRootUrl, dir.url);
		if (book.latestChart != dir.text || book.latestChartUrl != dir.url) {
			book.latestChartUrl = dir.url;
			book.latestChart = dir.text;
			book.updateDate = dt.format(dtfmt); //dt.toLocaleDateString();
			var books = bookCache.updateBook(book);
			sendViewMessage("showBookShelf", books);
		}

		if (book.updateDate == dt.format(dtfmt)) {
			updateNum++;
			showUpdateNum(updateNum);
		}
	};

	this.refreshDir = function() {
		var books = bookCache.getBook();
		updateNum = 0;
		dirRefresher.getBookDir(books);
		setTimeout("refreshDir()", 3600 * 1000);
	};

	this.getBook = function(index) {
		return bookCache.getBook(index);
	}

	this.addBook = function(option) {
		if (option.chartRootUrl == "") {
			return;
		}
		var book = bookCache.createBook();
		book.bookname = option.bookname;
		book.author = option.author;
		book.chartRootUrl = option.chartRootUrl;

		dirRefresher.getBookDir(book);
	};

	this.delBook = function(book) {
		var books = bookCache.delBook(book);
		sendViewMessage("showBookShelf", books);
		refreshDir();
	};

	this.registerView = function(view) {
		bookView = view;
	};

	this.exportDB = function() {
		var cache = bookCache.getBook();
		var out = JSON.stringify(cache);
		var blob = new Blob([out]);
		saveAs(blob, "readerConfig.txt");
	};

	this.getConfig = function() {
		//var cache = bookCache.
	};

	init(options);
};

bookManager = new BookManager();

function testExportConfig() {
	bookManager.exportDB();
}
