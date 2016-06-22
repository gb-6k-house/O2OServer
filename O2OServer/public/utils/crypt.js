var crypto = require('crypto');
var moment =require('moment');
//已时间戳+固定字符串生产秘钥
exports.keyStr= function(){
    var strDate = moment().utcOffset(8).format('YYYYMMDD');
    return this.encryptDes('Ttc#pjl0Kstg%C',strDate+strDate+strDate);
}

exports.sha1 = function(str){
    var sha1sum = crypto.createHash('sha1');
    sha1sum.update(str);
    str = sha1sum.digest('hex');
    //var str = sha1sum.update(str,'utf8','hex');
    //str += sha1sum.final('hex');
    return str;
}

exports.md5 = function(str){
	var md5sum = crypto.createHash('md5');
		md5sum.update(str);
		str = md5sum.digest('hex');
	return str;
}

exports.encryptAes = function(str,secret){
   var cipher = crypto.createCipher('aes192', secret);
   var enc = cipher.update(str,'utf8','hex');
   enc += cipher.final('hex');
   return enc;
}

exports.decryptAes = function(str,secret){
   var decipher = crypto.createDecipher('aes192', secret);
   var dec = decipher.update(str,'hex','utf8');
   dec += decipher.final('utf8');
   return dec;
}

exports.encryptDes = function(str,secret){
    var cipher = crypto.createCipheriv('des3', secret, '01234567');
    var enc = cipher.update(str,'utf8','base64');
    enc += cipher.final('base64');
    return enc;
}

exports.decryptDes = function(str,secret){
    var decipher = crypto.createDecipheriv('des3', secret, '01234567');
    var dec = decipher.update(str,'base64','utf8');
    dec += decipher.final('utf8');
    return dec;
}

