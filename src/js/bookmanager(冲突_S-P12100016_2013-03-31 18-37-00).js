hfunction postInit(){
	bookManager.postInit();
};

function refreshDir(){
	bookManager.refreshDir();
}

var BookManager = function(options){
	//var background = chrome.extension.getBackgroundPage();
	var bookCache;
	var dirRefresher;
	var bookView;
	var bookParaser;
	var updateNum = 0;
	
	var init = function(options){
		bookCache = new BookCache();

		dirRefresher = new DirRefresh({
			"callback" : updateDir,
		});
		
		bookParaser = new BookParaser();
		setTimeout("postInit()", 500);
	};

	this.postInit = function(){
		if (bookCache.isOpenOver()){
			refreshDir();
		}
		else{
			setTimeout("postInit()", 500);
		}
	};

	var sendViewMessage = function(type, param){
		if (bookView){
			bookView.receiveMessage({
				"type": type,
				"param": param,
			});
		}
	};

	this.retrieveBook = function(url, book){
		if (url){
			// 设置接收到的内容的字符集，防止乱码
			$.ajaxSetup({
	    		'beforeSend' : function(xhr) {
	        		xhr.overrideMimeType('text/html; charset=gb2312');
	    		},
			});
			$.get(url, function(data, status, xhr){
				if (status == "success"){
					var result = bookParaser.parseResponse(url, data);
					if (result.isChart){
						var chart = result;
						sendViewMessage("addChart", chart);
						book.bookmarkChart = chart.title;
						book.bookmarkChartUrl = this.url;
						var books = bookCache.updateBook(book);
						sendViewMessage("showBookShelf", books);
					}
					else {
						if (book.bookname){
							sendViewMessage("showDir", result.bookdir);
						}
						else{
							book.bookname = result.
						}
					}
				}
			});
		};
	};

	var updateDir = function(book, content){
		var dir;
		if (book.bookmarkChart == null){
			dir = bookParaser.getFirstDir(content.data);
			book.bookmarkChart = dir.text;
			book.bookmarkChartUrl = book.chartRootUrl + dir.url;
		}
		
		var dt = new Date();
		dir = bookParaser.getLastDir(content.data);
		dir.url = book.chartRootUrl + dir.url;
		if (book.latestChart != dir.text || book.latestChartUrl != dir.url){
			book.latestChartUrl = dir.url;
			book.latestChart = dir.text;
			book.updateDate = dt.toLocaleDateString();
			var books = bookCache.updateBook(book);
			sendViewMessage("showBookShelf", books);
			var dirs = bookParaser.getDir(content.data);
			bookCache.updateDir(book, dirs);
		}

		if (book.updateDate == dt.toLocaleDateString()){
			updateNum++;
			showUpdateNum(updateNum);
		}
	};

	this.refreshDir = function(){
		var books = bookCache.getBook();
		updateNum = 0;
		dirRefresher.getBookDir(books);
		setTimeout("refreshDir()", 3600 * 1000);
	};
	
	this.getBook = function(index){
		return bookCache.getBook(index);
	}
	
	this.addBook = function(option){
		if (option.bookname == "" || option.chartRootUrl == ""){
			return;
		}
		var book = bookCache.createBook();
		book.bookname = option.bookname;
		book.author = option.author;
		book.chartRootUrl = option.chartRootUrl;
		var books = bookCache.addBook(book);
		sendViewMessage("showBookShelf", books);
		
		dirRefresher.getBookDir(book);
	};
	
	this.delBook = function(book){
		bookCache.delBook(book.bookname);
	};

	this.registerView = function(view){
		bookView = view;
	};
	
	init(options);
};

bookManager = new BookManager();
