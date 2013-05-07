var CommandQueue = function() {
	var lock = false;
	var queue = new Array();
	var currentCmd;

	runNext = function() {
		if (lock) return;
		if (queue.length > 0) {
			lock = true;
			currentCmd = queue.shift();
			currentCmd.command(currentCmd.param, currentCmd.queueCallback);
		}
	};

	queueCallback = function(obj) {
		currentCmd.callback(obj);
		lock = false;
		runNext();
	};

	this.push = function(command, param, callback) {
		var cmd = {
			"command": command,
			"param": param,
			"callback": callback || function() {},
			"queueCallback": queueCallback,
		};
		queue.push(cmd);
		runNext();
	};

	this.runNextCommand = function() {
		lock = false;
		runNext();
	};
};

var BookInfo = {
	"bookname": null,
	"author": null,
	"bookmarkChart": null,
	"bookmarkChartUrl": null,
	"latestChart": null,
	"latestChartUrl": null,
	"chartRootUrl": null,
	"updateDate": null,
	"bookSite": null,
};

var BookDatabase = function() {
	var bookDatabase;
	var openCallback;
	var commandQueue = new CommandQueue();
	var dbMetaData;
	//var openFinish;

	var errorHandler = function(event) {
		console.log("Database error: " + event.target.errorCode);
	};

	var _openDatabase = function(parm, callback) {
		openCallback = callback;
		openFinish = false;
		//var request = window.indexedDB.open("BookDatabase", 4);
		var request = window.indexedDB.open("BookDatabase", parm.version);

		request.onerror = errorHandler;
		request.onsuccess = function(event) {
			bookDatabase = event.target.result;
			openFinish = true;
			openCallback();
		};
		request.onupgradeneeded = function(event) {
			bookDatabase = event.target.result;
			var tables = parm.table;

			for (var i = 0; i < tables.length; i++) {
				createTable(tables[i]);
			}
		};

	};

	var isTableExist = function(name) {
		for (var i = 0; i < bookDatabase.objectStoreNames.length; i++) {
			if (bookDatabase.objectStoreNames[i] == name) {
				return true;
			}
		}
		return false;
	};

	var createTable = function(options) {
		if (!isTableExist(options.name)) {
			var objectStore;
			objectStore = bookDatabase.createObjectStore(options.name, options.keyPath);
			for (var i = 0; i < options.idx.length; i++) {
				objectStore.createIndex(options.idx[i].name, options.idx[i].keyPath, options.idx[i].param);
			}
		}
	};

	this.openDatabase = function(options, callback) {
		dbMetaData = options;
		commandQueue.push(_openDatabase, options, callback);
	}

	var getObjectStore = function(name) {
		return bookDatabase.transaction(name, "readwrite").objectStore(name);
	};

	var _getAllData = function(param, callback) {
		var bookStore = getObjectStore(param.tableName);
		param.table = new Array();
		bookStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				param.table.push(cursor.value);
				cursor.
				continue ();
			} else {
				callback(param);
			};
		};
	};

	this.getAllData = function(options, callback) {
		commandQueue.push(_getAllData, options, callback);
	};

	this.insert = function(tableName, data) {
		var store = getObjectStore(tableName);
		store.add(data);
	};

	this.update = function(tableName, data) {
		var store = getObjectStore(tableName);
		store.put(data);
	}

	this.delete = function(tableName, data) {
		var store = getObjectStore(tableName);
		store.delete(data);
	}
};

