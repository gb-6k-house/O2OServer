
'use strict'

/**
 * Module dependencies.
 * @private
 */

var bytes = require('bytes')
var contentType = require('content-type')
var createError = require('http-errors')
var debug = require('debug')('body-parser:json')
var read = require('./lib/read')
var typeis = require('type-is')
var crypto = require('crypto');
var moment =require('moment');
//已时间戳+固定字符串生产秘钥
function keyStr(){
    var strDate = moment().utcOffset(8).format('YYYYMMDD');
    return encryptDes('Ttc#pjl0Kstg%C',strDate+strDate+strDate);
}

function encryptDes(str,secret){
    var cipher = crypto.createCipheriv('des3', secret, '01234567');
    var enc = cipher.update(str,'utf8','base64');
    enc += cipher.final('base64');
    return enc;
}

function decryptDes(str,secret){
    var decipher = crypto.createDecipheriv('des3', secret, '01234567');
    var dec = decipher.update(str,'base64','utf8');
    dec += decipher.final('utf8');
    return dec;
}
/**
 * Module exports.
 */

module.exports = doParserBody

/**
 * RegExp to match the first non-space in a string.
 *
 * Allowed whitespace is defined in RFC 7159:
 *
 *    ws = *(
 *            %x20 /              ; Space
 *            %x09 /              ; Horizontal tab
 *            %x0A /              ; Line feed or New line
 *            %x0D )              ; Carriage return
 */

var firstcharRegExp = /^[\x20\x09\x0a\x0d]*(.)/

/**
 * Create a middleware to parse JSON bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */

function doParserBody(options) {
    var opts = options || {}

    var limit = typeof opts.limit !== 'number'
        ? bytes.parse(opts.limit || '100kb')
        : opts.limit
    var inflate = opts.inflate !== false
    var reviver = opts.reviver
    var strict = opts.strict !== false
    //var type = opts.type || 'application/json'
    var verify = opts.verify || false

    if (verify !== false && typeof verify !== 'function') {
        throw new TypeError('option verify must be function')
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

    return function jsonParser(req, res, next) {
        if (req._body) {
            return debug('body already parsed'), next()
        }

        req.body = req.body || {}

        // skip requests without bodies
        if (!typeis.hasBody(req)) {
            return debug('skip empty body'), next()
        }

        debug('content-type %j', req.headers['content-type'])

        // determine if request should be parsed
        //if (!shouldParse(req)) {
        //    return debug('skip parsing'), next()
        //}

        // assert charset per RFC 7159 sec 8.1
        var charset = getCharset(req) || 'utf-8'
        if (charset.substr(0, 4) !== 'utf-') {
            debug('invalid charset')
            next(createError(415, 'unsupported charset "' + charset.toUpperCase() + '"', {
                charset: charset
            }))
            return
        }

        // read
        read(req, res, next, parse, debug, {
            encoding: charset,
            inflate: inflate,
            limit: limit,
            verify: verify
        })
    }
}

/**
 * Get the first non-whitespace character in a string.
 *
 * @param {string} str
 * @return {function}
 * @api public
 */


function firstchar(str) {
    var match = firstcharRegExp.exec(str)
    return match ? match[1] : ''
}

/**
 * Get the charset of a request.
 *
 * @param {object} req
 * @api private
 */

function getCharset(req) {
    try {
        return contentType.parse(req).parameters.charset.toLowerCase()
    } catch (e) {
        return undefined
    }
}

/**
 * Get the simple type checker.
 *
 * @param {string} type
 * @return {function}
 */

function typeChecker(type) {
    return function checkType(req) {
        return Boolean(typeis(req, type))
    }
}
