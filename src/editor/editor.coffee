# send logs also to terraformed page
window.console.originalLog = window.console.log
window.console.log = ->
  window.console.originalLog.apply this, arguments_
  terraform.logger.apply this, arguments_

$ ->
  console.log "Editor loaded."
  editor = ace.edit("editor")
  editor.setTheme "ace/theme/monokai"
  editor.getSession().setMode "ace/mode/javascript"
