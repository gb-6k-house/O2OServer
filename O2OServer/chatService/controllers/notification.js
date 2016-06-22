/**
 * Created by niupark on 16/3/2.
 */
var logger = process.logger;
var sockets = process.sockets;
var confige = require('./../configes/confige');

var mt =require('../models/messageType');
var rpc = require('./rpc-server');

//var notification = process.redisNotification;
var redis = require('redis');
var notification = redis.createClient(confige.redis.port, confige.redis.ip);
/*
 *接口名 notification
 *描述 发生消息notification 给目标用户,
 * 发送数据格式{
 * type: 消息类型
 * msg:具体消息内容
 * }
 * */
function notifyClient(socket,type, msg){
    var notify = {};
    notify.type = type;
    notify.msg = msg;
    socket.emit(mt.SysNotification,JSON.stringify(notify));
}
/*
*订阅用户登录消息
 */
notification.subscribe(mt.NTUserLogin);
notification.subscribe(mt.NTUserLogout);

notification.on('message',function(chanel, imei){
    logger.info('通知:' + chanel);
    if (chanel === mt.NTUserLogin || chanel ===mt.NTUserLogout){
        sockets.forEach(function(value, key) {
            var socket = value;
            if (socket.IMEI != imei){
                notifyClient(socket, chanel, imei);
            }
        });
    }

});
