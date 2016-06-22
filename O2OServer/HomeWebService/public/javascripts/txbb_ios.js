/*网页与ios通讯接口*/

//设备底层api
var iosDevice = {
	dialTelephone:function(mobile){
		try{
			TXBB_IOS_SDK.dialTelephone(mobile);
		}catch(e){
			window.location.href = "/dialTelephone:"+mobile;
		}
	}
}

//应用层api
var iosApp = {
    getAuth:function(callback){
    	try{
    		TXBB_IOS_SDK.getAuth(callback);
		}catch(e){
			window.location.href = "/getAuth";
		}
    },
	share:function(title, content, url, type){
		try{
			TXBB_IOS_SDK.openWeiXingShare(title, content, url, type);
		}catch(e){
			window.location.href = "/share+"+type+"+"+title+"+"+content+"+"+url;
		}		
	},
	copy:function(content, callback){
    	try{
    		TXBB_IOS_SDK.copyPasteboard(content);
		}catch(e){
			window.location.href = "/copy+"+content;
		}		
	},
	openImgs:function(urls){
		try{
    		TXBB_IOS_SDK.openImgs(urls);
		}catch(e){
			window.location.href = "/openImgs+"+urls;
		}
	},
	moonRevenue:function(){
		try{
    		TXBB_IOS_SDK.moonRevenue();
		}catch(e){
			window.location.href = "/moonRevenue";
		}
	}
}

//ios call js
var JSBridge = {
	hasData:false,
	args:null,
	setData:function(json){
		this.hasData = true;
		this.args = JSON.parse(json);
		initData();
	},
	getParam:function(key){
		var value = this.args[key];
		if(value!=undefined){
			return value;
		}else{
			return null;
		}
	},
	toString:function(){
		return JSON.stringify(this.args);
	}
}
