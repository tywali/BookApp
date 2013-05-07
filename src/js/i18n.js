
function i18nSetText(texts) {
    var tags = $("[i18nkey]");
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        var id = $(tag).attr("i18nkey");
        var text = texts[id];
        if (tag.tagName == "INPUT") {
            $(tag).val(text);
        }
        else {
            $(tag).text(text);
        }
    }
}
