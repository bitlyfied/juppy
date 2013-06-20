var express = require('express');
var exp = express();
var httpProxy = require('http-proxy');
var proxy = new httpProxy.RoutingProxy();


var server = {
	config: function(settings){
		if(settings.staticPath){
			exp.use(express.static(settings.staticPath + '/'));
			console.log('Static content path %s', settings.staticPath);
		}

		exp.all('*', function(req, res){
			proxy.proxyRequest(req, res, {
				target: {
					host: '94.236.111.59',
					port: 80
				}
			});
		});

	},
	start: function(){
		exp.listen(3000);
		console.log('Juppy listening on port 3000');
	}
};



module.exports = server;
