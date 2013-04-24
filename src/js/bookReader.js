
function addBook(book){
	$("#form-addBook input").val("");
	if (book){
		$("#form-addBook #name").val(book.bookname);
		$("#form-addBook #author").val(book.author);
		$("#form-addBook #address").val(book.chartRootUrl);
		$("#form-addBook h1").text("修改书籍");
		$("#form-addBook p").text("修改《" + book.bookname + "》的参数。");
	}
	else {
		$("#form-addBook h1").text("添加书籍");
		$("#form-addBook p").text("将书籍添加到书架。");
	}
	$.blockUI({
		message : $('#form-addBook')
	});
	$('.blockOverlay').attr('title', 'clickclose').click($.unblockUI);
	$('.close').click($.unblockUI);
}

function delBook(data){
	$.blockUI({
		message : $('#form-delbook')
	});
	$('.blockOverlay').attr('title', 'clickclose').click($.unblockUI);
	$('.close').click($.unblockUI);
	var button = $("#form-delbook #delok")
	currentBook = bookView.getBook($(data).parent());
	$("#form-delbook p").text("你是否确认删除《" + currentBook.bookname + "》？");
}

var bookView;
var bm;
var currentBook;
$(document).ready(function() {
	var background = chrome.extension.getBackgroundPage();
	bm = background.bookManager;
	bookView = new BookView({
		"shelfArea" : "table#books",
		"showArea" : "div#readBook",
		"retrieve": bm.retrieveBook,
	});
	bm.registerView(bookView);
	var books = bm.getBook();
	bookView.showBookShelf(books);
	
	$("table#books").click(function(event) {
		var data = event.target;
		var action = $(data).attr("action");
		switch (action){
			case "del":
				delBook(data);
				break;
			case "edit":
				var book = bookView.getBook(data);
				addBook(book);
				break;
			default:
				bookView.showBook(event);
		};
	});

	$("#form-delbook #delok").click(function(event){
		bm.delBook(currentBook);
		$.unblockUI();
	});
	
	$('#dock2').Fisheye(
		{
			maxWidth: 50,
			items: 'a',
			itemsText: 'span',
			container: '.dock-container',
			itemWidth: 40,
			proximity: 90,
			halign : 'center'
		}
	);
	
	$('#addbook').click(function(event){
		addBook();
	});
	
	$(".genform .cancel").click(function() {
		$.unblockUI();
	});
	
	$("#form-addBook #addbookok").click(function(event) {
		var name = $("#form-addBook #name").val();
		var author = $("#form-addBook #author").val();
		var url = $("#form-addBook #address").val();
		bm.addBook({
			"bookname" : name,
			"author" : author,
			"chartRootUrl" : url,
		});
		$.unblockUI();
	});

	$("button#test").click(function(){
		//background.bookFormatTest();
		//background.testLog();
		background.testExportConfig();
	});
});

