/**
 * Created by jason on 2015/11/9.
 */

var extArray = [];
var extMap = {};
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
    for(var i = 0; i<10000; i++) {
        var ext = {
            id : getRandomId(32),
            name : getRandomStr(10),
            size : getRandomNum(1, 1000)
        };
        if (!extMap[ext.id]) {
            extArray.push(ext);
            extMap[ext.id] = ext;
            size++;
        }
    }
    callback(size)
};

exports.getExtByPage = function(startIndex, count, callback) {
    if(startIndex >= extArray.length) {
        callback(null);
        return;
    }
    count = Math.min(extArray.length - startIndex, count);
    callback(extArray.slice(startIndex, startIndex + count));
};

exports.getExtById = function(id, callback) {
    callback(extMap[id]);
};