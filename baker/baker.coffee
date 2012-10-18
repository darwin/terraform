phantomProxy = require 'phantom-proxy'

driver = ->
  console.log "terraform it!"
  window.terraform.bootstrap()
  return "x"

collector = ->
  console.log "collect!"

class Baker
  constructor: (@path) ->

  bake: (cb) ->
    console.log "baking #{@path}..."

    phantomProxy.create {}, (proxy) =>
        page = proxy.page

        page.waitForFlag = (flag, callbackFn, timeout) ->
            self = this
            startTime = Date.now()
            timeoutInterval = 150
            testForFlag = ->
              elapsedTime = Date.now() - startTime
              if (elapsedTime > timeout)
                  console.log('warning: timeout occurred while waiting for selector:"%s"'.yellow, selector)
                  callbackFn? false
                  return

              self.evaluate (flag) ->
                return "got it" if window["terraform"][flag]
                return "nah!"
              , (result) ->
                return callbackFn? true if result == "got it"
                setTimeout testForFlag, timeoutInterval
              , flag

            timeout = timeout || 10000
            setTimeout testForFlag, timeoutInterval

        page.onUrlChanged = (event) =>
          console.log 'url changed', event

        page.onResourceRequested = (event) =>
          console.log event.data.url.data

        page.onConsoleMessage = (event) =>
          console.log JSON.stringify(event)

        page.onError = (event) =>
          console.log JSON.stringify(event)

        page.open 'http://localhost:9721/demo?terraform-baking', ->
          page.waitForFlag 'readyForBootstrap', ->
            page.evaluate driver, (res) ->
              page.waitForFlag 'executionFinished', ->
                page.evaluate collector, (res) ->
                  setTimeout -> # wait for log messages
                    phantomProxy.end()
                  , 2000
                  cb?()

module.exports = Baker