class TerraformJson extends TerraformItem
  type: "json"

  getValue: ->
    $.parseJSON(@content)

registerItemClass TerraformJson