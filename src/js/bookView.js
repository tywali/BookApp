var BookShelfView = function(options){
	var bookGrid;	// = bookView;
	
	var init = function(options){
		bookGrid = options.shelfArea;
	};

	this.showBookShelf = function(books){
		this.clearShelf();
		// 使用文档碎片技术提升性能
		var oFragment = $("<fragment></fragment>");
		for (var i = 0; i < books.length; i++){
			var book = books[i];
		    var row = $("<tr></tr>");
		    var ths = $(bookGrid).find("thead th");
		    $(ths).each(function(){
		        var fieldName = $(this).attr("fieldid");
		        var node = $("<td></td>");
		        var cell = node;//$(node).find("a");
		        $(cell).text(book[fieldName]);
		        if (book[fieldName + "Url"]){
		        	$(cell).attr("href", book[fieldName + "Url"]);
		        }
		        else{
		        	$(cell).attr("href", book["chartRootUrl"]);
		        }
		        $(row).append(node);
		    });
		    var node = $("<td></td>");
		    var img = $("<img />");
		    img.attr("src", "images/del.png");
		    img.attr("action", "del");
		    node.append(img);
		    $(row).append(node);
		    $(row).attr("bookname", book["bookname"]);
		    row[0].book = book;
		    oFragment.append(row);
		}
	    $(bookGrid).append(oFragment.find("tr"));
	};
	
	this.clearShelf = function(){
		$(bookGrid).find("tbody").empty();
	};
	
	this.getBook = function(node){
		var row = $(node).parent();
		var book =  $(row)[0].book;
		return book;
	};
	
	this.getUrl = function(node){
		return $(node).attr("href");
	};
	
	init(options);
};

