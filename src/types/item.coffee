class TerraformItem
  constructor: (@terraform, @el) ->

  id: ->
    (@el.attr 'id') or ''

  name: ->
    id = @id()
    res = ""
    res += '#'+id if id
    res

  title: ->
    href = @el.attr 'href'
    res = @name()
    res += " #{href}" if href
    res

  fetch: (deferrable) ->
    url = @el.attr 'href'
    @terraform.warn "specify href on ", @el unless url
    cb = deferrable.callback (data, status) =>
      @terraform.info "loaded '#{url}' as #{@type}"
      @content = data
    request= $.get url, cb, "text"
    request.error (x, t, err) =>
      msg = "unable to fetch #{@name()}: [#{t}]"
      msg += " " + err.message if err.message?
      @terraform.error msg

  getValue: ->
    @content

  setContent: (val) ->
    @content = val

  execute: ->
    # no-op

  fetchDependencies: (scripts, cb) ->
    scripts = [].concat scripts
    # shared loader accross all instances
    loader = TerraformCoffee::loader

    unless loader?
      loader = new Deferrable
      for script in scripts
        loadScript script, loader.callback =>
          @terraform.info "loaded dependency '#{script}' for #{@type} files"

    if loader.fired
      cb?()

    loader.onSuccess =>
      cb?()
