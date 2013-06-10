var celeri = require('celeri');

var api = {
    sayHello: function(name) {
        console.log("hello %s!", name || 'craig');
    }
}


celeri.onJs({ api: api });

celeri.open({prefix: 'juppy > '});

celeri.parse(process.argv);
