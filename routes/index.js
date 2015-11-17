var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  console.log(new Date().toString(), '@@@ /!return...');
  //res.render('pages/tagged', {user: 'Leung'});

  res.redirect('index.html')
});

/* GET tagged-extension page. */
router.get('/tagged', function(req, res) {
  res.json();
  res.render('pages/tagged', {user: 'Leung'});
});

///* GET raw-extension page. */
//router.get('/raw', function(req, res) {
//  res.render('pages/raw', {user: 'Leung'});
//});
//
///* GET market page. */
//router.get('/market', function(req, res) {
//  res.render('pages/market', {user: 'Leung', url:''});
//});


module.exports = router;
