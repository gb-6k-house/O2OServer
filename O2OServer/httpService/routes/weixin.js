/**
 * Created by niupark on 16/3/18.
 */

var express = require('express');
var router = express.Router();
var weixin = require('../http-controllers/weixinHttp');

//router.get('/createMenue',weixin.createMenu);
//router.get('/deleteMenue',weixin.deleteMenue);
router.post('/jsReady', weixin.jsReady);
router.post('/pageAuthorize', weixin.pageAuthorize);
module.exports = router;