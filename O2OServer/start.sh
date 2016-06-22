#停止所有服务
pm2 stop all
#启动RPC服务
pm2 start ./rpcService/bin/RpcStartBoot -i max
#启动Http服务
pm2 start ./httpService/bin/HttpStartBoot -i max

#启动Home Web服务
pm2 start ./HomeWebService/bin/www -i 1
pm2 list
