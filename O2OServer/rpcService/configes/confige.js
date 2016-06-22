/**
 * Created by niupark on 16/1/6.
 */
exports.debug = true;
exports.port = 3000;
exports.charPort = 3001;
exports.session_secret = 'scott todo session secret';
exports.root=__dirname;
exports.redis={'port':6379, 'ip':'127.0.0.1'};
exports.rpchost={'port':6002, 'ip':'127.0.0.1'};
exports.wxrpchost={'port':6003, 'ip':'127.0.0.1'};

exports.friendsCircle = 500.00; //定义朋友圈的距离 500m

//定义换成图片路径
exports.tmpImagePath = '/Users/niupark/Documents/UC/tmp/';

exports.qiniu = {
    domain:'http://7xs6h1.com1.z0.glb.clouddn.com',
    accesskey:'TP7ii0URhQBmNP7tqP8r_cyAJ2dySMNzqnFYy3Ha',
    secretkey:'P7flZWg_jypaUc3P8OwHcAd7a3IXeNzFVftI9mla',
    fileSpace:'files'
}