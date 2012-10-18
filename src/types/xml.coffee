class TerraformXml extends TerraformItem
  type: "xml"

  fetch: (deferrable) ->
    cb = deferrable.callback =>
      super deferrable

    @fetchDependencies "../src/lib/xml2js.js", =>
      cb()

  getValue: ->
     x2js.xml_str2json @content

registerItemClass TerraformXml