var BookView = function(options){
	var bookShelf;	// = bookView;
	var showArea;	// = $(selector);
	var innerArea;
	var retrieve;
	var currentBook;
	
	var init = function(options){
		bookShelf = new BookShelfView(options);
		//bookGrid = options.shelfGrid;
		showArea = $(options.showArea);
		retrieve = options.retrieve || function(){};
		
		// 设置对象的tabindex属性不为0，则点击或调用focus()函数，该对象可以获得焦点
		showArea.attr("tabindex", "10");
		// 全屏模式下，对方向键只支持keydown事件
		showArea.keydown(function(e) {
			areaScroll(showArea, e);
		});

		showArea.mousewheel(function(event, detla){
			if (detla < 0){
				var key = {keyCode : 40};
				areaScroll(showArea, key);
			}
			else {
				var key = {keyCode : 38};
				areaScroll(showArea, key);
			}
		});

		/**
		 * 点击目录的章节看内容
		 */
		showArea.click(function(e, d){
			var node = $(e.target);
			var href = $(node).attr("href");
			if (href){
				//阻止链接的自动跳转
				e.preventDefault();
				var url = currentBook.chartRootUrl + href;
				innerArea.empty();
				retrieve(url, currentBook);
			}
		});
		// 增加表格用来阅读
		//showArea.append("<table id='readArea'><tbody></tbody></table>");
		innerArea = showArea.find("tbody");
	};
	
	/**
	 * 用按键控制滚动
 	 * @param {Object} area
 	 * @param {Object} key - 按下的按键，只处理PgUp, PgDn, Up, Down这4个按键
	 */	
	var areaScroll = function(area, key){
		// 得到显示区域高度
		var areaHeight = area.height();
		// 得到字体大小，注意是字符串，后缀为px
		var fontSize = area.css('font-size');
		// 根据字体大小得到字体高度，以便按行滚动，注意要转换为数字，否则就是字符串相加了
		var lineHeight = parseInt(fontSize.replace("px", "")) * 1.5;
		area = area[0];
		switch(key.keyCode){
			case 34:	// PageDown
				area.scrollTop += areaHeight;
				break;
			case 33:	// PageUp
				area.scrollTop -= areaHeight;
				break;
			case 38:	// KeyUp
				area.scrollTop -= lineHeight;
				break;
			case 40:	// KeyDown
				area.scrollTop += lineHeight;
				break;
		}
		
		if (isNeedNextChart(showArea)){
			var nexturl = innerArea.find("tr:last").attr("next");
			retrieve(nexturl, currentBook);
		}
		else if (isNeedPrevChart(showArea)){
			var prevurl = innerArea.find("tr:first").attr("prev");
			retrieve(prevurl, currentBook);
		}
	};
	
	var isNeedNextChart = function(area){
		// 得到显示区域高度
		var areaHeight = area.height();
		area = area[0];
		var offset = area.scrollHeight - area.scrollTop;
		if (offset < areaHeight * 2){
			return true;
		}
		return false;
	};
	
	var isNeedPrevChart = function(area){
		// 得到显示区域高度
		var areaHeight = area.height();
		area = area[0];
		//var offset = area.scrollHeight - area.scrollTop;
		if (area.scrollTop < areaHeight * 1 - 10){
			return true;
		}
		return false;
	};
	
	var isNextChart = function(chart){
		var nexturl = innerArea.find("tr:last").attr("next");
		if (nexturl == chart.url){
			return true;
		}
		return false;
	};
	
	var isPrevChart = function(chart){
		var prevUrl = innerArea.find("tr:first").attr("prev");
		if (prevUrl == chart.url){
			return true;
		}
		return false;
	};
	
	var isRepeatChart = function(chart){
		var node = innerArea.find("[url='" + chart.url + "']");
		if (node.length > 0){
			return true;
		}
		return false;
	};
	
	var isChartCountOverFlow = function(){
		var charts = innerArea.find("tr");
		if (charts.length >= 3){
			return true;
		}
		return false;
	};
	
	var onFullScreenEvent = function(status){
		// 退出全屏状态
		if (status == false){
			innerArea.empty();
		}
	};
	
	var fullScreen = function(e){
		$(showArea).fullScreen({
			"callback" : onFullScreenEvent,
		});
		$(showArea).focus();
		//e.preventDefault();
	};
	
	this.addChart = function(chart){
		if (isRepeatChart(chart)){
			return;
		}
		var node = $("<tr></tr>");
		var title = $("<h3></h3>").text(chart.title);
		var content = $("<p></p>").html(chart.content);
		$(node).append(title);
		$(node).append(content);
		$(node).attr("prev", chart.prev);
		$(node).attr("url", chart.url);
		$(node).attr("next", chart.next);
		// 向上翻页则在前面增加，同时调整滚动位置
		if (isPrevChart(chart)){
			var area = showArea[0];
			var oldHeight = area.scrollHeight;
			var oldpos = area.scrollTop;
			innerArea.prepend(node);
			// 调整滚动条位置，防止直接滚动到起始位置
			area.scrollTop = area.scrollHeight - oldHeight + oldpos;
			if (isChartCountOverFlow()){
				//innerArea.find("tr:last").remove();
			}
		}
		// 向下翻页则在后面增加
		else{
			innerArea.append(node);
			if (isChartCountOverFlow()){
				//innerArea.find("tr:first").remove();
			}
		}
	};
	
	this.showDir = function(bookdir){
		innerArea.empty();
		var node;
		var len = bookdir.length;
		var oFragment = $("<fragment></fragment>");
		for(var i = 0; i < len; i++){
			if (i % 4 == 0){
				oFragment.append(node);
				node = $("<tr></tr>");
			}
			var cell = $("<td></td>");
			cell.append(bookdir[i]);
			node.append(cell);
		}
		oFragment.append(node);
		innerArea.append(oFragment.find("tr"));
	};
	
	this.showBook = function(event){
		var data = event.target;
		var url = bookShelf.getUrl(data);
		currentBook = bookShelf.getBook(data);
		if (currentBook){
			innerArea.empty();
			retrieve(url, currentBook);
			fullScreen(event);
		}
	};
	
	this.showBookShelf = function(books){
		bookShelf.showBookShelf(books);
	};

	this.receiveMessage = function(message){
		this[message.type](message.param);
	};

	this.getBook = function(node){
		return bookShelf.getBook(node);
	}
	
	init(options);
};
