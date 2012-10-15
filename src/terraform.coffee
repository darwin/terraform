# create a default config if not provided
unless this.TerraformConfig?
  this.TerraformConfig =
    defScope: this # scope where we define terraform object
    evalScope: this # target scope where we eval parser code
    logScope: this # scope where we expect console.log for editor logging

# Terraform singleton
class Terraform
  constructor: (@config) ->

  addScript: (url, cb) ->
    th = document.getElementsByTagName("head")[0]
    s = document.createElement("script")
    s.onload = ->
      cb?()

    s.setAttribute "type", "text/javascript"
    s.setAttribute "src", url
    th.appendChild s

  addJQuery: (cb) ->
    unless typeof jQuery is "undefined"
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

  fetchExternals: (cb) ->
    cb?()

  bootstrap: (cb) ->
    @addJQuery =>
      @fetchExternals =>
        cb?()

  logger: (args...) ->
    return unless @config.logScope
    args.unshift "Terraform Editor:"
    @config.logScope.console.log.apply @config.logScope.console, args

  edit: ->
    @openEditor()

# bootstrap!
((config) ->
  terraform = new Terraform(config)

  # export public interface
  config.defScope.terraform = terraform

  # perform intial editor bootstraping, this enables user to call it later by hand via terraform.bootstrap() if needed
  unless config.preventBootstrapping
    terraform.bootstrap()

)(this.TerraformConfig)