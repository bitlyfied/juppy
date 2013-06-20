var express = require('express');
var httpProxy = require('http-proxy');
var multiProxy = new httpProxy.RoutingProxy();
var extend = require('util')._extend;
var colors = require('colors');

var proxy;
var cache = {};

var settings = {
	staticPath : '',
	forwardIp : '',
	forwardPort : 80
};

var exp = express();

exp.get('/hello', function(req, res){
	res.send('Hello Juppy!');
});

function proxyCache(req, res, next){
	var signature = req.method + req.url;
    var hit = getCache(req);

    if(settings.cache && hit){
        console.log('From cache: ' + signature.green);
        res.status(hit.status);
        res.header(hit.header);
        return res.send(hit.body);
	}

	multiProxy.proxyRequest(req, res, {
		target: {
			host: settings.forwardIp,
			port: settings.forwardPort
		}
	});

	if(!proxy){
        initProxy(multiProxy.proxies[settings.forwardIp+':'+settings.forwardPort]);
    }
}

function initProxy(p){
    proxy = p;

    proxy.on('start', function(req, res, response){
        var hit = {body:'', chunks: [], header:'', status: 200};
        var write = res.write;

        res.write = function(chunk, encoding){
            hit.chunks.push(chunk.toString());
            return write.apply(this, arguments);
        };

        res.end = function(chunk, encoding){
            hit.header = res._header;
            hit.body = hit.chunks.join('');
            hit.status = res.statusCode;

            delete hit.chunks;

            setCache(req, hit);

            console.log("Cache size: " + Object.keys(cache).length);
        };
    });
}

function getCache(req){
    return cache[req.method + req.url];
}

function setCache(req, hit){
    cache[req.method + req.url] = hit;
}

var server = {
	config: function(config){
		extend(settings, config);
	},
	serve: function(staticPath){
		settings.staticPath = staticPath;
		exp.use(express.static(staticPath + '/'));
		console.log('Serving static content path: ', staticPath.green);
	},
	proxy: function(ip, port){
		settings.forwardIp = ip;
		settings.forwardPort = port || 80;

		exp.use(proxyCache);

		console.log('Proxying to: ', (settings.forwardIp + ':' + settings.forwardPort).green);
	},
	cache: function(){
		settings.cache = true;
	},
	logger: function(){
		exp.use(express.logger());
	},
	start: function(port){
		port = port || 80;
		exp.listen(port);
		console.log('Juppy listening on port: ' + (port+'').green);
	}
};


// server.logger();

module.exports = server;
