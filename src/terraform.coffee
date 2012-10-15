# create a default config if not provided
if typeof TerraformConfig is "undefined"
  TerraformConfig =
    defScope: this # scope where we define terraform object
    evalScope: this # target scope where we eval parser code
    logScope: this # scope where we expect console.log for editor logging

# make our stuff private, the only exported variable will be terraform into TerraformConfig.defScope
((config) ->
  editor = undefined
  addScript = (url, cb) ->
    th = document.getElementsByTagName("head")[0]
    s = document.createElement("script")
    s.onload = ->
      cb()

    s.setAttribute "type", "text/javascript"
    s.setAttribute "src", url
    th.appendChild s

  addJQuery = (cb) ->
    unless typeof jQuery is "undefined"
      console.log "jQuery already present."
      cb()
    else
      addScript "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js", ->
        cb()

  openEditor = ->
    console.log "Opening editor."
    editor = window.open("../src/editor/editor.html", "_blank", "resizable=yes, scrollbars=yes, titlebar=yes, width=800, height=900, top=10, left=10")
    editor.terraform = terraform
    editor.focus()

  evalCode = (code) ->
    tempVarName = "__instaedit_gen_" + Math.floor(Math.random() * 5000)
    prefix = "(function(content){"
    postfix = "})(" + tempVarName + ")"
    code = prefix + code + postfix

    # eval in wrapper function using global temporary variable
    # TODO: alternatively we could encode site content into postfix as a parameter string
    config.evalScope[tempVarName] = getSiteContent()
    try
      config.evalScope.eval code
    catch ex
      editor.onError ex  if editor and editor.onError
    delete config.evalScope[tempVarName]

  fetchExternals = (cb) ->
    cb()

  bootstrap = (cb) ->
    addJQuery ->
      fetchExternals ->
        cb()

  logger = ->
    return  unless config.logScope
    args = Array::slice.call(arguments_)
    args.unshift "Terraform:"
    config.logScope.console.log.apply config.logScope.console, args

  editPage = ->
    openEditor()


  # define public interface
  terraform =
    bootstrap: bootstrap
    logger: logger
    evalCode: evalCode
    edit: editPage


  # export public interface into selected scope
  config.defScope.terraform = terraform  if config.defScope

  # perform intial editor bootstraping, this enables user to call it later by hand via terraform.bootstrap() if needed
  unless config.preventBootstrapping
    bootstrap ->

) TerraformConfig