# send logs also to terraformed page
window.console.originalLog = window.console.log
window.console.log = (args...) ->
  window.console.originalLog.apply window.console, args
  terraform.logger.apply terraform, args

$ ->
  console.log "Editor loaded."
  editor = ace.edit("editor")
  editor.setTheme "ace/theme/monokai"
  editor.getSession().setMode "ace/mode/javascript"
