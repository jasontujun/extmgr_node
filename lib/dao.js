/**
 * Created by jason on 2015/11/9.
 */

var extArray = [];
var extMap = {};
var tagArray = ['开发者工具', '社交与通讯', '购物', '天气与新闻', '娱乐', '照片', '博客'];
var tagSizeMap = {};
var tagExtMap = {};
var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function getRandomId(length) {
    var str = '';
    for (var i = 0; i < length; i++) {
        str = str.concat(chars.charAt(getRandomNum(0, chars.length)))
    }
    return str;
}

function getRandomStr(length) {
    var str = '';
    for (var i = 0; i < length; i++) {
        str = str.concat(chars.charAt(getRandomNum(10, 26)))
    }
    return str;
}

function getRandomNum(offset, size) {
    return Math.floor(Math.random() * size) + offset;
}

exports.init = function(callback) {
    var size = 0;
    for (var i = 0; i<1000; i++) {
        var ext = {
            id : getRandomId(32),
            name : getRandomStr(10),
            size : getRandomNum(1, 1000),
            tag : [tagArray[getRandomNum(0, tagArray.length)]]
        };
        if (!extMap[ext.id]) {
            extArray.push(ext);
            extMap[ext.id] = ext;
            if (ext.tag) {
                for (var j = 0; j < ext.tag.length; j++) {
                    if (tagExtMap[ext.tag[j]]) {
                        tagExtMap[ext.tag[j]].push(ext);
                    } else {
                        tagExtMap[ext.tag[j]] = [ext];
                    }
                }
            }
            size++;
        }
    }
    for (var k = 0; k < tagArray.length; k++) {
        tagSizeMap[tagArray[k]] = tagExtMap[tagArray[k]] ? tagExtMap[tagArray[k]].length : 0;
    }
    callback(size)
};

exports.getExtByPage = function(tag, startIndex, count, callback) {
    if (startIndex >= extArray.length) {
        callback(null);
        return;
    }
    var exts = tag ? tagExtMap[tag] : extArray;
    if (!exts) {
        callback([])
    } else {
        count = Math.min(exts.length - startIndex, count);
        callback(exts.slice(startIndex, startIndex + count));
    }
};

exports.getExtById = function(id, callback) {
    callback(extMap[id]);
};

exports.getExtByTag = function(tag, callback) {
    callback(extMap[id]);
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

exports.addTagForExt = function(tag, extId, callback) {
    var ext = extMap[extId];
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
    if (tagExtMap[tag]) {
        tagExtMap[tag].push(ext);
    } else {
        tagExtMap[tag] = [ext];
    }
    tagSizeMap[tag] = tagExtMap[tag].length;
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
    if(exts) {
        for(var i = 0; i < exts.length; i++) {
            var ext = exts[i];
            if(ext.tag && ext.tag.length > 0) {
                var index2 = ext.tag.indexOf(tag);
                if (index2 != -1) {
                    ext.tag.splice(index2, 1);
                }
            }
        }
    }
    callback(true);
};

exports.removeTagForExt = function(tag, extId, callback) {
    var ext = extMap[extId];
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
    }
    if (tagExtMap[tag]) {
        var index2 = tagExtMap[tag].indexOf(ext);
        if (index2 != -1) {
            tagExtMap[tag].splice(index2, 1);
        }
        tagSizeMap[tag] = tagExtMap[tag].length;
    }
};