var FileAPI = function(){
	var workerFile = new Worker("js/workerFileAPI.js");
	workerFile.onmessage = function(event){
		//alert(event.data.result);
	}
	
	workerFile.onerror = function(event){
		//alert(event.message);
	}
	
	this.writeFile = function(name, content, writeMode){
		workerFile.postMessage({
			"type": "writeFile",
			"filename": name,
			"content": content,
			"contentype" : "text",
			"writemode" : writeMode,
		});
	};
	
	this.readFile = function(name){
		workerFile.postMessage({
			"type" : "readFile", 
			"filename" : name,
		});
	};
	
	this.getUrl = function(name){
		workerFile.postMessage({
			"type" : "getUrl",
			"filename" : name,
		});
	};
	
	this.createDir = function(name){
		workerFile.postMessage({
			"type" : "makeDir",
			"dirname" : name,
		});
	};
};

//var fileApi = new FileAPI();
