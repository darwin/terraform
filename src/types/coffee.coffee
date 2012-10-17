class TerraformCoffee extends TerraformItem
  type: "coffee"
  loader: null

  fetch: (deferrable) ->
    cb = deferrable.callback =>
      super deferrable

    @fetchDependencies "../src/lib/coffee-script.js", =>
      cb()

  execute: (context) ->
    try
      code = CoffeeScript.compile @content
      @terraform.evalCode code, context
    catch error
      @terraform.error error.stack

registerItemClass TerraformCoffee