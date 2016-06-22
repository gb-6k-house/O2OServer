/**
 * Created by niupark on 16/3/16.
 */
//引入相关模块
var http        = require('https');
var url         = require('url');
var util        = require('util');
var querystring = require('querystring');
var crypto      = require('crypto');

var API_TOKEN                    =  'https://api.weixin.qq.com/cgi-bin/token'//获取access token
//获取微信服务器IP地址
var API_GET_CALLBACK_IP          =  'https://api.weixin.qq.com/cgi-bin/getcallbackip'
//创建自定义菜单
var API_MENU_CREATE              =  'https://api.weixin.qq.com/cgi-bin/menu/create'
//查询菜单
var API_MENU_GET                 =  'https://api.weixin.qq.com/cgi-bin/menu/get'
//删除菜单
var API_MENU_DELETE              =  'https://api.weixin.qq.com/cgi-bin/menu/delete'
//获取用户基本信息
var API_GET_USERINFO             =  'https://api.weixin.qq.com/cgi-bin/user/info'



//创建个性化菜单
var API_MENU_CREATE_CONDITIONAL              =  'https://api.weixin.qq.com/cgi-bin/menu/addconditional'

//screte = 7a6eac9552aa7188945b676d94ecdff9


/**
 * 调用微信接口对象
 * @param {string}  appId 第三方用户唯一凭证  ,在公众号平台,基本配置页面可以查看
 * @param {string}   secretKey   第三方用户唯一凭证密钥，即appsecret
 * @param {object} 打印日志对象,必须实现 error, info ,warn接口
 */
function WechatApp(appId, secretKey, logger) {
    this.appid = appId;
    this.secret = secretKey;

    //调用获取Token接口
    function callToken(callback){
        var tokenParam = new TokenParam();
        tokenParam.appid = appId;
        tokenParam.secret = secretKey;
        callAPI(API_TOKEN,null,tokenParam,'GET',10000,function(e,data) {
            logger.info(API_TOKEN + '返回:' + data);
            if (e) {
                logger.error('refresh token failed');
                typeof callback === 'function' && callback(e);
            } else {
                typeof callback === 'function' && callback(null, data);
            }
        });
    }
    var token = '';
    callToken(function(e, data){
       if (data){
           var ret = JSON.parse(data);
           token = ret.access_token;
           logger.info('获取token成功:' + token);
           var time = (ret.expires_in - 60)*1000; //在实效之前60s刷新token
           //定时刷新token
           setInterval(function() {
               callToken(function (e, data) {
                   if (data) {
                       var ret = JSON.parse(data);
                       token = ret.access_token;
                       logger.info('获取token成功:' + token);

                   }
               });
           },time);
       }
    });
   /*
    *如果公众号基于消息接收安全上的考虑，需要获知微信服务器的IP地址列表，以便识别出哪些消息是微信官方推送给你的，哪些消息可能是他人伪造的，可以通过该接口获得微信服务器IP地址列表。
    *@param {function} callback(e,data)    回调函数
    {
    "ip_list":["127.0.0.1","127.0.0.1"]
    }
    */
    this.queryIplist = function(callback) {
        callAPI(API_GET_CALLBACK_IP,token, new IPListParam(), 'GET', 10000, callback)
    };

    /**
     * 自定义菜单创建接口
     * @param  {MenuParam}   mene
     * @param {function} callback(e,data)    回调函数
     */

    this.createMenu = function(mene,callback){
        callAPI(API_MENU_CREATE,token, mene.paramObject(), 'POST', 10000, callback);
    }
    /**
     * 查询菜单接口
     * @param {function} callback(e,data)    回调函数
     */

    this.getMenu = function(callback){
        callAPI(API_MENU_GET,token, {}, 'GET', 10000, callback);
    }
    /**
     * 删除菜单接口
     * @param {function} callback(e,data)    回调函数
     */

    this.deleteMenu = function(callback){
        callAPI(API_MENU_DELETE,token, {}, 'GET', 10000, callback);
    }


    /**
     * 个性化菜单创建接口
     * @param  {MenuParam}   mene
     * @param {function} callback(e,data)    回调函数
     */
    this.createConditionalMenu = function(mene,callback){
        callAPI(API_MENU_CREATE_CONDITIONAL,token, mene.paramObject(), 'POST', 10000, callback);
    }
}

/**
 * 调用API
 * @param  {string}   api                   api地址
 * @param  {string}   token                 获取的服务器token
 * @param  {object}   params                参数对象
 * @param  {string}   method                请求方法，GET或POST
 * @param  {int}      timeout               超时时间，单位毫秒
 * @param  {Function} callback(err, result) 回调函数
 */
