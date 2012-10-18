# send logs also to the terraformed page
window.console.originalLogReplacedByTerraformEditor = window.console.log
window.console.log = (args...) ->
  # window.console.window.console.originalLogReplacedByTerraformEditor.apply window.console, args
  args.unshift "log"
  terraform?.logger.apply terraform, args

class Editor
  constructor: (@terraform) ->
    @ace = ace.edit("editor")
    @ace.setTheme "ace/theme/twilight"
    @ace.setShowPrintMargin no
    @ace.setShowInvisibles yes
    @ace.setDisplayIndentGuides no
    @ace.setShowFoldWidgets no
    session = @ace.getSession()
    session.setUseSoftTabs yes
    session.setUseWrapMode yes
    session.setTabSize 2
    session.setFoldStyle "manual"

    @ace.commands.addCommand
        name: 'Save Changes'
        bindKey: {win: 'Ctrl-S', mac: 'Command-S'}
        exec: =>
          @saveFile()
          true

    @terraform.config.setupAce?(@ace)

    @picker = $('#file-picker')
    @picker.on 'change', (event) =>
      @selectFile @picker.val()

    @apply = $('#apply')
    @apply.on 'click', =>
      @saveFile()
      @ace.focus()

    @updateFromModel(@terraform.model)

  updateFromModel: (model) ->
    @updateFilePicker model
    @selectFile 0

  updateFilePicker: (model) ->
    @picker.empty()
    @files = []
    unit_index = 0
    for unit in model
      unit_index++
      for item in unit.items
        continue unless item.content
        @files.push item
        title = "#{@files.length}. #{item.title()}"
        @picker.append($("<option />").val(@files.length-1).text(title));

  setupAceForFile: (file) ->
    aceModes = {}
    @ace.getSession().setMode "ace/mode/#{aceModes[file.type] or file.type}"

  selectFile: (index) ->
    file = @files[index]
    console.log("selectFile", file)
    return unless file?

    @currentFile = file
    @ace.setValue ""
    @setupAceForFile file
    @ace.setValue file.content
    @ace.selection.clearSelection()
    @ace.selection.moveCursorFileStart()
    @ace.focus()

  saveFile: ->
    return unless @currentFile
    @currentFile.setContent @ace.getValue()
    @terraform.executeModel() # TODO: execute only affected unit (optimization)

$ ->
  window.terraformEditor = new Editor(terraform)
  console.log "Editor ready!"