class TerraformItem
  constructor: (@terraform, @el) ->

  id: ->
    (@el.attr 'id') or ''

  name: ->
    push = @el.attr 'data-push'
    res = @id()
    res += " (#{push})" if push?

  fetch: (deferrable) ->
    url = @el.attr 'href'
    @terraform.warn "specify href on ", @el unless url
    cb = deferrable.callback (data, status) =>
      @terraform.info "loaded '#{url}' as #{@type}"
      @content = data
    call = $.get url, cb, "text"
    call.error (x, t, err) =>
      msg = "unable to fetch #{@name()}: [#{t}]"
      msg += " " + err.message if err.message?
      @terraform.error msg

  getValue: ->
    @content

  setContent: (val) ->
    @content = val

  execute: ->
    # no-op