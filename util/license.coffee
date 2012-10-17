# see https://github.com/jashkenas/coffee-script/wiki/%5BExtensibility%5D-Hooking-into-the-Command-Line-Compiler
#
# note: we cannot just require CoffeeScript here, command.js modifies returned CoffeeScript object which is a bummer,
#       because of http://nodejs.org/api/modules.html#modules_module_caching_caveats
#       instead try to lookup CoffeeScript object in our parent module (which is command.js)

# CoffeeScript = require 'coffee-script'
for m in module.parent.children
  path = m.id.split "/"
  name = path[path.length-1]
  if name == "coffee-script.js"
    CoffeeScript = m.exports
    break

CoffeeScript.on 'success', (task) ->
  task.output = """
    // The MIT License
    // Copyright (c) #{ new Date().getFullYear() } BinaryAge\n
   """ + task.output
