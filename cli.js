var celeri = require('celeri'),
    path = require('path'),
    server = require('./server.js');

celeri.option({
    command: 'serve :path OR serve :path :proxy',
    description: 'Starts the server, using [path] as public folder'
}, function(data) {

    server.start();
    server.serve(path.resolve(data.path));

    if(data.proxy){
        celeri.emit('proxy ' + data.proxy);
    }

});

celeri.option({
    command: 'logger',
    description: 'Logs requests'
}, function(data) {
    server.logger();
});

celeri.option({
    command: 'cache',
    description: 'Cache all the requests proxyed'
}, function(data) {
    server.cache();
});


celeri.option({
    command: 'cacheDump',
    description: 'Save the cache in a file'
}, function(data) {
    server.cacheDump();
});


celeri.option({
    command: 'proxy :ip OR proxy :ip :port',
    description: 'Set-up the server to proxy requests'
}, function(data) {
    server.proxy(data.ip, data.port);
});

celeri.parse(process.argv);

celeri.open({prefix: 'juppy > '});
