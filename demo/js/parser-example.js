var converter = new Markdown.Converter();

document.getElementById('instaeditable').innerHTML = converter.makeHtml(instadata);