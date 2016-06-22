/**
 * Created by niupark on 16/3/3.
 */
'use strict';

const eCode = require('../models/errorCode');
const http = require('./httpBase').http;
const rpc = require('./rpc-server');
const logger = process.logger;


/*
 *接口名 getAllUser
 *描述 获取全网的用户,包括登录和非登录的用户
 * 入参数 {IMEI:}
 * 出参数{
 * code:
 * msg:
 * data:{
 *      list:[{IMEI:用户IMEI
 *        login:用户是否登录1:登录 0:未登录
 *        name:用户名
 *       }],
 *       lengthl:1}
 * }
 * */

exports.getAllUser = function(req, res,next) {
    if (!req.body.IMEI){
        http.sendData(res, eCode.ParamerError, '参数错误', null);
        return
    }
    let imei = req.body.IMEI;
    rpc.call(function(remote){
        remote.getAllUser(imei,function(v, e){
            if (e){
                http.sendData(res, eCode.UnkownError, '操作失败', null);
            }else{
                http.sendData(res, eCode.Success, '操作成功', v);
            }
        });
    });
}