/**
 * Created by niupark on 16/3/3.
 */
var DNode = require('dnode');
var confige = require('../configes/confige');

exports.call = function(f){
    DNode.connect(confige.rpchost.port, function(remote) {
        f(remote);
    });
}
