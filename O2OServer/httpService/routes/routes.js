/**
 * Created by niupark on 16/1/6.
 */
var home = require('../http-controllers/homeHttp');
var user = require('../http-controllers/userHttp');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/homjoinUS',home.joinUS);
router.post('/home/getNewMsg',home.getNewMsg);
//express().use('/home/getNewMsg',home.getNewMsg);
router.post('/home/sendNewMsg',home.sendNewMsg);
router.post('/user/getAllUser',user.getAllUser);
module.exports = router;
