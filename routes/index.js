var express = require('express');
var router = express.Router();
var dao = require('../lib/dao');

// init logic
dao.init(function(size) {
  console.log(new Date().toString(), 'init finish. data size is ' + size);
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', function(err, html){
    console.log(new Date().toString(), '@@@ request / err!' + err);
  });
});

router.get('/exts/getByPage', function(req, res) {
  if (!req.query.offset || !req.query.count) {
    res.status(400).end();
  }
  var offset = parseInt(req.query.offset);
  var count = parseInt(req.query.count);
  dao.getExtByPage(offset, count, function(data) {
    var result = {};
    if(!data) {
      result.count = -1;// no more data
    } else {
      result.count = data.length;
      result.exts = data;
      console.log(new Date().toString(), '@@@ getByPage!offset=' + offset + ',count=' + count + ',return=' + data.length);
    }
    res.status(200).json(result);
  });
});

module.exports = router;
