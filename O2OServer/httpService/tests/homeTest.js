/**
 * Created by niupark on 16/1/8.
 */
//require('util').inherits(home,require('./baseTest').base);
    require('should');
var test = require('./baseTest');
function home(){
}
home.prototype = new test(); //建立原型链

var homeTest = new home();

homeTest.joinUs=function(){
    homeTest.POST('/home/joinUS', {location:{longitude:0.0, latitude:0.0}, IMEI:'868942028136517'});
}
homeTest.getNewMsg=function(){
    homeTest.POST('/home/getNewMsg', {location:{longitude:112.977636, latitude:28.202683}, IMEI:'868942028136517'});
};
homeTest.sendNewMsg=function(){
    homeTest.POST('/home/sendNewMsg', {location:{longitude:112.977636, latitude:28.202683}, IMEI:'868942028136517', MSG:'hello world 2016 2'});
};

//homeTest.joinUs();
//homeTest.sendNewMsg();
homeTest.POST('/api-usreen/user/getAllUser', {IMEI:'865790025955667'});

//homeTest.POST('/api-weixin/jsReady', {url:'www.baidu.com'});

//homeTest.POST('/api-neighborhood/getPassport', {code:'865790025955667'});
var moment = require('moment');

var data = moment('2016-03-25 14:32:10', 'YYYY-MM-DD HH:mm:ss');

var duration = moment().diff(data);

