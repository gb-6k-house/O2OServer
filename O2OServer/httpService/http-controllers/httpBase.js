/**
 * Created by niupark on 16/1/11.
 */
/*封装发送的数据包*/

'use strict';

const logger = process.logger;

function  httpBase(){};

httpBase.prototype.sendData= function (response, errcode ,msg ,data){
    let obj ={};
    obj.code = errcode;
    obj.msg = msg;
    if(data){
        obj.data = data;
    }
    logger.info(response.req.url + ' 返回数据包:' + JSON.stringify(obj));
   //解决a跨越问题
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    response.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    response.header("X-Powered-By",' 3.2.1')
    response.set('Content-Type','application/json')
    response.send(obj);
}


exports.http = new httpBase();
