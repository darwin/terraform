# some jquery helpers
$ = null # <= our own local version of jQuery
$$ = (jQuerySet) ->
  for el in jQuerySet
    $(el)

loadScript = (url, cb) ->
  # note: use DOM API, we may not have jQuery at this point
  h = document.getElementsByTagName("head")[0]
  s = document.createElement("script")
  s.onload = ->
    h.removeChild s
    cb?()
  s.setAttribute "type", "text/javascript"
  s.setAttribute "src", url
  h.appendChild s