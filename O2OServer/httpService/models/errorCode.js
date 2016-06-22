/**
 * Created by niupark on 16/1/11.
 */
//系统错误
exports.Success = 0;
exports.ParamerError = 2001;
exports.UnkownError = 2002;
//业务错误码
exports.NotEnterpriseUser = 50001; //当前用户不是企业号用户
exports.PassPortCheckFailed = 50002; //通行证校验失败
exports.AccessPageInvalid = 50003; //授权页面已经失效,需要重新请求

