class TerraformYaml extends TerraformItem
  type: "yaml"

  fetch: (deferrable) ->
    cb = deferrable.callback =>
      super deferrable

    @fetchDependencies "../src/lib/yaml.js", =>
      cb()

  getValue: ->
    YAML.eval @content

registerItemClass TerraformYaml