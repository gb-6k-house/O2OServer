/**
 * Created by niupark on 16/2/24.
 */
var logger = process.logger;
var chat = require('./chatWeb');
var sockets = process.sockets;
var mt =require('../models/messageType');
var confige = require('./../configes/confige');

var rpc = require('./rpc-server');
//var notification = process.redisNotification;

var redis = require('redis');

var notification = redis.createClient(confige.redis.port, confige.redis.ip);


/*
 *接口名 心跳接口ack
 *描述
 * @paramer data:{IMEI:
 * location:{latitude:,longitude} :发送者位置
 * pushToken: //推送通知
 * }
 * 用户定时发送心跳
 * */
exports.ack = function(data) {
    //收到心跳包,更新时间
    logger.info('心跳包:' + data);

    this.ackTime = new Date();
    if(data){
        var user = JSON.parse(data);
        if(user.IMEI){
            saveUser(user);
        }
    }
}
function saveUser(user){
    if (user.IMEI){
        rpc.call(function(remote) {
            remote.saveUser(user,function(err){
            });
        });
    }

}
/*
 *接口名 login
 *描述 用户登录接口
 * 参数{
 * IMEI:
 * location:{latitude:,longitude} :发送者位置}
 * platformt://平台,ios , android, web
 * pushToken: //推送通知
 * }
* */
exports.login = function(data){
    //通知所有在线用户,用户登录了
    logger.info('登录请求数据:' + data);
    var json = JSON.parse(data);
    if (json && json.IMEI){
       var old_socket = sockets.get(json.IMEI);
        if (old_socket) {
            old_socket.emit('logout')
        }
        if (old_socket && old_socket != this) {
            old_socket.disconnect()
        }
        logger.info(json.IMEI + '用户请求登录');
        this.IMEI = json.IMEI;
        this.login = true;
        sockets.set(json.IMEI, this);
        //保存登录用户信息
        json.login = 1;
        saveUser(json, 1);
        //用户登录
        notification.publish(mt.NTUserLogin, this.IMEI, function(e){});

    }

}
exports.logout = function(data) {
    var address = this.handshake.address;
    logger.info(" logout ");
    old_socket.login = false;
    socket.disconnect();
}

exports.disconnect = function(data) {
    var address = this.handshake.address;
    if (this.IMEI){
        logger.info(" Disconnect " + this.IMEI);
        //保存用户状态
        saveUser({IMEI:this.IMEI, login:0}, 0);
        notification.publish(mt.NTUserLogout, this.IMEI,function(e){});
        sockets.remove(this.IMEI);
    }
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
function send_msg(socket, msg) {
    //delay for 5 sec
    if (socket.isSendingChatMessage) {
        setTimeout(function () {
            send_msg_delay(socket)
        }, 5000)
        return
    }
    socket.isSendingChatMessage = true
    socket.emit("message", msg);
}

