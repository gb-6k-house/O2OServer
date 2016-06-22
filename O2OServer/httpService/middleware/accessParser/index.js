/**
 * Created by niupark on 16/4/15.
 */
'use strict'


function doParserAccess(authInterface) {
    if (!authInterface){
        //需要指定登录接口, 登录接口是特殊接口,无sesstion信息
        throw new Error('no auth interface appoint');
    }

    // create the appropriate type checking function
    //var shouldParse = typeof type !== 'function'
    //    ? typeChecker(type)
    //    : type

    function parse(req,body) {
        if (body.length === 0) {
            // special-case empty json body, as it's a common client-side mistake
            // TODO: maybe make this configurable or part of "strict" option
            return {}
        }

        var encrypt = req.header('encrypt');

        if (encrypt && encrypt == 1){
            body = decryptDes(body, keyStr());
        }
        //check if valide json
        if (strict) {
            var first = firstchar(body)

            if (first !== '{' && first !== '[') {
                debug('strict violation')
                throw new Error('invalid json')
            }
        }
        console.log(req.url + ':请求数据体:\n' + body);
        debug('parse json');
        return JSON.parse(body);
    }

    return function accessParser(req, res, next) {
         if (req.url === authInterface){
             //登录, 返回accessToken
         }else{
             let token = req.header('Access-Token');
             if(!token){
                 let obj ={};
                 obj.code = 1001; //用户权限错误
                 obj.msg = '非法用户';
                 response.set('Content-Type','application/json')
                 response.send(obj);
             }else{

             }
         }
    }
}
module.exports = doParserAccess;