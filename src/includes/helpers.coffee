_ = null # <= our own local version of underscore.js
$ = null # <= our own local version of jQuery

extend = (object, properties) ->
  for key, val of properties
    object[key] = val
  object

$$ = (jQuerySet) ->
  for el in jQuerySet
    $ el

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