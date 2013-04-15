var CommandQueue = function(){
	var lock = false;
	var queue = new Array();
	var currentCmd;
	
	runNext = function(){
		if (lock) return;
		if (queue.length > 0){
			lock = true;
			currentCmd = queue.shift();
			currentCmd.command(currentCmd.param, currentCmd.queueCallback);
		}
	};
	
	queueCallback = function(obj){
		currentCmd.callback(obj);
		lock = false;
		runNext();
	};
	
	this.push = function(command, param, callback){
		var cmd = {
			"command" : command,
			"param" : param,
			"callback" : callback || function(){},
			"queueCallback" : queueCallback,
		};
		queue.push(cmd);
		runNext();
	};
	
	this.runNextCommand = function(){
		lock = false;
		runNext();
	};
};

var BookInfo = {
	"bookname" : null,
	"author" : null,
	"bookmarkChart" : null,
	"bookmarkChartUrl" : null,
	"latestChart" : null,
	"latestChartUrl" : null,
	"chartRootUrl" : null,
	"updateDate" : null,
	"bookSite" : null,
};

var BookDatabase = function(){
	var bookDatabase;
	var openCallback;
	var commandQueue = new CommandQueue();
	var books;
	//var openFinish;
	
    var errorHandler = function(event){
        console.log("Database error: " + event.target.errorCode);
    };

	var openDatabase = function(parm, callback){
		openCallback = callback;
		openFinish = false;
		var request = window.indexedDB.open("BookDatabase", 3);
		
	    request.onerror = errorHandler;
		request.onsuccess = function(event){
			bookDatabase = event.target.result;
			openFinish = true;
			openCallback();
		};
		request.onupgradeneeded = function(event){
			bookDatabase = event.target.result;
			
			//创建书籍表
			var objectStore = bookDatabase.createObjectStore("books", { keyPath: "bookname" });
			objectStore.createIndex("books_bookname", "bookname", { unique: true });
			objectStore.createIndex("boks_author", "author", { unique: false });
			
			//创建网站表
			objectStore = bookDatabase.createObjectStore("booksite", { keyPath: "url" });
			objectStore.createIndex("booksite_url", "url", { unique: true });
		};
	};
	
	var getObjectStore = function(name){
		return bookDatabase.transaction(name, "readwrite").objectStore(name);
	};
	
	var _getAllBook = function(parm, callback){
		var bookStore = getObjectStore("books");
		bookStore.openCursor().onsuccess = function(event){
			var cursor = event.target.result;
			if (cursor){
				books.push(cursor.value);
				//parm.callback(cursor.value);
				cursor.continue();
			}
			else{
				callback(books);
			};
		};
	};
	
	this.addBook = function(book){
		var bookStore = getObjectStore("books");
		bookStore.add(book);
	};

	this.updateBook = function(book){
		var bookStore = getObjectStore("books");
		bookStore.put(book);
	};
	
	this.delBook = function(bookname){
		var bookStore = getObjectStore("books");
		bookStore.delete(bookname);
	};
	
	this.getAllBook = function(callback){
		books = new Array();
		commandQueue.push(_getAllBook, null, callback);
	};
	
	commandQueue.push(openDatabase, null, null);
};

var BookCache = function(){
	var cache;
	var database;
	var isRetrieveOver;
	var fileAPI;

	var init = function(){
		database = new BookDatabase();
		database.getAllBook(retrieve);
		isRetrieveOver = false;
		fileAPI = new FileAPI();
	};

	var retrieve = function(books){
		cache = books;
		cache.sort(bookSort);
		isRetrieveOver = true;
	};

	var bookSort = function(book_1, book_2){
		var date = book_1.updateDate - book_2.updateDate;
		if (book_1.updateDate == book_2.updateDate){
			// 用localeCompare()可以保证按拼音排序
			return book_1.bookname.localeCompare(book_2.bookname);
		}
		else {
			return -book_1.updateDate.localeCompare(book_2.updateDate);
			//return book_1.updateDate < book_2.updateDate;
		}
	};

	this.getBook = function(index){
		if (!isRetrieveOver){
			return null;
		}

		if (index){
			if (index >= 0 && index < cache.length){
				return cache[index];
			}
			var bookInfo = JSON.parse(JSON.stringify(BookInfo));
			return bookInfo;
		}
		else{
			return cache;
		}
	};

	var getBookIndex = function(book){
		for (var i = 0; i < cache.length; i++) {
			if (cache[i].bookname == book.bookname){
				return i;
			}
		};

		return -1;
	};

	this.addBook = function(book){
		return this.updateBook(book);
	};

	this.delBook = function(book){
		var index = getBookIndex(book);
		if (index >= 0){
			cache.splice(index, 1);
			database.delBook(book.bookname);
		}
		return this.getBook();
	};

	this.updateBook = function(book){
		var index = getBookIndex(book);
		if (index >= 0){
			cache.splice(index, 1, book);
		}
		else{
			cache.push(book);
		}
		cache.sort(bookSort);
		database.updateBook(book);

		return this.getBook();
	};

	this.createBook = function(){
		return this.getBook(-1);
	};

	this.updateDir = function(book, bookdir){
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
		fileAPI.writeFile(book.bookname, oFragment.html(), "replace");
	}

	this.isOpenOver = function(){
		return isRetrieveOver;
	};

	init();
};
