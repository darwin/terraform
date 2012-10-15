# create a default config if not provided
unless this.TerraformConfig?
  this.TerraformConfig =
    defScope: this # scope where we define terraform object
    evalScope: this # target scope where we eval parser code
    logScope: this # scope where we expect console.log for editor logging

class TerraformScript
  constructor: (@el) ->

  read: ->
    @code = jQuery(@el).text()

class TerraformJsScript extends TerraformScript
  constructor: (@el) ->

  execute: (terraform) ->
    jQuery(@el).text(@code)
    terraform.evalCode(@code)

class TerraformCoffeeScript extends TerraformScript
  constructor: (@el) ->

  execute: (terraform) ->
    # TODO: parse & eval coffeescript

class TerraformData
  constructor: (@el) ->

  read: ->
    @data = jQuery(@el).text()

  execute: (terraform) ->
    jQuery(@el).text(@data)

class TerraformGroup
  constructor: (@el) ->

  read: ->
    @items = []
    for script in jQuery(@el).children('script')
      type = jQuery(script).attr('type')
      item = new TerraformData(script) if type is "terraform/data"
      item = new TerraformJsScript(script) if type is "terraform/js"
      item = new TerraformCoffeeScript(script) if type is "terraform/coffee"
      item.read()
      @items.push item

  execute: (terraform) ->
    for item in @items
      item.execute(terraform)

# Terraform singleton
class Terraform
  constructor: (@config) ->

  addScript: (url, cb) ->
    th = document.getElementsByTagName("head")[0]
    s = document.createElement("script")
    s.onload = -> cb?()
    s.setAttribute "type", "text/javascript"
    s.setAttribute "src", url
    th.appendChild s

  addJQuery: (cb) ->
    if jQuery?
      console.log "jQuery already present."
      cb?()
    else
      @addScript "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js", ->
        cb?()

  openEditor: ->
    @editor = window.open("../src/editor/editor.html", "_blank", "resizable=yes, scrollbars=yes, titlebar=yes, width=800, height=900, top=10, left=10")
    @editor.terraform = terraform
    @editor.focus()

  evalCode: (code) ->
    try
      # try to eval in wrapper function
      @config.evalScope.eval "(function(){#{code}})()"
    catch ex
      @editor?.onError? ex

  readModel: ->
    @model = []
    for el in jQuery('.terraform')
      group = new TerraformGroup(el)
      group.read()
      @model.push group
    console.log(@)

  fetchExternals: (cb) ->
    cb?()

  bootstrap: (cb) ->
    @addJQuery =>
      @fetchExternals =>
        cb?()

  executeModel: ->
    for item in @model
      item.execute(@)

  populate: ->
    @readModel() unless @model
    @executeModel()

  logger: (args...) ->
    return unless @config.logScope
    args.unshift "Terraform Editor:"
    @config.logScope.console.log.apply @config.logScope.console, args

  edit: ->
    @openEditor()

# bootstrap!
((config) ->
  return unless config.defScope

  terraform = new Terraform(config)

  # export public interface
  config.defScope.terraform = terraform

  # perform intial editor bootstraping, this enables user to call it later by hand via terraform.bootstrap() if needed
  unless config.preventBootstrapping
    terraform.bootstrap ->
      terraform.populate()

)(this.TerraformConfig)