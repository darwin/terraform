# send logs also to the terraformed page
window.console.originalLog = window.console.log
window.console.log = (args...) ->
  window.console.originalLog.apply window.console, args
  terraform.logger.apply terraform, args

class Editor
  constructor: (@terraform) ->
    @ace = ace.edit("editor")
    @ace.setTheme "ace/theme/twilight"
    @ace.getSession().setUseSoftTabs yes
    @ace.setShowPrintMargin no

    @ace.commands.addCommand
        name: 'myCommand'
        bindKey: {win: 'Ctrl-S', mac: 'Command-S'}
        exec: =>
          console.log "exec save"
          @saveFile()
          true

    @picker = $('#file-picker')
    @picker.on 'change', (event) =>
      @selectFile @picker.val()

    @updateFromModel(@terraform.model)

  updateFromModel: (model) ->
    @updateFilePickerFromModel(model)
    @selectFile 0

  updateFilePickerFromModel: (model) ->
    # update file picker
    @picker.empty()
    @files = []
    group_index = 0
    for group in model
      group_index += 1
      for item in group.items
        @files.push item
        title = "#{@files.length}. [\##{group_index}]: #{item.name()}"
        @picker.append($("<option />").val(@files.length-1).text(title));

  setupAceForFile: (file) ->
    @ace.getSession().setMode "ace/mode/#{file.type}"

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
    @currentFile.content = @ace.getValue()
    @currentFile.write()
    @terraform.executeModel()

$ ->
  console.log "Editor loaded."
  window.terraformEditor = new Editor(terraform)