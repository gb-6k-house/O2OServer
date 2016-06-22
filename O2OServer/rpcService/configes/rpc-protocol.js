/**
 * Created by niupark on 16/2/19.
 */
/*
  @by liukai
  主要定义rpc服务提供的接口
* */

var confige = require('../configes/confige');
var homeRpc = require('../rpc-controllers/homeRpc');
var userRpc = require('../rpc-controllers/userRpc');
var chatRpc = require('../rpc-controllers/chatRpc');
var wechatRpc = require('../rpc-controllers/wechatRpc');
var acessSysRpc = require('../rpc-controllers/acessSysRpc');

var DNode = require('dnode');
function onError(error) {
    console.log('DNode error', JSON.stringify(error));
}

exports.start = function(){
    //rpc 发布接口
    var server = DNode({
        fethNewMsg:homeRpc.fethNewMsg,
        saveNewMsg:homeRpc.saveNewMsg,
        joinUS:homeRpc.joinUS,
        //
        getAllUser:userRpc.getAllUser,
        saveUser:userRpc.saveUser,
        //
        getChatMessage:chatRpc.getChatMessage,
        sendChatMessage:chatRpc.sendChatMessage,
        delUserMessage:chatRpc.delUserMessage
    }).listen(confige.rpchost.port);

    server.on('error', onError);

    //rpc 发布接口
    var wxserver = DNode({
        jssdkReady:wechatRpc.jssdkReady,
        pageAuthorize:wechatRpc.pageAuthorize,
        getPassport:acessSysRpc.getPassport,
        vertifyPassport:acessSysRpc.vertifyPassport

    }).listen(confige.wxrpchost.port);

    wxserver.on('error', onError);

}
