var celeri = require('celeri'),
    path = require('path'),
    server = require('./server.js');

var api = {
    sayHello: function(name) {
        console.log("hello %s!", name || 'craig');
    }
}


celeri.option({
    command: 'start :path',
    description: 'Starts the proxy-cache server, using [path] as public folder"'
}, function(data) {
    var staticPath = path.resolve(data.path);

    server.config({
        staticPath: staticPath
    });

    server.start();
});

celeri.parse(process.argv);

//celeri.open({prefix: 'juppy > '});
