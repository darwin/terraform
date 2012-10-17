unless window.terraformScriptCoffeeInfoDisplayed?
  console.log "hello world from sample terraform coffee script", ctx
  window.terraformScriptCoffeeInfoDisplayed = yes

stage = $ '#stage'
stage.append "<hr>"
stage.append ctx.data3

# time for shoppin'?
list = ctx.data4.shopping_list
items = list[0..-2].join(", ")+" and "+list[-1..-1]
stage.append "when your mom says \"YAML\" you go and buy: #{items}"