class TerraformJavascript extends TerraformItem
  type: "javascript"

  execute: (context) ->
    @terraform.evalCode(@content, context)

registerItemClass TerraformJavascript