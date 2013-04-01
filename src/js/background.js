
var tabId;
chrome.browserAction.onClicked.addListener(function(tab){
	chrome.tabs.create({url: "bookApp.html"}, function(tab){
        tabId = tab.id;
    });
});

function showUpdateNum(num){
    // 设置图标上的数字
    chrome.browserAction.setBadgeText({text: num.toString()});
}

function enableButton(){
    chrome.browserAction.enable(tabId);
}

function disableButton(){
    chrome.browserAction.disable();
}
