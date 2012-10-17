class TerraformMarkdown extends TerraformItem
  type: "markdown"

  fetch: (deferrable) ->
    cb = deferrable.callback =>
      super deferrable

    @fetchDependencies "../src/lib/markdown.js", =>
      cb()

  getValue: ->
    markdown.toHTML @content

registerItemClass TerraformMarkdown