function callAPI(api,token, params, method, timeout, callback){

    try{
        //将method转为大写
        method = method.toUpperCase();
        //效验method
        if(method !== 'GET' && method !== 'POST'){
            throw new Error('method is invalid');
        }

        //效验timeout
        if(parseInt(timeout) !== timeout || timeout < 1){
            timeout = 3000;
        }


        var urlParams = url.parse(api);
        var host = urlParams.host;
        var path = urlParams.path;
        var strParams  = '';
        if(method === 'GET'){
            if (token) params.access_token = token;
            strParams = querystring.stringify(params);
            path += '?' + strParams;
        }else if(method === 'POST') {
            strParams = JSON.stringify(params);
            if (token) path += '?' + 'access_token=' + token;
        }

        var requestOption = {
            host: host,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        };

        if(method === 'POST'){
            requestOption.headers['Content-Length'] = strParams.length;
        }

    }catch(e){
        return typeof callback === 'function' && callback(e);
    }
    console.log('发送微信服务器的数据:' + strParams);
    var req = http.request(requestOption, function(res){
        res.setEncoding('utf8');
        res.on('data', function(data){
            typeof callback === 'function' && callback(null, data);
        });
    });

    req.on('error', function(e){
        typeof callback === 'function' && callback(e);
    });

    if(method === 'POST'){
        req.write(strParams);
    }

    req.setTimeout(timeout, function(){
        req.abort();
    });

    req.end();
}

//
function TokenParam(){
    /*
     参数	是否必须	说明
     grant_type	是	获取access_token填写client_credential
     appid	是	第三方用户唯一凭证
     secret	是	第三方用户唯一凭证密钥，即appsecret
    * */
    this.grant_type = 'client_credential';
    this.appid = '';
    this.secret = '';
}

//
function IPListParam(){
}

//自定义菜单创建接口参数
function MenuParam(){
    this.button = [];
    this.matchrule; //个性化菜单参数,普通菜单没有
    function ButtonItem(){
        this.type;
        this.name ;
        this.key;
        this.url  ;
        this.media_id;
        this.sub_button;
        //新增菜单项
        this.addItem = function(){
            var item = new ButtonItem();
            this.sub_button.push(item);
            return item;
        }
        this.paramObject = function(){
            var json ={};
            if (!this.type || !this.name){
                throw  Error('type or name invalide');
            }
            json.name = this.name;
            json.type = this.type;
            json.sub_button = [];
            //判断key 的有效性
            if ((this.type == exports.BUTTON_STYLE_CLICK
               || this.type == exports.BUTTON_STYLE_SCANCODE_PUSH
                || this.type == exports.BUTTON_STYLE_SCANCODE_WAITMSG
                || this.type == exports.BUTTON_STYLE_PIC_SYSPHOTO
                || this.type == exports.BUTTON_STYLE_PIC_PHOTO_ALBUM
                || this.type == exports.BUTTON_STYLE_LOCATION_SEL
                || this.type == exports.BUTTON_STYLE_PIC_WEIXIN)
            && !this.key){
                throw  Error(this.type + "itme's key  not found");
            }else if(this.key){
                json.key = this.key;
            }
            //判断url
            if(this.type ==  exports.BUTTON_STYLE_VIEW && !this.url){
                throw  Error(this.type + "itme's url  not found");
            }else if (this.url){
                json.url = this.url;
            }
            // media_id
            if((this.type ==  exports.BUTTON_STYLE_MEDIA_ID
                || this.type ==  exports.BUTTON_STYLE_VIEW_LIMITED)
                && !this.media_id){
                throw  Error(this.type + "itme's media_id  not found");
            }else if (this.media_id){
                json.media_id = this.media_id;
            }
            for (var i = 0; this.sub_button && i < this.sub_button.length ; i ++){
                json.sub_button.push(this.sub_button[i].paramObject());
            }
            return json;
        }
    }
    //新建一个按钮
    this.addButton = function(){
        var item = new ButtonItem();
        this.button.push(item);
        return item;
    }
    function Mathcrule(){
        this.group_id = null; //用户分组id，可通过用户分组管理接口获取
        this.sex = null; //性别：男（1）女（2），不填则不做匹配
        this.country =null; //国家信息，是用户在微信中设置的地区，具体请参考地区信息表
        this.province = null; //省份信息，是用户在微信中设置的地区，具体请参考地区信息表
        this.city  = null;//城市信息，是用户在微信中设置的地区，具体请参考地区信息表
        this.client_platform_type = null;//客户端版本，当前只具体到系统型号：IOS(1), Android(2),Others(3)，不填则不做匹配
        /*语言信息，是用户在微信中设置的语言，具体请参考语言表：
         1、简体中文 "zh_CN" 2、繁体中文TW "zh_TW" 3、繁体中文HK "zh_HK" 4、英文 "en" 5、印尼 "id" 6、马来 "ms" 7、西班牙 "es"
         8、韩国 "ko" 9、意大利 "it" 10、日本 "ja" 11、波兰 "pl" 12、葡萄牙 "pt"
          13、俄国 "ru" 14、泰文 "th" 15、越南 "vi" 16、阿拉伯语 "ar" 17、北印度 "hi" 18、希伯来 "he" 19、土耳其 "tr" 20、德语 "de" 21、法语 "f*/
        this.language = null ;//
        this.paramObject = function(){
            var json = {};
            if (this.group_id) json.group_id = group_id;
            if (this.sex) json.sex = sex;
            if (this.country) json.country = country;
            if (this.province) json.province = province;
            if (this.city) json.city = city;
            if (this.client_platform_type) json.client_platform_type = client_platform_type;
            if (this.language) json.language = language;
            return json;
        }
    }
    //创建个性化参数
    this.newMatchrule = function(){
        return new Mathcrule();
    }

    //获取传送给服务器的json串
    this.paramObject = function(){
        var json = {};
        json.button = [];
        if (this.matchrule){
            json.matchrule = this.matchrule.paramObject();
        }
        for (var i = 0; i < this.button.length ; i ++) {
            json.button.push(this.button[i].paramObject());
        }
        return json;
    }
}






