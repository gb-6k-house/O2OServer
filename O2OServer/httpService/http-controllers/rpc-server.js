/**
 * Created by niupark on 16/2/19.
 */
'use strict';

const DNode = require('dnode');
const confige = require('../configes/confige');
const logger = process.logger;

exports.call = function (f) {
    try {
        DNode.connect(confige.rpchost.port, function (remote) {
            f(remote);
        });
    } catch (e) {
        logger.error(e);
    }

}

exports.callWX = function (f) {
    try {

        DNode.connect(confige.wxrpchost.port, function (remote) {
            f(remote);
        });
    } catch (e) {
        logger.error(e);
    }
}
