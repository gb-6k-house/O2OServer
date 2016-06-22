/**
 * Created by niupark on 16/1/6.
 */
'use strict';
var db = require('../../public/utils/mysqlUtils')(require('../configes/dbConfige'));
var dateformat = require('../../public/utils/dateFormat');
var moment = require('moment');
var eCode = require('../models/errorCode');
var logger = process.logger;
var memDB = process.memDB;
var redis = require('redis');
var confige = require('../configes/confige');
var pushNotify = redis.createClient(confige.redis.port, confige.redis.ip);
//var pushNotify = process.pushNotify; 为什么使用process.pushNotify收不到通知呢

var mt =require('../models/messageType');

var userRpc = require('./userRpc')
/*
 登录接口
 */
exports.joinUS = function(imei, callback){
    /*判断用户是否存在,存在则更新登录时间*/
    db.query('select IMEI from t_user where IMEI=\''+imei +'\'',function(qerr,vals,fields){
        if(vals.length > 0){
            db.query(['update t_user set loginDate =',
                      "'",
                     dateformat.format(new Date, 'yyyy-MM-dd hh:mm:ss'),
                     "'"].join(''), function(qerr,vals,fields) {
                    if (qerr){
                        callback(qerr,null);
                    }
                }
            );
        }else{

            var sql = ['insert into t_user values(',
                       reqData.location.longitude,
                       ',',
                       reqData.location.latitude,
                       ',\'',
                         reqData.IMEI,
                        '\',\'',
                        dateformat.format(new Date, 'yyyy-MM-dd hh:mm:ss'),
                        '\')'].join('');
            db.query(sql, function(qerr,vals,fields){
                if (qerr){
                    callback(qerr,null);
                }
            });
        }
    });
    //返回匿名
    db.query('select *from t_anonymous', function(qerr,vals,fields){
        if (qerr || !vals){
            callback(qerr, null);
        }else{
            var resData ={};
            resData.name = vals[1].name;
            callback(null,resData);
        }

    });
}


exports.saveNewMsg = function(imei, location, data ,callback){
    var sql = ["insert into t_localation_msg values('",
        imei,
        "','",
        data,
        "','",
        dateformat.format(new Date, 'yyyy-MM-dd hh:mm:ss'),
        "',",
        location.longitude,
        ',',
        location.latitude,
        ")"
    ].join('');
    db.query(sql, function(qerr,vals,fields){
        if (qerr){
            var err = {code:eCode.UnkownError,msg:"数据库操作失败"};
            callback(err)
        }else{
            callback(null);
        }
        //保存用户最新说的话,作为用户的名字,用于前端显示

        userRpc.saveUser({IMEI:imei, name:data});

        //将消息推送给朋友圈的用户
        pushNotify.publish(mt.NTUserPublishMsg, JSON.stringify({IMEI:imei, location:location, msg:data}), function(e){});
    });
}


/*
获取朋友圈,最新20条数据
  消息列表
 */
exports.fethNewMsg= function(imei, location, callback){
    var sql = ['select b.* from (select a.*, GetDistance(a.latitude, a.longitude,',
        location.latitude,
        ",",
        location.longitude,
        ') as distance from t_localation_msg a ) b where b.distance<=',
        confige.friendsCircle, ' ORDER BY distance, date DESC LIMIT 20' ].join('');
    db.query(sql,function(qerr,vals,fields) {
        if (qerr) {
            callback(null);
        } else {
            let data = {};
            data.list = new Array();
            data.length = vals.length;
            // for (let elem of vals.values()) {
            //     data.list[i] = {};
            //     //data.list[i].IMEI = vals[i].IMEI;
            //     data.list[i].distance = elem.distance;
            //     data.list[i].MSG = elem.msg;
            //     data.list[i].IMEI = elem.IMEI;
            //     data.list[i].date = elem.date;
            //     //消息发送距离现在时常ms
            //     var duration = moment.duration(moment().diff(moment(elem.date, 'YYYY-MM-DD HH:mm:ss')));
            //     data.list[i].duration = {};
            //     data.list[i].duration.minutes = duration.asMinutes();
            //     data.list[i].duration.hours = duration.asHours();
            //     data.list[i].duration.days = duration.asDays();
            //     data.list[i].duration.months = duration.asMonths();
            //     data.list[i].location = {latitude: 0, longitude: 0};
            //     data.list[i].location.latitude = elem.latitude;
            //     data.list[i].location.longitude = elem.longitude;
            // }
            for (let i = 0; i < vals.length; i++) {
                data.list[i] = {};
                //data.list[i].IMEI = vals[i].IMEI;
                data.list[i].distance = vals[i].distance;
                data.list[i].MSG = vals[i].msg;
                data.list[i].IMEI = vals[i].IMEI;
                data.list[i].date = vals[i].date;
                //消息发送距离现在时常ms
                let duration = moment.duration(moment().diff(moment(vals[i].date, 'YYYY-MM-DD HH:mm:ss')));
                data.list[i].duration = {};
                data.list[i].duration.minutes = duration.asMinutes();
                data.list[i].duration.hours = duration.asHours();
                data.list[i].duration.days = duration.asDays();
                data.list[i].duration.months = duration.asMonths();
                data.list[i].location = {latitude: 0, longitude: 0};
                data.list[i].location.latitude = vals[i].latitude;
                data.list[i].location.longitude = vals[i].longitude;
            }
            callback(data);
        }
    });
}




