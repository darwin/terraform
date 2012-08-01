// INFO: content variable is passed from the outside

var html = converter.makeHtml(content);

// -> Apply when editing /_posts/2012-04-26-totalspaces-brings-back-grid-spaces.md in context of index.html
var converter = new Markdown.Converter();
document.getElementById('content1').innerHTML = html;
// <-

// -> Apply when editing /_posts/2012-04-07-hello-san-francisco.md
var converter = new Markdown.Converter();
document.getElementById('content2').innerHTML = '<b>' + html + '</b>';
// <-

// -> General directive
var converter = new Markdown.Converter();
document.getElementById('content1').innerHTML = html;
// <-