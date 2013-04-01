var DirRefresh = function(options){
	var curBook;
	var callback;
	var worker = new Worker("js/workerHttp.js");
	worker.onmessage = function(event){
		var response = event.data;
		if (response.statusText == "OK"){
			callback(response.input.book, response);
		};
	};
	
	var init = function(options){
		callback = options.callback || function(){};
	};
	
	this.getBookDir = function(books){
		if (typeof(books.length) == "undefined"){
			worker.postMessage({
				"type" : "get",
				"url" : books.chartRootUrl,
				"book" : books,
				"overrideMimeType" : "text/html; charset=gb2312",
			});
		}
		else{
			for (var i = 0; i < books.length; i++){
				worker.postMessage({
					"type" : "get",
					"url" : books[i].chartRootUrl,
					"book" : books[i],
					"overrideMimeType" : "text/html; charset=gb2312",
				});
			}
		}
	};
	
	init(options);
};

//var dirRefresh = new DirRefresh();
