ExecPlan = require('exec-plan').ExecPlan
fs = require 'fs'
p = require 'path'

class Server
  constructor: (path) ->
    @path = p.resolve path

  prepareConfig: (content) ->
    content
      .replace(/\$BAKER_PATH/g, p.resolve __dirname)
      .replace(/\$SITE_PATH/g, @path)

  launch: (cb) ->
    console.log "launching server #{@path}..."
    plan = new ExecPlan()
    plan.on 'complete', (stdout) ->
      cb?()
    configPath = p.resolve __dirname, "nginx.conf"
    configTemplatePath = p.resolve __dirname, "nginx.conf.template"
    content = fs.readFileSync configTemplatePath
    content += ""
    fs.writeFileSync configPath, (@prepareConfig content)

    cmd = 'nginx -c "'+configPath+'"'
    console.log "> #{cmd}"
    plan.add cmd
    plan.execute()

  stop: (cb) ->
    console.log "stopping server #{@path}..."
    plan = new ExecPlan()
    plan.on 'complete', (stdout) ->
      cb?()
    cmd = 'nginx -s stop'
    console.log "> #{cmd}"
    plan.add cmd
    plan.execute()

module.exports = Server