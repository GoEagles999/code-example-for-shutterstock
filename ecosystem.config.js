module.exports = {
  apps : [{
    name   : "server",
    script : "./server.js",
		watch  : ["./state/settings.json"],
  }]
}
