/**
 * Created by niupark on 16/3/9.
 */
'use strict'; 
const logger = process.logger;
const memDB = process.memDB;
const mt =require('../models/messageType');

const userRpc = require('./userRpc')
const Xinge = require('../../public/utils/Xinge');

const XingeIOSApp = new Xinge.XingeApp(2200185841, '8591164fc0e571b94c96d33a84c11f89');
const XingeAndroidApp = new Xinge.XingeApp(2100185840, '1fe1900a9a753f2aafc98405c82c9be5');

const redis = require('redis');
const confige = require('../configes/confige');
const pushNotify = redis.createClient(confige.redis.port, confige.redis.ip);

/*
 *订阅用户登录消息
 */
pushNotify.subscribe(mt.NTUserPublishMsg);
pushNotify.subscribe(mt.NTUserP2PMsg);

pushNotify.on('message',function(chanel, data){
    logger.info('推送通知:' + chanel);
    if (chanel === mt.NTUserPublishMsg ){
         pushToFriend(data);
    }else if (chanel === mt.NTUserP2PMsg){
        pushP2PMsg(data);
    }
});
 /**
 * 推送信息给周边好友
 * @param  {object}  obj 待检查对象
 * @return {Boolean}     检查结果
 */
function pushToFriend(data){
     //Android message start.
     let json = JSON.parse(data);
     let style = new Xinge.Style();
     style.ring = 1;
     style.vibrate = 0;
     style.ringRaw = '';
     style.smallIcon = '';
     style.builderId = 77;

     let action = new Xinge.ClickAction();
     action.actionType = Xinge.ACTION_TYPE_ACTIVITY;
     action.activity = 'com.example.screenunion.activity.ChatActivity';
     action.atyAttr.if = '0';
     action.atyAttr.pf = '0';
     let androidMessage = new Xinge.AndroidMessage();
     androidMessage.type = Xinge.MESSAGE_TYPE_NOTIFICATION;
     androidMessage.title = '附近消息';
     androidMessage.content = json.msg;
     androidMessage.style = style;
     androidMessage.action = action;
     androidMessage.sendTime = new Date().getTime();
     androidMessage.expireTime = 0;
     androidMessage.multiPkg = 0;
     androidMessage.customContent = {imei:json.IMEI};

//IOS message start.
     let iOSMessage = new Xinge.IOSMessage();
     iOSMessage.alert = json.msg;
     iOSMessage.badge = 1;
     iOSMessage.sound = 'df';
     iOSMessage.acceptTime.push(new Xinge.TimeInterval(0, 0, 23, 0));
  //获取周边用户
     logger.info('开始发送推送通知')

     userRpc.getCircleFriend(json, function(list){
         //获取分开IOS用户和android用户,批量发送
         let ioslist = [];
         let androidlist = []
         for(let i=0; i<list.length; i++){
             let user = list[i];
             //通知不发送给自己
             if(user.IMEI !==json.IMEI
             &&
                 user.pushToken
             && user.platform
                 &&user.platform.toUpperCase() === 'IOS'){
                 ioslist.push(user.pushToken);
             }else if(user.IMEI !==json.IMEI
                 && user.pushToken
                 && user.platform
                 && user.platform.toUpperCase() === 'ANDROID'){
                androidlist.push(user.pushToken);
             }
         }
         if (ioslist.length > 0){
             try {
                 XingeIOSApp.pushByDevices(ioslist,iOSMessage, Xinge.IOS_ENV_DEV, function(err, result){
                     logger.info(result);
                 });
             } catch (e) {
                 logger.error('IOS推送失败:' + e.message);
             }

         }
         if (androidlist.length > 0){
             try {

                 XingeAndroidApp.pushByDevices(androidlist, androidMessage, function (err, result) {
                     logger.info(result);
                 });
             }catch (e) {
                 logger.error('Androd 推送失败:' + e.message);
             }
         }
     });
}
/*
*当前用户推送平台
* */
function userPlatform(user){
    if(user.pushToken
        && user.platform
        &&user.platform.toUpperCase() === 'IOS'){
        return 0;
    }else if(user.pushToken
        && user.platform
        && user.platform.toUpperCase() === 'ANDROID'){
        return 1;
    }else {
        return -1;
    }
}

/**
 * 推送信息给特定用户
 * @param  {object}  data
 * @return {Boolean}     检查结果
 */

function  pushP2PMsg(data){
    let msg = JSON.parse(data);
    let style = new Xinge.Style();
    style.ring = 1;
    style.vibrate = 0;
    style.ringRaw = '';
    style.smallIcon = '';
    style.builderId = 77;
    //style.nId = 1; //覆盖之前的
    let action = new Xinge.ClickAction();
    action.actionType = Xinge.ACTION_TYPE_ACTIVITY;
    action.activity = 'com.example.screenunion.activity.ChatActivity';
    action.atyAttr.if = '0';
    action.atyAttr.pf = '0';
    let androidMessage = new Xinge.AndroidMessage();
    androidMessage.type = Xinge.MESSAGE_TYPE_NOTIFICATION;
    androidMessage.title = '求助消息';
    androidMessage.content = msg.msg;
    androidMessage.style = style;
    androidMessage.action = action;
    androidMessage.sendTime = new Date().getTime();
    androidMessage.expireTime = 0;
    androidMessage.multiPkg = 0;
    androidMessage.customContent = {imei:msg.from}; //消息发送者
    logger.info(msg.from + '开始发送推送通知');

//IOS message start.
    let iOSMessage = new Xinge.IOSMessage();
    iOSMessage.alert = msg.msg;
    iOSMessage.badge = 1;
    iOSMessage.sound = 'df';
    iOSMessage.acceptTime.push(new Xinge.TimeInterval(0, 0, 23, 0));
    iOSMessage.customContent = msg;
    //获取周边用户
    logger.info('开始发送推送通知')
    userRpc.forUser(msg.to,function(list, index){
        if(index < 0){
            return;
        }
        let user = list[index];
        if(userPlatform(user)==0){
            try {
                XingeIOSApp.pushToSingleDevice(user.pushToken,iOSMessage, Xinge.IOS_ENV_DEV, function(err, result){
                    logger.info(result);
                });
            } catch (e) {
                logger.error('IOS推送失败:' + e.message);
            }

        }else if(userPlatform(user)==1){
            try {

                XingeAndroidApp.pushToSingleDevice(user.pushToken, androidMessage, function (err, result) {
                    logger.info(result);
                });
            }catch (e) {
                logger.error('Androd 推送失败:' + e.message);
            }
        }

    });
}