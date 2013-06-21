var cache = {};

function cacheMe(id, req, res, next){
    var hit = cache[id];

    if(hit){
        console.log('From Cache: ' + (hit.status == 200 ? id.green : id.orange));
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
        chunks.push(chunk);
        return originalWrite.apply(this, arguments);
    }

    res.on('finish', function(){
        cache[id] = {
            status : res.statusCode,
            header : res._header,
            body   : Buffer.concat(chunks)
        };

        console.log("Cache (%d): %s", Object.keys(cache).length, Object.keys(cache));
    });
}

module.exports = function(app){
    app.get('/disabled-admin', function(req, res, next){

        if(req.headers.host == 'noths.dev.noths.com'){
            return cacheMe('admin', req, res, next);
        }

        return next();
    });

    app.get('/*', function(req, res, next){
        if(req.xhr){
            var id = req.url.replace(/_dc=(\d*)?&/, '').replace(/authenticity_token=(.*?)($|&)/, '').replace(/(\?|&)$/,'');
            return cacheMe(id, req, res, next);
        }else{
            return next();
        }
    });
}
