var request = require('request');


var express = require('express')
var app = express()

function handleError(e,req,res) {
    if(e.code == 'ENOTFOUND'){
        res.status(404).end('not found')
    }else{
        res.status(500).end('server error')
    }
}

var CACHE = {};

function checkCache(url) {
    if (CACHE[url] && CACHE[url].time){
        if ((Date.now() - CACHE[url].time < 20000)) { 
            return true;
        }
        else {
            delete CACHE[url];
            return false;
        }
    }
}

function cache(url,x,req,res,callback) {

    if (checkCache(url)) {
        sendCacheResp(CACHE[url],res); return;
    }else{
        console.log('request new content')
        req.pipe(x).pipe(res);
    }
    
    CACHE[url] = {};

    
    var buffers = [];
    //var x = request(url);
    x.on('error',function(e){
        handleError(e,req, res);
        CACHE[url] = {};
    });
    x.on('data', function(buffer) {
        buffers.push(buffer);
    });
    x.on('response',function(response){
        CACHE[url].headers = response.headers;
    })
    x.on('end', function() {
        //noinspection JSUnresolvedVariable
        var buffer = Buffer.concat(buffers);
        CACHE[url].content = buffer;
        CACHE[url].time = Date.now();
        console.log("CACHE ING")
        console.log(CACHE)
    });
}

function sendCacheResp (cache,res) {
    console.log('load cache content')
    res.set('X-Cache-Time',cache.time);
    res.set(cache.headers);
    res.end(cache.content);

}

app.get('/bbc', function (req, res) {

    /**
     * simple proxy for single site
     */

    var url = 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml';
    var x = request(url);
    x.on('error',function(e){
        handleError(e,req, res)
    });
    req.pipe(x).pipe(res);

    //x.pipe(res) see request's readme
    
    console.log(111+url)
});



app.get('/*', function (req, res) {

    /**
     * simple proxy for single site
     */
    var toUrl = req.originalUrl.substr(1,req.originalUrl.length); // remove  '/'
    toUrl = decodeURIComponent(toUrl);
    var has_http = /^(http:\/\/)|^(https:\/\/)/g.test(toUrl); // start with 'http:// or https://'
    var url = toUrl == '' ? 'https://www.baidu.com' : has_http?toUrl: (req.protocol+'://'+toUrl);
    
    var cached = checkCache(url);
    
    
    var x = request(url);


    cache(url, x,req,res);
    
    //x.pipe(res) see request's readme
    
    console.log(222+url)
    console.log(CACHE)
    
    
    
})







app.listen(3000)


