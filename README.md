# Terraform

### Static site generator with live preview

I love [static site generators](http://mickgardner.com/2011/04/27/An-Introduction-To-Static-Site-Generators.html). This one is different. **It executes on client-side in the browser**. This enables several unforeseen features.

* you get embedded editor with **live preview** - update your pages directly from the browser!
* you may write in Javascript or [Cofeescript](http://coffeescript.org), or [anything](https://github.com/jashkenas/coffee-script/wiki/List-of-languages-that-compile-to-JS) which compiles down to Javascript
* you may use [jQuery](http://jquery.com) or any other client-side library you like
* you may shoot AJAXes, consume JSON data, eat YAMLs, render markdowns, anything webs can do!

#### Wait! How can static site generator run on client-side?

Thanks to [PhantomJS](http://phantomjs.org), we can emulate browser on server-side. When your code regenerates a site we bake the changes back into original static files. The resulting pre-baked site still keeps the ability to be live-edited when needed.

Simply we get the best of both worlds. Plus some nice integration with GitHub as a bonus.

## Local development

**Prerequisities:**

* ruby, rubygems, bundler
* nodejs, npm, phantomjs
* nginx

**Initial setup:**

    git clone https://github.com/darwin/terraform
    cd terraform
    rake init

Setup your nginx to serve terraform folder at some local url (e.g. http://terraform.local).

**Development:**

    rake dev

    => http://terraform.local/demo


## Questions?

> How does this compare to [Jekyll](https://github.com/mojombo/jekyll)?

I see Terraform as a Jekyll post-process step. Terraform definitely needs some initial static page skeletons to bootstrap. It is up to you to divide work between Jekyll and Terraform. I plan to use Jekyll for heavy-duty page layouts and generic site features. Terraform will be used for actual page content.

#### MIT-style [license](https://raw.github.com/darwin/terraform/master/license.txt)