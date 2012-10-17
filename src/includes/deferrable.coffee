class Deferrable

  constructor: (options) ->
    @counter = 0
    @callbacks = []
    @fired = no

  callback: (fn) ->
    throw new Error('Cannot add callback. Deferrable has already fired.') if @fired
    @counter++
    (args...) =>
      throw new Error('Too late. Deferrable has already fired.') if @fired
      fn?(args...)
      @counter--
      @fire() if @counter == 0

  fire: () ->
    for callback in @callbacks
      callback()
    @fired = yes

  onSuccess: (callback) ->
    @callbacks.push callback if callback