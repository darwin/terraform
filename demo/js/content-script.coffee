# INFO: content variable is passed from the outside
# See also - https://raw.github.com/binaryage/instaedit/master/demo/js/content-script-example.js - to see what is possible 

converter = new Markdown.Converter()

post1 = converter.makeHtml(contents["/binaryage/blog/gh-pages/_posts/2012-04-26-totalspaces-brings-back-grid-spaces.md"])
post1 = post1.split("{{site.url}}").join("http://blog.binaryage.com/")

post2 = converter.makeHtml(contents["/binaryage/blog/gh-pages/_posts/2012-04-07-hello-san-francisco.md"])
post2 = post2.split("{{site.url}}").join("http://blog.binaryage.com/")

document.getElementById("content1").innerHTML = post1
document.getElementById("content2").innerHTML = post2