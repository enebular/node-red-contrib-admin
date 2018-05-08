var httpRequest = require('request')
var when = require('when')

var body_cache = null

module.exports = function(RED) {
  RED.httpAdmin.get('/enebular/search/:module', function(req, res) {
    var module = req.param('module')
    searchModule(module, function(err, content) {
      if (err) res.json({ err: err })
      else res.json({ content: content })
    })
  })
}

function searchModule(module_name, cb) {
  if (!module_name.length) {
    return
  }
  var options = {
    method: 'GET',
    url: 'https://catalogue.nodered.org/catalogue.json',
    headers: {
      Accept: 'application/json'
    }
  }

  if (body_cache) match(module_name, body_cache, cb)
  else {
    httpRequest.get(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        body_cache = body
        match(module_name, body, cb)
      } else if (error) {
        cb(error.toString())
      } else {
        cb(response.statusCode + ': ' + body)
      }
    })
  }
}

function match(module_name, body, cb) {
  var result = []
  var modules = JSON.parse(body).modules
  var filter = new RegExp(module_name)
  var found = false
  for (var i = 0; i < modules.length; i++) {
    var nodeRedModule = modules[i]
    if (!filter || filter.test(nodeRedModule.id)) {
      result.push(nodeRedModule.id)
      found = true
    }
  }
  if (found) {
    cb(null, result)
  } else {
    cb('Not Found')
  }
}
