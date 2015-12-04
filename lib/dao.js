/**
 * Created by jason on 2015/11/9.
 */

/**
 * Extension = {
    "cat": "ext/7-productivity", // 类别
    "catName": "生产工具", // 类别中文名
    "screenshot": [ // 截图
        "https://lh3.googleusercontent.com/_AHNgTOR3QM5xhdyoVHXiYmxIkLG7W1DIEFgxCqNF3sBi_hQt54qZ_Myr-k_QGtBW8FRdIEn=s120-h90-e365",
        "https://lh3.googleusercontent.com/_AHNgTOR3QM5xhdyoVHXiYmxIkLG7W1DIEFgxCqNF3sBi_hQt54qZ_Myr-k_QGtBW8FRdIEn=s460-h340-e365",
        "https://lh6.googleusercontent.com/iumLanWymK3_yV8Wna016o9L1NnjAYRIoYp2YSearFo_Cl1TSL4nMyJDkwKQTKPhwUSPRITWpC4=s120-h90-e365",
        "https://lh4.googleusercontent.com/U6AFWDBSmYIiVrTiNeNNeQQyKZ7fLqSzL_dqi--G1wEryJJkdJdqJCfs69qb6F0YaopiEvOWdA=s120-h90-e365",
        "https://lh6.googleusercontent.com/iumLanWymK3_yV8Wna016o9L1NnjAYRIoYp2YSearFo_Cl1TSL4nMyJDkwKQTKPhwUSPRITWpC4=s460-h340-e365",
        "https://lh4.googleusercontent.com/glkSOuwhY0G6QO6RECEDc6nGdD35Ldh2gIIsujKA6Fg_SgyZMW7DG2iMByABQrakQi42L6MwgFA=s120-h90-e365",
        "https://lh4.googleusercontent.com/glkSOuwhY0G6QO6RECEDc6nGdD35Ldh2gIIsujKA6Fg_SgyZMW7DG2iMByABQrakQi42L6MwgFA=s460-h340-e365",
        "https://lh4.googleusercontent.com/U6AFWDBSmYIiVrTiNeNNeQQyKZ7fLqSzL_dqi--G1wEryJJkdJdqJCfs69qb6F0YaopiEvOWdA=s460-h340-e365"
    ],
    "url": "https://chrome.google.com/webstore/detail/...",// 详情url
    "id": "aaimfnihhldcboiodbjkklmflkdmabdm",
    "name": "搜狐随身看", // 名称
    "description": "永久收藏网页内容...", // 简介
    "author": "Sohu.com", // 作者
    "userNum": "714", // 用户数
    "price": "免费", // 价格
    "rate": 4.230769230769231, // 评分
    "commNum": 13, // 评论数
    "icon": "https://lh6.googleusercontent.com/hjsK65p6OgZR9OAKmOIOEs0xui_Vr1OVWFYFLZanm3-1pkUbI22PbXWPdqkcNLha-GgkrCw0Lw=s26-h26-e365",// 小图标
    "image": "https://lh6.googleusercontent.com/2QcThdHoan7lTAfudi8NXOdRRF_-oIq1LbRsgTtfhmSMOXPUrG9nkOjdJr6wbqqy9t4ljtQi=s220-h140-e365"// 列表图片
    // ======= self-define ======= //
    "tag": ['tag1', 'tag2', .....]
 * }
 */

var config = require('../config.json'),
    loader = require('./loader');

var allExtArray = [];// 所有extension的排序集合(有tag和无tag)
var allExtMap = {};// 所有extension的以id为索引的集合
var tagExtMap = {};// 按tag分类的extension
var rawExtArray = []; // 没有tag的extension
var tagArray = [];// tag的有序集合
var tagSizeMap = {};// 包含该tag的extension数量的集合

exports.init = function(callback) {
    loader.loadFromFile(config.dir, true,
        {
            allExtArray : allExtArray,
            allExtMap : allExtMap,
            tagExtMap : tagExtMap,
            rawExtArray : rawExtArray,
            tagArray : tagArray,
            tagSizeMap : tagSizeMap
        }, function (result) {
            callback(result ? allExtArray.length : 0);
        });

    //require('./faker').load({
    //    allExtArray : allExtArray,
    //    allExtMap : allExtMap,
    //    tagExtMap : tagExtMap,
    //    rawExtArray : rawExtArray,
    //    tagArray : tagArray,
    //    tagSizeMap : tagSizeMap
    //});
    //callback(allExtArray.length)
};

exports.getAllExtByPage = function(startIndex, count, callback) {
    if (startIndex >= allExtArray.length) {
        callback(null);
        return;
    }
    count = Math.min(allExtArray.length - startIndex, count);
    callback(allExtArray.slice(startIndex, startIndex + count));
};

