var cache = {};

function cacheMe(id, req, res, next){
    var hit = cache[id];

    if(hit){
        console.log('From Cache: ' + (hit.status == 200 ? id.green : id.red));
        res.status(hit.status);
        res.header(hit.header);
        res.send(hit.body);
    }else{
        cacher(id, res);
        next();
    }
}

function cacher(id, res){
    var chunks = [];
    var originalWrite = res.write;

    res.write = function(chunk){
        chunks.push(chunk.toString());
        return originalWrite.apply(this, arguments);
    }

    res.on('finish', function(){
        if(res.statusCode == 500){
            console.log("Cache error: %s %s", (res.statusCode+'').red, id.yellow);
            return;
        }

        cache[id] = {
            status : res.statusCode,
            header : res._header,
            body   : chunks.join('')
        };

        console.log("Cache (%d): %s", Object.keys(cache).length, id);
    });
}

function filterMe(res, next, flt){
    filter(res, flt);
    next();
}

function filter(res, flt){
    var content = '';
    var originalWrite = res.write;
    var originalHead = res.writeHead;
    var originalEnd = res.end;

    res.writeHead = function(){
        return;
    }

    res.write = function(chunk){
        content += chunk.toString();
    }

    res.end = function(){
        var body = flt(content);
        
        res.setHeader('content-length', body.length);
        originalHead.call(this, 200);

        originalWrite.call(this, new Buffer(body));
        originalEnd.call(this);
    }

    res.on('ssfinish', function(){
        console.log('finish');
    });
}

module.exports = function(app){


    app.get('/*', function(req, res, next){
        return filterMe(res, next, function(content){
            return content;
        });
    });

    //return;

    app.get('/disabled-admin', function(req, res, next){

        if(req.headers.host == 'noths.dev.noths.com'){
            return cacheMe('admin', req, res, next);
        }

        return next();
    });

    app.get('/*', function(req, res, next){
        if(req.xhr){
            var id = req.headers.host + req.url.replace(/_dc=(\d*)?&/, '').replace(/authenticity_token=(.*?)($|&)/, '').replace(/(\?|&)$/,'');
            return cacheMe(id, req, res, next);
        }else{
            return next();
        }
    });
}
