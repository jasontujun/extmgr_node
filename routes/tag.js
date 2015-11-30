var express = require('express');
var router = express.Router();
var dao = require('../lib/dao');


router.get('/getAll', function(req, res) {
    var withRaw = req.query.withRaw;
    dao.getAllTag(function(data) {
        console.log(new Date().toString(), '@@@ /tag/getAll!withRaw=' + withRaw + ',return=' + data);
        var result = withRaw ? {tags:data, raw:dao.getRawSize()} : {tags:data};
        res.status(200).json(result);
    })
});

router.post('/add', function(req, res) {
    var tag = req.body.tag;
    if (!tag) {
        res.status(400).end();
        return;
    }
    dao.addTag(tag, function(result) {
        console.log(new Date().toString(), '@@@ /tag/add!tag=' + tag + ',return=' + result);
        res.status(200).json({result:result});
    })
});

router.post('/remove', function(req, res) {
    var tag = req.body.tag;
    if (!tag) {
        res.status(400).end();
        return;
    }
    dao.removeTag(tag, function(result) {
        console.log(new Date().toString(), '@@@ /tag/remove!tag=' + tag + ',return=' + result);
        res.status(200).json({result:result});
    })
});

module.exports = router;