exports.getTaggedExtByPage = function(tag, startIndex, count, callback) {
    if (!tagExtMap[tag]) {
        callback(null);
        return;
    }
    if (startIndex >= tagExtMap[tag].length) {
        callback(null);
        return;
    }
    count = Math.min(tagExtMap[tag].length - startIndex, count);
    callback(tagExtMap[tag].slice(startIndex, startIndex + count));
};

exports.getRawExtByPage = function(startIndex, count, callback) {
    if (startIndex >= rawExtArray.length) {
        callback(null);
        return;
    }
    count = Math.min(rawExtArray.length - startIndex, count);
    callback(rawExtArray.slice(startIndex, startIndex + count));
};

exports.getExtById = function(id, callback) {
    callback(allExtMap[id]);
};

exports.getExtByTag = function(tag, callback) {
    callback(allExtMap[id]);
};

exports.getRawSize = function() {
    return rawExtArray.length;
};

exports.getAllTag = function(callback) {
    callback(tagSizeMap);
};

exports.addTag = function(tag, callback) {
    if (tagSizeMap.hasOwnProperty(tag)) {// tag exist
        callback(false);
        return;
    }
    tagSizeMap[tag] = 0;
    tagArray.push(tag);
    callback(true);
};

exports.removeTag = function(tag, callback) {
    if (!tagSizeMap.hasOwnProperty(tag)) {// tag not exist
        callback(false);
        return;
    }
    var index1 = tagArray.indexOf(tag);
    if (index1 != -1) {
        tagArray.splice(index1, 1);
    }
    var exts = tagExtMap[tag];
    delete tagSizeMap[tag];
    delete tagExtMap[tag];
    if (exts) {
        for(var i = 0; i < exts.length; i++) {
            var ext = exts[i];
            if (ext.tag && ext.tag.length > 0) {
                var index2 = ext.tag.indexOf(tag);
                if (index2 != -1) {
                    ext.tag.splice(index2, 1);
                    // 这个extension已经没有tag了，归入rawExtArray
                    if (ext.tag.length == 0) {
                        rawExtArray.push(ext);
                    }
                }
            }
        }
    }
    callback(true);
};

exports.addTagForExt = function(tag, extId, callback) {
    var ext = allExtMap[extId];
    if (!ext) {// extension not exist
        callback(false);
        return;
    }
    if (!tagSizeMap.hasOwnProperty(tag)) {// tag not exist
        callback(false);
        return;
    }
    if (ext.tag && ext.tag.indexOf(tag) != -1) {// ext has the same tag
        callback(false);
        return;
    }
    ext.tag.push(tag);
    // 这个extension从无tag变成有tag，从rawExtArray删除
    if (ext.tag.length == 1) {
        var index = rawExtArray.indexOf(ext);
        if (index != -1) {
            rawExtArray.splice(index, 1);
        }
    }
    if (tagExtMap[tag]) {
        tagExtMap[tag].push(ext);
    } else {
        tagExtMap[tag] = [ext];
    }
    tagSizeMap[tag] = tagExtMap[tag].length;
    callback(true);
};

exports.removeTagForExt = function(tag, extId, callback) {
    var ext = allExtMap[extId];
    if (!ext) {// extension not exist
        callback(false);
        return;
    }
    if (!tagSizeMap.hasOwnProperty(tag)) {// tag not exist
        callback(false);
        return;
    }
    if (!ext.tag || ext.tag.indexOf(tag) == -1) {// ext doesn't has the tag
        callback(false);
        return;
    }

    var index1 = ext.tag.indexOf(tag);
    if (index1 != -1) {
        ext.tag.splice(index1, 1);
        // 这个extension已经没有tag了，归入rawExtArray
        if (ext.tag.length == 0) {
            rawExtArray.push(ext);
        }
    }
    if (tagExtMap[tag]) {
        var index2 = tagExtMap[tag].indexOf(ext);
        if (index2 != -1) {
            tagExtMap[tag].splice(index2, 1);
        }
        tagSizeMap[tag] = tagExtMap[tag].length;
    }
    callback(true);
};

exports.search = function(keyword, callback) {
    var result = [];
    for (var i = 0; i < allExtArray.length; i++) {
        if (allExtArray[i].name.indexOf(keyword) != -1) {
            result.push(allExtArray[i]);
        } else if(allExtArray[i].description.indexOf(keyword) != -1) {
            result.push(allExtArray[i]);
        } else if(allExtArray[i].id.indexOf(keyword) != -1) {
            result.push(allExtArray[i]);
        }
    }
    callback(result);
};