var httpRequest = require("request");
var when = require("when");

var body_cache = null;

module.exports = function(RED) {


	RED.httpAdmin.get("/enebular/search/:module", function (req, res) {
		var module = req.param('module');
		searchModule(module, function(err, content) {
		if(err) res.json({err:err});
		else res.json({content:content});
		});
	});
}

function searchModule(module_name, cb) {
    var options = {
        method: "GET",
        url: 'https://registry.npmjs.org/-/_view/byKeyword?startkey=["node-red"]&amp;endkey=["node-red",{}]&amp;group_level=3',
        headers: {
            'Accept': 'application/json',
        }
    };
    if(body_cache) match(module_name, body_cache, cb);
    else{
	    httpRequest.get(options, function(error, response, body) {
	        if (!error && response.statusCode == 200) {
	        	body_cache = body;
	        	match(module_name, body, cb);
	        } else if (error) {
	        	cb(error.toString());
	        } else {
	        	cb(((response.statusCode + ": " + body)));
	        }
	    });

    }
}

function match(module_name, body, cb) {
    var result = [];
    var info = (JSON.parse(body)).rows;
    var filter = new RegExp(module_name);
    var found = false;
    for (var i = 0; i < info.length; i++) {
        var n = info[i];
        if (!filter || filter.test(n.key[1]) || filter.test(n.key[2])) {
            result.push(n.key[1]);
            found = true;
        }
    }
    if (found) {
        cb(null, result);
    }else{
    	cb('Not Found');
    }	
}

