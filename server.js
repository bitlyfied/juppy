var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
var proxy = new httpProxy.RoutingProxy();

app.get('/hello.txt', function(req, res){
	var body = 'Hello World';
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', body.length);
	res.end(body);
});

app.all('*', function(req, res){
	proxy.proxyRequest(req, res, {
		target: {
			host: '94.236.111.59',
			port: 80
		}
	});
});

app.listen(80);
console.log('Listening on port 80');
