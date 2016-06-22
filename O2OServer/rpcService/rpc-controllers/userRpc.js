/**
 * Created by niupark on 16/3/2.
 */
/*
 *获取全网注册用户
 *
 */
'use strict';
const moment = require('moment');
const logger = process.logger;
const memDB = process.memDB;
const confige = require('../configes/confige');
function getAllUser(user, callback) {
    memDB.get("all_user_list", function (e, v) {
        let data = {};
        if (v){
            let list = JSON.parse(v);
            //登录用户排在前面
            list.sort(function(a,b){
                if (a.IMEI == user){
                    return -1;
                }else if (b.IMEI == user){
                    return 1;
                }else if(a.login > b.login ){
                    return -1;
                }else if(a.login < b.login){
                    return 1;
                }else{
                    return 0;
                }

            });

            //获取用户说的最后一句话

            data.list = list;
            data.length = list.length;
            callback(data,e);
        }else {
            data.list = [];
            data.length = 0;
            callback(data, e);
        }
    });

}
/*
 *保存用户,user 目前为json对象
 * {
 * IMEI:
 * login:0
 * name:
 * }
 *
 */
function saveUser(user, callback) {
    let newUser = {IMEI: user.IMEI,
        name:user.IMEI
    };
    function updateForUser(updateUser){
        updateUser.date=moment().format('YYYY-MM-DD hh:mm:ss')
        if(user.login){
            updateUser.login = user.login;
        }
        if(user.location){
            updateUser.latitude = user.location.latitude;
        }
        if(user.location){
            updateUser.longitude = user.location.longitude;
        }
        if(user.name){
            updateUser.name = user.name;
        }
        if(user.platform){
            updateUser.platform = user.platform;
        }
        if(user.pushToken){
            updateUser.pushToken = user.pushToken;
        }
    }
    updateForUser(newUser);
    forUser(user.IMEI, function(list, index){
        if(index >=0){
            updateForUser(list[index]);
        }else{
            list.push(newUser);
        }
        logger.info(list);
        //保存用户
        memDB.set("all_user_list",JSON.stringify(list), function(e){
            if (e){
                logger.error(user.IMEI + '用户信息保存失败' + JSON.stringify(e));
            }else{
                logger.info(user.IMEI + '用户信息保存成功');
            }
            typeof callback === 'function' && callback(newUser, e);
        });

    });


}


/*
 * 查找用户,执行action操作
 * */
function forUser(imei,action){
    memDB.get("all_user_list", function (e, v) {
        let list= [];
        let index= -1;
        if (v) {
            list = JSON.parse(v);
            for (let i = 0; i < list.length; i++){
                if (list[i].IMEI == imei){
                    index = i;
                    break;
                }
            }
        }
        typeof action === 'function' && action(list, index);

    });
}


function Rad(d){
    return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
}
//计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
function GetDistance(lat1,lng1,lat2,lng2){

    let radLat1 = Rad(lat1);
    let radLat2 = Rad(lat2);
    let a = radLat1 - radLat2;
    let  b = Rad(lng1) - Rad(lng2);
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
            Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s *6378.137 ;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000; //输出为公里
    //s=s.toFixed(4);
    return s;
}


/*
 *根据地理位置,获取朋友圈用户,包括自己
 * @param  {object}  location地址信息
 * @return {}
 */
function  getCircleFriend(user, callback){
    memDB.get("all_user_list", function (e, v) {
        let list = [];
        let userlist = [];
        let newUser;
        if (v && user.location) {
            let location = user.location;
            list = JSON.parse(v);
            for (let i = 0; i < list.length; i++){
                if (list[i].latitude
                    &&list[i].longitude){
                    let distance = GetDistance(list[i].latitude,list[i].longitude,location.latitude, location.longitude) *1000;
                    logger.info('计算用户的距离:' + distance);
                    if (distance <= confige.friendsCircle){
                        userlist.push(list[i]);
                    }
                }

            }
        }
        typeof callback === 'function' && callback(userlist);

    });

}

exports.forUser = forUser;
exports.saveUser = saveUser;
exports.getAllUser = getAllUser;
exports.getCircleFriend = getCircleFriend;