var DBCache = function(options) {
	var db;
	var cacheCount, tableCount;
	var initCallback;
	var dataCache;
	var tables;

	var init = function(options) {
		initCallback = options.callback;
		tables = options.tables.table;

		db = new BookDatabase();
		db.openDatabase(options.tables, null);

		cacheCount = tableCount = 0;
		dataCache = {};
		for (var i = 0; i < options.cache.length; i++) {
			dataCache[options.cache[i]] = {};
			dataCache[options.cache[i]]["tableName"] = options.cache[i];
			dataCache[options.cache[i]]["table"] = null;
			tableCount++;
			db.getAllData(dataCache[options.cache[i]], retrieveEnd);
		}
	};

	var retrieveEnd = function() {
		cacheCount++;
		if (cacheCount == tableCount) {
			initCallback();
		}
	};

	var getKeyPath = function(tableName) {
		var table = tables[tableName];
		return table.keyPath.keyPath;
	};

	var getIndex = function(tableName, data) {
		var find = false;
		var keyPath = getKeyPath(tableName);
		if (typeof(keyPath) == "string") {
			for (var k = 0; k < dataCache[tableName].table.length; k++) {
				if (dataCache[tableName].table[k][keyPath] == data[keyPath]) {
					find = true;
					return k;
				}
			}
		} else {}
		if (find) {

		}
		return -1;
	};

	this.update = function(tableName, data) {
		var cache = dataCache[tableName].table;
		var index = getIndex(tableName, data);
		if (index >= 0) {
			cache.splice(index, 1, data);
		} else {
			cache.push(data);
		}
		db.update(tableName, data);

		return cache;
	};

	this.delete = function(tableName, data) {
		var cache = dataCache[tableName].table;
		var index = getIndex(tableName, data);
		if (index >= 0) {
			cache.splice(index, 1);
			var keyPath = getKeyPath(tableName);
			db.delete(tableName, data[keyPath]);
		}
		return cache;
	};

	this.sort = function(tableName, sortFunction) {
		dataCache[tableName].table.sort(sortFunction);
		return this.getCache(tableName);
	};

	this.getCache = function(tableName) {
		return dataCache[tableName].table;
	};

	init(options);
};

var BookCache = function() {
	var dbCache;
	var isRetrieveOver;
	var cacheCount = 0,
		tableCount = 0;

	var init = function() {
		var bookTables = {
			"version": 4,
			"table": {
				//书籍表
				"books": {
					"name": "books",
					"keyPath": {
						keyPath: "bookname"
					},
					"idx": [{
						"name": "books_bookname",
						"keyPath": "bookname",
						"param": {
							unique: true
						}
					}, {
						"name": "books_author",
						"keyPath": "author",
						"param": {
							unique: false
						}
					}]
				},
				//格式化规则表
				"formatRule": {
					"name": "formatRule",
					"keyPath": {
						keyPath: ["category", "type"]
					},
					"idx": [{
						"name": "rule_idx",
						"keyPath": ["category", "type"],
						"param": {
							unique: true
						}
					}],
				}
			}
		};

		dbCache = new DBCache({
			"tables": bookTables,
			"cache": ["books", "formatRule"],
			"callback": retrieveEnd
		});
		isRetrieveOver = false;
	};

	var retrieveEnd = function() {
		isRetrieveOver = true;
		dbCache.sort("books", bookSort);
	}

	var bookSort = function(book_1, book_2) {
		var date = book_1.updateDate - book_2.updateDate;
		if (book_1.updateDate == book_2.updateDate) {
			// 用localeCompare()可以保证按拼音排序
			return book_1.bookname.localeCompare(book_2.bookname);
		} else {
			return -book_1.updateDate.localeCompare(book_2.updateDate);
		}
	};

	this.getBook = function(index) {
		if (!isRetrieveOver) {
			return null;
		}
		var cache = dbCache.getCache("books");

		if (index) {
			if (index >= 0 && index < cache.length) {
				return cache[index];
			}
			var bookInfo = createJSONObj(BookInfo);
			return bookInfo;
		} else {
			return cache;
		}
	};

	this.addBook = function(book) {
		return this.updateBook(book);
	};

	this.delBook = function(book) {
		return dbCache.delete("books", book);
	};

	this.updateBook = function(book) {
		dbCache.update("books", book);
		return dbCache.sort("books", bookSort);
	};

	this.createBook = function() {
		return this.getBook(-1);
	};

	this.isOpenOver = function() {
		return isRetrieveOver;
	};

	var ruleSort = function(rule_1, rule_2) {

	};

	this.addRule = function(rule) {
		return this.updateRule(rule);
	};

	this.updateRule = function(rule) {
		dbCache.update("formatRule", rule);
		return dbCache.sort("formatRule", ruleSort);
	};

	this.getRule = function() {
		var cache = dbCache.getCache("formatRule");
		return cache;
	};

	init();
};
