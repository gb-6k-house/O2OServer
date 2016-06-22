/**
 * Created by niupark on 16/3/18.
 */
/*
 * */
'use strict';
const logger = process.logger;
const jssdk = require('node-weixin-jssdk');

const settings = require('node-weixin-settings');

const oauth = require('node-weixin-oauth');


var settingsConf = {
};
function get(id, key, cb) {
    if (!cb instanceof Function) {
        throw new Error();
    }

    if (settingsConf[id] && settingsConf[id][key]) {
        return cb(settingsConf[id][key]);
    }

    return cb(null);
}

function set(id, key, value, cb) {
    if (!cb instanceof Function) {
        throw new Error();
    }
    if (!settingsConf[id]) {
        settingsConf[id] = {};
    }
    settingsConf[id][key] = value;
    cb;
}

function all(id, cb) {
    if (!cb instanceof Function) {
        throw new Error();
    }
    if (!settingsConf[id]) {
        settingsConf[id] = {};
    }
    cb(settingsConf[id]);
}

settings.registerSet(set);
settings.registerGet(get);
settings.registerAll(all);

//const
/*
 微信公众号开发验证接口
 */

/*测试公众号
 *appID
 wxebf2d76f972c42cf
 appsecret
 016be2b559c914a9ae1e28e9b6788c90
 * */

//let wechatApp = new wechat.WechatApp('wxebf2d76f972c42cf', '016be2b559c914a9ae1e28e9b6788c90',logger);
/*
{
    "button": [
    {
        "name": "物业",
        "sub_button": [
            {
                "type": "view",
                "name": "现网环境",
                "url": "http://www.uscreen.online/users/accessSysHome.html"
            },
            {
                "type": "view",
                "name": "本地环境",
                "url": "http://192.168.0.192:8080/users/accessSysHome.html"
            }
        ]
    }
]
}*/
function  createMenu(){
    let menu = new wechat.MenuParam();
    let button = menu.addButton();
    button.type = wechat.BUTTON_STYLE_VIEW;
    button.name = '通行证';
    button.key ='KEY_SAY_1';
    button.url = 'https://www.baidu.com';


    wechatApp.createMenu(menu,function(e, data){
        if (!e){
            logger.info(data);
        }else{
            logger.info(e);
        }
    })

}
function  deleteMenue(){
    wechatApp.deleteMenu(function(e, data){
        if (!e){
            logger.info(data);
        }else{
            logger.info(e);
        }
    })
}
/*
 *获取 jsapi_ticket
 * 返回jssdk调用的初始化参数
 * @paramer app = {
    id:
    secret:
 };
 @url :
 */
function ready(app, url, cb){
    try{
        jssdk.prepare({id:app.appid,secret:app.secret}, url, function(e, ticket){
            if(e){
                logger.error('获取jsapi_ticket失败');
                cb(true);
            }else{
                logger.info(ticket);
                cb(false, ticket);
            }

        });
    }catch (e){
        cb(true);
    }

}

/*
* 公众号页面请求授权接口
* */

function pageAuthorize(app, url, cb){
    //  createURL: function (appId, redirectUri, state, scope, type) {
    try {
        logger.info('授权页面:' + url);
        let oauthUrl =  oauth.createURL(app.appid, url,'0', 1, 0);
        typeof cb === 'function' && cb(false, oauthUrl);
    }catch (e){
        logger.error(e);
        typeof cb === 'function' && cb(true);
    }

}
/*
*
* */

exports.jssdkReady = ready;
exports.pageAuthorize = pageAuthorize;

exports.createMenu =createMenu;
exports.deleteMenue =deleteMenue;