//用户点击click类型按钮后，微信服务器会通过消息接口推送消息类型为event	的结构给开发者（参考消息接口指南），并且带上按钮中开发者填写的key值，开发者可以通过自定义的key值与用户进行交互；
exports.BUTTON_STYLE_CLICK               = 'click';
//用户点击view类型按钮后，微信客户端将会打开开发者在按钮中填写的网页URL，可与网页授权获取用户基本信息接口结合，获得用户基本信息
exports.BUTTON_STYLE_VIEW                = 'view';
//用户点击按钮后，微信客户端将调起扫一扫工具，完成扫码操作后显示扫描结果（如果是URL，将进入URL），且会将扫码的结果传给开发者，开发者可以下发消息。
exports.BUTTON_STYLE_SCANCODE_PUSH       = 'scancode_push';
//用户点击按钮后，微信客户端将调起扫一扫工具，完成扫码操作后，将扫码的结果传给开发者，同时收起扫一扫工具，然后弹出“消息接收中”提示框，随后可能会收到开发者下发的消息。
exports.BUTTON_STYLE_SCANCODE_WAITMSG    = 'scancode_waitmsg';
//用户点击按钮后，微信客户端将调起系统相机，完成拍照操作后，会将拍摄的相片发送给开发者，并推送事件给开发者，同时收起系统相机，随后可能会收到开发者下发的消息
exports.BUTTON_STYLE_PIC_SYSPHOTO        = 'pic_sysphoto';
//用户点击按钮后，微信客户端将弹出选择器供用户选择“拍照”或者“从手机相册选择”。用户选择后即走其他两种流程。
exports.BUTTON_STYLE_PIC_PHOTO_ALBUM     = 'pic_photo_or_album';
//用户点击按钮后，微信客户端将调起微信相册，完成选择操作后，将选择的相片发送给开发者的服务器，并推送事件给开发者，同时收起相册，随后可能会收到开发者下发的消息。
exports.BUTTON_STYLE_PIC_WEIXIN          = 'pic_weixin';
//用户点击按钮后，微信客户端将调起地理位置选择工具，完成选择操作后，将选择的地理位置发送给开发者的服务器，同时收起位置选择工具，随后可能会收到开发者下发的消息。
exports.BUTTON_STYLE_LOCATION_SEL        = 'location_select';
//用户点击media_id类型按钮后，微信服务器会将开发者填写的永久素材id对应的素材下发给用户，永久素材类型可以是图片、音频、视频、图文消息。请注意：永久素材id必须是在“素材管理/新增永久素材”接口上传后获得的合法id。
exports.BUTTON_STYLE_MEDIA_ID            = 'media_id';
//用户点击view_limited类型按钮后，微信客户端将打开开发者在按钮中填写的永久素材id对应的图文消息URL，永久素材类型只支持图文消息。请注意：永久素材id必须是在“素材管理/新增永久素材”接口上传后获得的合法id。
exports.BUTTON_STYLE_VIEW_LIMITED        = 'view_limited';


exports.WechatApp = WechatApp;
exports.MenuParam = MenuParam;