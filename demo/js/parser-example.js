// content variable is passed from the outside

var converter = new Markdown.Converter();

document.getElementById('content1').innerHTML = converter.makeHtml(content);