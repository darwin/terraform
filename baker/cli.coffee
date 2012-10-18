program = require 'commander'
Baker = require './baker'
Server = require './server'

program
  .version('0.0.1')
  .parse(process.argv)

for path in program.args
  baker = new Baker(path)
  server = new Server(path)

  process.on 'SIGINT', ->
    console.log('Got SIGINT signal.')
    server.stop()
    process.exit(0)

  # TODO: serialize this
  server.launch =>
    baker.bake =>
      server.stop =>
        console.log "finito?"
