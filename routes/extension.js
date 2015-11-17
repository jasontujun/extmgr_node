var express = require('express');
var router = express.Router();
var dao = require('../lib/dao');

// init logic
dao.init(function(size) {
  console.log(new Date().toString(), 'init finish. data size is ' + size);
});

router.get('/getAllTag', function(req, res) {
  dao.getAllTag(function(data) {
    console.log(new Date().toString(), '@@@ getAllTag!return=' + data);
    res.status(200).json(data);
  })
});

router.get('/tagged/getAllByPage', function(req, res) {
  if (!req.query.offset || !req.query.count) {
    res.status(400).end();
  }
  var offset = parseInt(req.query.offset);
  var count = parseInt(req.query.count);
  var tag = req.query.tag;
  dao.getExtByPage(tag, offset, count, function(data) {
    var result = {};
    if(!data) {
      result.count = -1;// no more data
    } else {
      result.count = data.length;
      result.exts = data;
      console.log(new Date().toString(), '@@@ /tagged/getAllByPage!offset=' + offset +
      ',count=' + count + ',tag=' + tag + ',return=' + data.length);
    }
    res.status(200).json(result);
  });
});


router.get('/raw/getAllByPage', function(req, res) {
  if (!req.query.offset || !req.query.count) {
    res.status(400).end();
  }
  var offset = parseInt(req.query.offset);
  var count = parseInt(req.query.count);
  dao.getExtByPage(null, offset, count, function(data) {
    var result = {};
    if(!data) {
      result.count = -1;// no more data
    } else {
      result.count = data.length;
      result.exts = data;
      console.log(new Date().toString(), '@@@ /tagged/getAllByPage!offset=' + offset + ',count=' + count + ',return=' + data.length);
    }
    res.status(200).json(result);
  });
});

module.exports = router;
