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

app.get('/*', function (req, res) {

    /**
     * simple proxy for single site
     */
    var toUrl = req.originalUrl.substr(1,req.originalUrl.length); // remove  '/'
    toUrl = decodeURIComponent(toUrl);
    var has_http = /^(http:\/\/)|^(https:\/\/)/g.test(toUrl); // start with 'http:// or https://'
    var url = toUrl == '' ? 'https://www.baidu.com' : has_http?toUrl: (req.protocol+'://'+toUrl);
    var x = request(url);
    
    x.on('error',function(e){
        handleError(e,req, res)
    });
    req.pipe(x).pipe(res);
    
    //x.pipe(res) see request's readme
    
    x = null;
    
    console.log(url)
    
    
    
    
})


app.listen(3000)


