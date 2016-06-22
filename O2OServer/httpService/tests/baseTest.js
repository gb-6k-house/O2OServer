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
            "encrypt":1
            //"Content-Length": JSON.stringify(data).length
        }
    }
    var body = "";
    var enData = crypt.encryptDes(JSON.stringify(data), crypt.keyStr());
    //console.log(crypt.decryptDes('9SPZrc6mA+8T8V3fqBXY2TPZZ3Z0WNQTAvGJBoeaWiVcIDxk4so4i/aPRO8U Hc4Qea8oPkcMJTxIG9zmfwz5ONG9xOmjH34Afc1Fl/wpvB6hSAAGTfh5jw==', '123456'));
   // console.log(crypt.decryptDes('yJVZSwUmrznSYwx1VTF22pWH3zIVAp4mDUAakLGzLM66GA8doFy0lTYIM5BIxClSZRjx8E+OZKenHi7B8odwKTnEluPTQvsC9nvrSBw9gOU=', crypt.keyStr()));

    console.log(enData);
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
    req.write(enData);
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

