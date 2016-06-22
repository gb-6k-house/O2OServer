/**
 * Created by niupark on 16/1/6.
 */
//var db = require('././dbConfige');
var mysql = require('mysql');
//var pool = mysql.createPool({
//    host: db.db,
//    user: db.user,
//    password: db.password,
//    database: db.database,
//    port: db.dbport
//});
//
//
//
//exports.query=function(sql,callback){
//    pool.getConnection(function(err,conn){
//        if(err){
//            callback(err,null,null);
//        }else{
//            process.logger.info(sql);
//            conn.query(sql,function(qerr,vals,fields){
//                //释放连接
//                conn.release();
//                //事件驱动回调
//                if(qerr){
//                    process.logger.error(qerr.stack);
//                }
//                callback(qerr,vals,fields);
//            });
//        }
//    });
//};

module.exports = function(confige){
    var pool = mysql.createPool({
        host: confige.db,
        user: confige.user,
        password: confige.password,
        database: confige.database,
        port: confige.dbport
    });
    function querySql(sql,callback){
        pool.getConnection(function(err,conn){
            if(err){
                callback(err,null,null);
            }else{
                console.log(sql);
                conn.query(sql,function(qerr,vals,fields){
                    //释放连接
                    conn.release();
                    //事件驱动回调
                    if(qerr){
                        process.logger.error(qerr.stack);
                    }
                    callback(qerr,vals,fields);
                });
            }
        });
    };
    return {
        query:querySql
    }
}
