#include "includes/deferrable"
#include "includes/jquery-helpers"

# create a default config if not provided
defaultConfig =
  defScope: this # scope where we define terraform object
  evalScope: this # target scope where we eval parser code
  logScope: this # scope where we expect console.log for editor logging
  contextVariableName: "ctx"
  editorUrl: "../src/editor/editor.html?#{Math.floor(Math.random() * 10000)}"
  editorMode: 'iframe'
  itemClasses: []

registerItemClass = (itemClass) ->
  defaultConfig.itemClasses.push itemClass

#include "types/item"
#include "types/text"
#include "types/coffee"
#include "types/json"
#include "types/javascript"
#include "types/dependency"
#include "types/yaml"
#include "types/xml"
#include "types/markdown"

#-----------------------------------------------------------------------------
# unit holds information from single <div class="terraform">...</div>
class TerraformUnit
  constructor: (@terraform, @el) ->

  factory: (type, el) ->
    for klass in @terraform.config.itemClasses
      if type is klass::type
        return new klass @terraform, el

    @terraform.warn "type '#{type}' not recognized, using text instead"
    new TerraformText @terraform, el

  parse: ->
    @items = []
    for el in $$ @el.children()
      type = el.attr('type') # e.g. terraform/javascript
      type = type.split("/")[1]
      item = @factory type, el
      item.parse?()
      @items.push item

  fetch: (deferrable) ->
    for item in @items
      item.fetch deferrable

  prepareContext: ->
    context = {}
    for item in @items
      value = item.getValue()
      continue unless value
      context[item.id()] = value
    context

  execute: ->
    context = @prepareContext()
    for item in @items
      item.execute(context)

#-----------------------------------------------------------------------------
# Terraform singleton
class Terraform
  version: "0.0.1"
  evalCounter: 0

  constructor: (@config) ->

  openEditor: ->
    if @config.editorMode == 'iframe'
      frame = $("<iframe src='#{@config.editorUrl}'><iframe>")
      frame.css
        position: "fixed"
        top: 0
        bottom: 0
        right: 0
        width: "50%"
        height: "100%",
        border: "none"
      $("html").css
        position: "relative"
        height: "100%"
      $("body").css
        marginTop: 0 # TODO: more advanced margin detection to prevent page jump
        position: "absolute"
        top: 0
        left: 0
        width: "50%",
        height: "100%",
      $("html").append(frame) # HACK: put our iframe on BODY level, we don't want to screw up scripts running on the page
      @editor = frame.contents()[0].defaultView
    else
      @editor = window.open(@config.editorUrl, "_blank", "resizable=yes, scrollbars=yes, titlebar=yes, width=800, height=900, top=10, left=10")

    @editor.terraform = terraform
    @editor.focus()

  evalCode: (code, context) ->
    temporaryVariableName = "__terraform_eval_" + @evalCounter++
    @config.evalScope[temporaryVariableName] = context
    try
      # try to eval in wrapper function
      @config.evalScope.eval "(function(#{@config.contextVariableName}){#{code}})(#{temporaryVariableName})"
    catch ex
      @editor?.onError? ex
    delete @config.evalScope[temporaryVariableName]

  parseModel: ->
    @model = []
    for el in $$ $('.terraform')
      unit = new TerraformUnit(@, el)
      unit.parse()
      @model.push unit

  fetchExternals: (cb) ->
    deferrable = new Deferrable()
    deferrable.onSuccess ->
      cb?()

    for item in @model
      item.fetch deferrable

  bootstrap: (cb) ->
    @parseModel() unless @model
    @fetchExternals =>
      @info "successfully fetched all externals"
      @executeModel()

  executeModel: ->
    @info "executing model", @model
    for unit in @model
      unit.execute()

  logger: (method, args...) ->
    return unless @config.logScope
    args.unshift "Terraform:"
    @config.logScope.console[method].apply @config.logScope.console, args

  error: (args...) ->
    args.unshift "error"
    @logger args...

  warn: (args...) ->
    args.unshift "warn"
    @logger args...

  info: (args...) ->
    args.unshift "info"
    @logger args...

  edit: ->
    @openEditor()

#################################################################################
# bootstrap!
((config) ->
  # load our separate instance of jQuery
  loadScript "https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.js", =>

    # setup jQuery
    $ = jQuery.noConflict(true)
    converters = $.ajaxSetup().converters
    converters["text javascript"] = true # recognizes javascript jquery type

    # instantiate singleton
    effectiveConfig = $.extend defaultConfig, config
    return if effectiveConfig.preventInstantiation
    terraform = new Terraform(effectiveConfig)

    # export public interface
    effectiveConfig .defScope?.terraform = terraform

    # perform intial bootstrap
    unless effectiveConfig.preventBootstrapping
      terraform.bootstrap()

)(@TerraformConfig)