/**
 * Created by niupark on 16/2/24.
 */
var router = require('./socketRouterEngine');
var loginWeb = require('../controllers/loginWeb');
var chatWeb = require('../controllers/chatWeb');
//配置路由列表
exports.confige = function(){
    router.on('login', loginWeb.login);
    router.on('logout', loginWeb.logout);
    router.on('ack',loginWeb.ack);

    router.on('disconnect', loginWeb.disconnect);
    router.on('startReciveMsg',chatWeb.startReciveMsg);
    router.on('endReciveMsg',chatWeb.endReciveMsg);

    router.on('P2PSendMessage',chatWeb.P2PSendMessage);
    router.on('message_answer',chatWeb.message_answer);
}

