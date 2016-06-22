/**
 * Created by niupark on 16/2/24.
 */
exports.debug = true;
exports.port = 3001;
exports.session_secret = 'scott todo session secret';
exports.root=__dirname;
exports.redis={'port':6379, 'ip':'127.0.0.1'};
//rpc 服务地址
exports.rpchost={'port':6002, 'ip':'127.0.0.1'};