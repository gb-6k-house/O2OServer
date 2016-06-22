//弹窗口
var $popwindow;
//活动代码
var actCode = 'ac_lantern_festival_2016';

$(function () {
    window.ua = detectUA();
    function detectUA() {
        var u = navigator.userAgent;
        return {
            weixin: u.match(/MicroMessenger/i) || window.WeixinJSBridge != undefined
        };
    }


    var readyu = false;

    //微信分享
    $(".weixin").click(function () {
        if (readyu) {
            shareToClient(0);
        } else {
            alert('请稍后')
        }
        return false;
    });
    //获取门禁
    $("#checkPassport").click(function () {

        if (readyu) {
            access();
        } else {
            alert('请稍后')
        }


        return false;
    });

    var signature;
    var timstap;
    var appid;
    var randomStr;
    var data = {"url": location.href};
    var urladdress = getServiceUrl() + '/api-weixin/jsReady';
    $.ajax({
        type: "POST",
        url: urladdress,
        contentType: "text/plain;charset=UTF-8",
        data: JSON.stringify(data),
        success: function (obj) {
            if (obj.code == 0) {
                appid = obj.data.appId;
                timstap = obj.data.timestamp;
                randomStr = obj.data.nonceStr;
                signature = obj.data.signature;
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: appid, // 必填，公众号的唯一标识
                    timestamp: timstap, // 必填，生成签名的时间戳
                    nonceStr: randomStr, // 必填，生成签名的随机串
                    signature: signature,// 必填，签名，见附录1
                    jsApiList: ['onMenuShareAppMessage', 'scanQRCode'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                wx.ready(function () {
                    readyu = true;
                    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
                });
                wx.error(function (res) {
                    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。

                });
            }

        }

    })


});

function shareMessage(shareData) {
    wx.onMenuShareAppMessage({
        title: shareData.title, // 分享标题
        desc: shareData.desc, // 分享描述
        link: shareData.link, // 分享链接
        imgUrl: shareData.imgUrl, // 分享图标
        success: function () {
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        },
        fail: function (e) {

        }
    })
}


function shareToClient(type) {

}


function access() {
  wx.scanQRCode({
        needResult: 1,  //默认为0，扫描结果由微信处理，1则直接返回扫描结果，           
        scanType: ["qrCode", "barCode"],  //可以指定扫二维码还是一维码，默认二者都有               
        success: function (res) {
            var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
             var data = {passport: result};
            var urladdress =  getServiceUrl() + '/api-neighborhood/vertifyPassport'
            $.ajax({
                type: "POST",
                url: urladdress,
                contentType: "text/plain;charset=UTF-8",
                data: JSON.stringify(data),
                success: function (obj) {
                    if (obj.code == 0) {
                        alert('验证成功');
                        var city = obj.data.province+obj.data.city;
                        var obj = {
							city: encodeURIComponent(city),
							hostName: encodeURIComponent(obj.data.hostName),
                            createDate:encodeURIComponent(obj.data.date),
							hostHeadUrl:obj.data.hostHeadUrl
						}
                         window.location.href="sweep.html?"+$.param(obj);
                    } else {
                        alert('通行证无效');
                        
                    }
                },
                error:function(e){
                    alert('操作失败,稍后再试');
                }

            })

        }
    });
}




function getServiceUrl(){
    //return 'http://192.168.0.192:3000';
    return 'http://www.uscreen.online:3000';

}

