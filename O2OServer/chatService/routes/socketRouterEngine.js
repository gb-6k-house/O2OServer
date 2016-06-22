/**
 * Created by niupark on 16/2/24.
 */

function parser (){
    var filters =[];
    function router(socket){
        for (var i = 0;  i < filters.length; i++){
            var filter = filters[i];
            socket.on(filter.adress, filter.callback);
        };
    }
    function on(event,callback){
        var filter = {};
        filter.adress = event;
        filter.callback = callback;
        filters.push(filter);
    }
    return{
        router:router,
        on:on
    }
}

var router = new parser();
module.exports = router;