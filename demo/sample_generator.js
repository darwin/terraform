if (!window.terraformScriptInfoDisplayed) {
  console.log("hello world from sample terraform script");
  console.log("to access current context use ctx variable");
  console.log(ctx);
  window.terraformScriptInfoDisplayed = true;
}

// clean our stage
var stage = $('#stage');
stage.empty();

// do something with text from #data1
stage.append(ctx.data1);

// process JSON from #data2
var list = ctx.data2.planets;
var ul = $("<ul/>").addClass("pretty-list");
for (var i=0; i<list.length; i++) {
  ul.append($("<li/>").text(list[i]));
}
stage.append(ul);