class TerraformYaml extends TerraformItem
  type: "yaml"

  getValue: ->
    # TODO: parseYAML(@content)

registerItemClass TerraformYaml