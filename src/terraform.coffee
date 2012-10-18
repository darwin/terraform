#include "includes/deferrable"
#include "includes/helpers"

# create a default config if not provided
defaultConfig =
  defScope: this # scope where we define terraform object
  evalScope: this # target scope where we eval parser code
  logScope: this # scope where we expect console.log for editor logging
  contextVariableName: "ctx"
  editorMode: 'iframe'
  editorUrl: "../src/editor/editor.html?#{Math.floor(Math.random() * 10000)}"
  jQueryUrl: "../src/lib/jquery.js"
  underscoreUrl: "../src/lib/underscore.js"

registerItemClass = (itemClass) ->
  defaultConfig.itemClasses ||= []
  defaultConfig.itemClasses.push itemClass

#include "types/item"
#include "types/dependency"
#include "types/text"
#include "types/html"
#include "types/javascript"
#include "types/coffee"
#include "types/json"
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

    @terraform.warn "type '#{type}' not recognized, treating it as a plain text"
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
      id = camelize(item.id(), true) # JSON-style, e.g. attr-html => attrHtml
      context[id] = value
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
      $frame = $("<iframe/>").attr 'src', @config.editorUrl
      $frame.css position: "fixed", top: 0, bottom: 0, right: 0, width: "50%", height: "100%", border: "none"

      $html = $ "html"
      $html.css position: "relative", height: "100%"

      $body = $ "body"
      margin = $html.width() - $body.width()
      $body.css marginTop: 0, position: "absolute", top: 0, left: 0, height: "100%"
      $body.css width: "50%"
      $body.css width: "-moz-calc(50% - #{margin}px)"
      $body.css width: "-webkit-calc(50% - #{margin}px)"

      # HACK: put our iframe on BODY level, we don't want to screw up scripts running on the page
      $html.append $frame

      @editor = $frame.contents()[0].defaultView
    else
      @editor = window.open @config.editorUrl, "_blank", "resizable=yes, scrollbars=yes, titlebar=yes, width=800, height=900, top=10, left=10"

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
    for item in @model
      item.fetch deferrable

    deferrable.onSuccess ->
      cb?()

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
((userConfig) ->
  config = extend defaultConfig, userConfig
  loader = new Deferrable

  # load our separate instance of underscore
  loadScript config.underscoreUrl, loader.callback =>
    console.log("Terraform: loaded base library underscore.js from '#{config.underscoreUrl}'")
    _ = window._.noConflict()

  # load our separate instace of jQuery
  loadScript config.jQueryUrl, loader.callback =>
    console.log("Terraform: loaded base library jQuery from '#{config.jQueryUrl}'")
    $ = window.jQuery.noConflict(true)
    converters = $.ajaxSetup().converters
    converters["text javascript"] = true # recognizes javascript jquery type

  loader.onSuccess ->
    # when we have all libraries available
    # instantiate the singleton
    return if config.preventInstantiation
    terraform = new Terraform(config)

    # export public interface
    config .defScope?.terraform = terraform

    # perform intial bootstrap
    unless config.preventBootstrapping
      terraform.bootstrap()

)(@TerraformConfig)