
var HTTP = function(){
	var curCmd;
	var xmlhttp = new XMLHttpRequest();
	var queue = new Array();
	var lock = false;
	
	var init = function(){
		xmlhttp.onreadystatechange = stateChange;
	};
	
	var stateChange = function(){
		//httpCallback(xmlhttp.responseText, xmlhttp.statusText);
		if (xmlhttp.readyState == 4) {
			postMessage({
				"type" : "httpResponse",
				"data" : xmlhttp.responseText,
				"statusText" : xmlhttp.statusText,
				"status" : xmlhttp.status,
				"input" : curCmd.param,
			});
			lock = false;
			runCmd();
		}
	};
	
	var addToQueue = function(param){
		queue.push(param);
		runCmd();
	};
	
	var runCmd = function(){
		if (lock) return;
		if (queue.length > 0){
			lock = true;
			curCmd = queue.shift();
			curCmd.cmd(curCmd.param);
		}
	};
	
	var getData = function(param){
		if (param.overrideMimeType){
			xmlhttp.overrideMimeType(param.overrideMimeType);
		}
		
		xmlhttp.open("GET", param.url, true);
		xmlhttp.send(null);
	};
	
	this.get = function(param){
		var cmd = {
			"cmd" : getData,
			"param" : param,
		};
		addToQueue(cmd);
	};
	
	init();
};

var http = new HTTP();

self.onmessage = function(e){
	var data = e.data;
	http[data.type](data);
};
