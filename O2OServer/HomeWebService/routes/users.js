var express = require('express');
var router = express.Router();
var passportHttp = require('../controllers/passportHttp');

router.get('/index.html', function(req, res, next) {
  res.render('index.html', {});
});
router.get('/dimension.html', function(req, res, next) {
  res.render('dimension.html', {});
});

router.get('/sweep.html', function(req, res, next) {
  res.render('sweep.html', {});
});

router.all('/accessSysHome.html', function(req, res, next) {
  res.render('accessSysHome.html', {});
});

router.all('/accessControl.html', passportHttp.passportManager);
//
router.all('/reveal.html',  function(req, res, next) {
  res.render('reveal.html', {});
});


router.all('/jssdk', function(req, res, next) {
  res.render('jssdk-main', {});
});




module.exports = router;
