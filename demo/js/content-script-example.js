/*
 * Content script example
 * example of conditional rule applying 
 * Eg.: // -> Apply when editting <source-file>
 * 	Or if you need to apply block only in specific context - // -> Apply when editting <source-file> in context of <actual-file>
 */
// INFO: content variable is passed from the outside

var converter = new Markdown.Converter();
var html = converter.makeHtml(content);
html = html.split('{{site.url}}').join('http://blog.binaryage.com/');

// -> Apply when editing /_posts/2012-04-26-totalspaces-brings-back-grid-spaces.md in context of index.html
document.getElementById('content1').innerHTML = html;
// <-

// -> Apply when editing /_posts/2012-04-07-hello-san-francisco.md
document.getElementById('content2').innerHTML = '<b>' + html + '</b>';
// <-

// -> General directive
document.getElementById('content1').innerHTML = html;
// <-