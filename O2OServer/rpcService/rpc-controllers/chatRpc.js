/**
 * Created by niupark on 16/3/9.
 */
'use strict';
const db = require('../../public/utils/mysqlUtils')(require('../configes/dbConfige'));
const dateformat = require('../../public/utils/dateFormat');
const moment = require('moment');
const eCode = require('../models/errorCode');
const logger = process.logger;
const memDB = process.memDB;
const redis = require('redis');
const confige = require('../configes/confige');
const pushNotify = redis.createClient(confige.redis.port, confige.redis.ip);
//let pushNotify = process.pushNotify; 为什么使用process.pushNotify收不到通知呢

let mt =require('../models/messageType');

/*
 *获取用户待发送的消息
 * @param  {object}  user用户信息
 * @param  {function}  callback(e, list);
 */
function  getChatMessage(user, callback){
    let key = user.from +"|"+ user.to;
    memDB.hget("chat_history", key, function (e, v) {
        let list = [];
        if (e){
            typeof callback === 'function' && callback(e);
        }else{
            if (v) {
                list = JSON.parse(v);
            }
            typeof callback === 'function' && callback(null,list);

        }

    })
}

/*
 *发送用户消息
 * 发送消息,先取出历史消息,一并发送
 * @param  {object}  user用户信息
 * @param  {function}  callback(e,msg);
 */
function  sendChatMessage(msg, callback){
    let list = [];
    let key = msg.from +"|"+ msg.to;
    memDB.hget("chat_history",key, function (e, v) {
        if (e){
            typeof callback === 'function' && callback(e);
        }else{
            if (v) {
                list = JSON.parse(v);
            }
            list.push(msg)
            let msglist = JSON.stringify(list)
            memDB.hset("chat_history", key, msglist, function (e, r) {
            })
            typeof callback === 'function' && callback(null,list);
        }

    })
    //将该条消息推送形式发送出去
    pushNotify.publish(mt.NTUserP2PMsg, JSON.stringify(msg), function(e){});
}

function delUserMessage(user, callback){
    //删除历史数据
    let key = user.from +"|"+ user.to;
    memDB.hdel("chat_history", key, function (e) {
        typeof callback === 'function' && callback(e);
    });
}
exports.getChatMessage = getChatMessage;
exports.sendChatMessage = sendChatMessage;
exports.delUserMessage = delUserMessage;

