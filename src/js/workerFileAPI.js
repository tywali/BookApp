//importScripts("FileAPI_Sync.js");

var FileExtSync = function(){
	var fileSystem, fileSystemSize;
	
	this.initFs = function(size){
		if (fileSystemSize > 0 && fileSystemSize >= size) {
			return fileSystemSize;
		}
		fileSystemSize = size || 1024 * 1024 * 10;
		self.requestFileSystemSync = self.webkitRequestFileSystemSync || self.requestFileSystemSync;
		fileSystem = self.requestFileSystemSync(PERSISTENT, fileSystemSize);
		return fileSystemSize;
	};
	
	this.writeFile = function(param){
		var filename = param.filename;
		var content = param.content;
		var type = param.type;
		var writemode = param.writemode;
		
		var fileEntry = fileSystem.root.getFile(filename, {create : true, exclusive: false});
		if (writemode == "replace"){
			fileEntry.remove();
			fileEntry = fileSystem.root.getFile(filename, {create : true, exclusive: false});
		}
		var writer = fileEntry.createWriter();
        var blob, byteArray
        i = len = 0;
        if (/text/i.test(type)) {
            blob = new Blob([content]);
        }
        else {
            len = content.length;
            byteArray = new Uint8Array(len);
            for (; i < len; i++) {
                byteArray[i] = content.charCodeAt(i) & 0xFF;
            }
            blob = new Blob([byteArray], {
                type: param.type
            });
        }
        writer.seek(writer.length);
        writer.write(blob);
		return writer.length;
	};
	
	this.readFile = function(param){
		var reader = new FileReaderSync();
		var fileEntry = fileSystem.root.getFile(param.filename, {create : false, exclusive: false});
		return reader.readAsText(fileEntry.file());
	};
	
	this.getUrl = function(param){
		var fileEntry = fileSystem.root.getFile(param.filename, {create : false, exclusive: false});
		return fileEntry.toURL();
	};
	
	this.makedir = function(param){
		var dirEntry = fileSystem.root.getDirectory(param.dirname, {create : true});
		return dirEntry.toURL();
	};
	
	this.initFs();
};

var fileExt = new FileExtSync();

self.onmessage = function(event) {
	var data = event.data;
	var res = fileExt[data.type](data);
	var result = {"command" : data.type, "result" : res};
	postMessage(result);
}
