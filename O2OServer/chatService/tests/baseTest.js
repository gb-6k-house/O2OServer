/**
 * Created by niupark on 16/3/3.
 */
var confige = require('./../configes/confige');
var io = require('socket.io-client');

var socket =  io.connect('http://127.0.0.1:'+confige.port);
function Base(){

};

Base.prototype.on = function(event,callback){
  socket.on(event, callback);
}
Base.prototype.emit= function(event, data){
    socket.emit(event,data);
}

module.exports = Base;
