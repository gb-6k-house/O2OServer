var express = require('express');
var router = express.Router();
var acessSysHttp = require('../http-controllers/acessSysHttp')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.all('/getPassport', acessSysHttp.getPassport);
router.post('/vertifyPassport', acessSysHttp.vertifyPassport);

module.exports = router;
