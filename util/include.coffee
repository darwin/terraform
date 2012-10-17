# (c) Antonin Hildebrand, license MIT

fs = require 'fs'
p = require 'path'

# see https://github.com/jashkenas/coffee-script/wiki/%5BExtensibility%5D-Hooking-into-the-Command-Line-Compiler
#
# note: we cannot just require CoffeeScript here, command.js modifies returned CoffeeScript object which is a bummer,
#       because of http://nodejs.org/api/modules.html#modules_module_caching_caveats
#       instead try to lookup CoffeeScript object in our parent module (which is command.js)
#
# CoffeeScript = require 'coffee-script'
for m in module.parent.children
  path = m.id.split "/"
  name = path[path.length-1]
  if name == "coffee-script.js"
    CoffeeScript = m.exports
    break

########################################################################

readSource = (path) ->
  fs.readFileSync path, 'utf8'

numberOfLines = (text) ->
  text.split("\n").length

resolveIncludePath = (basePath, relativePath) ->
  path = p.resolve basePath, relativePath
  return path if p.extname path
  return path if fs.existsSync path
  path + ".coffee"

preprocess = (text, path, linesMap, linesAdded=0) ->
  text.replace /^#include ['"](.*?)['"].*$/gm, (m, include, offset, input) =>
    includePath = resolveIncludePath p.dirname(path), include
    content = readSource includePath

    snippet= preprocess content, includePath, linesMap, linesAdded
    len = numberOfLines snippet

    lineNumber = (numberOfLines input.substring 0, offset) - 1
    linesMap.push { path: includePath, start: linesAdded+lineNumber, len: len }

    linesAdded -= 1 # we have deleted original #include line
    linesAdded += len # we have added bunch of new lines in-place

    snippet

lookupLineRewrite = (line, map) ->
  for record in map
    return record if line >= record.start and line < record.start + record.len

presentLineRewrite = (line, record, basePath) ->
  relativeLine = line - record.start
  relativePath = p.relative basePath, record.path
  "in #{relativePath}:#{relativeLine+1}" # we have 0-based math

patchLineNumbersInReport = (text, lastCompilation) ->
  text.replace /on line (\d+)/gm, (m, n) ->
    line = parseInt(n, 10) - 1
    record = lookupLineRewrite line, lastCompilation.linesMap
    return m if not record
    presentLineRewrite line, record, lastCompilation.basePath

#-----------------------------------------------------------------------------

lastCompilation =
    linesMap: []
    basePath: ''

CoffeeScript.on 'compile', (task) ->
  lastCompilation =
    linesMap: []
    basePath: p.dirname task.file
  task.input = preprocess task.input, task.file, lastCompilation.linesMap

CoffeeScript.on 'failure', self = (task) ->
  CoffeeScript.removeListener 'failure', self # needed for coffeescript to print the failure report as usual
  task.message = patchLineNumbersInReport task.message, lastCompilation