/**
 * Created by niupark on 16/3/18.
 */
/**
 * Created by niupark on 16/1/8.
 */
var http = require('http');
var confige = require('./../configes/confige');
var crypt = require('./../../public/utils/crypt');
function Base(){


};
Base.request=function(method, path, data){
    var opt = {
        host:confige.host,
        port:confige.port,
        method:method,
        path:path,
        headers:{
            "Content-Type": 'charset=UTF-8',
        }
    }
    var body;
    if (data) body = JSON.stringify(data);
    var req = http.request(opt, function(res) {
        console.log("post response: " + res.statusCode);
        res.setEncoding('utf8');
        res.on('data',function(d){
            body += d;
        }).on('end', function(){
            console.log(res.headers);
            console.log('请求返回数据体:' + body);
        });
    }).on('error', function(e) {
        console.log("post error: " + e.message);
    })
    if (body){
        req.write(body);
    }
    // req.write(JSON.stringify(data));
    // req.writeBody(enData);
    req.end();
}
Base.prototype.POST = function(path, data){
    Base.request('POST', path, data);
}


Base.prototype.GET = function(path, data){
    Base.request('GET', path, data);
}

module.exports = Base;

