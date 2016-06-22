/**
 * 门禁管理
 * Created by niupark on 16/3/18.
 */

'use strict';

const logger = process.logger;

const http = require('./httpBase').http;
const rpc = require('./rpc-server');
const eCode = require('../models/errorCode');
const confige = require('../configes/confige');


/*
 *接口名 getPassport
 *描述 获取门禁二维码
 * 入参数{
 * code: 微信授权code
 * }
 * */
function getPassport(req, res, next) {
    /*
     *生成二维码, 二维码的主要信息包含
     * openid, 生成日期
     * */

    let textObj = {};
    if (!req.body.code) {
        http.sendData(res, eCode.ParamerError, '参数错误', null);
    }else{
        rpc.callWX(function (remote) {
            try {
                remote.getPassport(confige.wxPublic,req.body.code, function (e, code, passport) {
                    if(code == 0){
                        http.sendData(res, eCode.Success, '操作成功', passport);
                    }else if(code == -1){
                        http.sendData(res, eCode.AccessPageInvalid, '页面已经失效,重新登录系统', null);

                    }else {
                        http.sendData(res, eCode.UnkownError, '内部错误', null);
                    }

                });
            } catch (e) {
                logger.error(e);
                http.sendData(res, eCode.UnkownError, '内部错误', null);

            }
        });
    }

}
/*
 *接口名 vertifyPassport
 *描述 识别门禁信息
 * 算法:
 * 有效期不能大于5分钟
 * 用户必须是属于当前企业号
 * 入参数{
 * passport: //门禁字符串
 * }
 * */
function vertifyPassport(req, res, next) {
    if (!req.body.passport) {
        http.sendData(res, eCode.ParamerError, '参数错误', null);
    }else{
        rpc.callWX(function (remote) {
            try {
                remote.vertifyPassport(confige.wxPublic,req.body.passport, function (success,data) {
                    if(success){
                        http.sendData(res, eCode.Success, '检测成功', data);
                    }else{
                        http.sendData(res, eCode.PassPortCheckFailed, '检测失败', null);
                    }
                });
            } catch (e) {
                http.sendData(res, eCode.PassPortCheckFailed, '检测失败', null);
            }
        });
    }


}

exports.getPassport = getPassport;
exports.vertifyPassport = vertifyPassport;