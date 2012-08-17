### Instaedit - pixel perfect web editor
Instaedit is wysiwyg editor of your page content, designed for editing of websites based on github pages (like binaryage.com).

## Brief usage tutorial
# Markup origins of content on your site

Put data-content-origin attribute on top level element wrapping content of some of your site source code on github.

Eg.: 
`<section id="page" data-content-origin="https://raw.github.com/binaryage/blog/gh-pages/_posts/2012-04-26-totalspaces-brings-back-grid-spaces.md">`
`	Content of https://raw.github.com/binaryage/blog/gh-pages/_posts/2012-04-26-totalspaces-brings-back-grid-spaces.md`
`</section>`

# Add a content-script
Its a script which defines a way of applying changes. Code is executed in isolated scope with content variables defined in it - see content-script example - https://github.com/binaryage/instaedit/blob/master/demo/js/content-script.coffee - as you can see, coffee script is also supported, instaedit automatically recognizes the language by postfix - .coffee and .js.

And you should define it as a script

`<script type="instaedit/contentscript" src="https://raw.github.com/binaryage/instaedit/master/demo/js/content-script.coffee"></script>`

or meta in head

`<meta name="instaedit/contentscript" value="https://raw.github.com/binaryage/instaedit/master/demo/js/content-script.coffee">`

# Install a browser extension
You should install a browser extension because of restrictions in github api policy, if you want to just try instaedit, then you can add this code to your site

`<script>`
`		window.onload = function () {`
`				document.getElementById('instaedit-edit').onclick = function () {`
`					(function () {`
`						var th = document.getElementsByTagName('head')[0];`

						var s = document.createElement('script');
						s.setAttribute('type', 'text/javascript');
						s.setAttribute('src', 'https://raw.github.com/binaryage/instaedit/master/src/instaedit.js');

						th.appendChild(s);
					})();
				}
			}
`</script>`

`<button id="instaedit-edit">Edit</button>`

but you will loose a "commit" feature.

# Start editing
After clicking "Launch" button in extension
![Chrome extension](instaedit/raw/master/doc/extension-screen.png "Chrome extension")

or Edit button on your site. You will see instaedit editor

![Editor screenshot](instaedit/raw/master/doc/editor-screen.png "Editor screenshot")

# Edit a content-script
After clicking "Edit parser" button you will get another editor with your content script code in it. Editor will be informing you about syntax errors during editing. When you will be satisfied with new version then click "Apply" button. Instaedit compiler will compile the code and immediately start applying it on content - eventually you will can see you concrete mistakes in code via notifications on the right side of editor - like that 
![Errors screenshot](instaedit/raw/master/doc/errors-screen.png "Editor errors screenshot")

# Commit
If you want commit new version of site then click on commit button in extension. Extension will open tabs with "edit links" - as you can see here : 
![Extension commit](instaedit/raw/master/doc/extension-commit-screen.png "Extension commit")

You should be signed to github and have appropriate privileges for editing. Extension will let you click on "Commit" button yourselves (you can check it one more time and make sure about changes)

# Still have troubles? 
See our demo here - https://github.com/binaryage/instaedit/tree/master/demo 

or feel free to contact me - jan@binaryage.com