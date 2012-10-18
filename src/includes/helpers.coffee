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

# from batman.js:
camelize_rx = /(?:^|_|\-)(.)/g
capitalize_rx = /(^|\s)([a-z])/g
underscore_rx1 = /([A-Z]+)([A-Z][a-z])/g
underscore_rx2 = /([a-z\d])([A-Z])/g

camelize = (string, firstLetterLower) ->
  string = string.replace camelize_rx, (str, p1) -> p1.toUpperCase()
  if firstLetterLower then string.substr(0,1).toLowerCase() + string.substr(1) else string

underscore = (string) ->
  string.replace(underscore_rx1, '$1_$2')
        .replace(underscore_rx2, '$1_$2')
        .replace('-', '_').toLowerCase()

capitalize = (string) -> string.replace capitalize_rx, (m,p1,p2) -> p1 + p2.toUpperCase()
