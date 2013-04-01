
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
		if (action){
			$.blockUI({
				message : $('#form-delbook')
			});
			$('.blockOverlay').attr('title', 'clickclose').click($.unblockUI);
			$('.close').click($.unblockUI);
			var button = $("#form-delbook #delok")
			currentBook = bookView.getBook($(data).parent());
		}
		else{
			bookView.showBook(event);
		}
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
		$.blockUI({
			message : $('#form-addBook')
		});
		$('.blockOverlay').attr('title', 'clickclose').click($.unblockUI);
		$('.close').click($.unblockUI);
		$("#form-addBook input").val("");
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
});

