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
    for(var i = 0; i<1000; i++) {
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
    for(var k = 0; k < tagArray.length; k++) {
        tagSizeMap[tagArray[k]] = tagExtMap[tagArray[k]] ? tagExtMap[tagArray[k]].length : 0;
    }
    callback(size)
};

exports.getExtByPage = function(tag, startIndex, count, callback) {
    if(startIndex >= extArray.length) {
        callback(null);
        return;
    }
    var exts = tag ? tagExtMap[tag] : extArray;
    if(!exts) {
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