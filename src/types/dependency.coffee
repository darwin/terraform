class TerraformDependency extends TerraformItem
  type: "dependency"

  fetch: (deferrable) ->
    url = @el.attr 'href'
    cb = deferrable.callback()
    loadScript url, cb

registerItemClass TerraformDependency