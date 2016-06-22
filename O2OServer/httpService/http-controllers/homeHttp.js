/**
 * Created by niupark on 16/1/6.
 */
'use strict';

const eCode = require('../models/errorCode');
const http = require('./httpBase').http;
const rpc = require('./rpc-server');
const logger = process.logger;
/*
 登录接口
 */
exports.joinUS = function(req, res,next){
    if (!req.body.location || !req.body.IMEI){
        http.sendData(res, eCode.ParamerError, '参数错误', null);
        return
    }
    /*判断用户是否存在,存在则更新登录时间*/
    rpc.call(function(remote) {
        remote.joinUS(req.body.IMEI,function(err, data){
            if (err) {
                http.sendData(res, eCode.UnkownError, '操作失败', null);
            }else{
                http.sendData(res, 0,'操作成功',data);
            }
        });
    });
}

/*
 *接口名 sendNewMsg
 *描述 接受用户发送过来的数据
 * 入参数{
 * IMEI: 消息发送者ID
 * location:{latitude:,longitude} :发送者位置
 * msg:具体消息内容
 * }
 * */

exports.sendNewMsg = function(req, res,next) {
    if (!req.body.location || !req.body.IMEI){
        http.sendData(res, eCode.ParamerError, '参数错误', null);
        return
    }
    let reqData = req.body;
    rpc.call(function(remote){
        remote.saveNewMsg(reqData.IMEI, reqData.location, reqData.MSG, function(err){
            if (err){
                http.sendData(res, eCode.UnkownError, '操作失败', null);
            }else{
                http.sendData(res, eCode.Success, '操作成功', null);
            }
        });
    });
}

/*
 *接口名 getNewMsg
 *描述 获取当前位置方圆500米,最新20条数据
 * 入参数{
 * IMEI: 消息发送者ID
 * location:{latitude:,longitude} :发送者位置
 * }
 * 出参数{
 * code:
 * msg:
 * list:[{distance:消息接受者和发送者之间的距离单位m
 *        MSG:消息内容
 *        IMEI:消息发送者ID
 *        date:2016-02-25 17:04:45 消息发送的时间
 *        duration: 距离现在时间
 *          {"minutes":分,
 *          "hours":时,
 *          "days":天,
 *          "months":月}
 *        location:{latitude:,longitude} :发送者位置
 *       }]
 * }
/*

 消息列表
 */
exports.getNewMsg = function(req, res,next) {
    if (!req.body.location){
        http.sendData(res, eCode.ParamerError, '参数错误', null);
        return
    }
    let reqData = req.body;
    rpc.call(function(remote){
        remote.fethNewMsg(reqData.IMEI, reqData.location, function(data){
            if (!data){
                http.sendData(res, eCode.UnkownError, '操作失败', null);
            }else{
                http.sendData(res, eCode.Success, '操作成功', data);

            }

        });
    })

}





