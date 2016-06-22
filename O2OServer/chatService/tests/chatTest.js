/**
 * Created by niupark on 16/3/3.
 */
var test = require('./baseTest');
var mt =require('../models/messageType');

function Chat(){
}
Chat.prototype = new test(); //建立原型链
var chat = new Chat();

//监听通知消息
chat.on(mt.SysNotification,function(data){
    console.log('收到系统通知,通知内容:'+data);
});

chat.emit('login',JSON.stringify({IMEI:'865790025955667'}));