/**
 * Created by niupark on 16/2/24.
 */
var logger = process.logger;
var sockets = process.sockets;
var confige = require('./../configes/confige');

var redis = require('redis');
var mt =require('../models/messageType');

var notification = redis.createClient(confige.redis.port, confige.redis.ip);
var rpc = require('./rpc-server');



/*
 *订阅用户登录消息
 */
notification.subscribe(mt.NTUserLogin,function(e){
    if (e){
        console.log('订阅失败');
    }
});

notification.on('message',function(chanel, imei){
    /*用户登录,将历史消息发送给用户*/
    if(chanel === mt.NTUserLogin || imei){
        //sendMsgTo(sockets.get(imei));
    }
});


////发送用户发送缓冲的消息
function send_msg_delay(fromuser,tosocket) {
    if (!tosocket.IMEI){
        tosocket.isSendingChatMessage = false
        return;
    }
    rpc.call(function(remote) {
        remote.getChatMessage({to:tosocket.IMEI,from:fromuser},function(err,list) {
           if(!err && list.length > 0){
               var msg = JSON.stringify(list)
               tosocket.isSendingChatMessage = false
               send_msg(fromuser,tosocket, msg)
           }
        })
    });

    //store.hget("chat_history", socket.IMEI, function (e, v) {
    //    if (v) {
    //        list = JSON.parse(v);
    //        if (list.length > 0) {
    //            var msg = JSON.stringify(list)
    //            socket.isSendingChatMessage = false
    //            send_msg(socket, msg)
    //        }
    //    }
    //})
}

/*
 *接口名 message
 *描述 发生消息给目标用户, 客户端接受消息后,返回应答消息message_answer,
 * 返回数据是数组[{
 * from: 消息发送者ID
 * to:消息目标ID
 * msg:具体消息内容
 * }]
 * */
function send_msg(fromuser,tosocket, msg) {
    //delay for 5 sec
    if (tosocket.isSendingChatMessage) {
        setTimeout(function () {
            send_msg_delay(fromuser,tosocket)
        }, 3000)
        return
    }
    //目标tosocket存在,且当前用户正在和目标用户交谈,则立即发送消息,否则不发送
    if (tosocket.canReciveMsg
        && tosocket.msgFrom === fromuser ){
        tosocket.isSendingChatMessage = true
        logger.info('发生消息给: ' + tosocket.IMEI + ' msg :' + msg);
        tosocket.emit("message", msg);
    }
}

    /*
     拼接历史消息,先存储,然后发布消息.
     * */
function process_newmsg(msg) {

    if (!msg || !msg.to){
        logger.error('消息格式错误:' + JSON.stringify(msg));
        return;
    }
    rpc.call(function(remote) {
        remote.sendChatMessage(msg,function(err,list){
            if (err) return;
            var msglist = JSON.stringify(list)
            var socketTo = sockets.get(msg.to);
            if (socketTo ) {
                send_msg(msg.from,socketTo, msglist);
            }
            else {
                console.log('目标用户没有登录,已存为历史消息');
            }
        });
    });
}
/*
*将未发送的消息发生给用户
* */
function sendMsgTo(tosocket){
    if (!tosocket.IMEI) return;
    rpc.call(function(remote) {
        remote.getChatMessage({to:tosocket.IMEI, from:tosocket.msgFrom},function(err,list) {
            if(!err && list.length > 0){
                var msg = JSON.stringify(list)
                send_msg(tosocket.msgFrom,tosocket, msg)
            }
        })
    });
}

/*
 *接口名 P2PSendMessage
 *描述 点对点发生消息
 * 参数{
 * from: 消息发送者ID
 * to:消息目标ID
 * msg:具体消息内容
 * }
 * */
exports.P2PSendMessage = function(msg) {
    logger.info(msg);
    process_newmsg(JSON.parse(msg));
}

/*
 *接口名 message_answer
 *描述 客户端收到消息之后返回应答
 * 参数{
 * }
 * */
exports.message_answer = function(msg) {
    ////监听客户端,发送成功之后,删除历史消息,服务器不做保留
    logger.info('收到客户端消息应答');
    //删除历史数据
    var socket = this;
    rpc.call(function(remote) {
        remote.delUserMessage({to:socket.IMEI, from:socket.msgFrom},function(err) {
            socket.isSendingChatMessage = false;
        })
    });

}

/*
 *接口名 startReciveMsg
 * @param  {string}  data:{from: //来自于谁的消息
 * }

 *描述 用户进入聊天页面时,接受,表示当前与谁进行聊天
 * }]
 * */
function  startReciveMsg(data){

    logger.info('开始聊天,聊天对象:' + data);
    this.canReciveMsg = true;
    this.msgFrom = data;
    sendMsgTo(this);

}

/*
 *接口名 endReciveMsg
 *描述 用户进入聊天页面时,发送改请求,标志准话接受消息了
 * }]
 * */
function  endReciveMsg(){
    this.canReciveMsg = false;
}
exports.startReciveMsg = startReciveMsg;
exports.endReciveMsg = endReciveMsg;

