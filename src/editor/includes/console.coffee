# send logs also to the terraformed page
for method in ["log", "error", "info", "warn"]
  window.console["original#{method}ReplacedByTerraformEditor"] = window.console[method]
  window.console[method] = (args...) ->
    args.unshift method
    terraform?.logger.apply terraform, args