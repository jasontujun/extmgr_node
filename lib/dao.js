/**
 * Created by jason on 2015/11/9.
 */


var fs = require('fs'),
    path = require('path'),
    redis = require('redis'),
    util = require('util'),
    config = require('../config.json'),
    client = redis.createClient(config.redisPort, config.redisHost);
client.select(1, function(err, res) {
    if (err) {
        console.log(new Date().toString(), '[redis] select db 1 error! ' + err);
    } else {
        console.log(new Date().toString(), '[redis] select db 1 success!');
    }
});

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
 * Tag = {
        name : "something",
        size : 0,
        createdTime : 1402304803,
        order : -1
 * }
 *
 * 数据库表结构:
 * [SET]key:'sfTagName' - value:['tag1', 'tag2', ...]
 * [HASH]key:'sfTag-$name'   - field:name
                             - field:createdTime
                             - field:order
 * [SET]key:'sfExtensionId' - value:['32bit-id', '32bit-id', ...]
 * [HASH]key:'sfExtension-$id'   - field:id
                                 - field:cat
                                 - field:catName
                                 - field:screenshot     - [array]json-string-value
                                 - field:url
                                 - field:name
                                 - field:description
                                 - field:author
                                 - field:userNum
                                 - field:price
                                 - field:rate
                                 - field:commNum
                                 - field:pic1
                                 - field:pic2
                                 - field:pic3
                                 - field:pic4
                                 - field:tag            - [array]json-string-value
 */
var DB_KEY_UPDATE_TIMESTAMP = 'sfUpdateTimestamp';
var DB_KEY_TAG_SET = 'sfTagName';
var DB_KEY_TAG_DATA_PREFIX = 'sfTag-';
var DB_KEY_EXTENSION_ID_SET = 'sfExtensionId';
var DB_KEY_EXTENSION_DATA_PREFIX = 'sfExtension-';
var DB_UPDATE_INTERVAL = 24 * 60 * 60 * 1000;// 数据库更新的时间间隔,单位:ms

var allExtArray = [];// 所有extension的有序集合(有tag和无tag) [extension{}, ...]
var allExtMap = {};// 所有extension的以id为索引的集合 {id, extension{}}
var tagExtMap = {};// 按tag分类的extension {tag: extensions[]}
var rawExtArray = []; // 没有tag的extension [extension{}, ...]
var tagArray = [];// tag名称的有序集合 [tagName, ...]
var tagMap = {};// 包含该tag的extension数量的集合 {tagName: tag{name,size,createdTime,order}}
var dbTimeStamp = 0;// 数据库上次更新的时间戳

function tagComparator(tag1, tag2) {
    var result = tag1.order - tag2.order;
    if (result === 0) {
        result = tag1.createdTime - tag2.createdTime;
    }
    if (result === 0) {
        result = tag1.name.localeCompare(tag2.name);
    }
    return result;
}

function extensionComparator(ext1, ext2) {
    var result = ext2.userNum - ext1.userNum;
    if (result === 0) {
        result = ext2.commNum - ext1.commNum;
    }
    if (result === 0) {
        result = ext2.rate - ext1.rate;
    }
    if (result === 0) {
        result = ext2.name.localeCompare(ext1.name);
    }
    return result;
}

/**
 * 将对象转换成“扁平”的对象，即只有key-value，value为非Object的基本数据类型。
 * @param origin
 * @returns 如果没有任何需要“扁平”的属性，则返回源对象；否则返回“扁平”后的新对象。
 */
function toPlain(origin) {
    var clone;
    for (var property in origin) {
        if (typeof origin[property] === 'object') {
            if (!clone) {
                clone = util._extend({}, origin);
            }
            clone[property] = JSON.stringify(origin[property]);
        }
    }
    return clone ? clone : origin;
}

/**
 * 深度拷贝对象
 * @param origin
 */
function deepClone(origin) {
    return JSON.parse(JSON.stringify(origin || {}));
}

/**
 * 从文件系统加载数据。
 * @param initTag
 * @param result data-structure: {
                    allExtArray : [extension{}, ...],
                    allExtMap : {id, extension{}},
                    tagExtMap : {tag: extensions[]},
                    rawExtArray : [extension{}, ...],
                    tagArray : [tagName, ...],
                    tagMap : {tagName: tag{name,size,createdTime,order}}
                  }
 * @param callback function([boolean]result)
 */
function loadFromFile(initTag, result, callback) {
    var dir = config.extensionDir;
    if (!dir) {
        console.log(new Date().toString(), '[loadFromFile]load error! dir is empty!');
        callback(false);
        return;
    }

    fs.readdir(dir, function(err, files) {
        if (err) {
            console.log(new Date().toString(), '[loadFromFile]load error! dir=' + dir + ',err=' + err);
            callback(false);
            return;
        }

        var count = 0;
        for (var i = 0; i < files.length; i++) {
            var fileName = files[i];
            var absPath = path.join(dir, fileName);
            var extension = require(absPath);
            if (extension.id) {
                // TODO 处理screenshot脏数据
                var cleanScreenShot = [];
                for (var m = 0; m < extension.screenshot.length; m++) {
                    if (extension.screenshot[m].indexOf('s460-h340') != -1) {
                        cleanScreenShot.push(extension.screenshot[m])
                    }
                }
                extension.screenshot = cleanScreenShot;
                // init icon and image
                extension.icon = extension.pic1;
                extension.image = extension.pic2 || extension.pic3 || extension.pic4 || '';
                delete extension.pic1;
                delete extension.pic2;
                delete extension.pic3;
                delete extension.pic4;
                // init tag
                if (initTag) {
                    if (extension.catName) {
                        extension.tag = [extension.catName];
                        if (result.tagArray.indexOf(extension.catName) === -1) {
                            result.tagArray.push(extension.catName);
                        }
                    }
                }
                // add to result
                if (!result.allExtMap[extension.id]) {
                    result.allExtArray.push(extension);
                    result.allExtMap[extension.id] = extension;
                    if (extension.tag.length > 0) {
                        for (var j = 0; j < extension.tag.length; j++) {
                            if (result.tagExtMap[extension.tag[j]]) {
                                result.tagExtMap[extension.tag[j]].push(extension);
                            } else {
                                result.tagExtMap[extension.tag[j]] = [extension];
                            }
                        }
                    } else {
                        result.rawExtArray.push(extension);
                    }
                    count++;
                } else {
                    console.log(new Date().toString(), '[loadFromFile]id duplicate! id =' + extension.id + ',file=' + absPath);
                }
            } else {
                console.log(new Date().toString(), '[loadFromFile]id not exist! file=' + absPath);
            }
        }
        var currentTime = new Date().getTime();
        for (var k = 0; k < result.tagArray.length; k++) {
            result.tagMap[result.tagArray[k]] = {
                name : result.tagArray[k],
                size : result.tagExtMap[result.tagArray[k]] ? result.tagExtMap[result.tagArray[k]].length : 0,
                createdTime : currentTime,
                order: -1
            };
        }
        console.log(new Date().toString(), '[loadFromFile]load successfully! totally load ' + count + ' data under ' + dir);
        callback(true);
    });
}

/**
 * 从数据库加载数据。
 * @param data data-structure: {
                    allExtArray : [extension{}, ...],
                    allExtMap : {id, extension{}},
                    tagExtMap : {tag: extensions[]},
                    rawExtArray : [extension{}, ...],
                    tagArray : [tag, ...],
                    tagMap : {tag: {tagName: tag{name,size,createdTime,order}},
                    dbTimeStamp : 1403049294
                  }
 * @param callback function([boolean]result, [string]updateTimestamp)
 */
function loadFromDb(data, callback) {
    loadTagFromDb(data, function(result) {
        if (result) {
            loadExtensionFromDb(data, function(result) {
                if (result) {
                    loadTimestampFromDb(data, function(result) {
                        callback(result);
                    })
                } else {
                    callback(result);
                }
            })
        } else {
            callback(result);
        }
    });
}

function loadTagFromDb(data, callback) {
    client.smembers(DB_KEY_TAG_SET,function(err, tagNames) {
        if (err) {
            console.error(new Date().toString(), '[loadTagFromDb]ERROR - Redis client [smembers ' + DB_KEY_TAG_SET + '] fail');
            callback(false);
            return;
        }
        for (var i = 0; i < tagNames.length; i++) {
            data.tagArray.push(tagNames[i]);
            data.tagMap[tagNames[i]] = {
                name: tagNames[i],
                size: 0,
                createdTime: 0,
                order: -1
            };
            data.tagExtMap[tagNames[i]] = [];
        }
        if (tagNames.length > 0) {
            var multiCMD = [];
            for (i = 0; i < tagNames.length; i++) {
                multiCMD.push(['HGETALL', DB_KEY_TAG_DATA_PREFIX + tagNames[i]]);
            }
            client.multi(multiCMD).exec(function (err, tags) {
                if (err) {
                    console.error(new Date().toString(), '[loadTagFromDb]ERROR - Redis client [HGETALL ' + DB_KEY_TAG_DATA_PREFIX + '$name] fail');
                    callback(false);
                    return;
                }
                for (var i = 0; i < tags.length; i++) {
                    if (data.tagMap[tags[i].name]) {
                        data.tagMap[tags[i].name].createdTime = parseInt(tags[i].createdTime);
                        data.tagMap[tags[i].name].order = parseInt(tags[i].order);
                    }
                }
                callback(true);
            });
        } else {
            callback(true);
        }
    });
}

function loadExtensionFromDb(data, callback) {
    client.smembers(DB_KEY_EXTENSION_ID_SET, function (err, ids) {
        if (err) {
            console.error(new Date().toString(), '[loadExtensionFromDb]ERROR - Redis client [smembers ' + DB_KEY_EXTENSION_ID_SET + '] fail');
            callback(false);
            return;
        }
        if (ids.length > 0) {
            var multiCMD = [];
            for (var i = 0; i < ids.length; i++) {
                multiCMD.push(['HGETALL', DB_KEY_EXTENSION_DATA_PREFIX + ids[i]]);
            }
            client.multi(multiCMD).exec(function (err, extensions) {
                if (err) {
                    console.error(new Date().toString(), '[loadExtensionFromDb]ERROR - Redis client [HGETALL ' + DB_KEY_EXTENSION_DATA_PREFIX + '$id] fail');
                    callback(false);
                    return;
                }
                for (var i = 0; i < extensions.length; i++) {
                    extensions[i].userNum = parseInt(extensions[i].userNum.replace(',', ''));
                    extensions[i].commNum = parseInt(extensions[i].commNum.replace(',', ''));
                    extensions[i].rate = parseFloat(extensions[i].rate);
                    if (extensions[i].screenshot) {
                        extensions[i].screenshot = JSON.parse(extensions[i].screenshot);
                    }
                    if (extensions[i].tag) {
                        extensions[i].tag = JSON.parse(extensions[i].tag);
                    }
                    data.allExtMap[extensions[i].id] = extensions[i];
                    data.allExtArray.push(extensions[i]);
                    if (extensions[i].tag && extensions[i].tag.length > 0) {
                        for (var j = 0; j < extensions[i].tag.length; j++) {
                            var t = extensions[i].tag[j];
                            if (data.tagExtMap.hasOwnProperty(t)) {
                                data.tagExtMap[t].push(extensions[i]);
                                data.tagMap[t].size++;
                            } else {
                                // dirty data!
                                console.error(new Date().toString(), '[loadExtensionFromDb]ERROR - Redis has dirty data!!extensionsId=' + extensions[i].id);
                            }
                        }
                    } else {
                        data.rawExtArray.push(extensions[i]);
                    }
                }
                data.allExtArray.sort(extensionComparator);
                for (var tag in tagExtMap) {
                    data.tagExtMap[tag].sort(extensionComparator);
                }
                callback(true);
            });
        } else {
            callback(true);
        }
    });
}

function loadTimestampFromDb(data, callback) {

    client.get(DB_KEY_UPDATE_TIMESTAMP, function(err, timestampStr) {
        if (err) {
            console.error(new Date().toString(), '[loadTimestampFromDb]ERROR - Redis client [get ' + DB_KEY_UPDATE_TIMESTAMP + '] fail');
            callback(false);
            data.dbTimeStamp = 0;
            return;
        }
        data.dbTimeStamp = timestampStr ? parseInt(timestampStr) : 0;
        callback(true);
    });
}

/**
 * 将数据合并到当前的数据库中
 * @param tags
 * @param extensions
 * @param callback
 */
function mergeDataToDb(tags, extensions, callback) {
    // first, compare with current data
    var newTags = [];
    for (var tagName in tags) {
        if (!tagExtMap.hasOwnProperty(tagName)) {
            newTags.push(tags[tagName]);
        }
    }
    var tagOrder = tagArray.length;
    newTags.sort(tagComparator);
    for (var j = 0; j < newTags.length; j++) {
        newTags[j].order = tagOrder;// 给新增的tag依次排到末尾
        tagOrder++;
    }
    var newExtensions = [];
    var changeExtensions = [];
    for (var i = 0; i < extensions.length; i++) {
        var newExt = extensions[i];
        var oldExt = allExtMap[newExt.id];
        if (!oldExt) {// new extension
            newExtensions.push(newExt);
        } else {// update exist extension
            var hasChange = false;
            for (var property in newExt) {
                if (!oldExt.hasOwnProperty(property)) {
                    oldExt[property] = newExt[property];
                    hasChange = true;
                } else {
                    if (Array.isArray(newExt[property])) {
                        if (!Array.isArray(oldExt[property])) {
                            oldExt[property] = newExt[property];
                            hasChange = true;
                        } else {
                            for (var k = 0; k < newExt[property].length; k++) {
                                if (oldExt[property].indexOf(newExt[property][k]) == -1) {
                                    oldExt[property].push(newExt[property][k]);
                                    hasChange = true;
                                }
                            }
                        }
                    } else if (oldExt[property] != newExt[property]) {
                        oldExt[property] = newExt[property];
                        hasChange = true;
                    }
                }
            }
            if (hasChange) {
                changeExtensions.push(oldExt);
            }
        }
    }
    console.log(new Date().toString(), '[mergeDataToDb]newTags=' + newTags.length +
    ', newExtensions=' + newExtensions.length + ', changeExtensions=' + changeExtensions.length);
    // second, update to db
    var multi = client.multi();
    for (i = 0; i < newTags.length; i++) {
        multi.sadd(DB_KEY_TAG_SET, newTags[i].name);
        multi.hmset(DB_KEY_TAG_DATA_PREFIX + newTags[i].name,
            ['name', newTags[i].name, 'createdTime', newTags[i].createdTime, 'order', newTags[i].order]);
    }
    for (i = 0; i < newExtensions.length; i++) {
        var extension = toPlain(newExtensions[i]);
        multi.sadd(DB_KEY_EXTENSION_ID_SET, extension.id);
        multi.hmset(DB_KEY_EXTENSION_DATA_PREFIX + extension.id, extension);
    }
    for (i = 0; i < changeExtensions.length; i++) {
        var extension = toPlain(changeExtensions[i]);
        multi.sadd(DB_KEY_EXTENSION_ID_SET, extension.id);
        multi.hmset(DB_KEY_EXTENSION_DATA_PREFIX + extension.id, extension);
    }
    multi.set(DB_KEY_UPDATE_TIMESTAMP, new Date().getTime());
    multi.exec(function(err, replies) {
        if (err) {
            console.error(new Date().toString(), '[mergeDataToDb]ERROR - Redis client [sadd & hmset] fail');
            callback(false);
            return;
        }
        console.log(new Date().toString(), '[mergeDataToDb]SUCCESS! MULTI got ' + replies.length + ' replies');
        callback(true);
    });
}

/**
 * 把本地文件的数据同步到数据库，并重新从数据库加载数据到内存
 * @param callback
 */
function syncData(callback) {
    console.log(new Date().toString(), '[syncData]');
    var tmpData = {
        allExtArray : [],
        allExtMap : {},
        tagExtMap : {},
        rawExtArray : [],
        tagArray : [],
        tagMap : {}
    };
    loadFromFile(true, tmpData,
        function (result) {
            if (result) {
                mergeDataToDb(tmpData.tagMap, tmpData.allExtArray,
                    function(result) {
                        if (result) {
                            // clear cache data in memory, reload from db
                            allExtArray = [];
                            allExtMap = {};
                            tagExtMap = {};
                            rawExtArray = [];
                            tagArray = [];
                            tagMap = {};
                            loadFromDb(
                                {
                                    allExtArray : allExtArray,
                                    allExtMap : allExtMap,
                                    tagExtMap : tagExtMap,
                                    rawExtArray : rawExtArray,
                                    tagArray : tagArray,
                                    tagMap : tagMap,
                                    dbTimeStamp : dbTimeStamp
                                }, function (result) {
                                    if (result) {
                                        callback(true);
                                    } else {
                                        console.error(new Date().toString(), '[syncData]ERROR - reloadFromDb() fail');
                                        callback(false);
                                    }
                                });
                        } else {
                            console.error(new Date().toString(), '[syncData]ERROR - mergeDataToDb() fail');
                            callback(false);
                        }
                    });
            } else {
                console.error(new Date().toString(), '[syncData]ERROR - loadFromFile() fail');
                callback(false);
            }
        });
}

exports.init = function(callback) {
    loadFromDb(
        {
            allExtArray : allExtArray,
            allExtMap : allExtMap,
            tagExtMap : tagExtMap,
            rawExtArray : rawExtArray,
            tagArray : tagArray,
            tagMap : tagMap,
            dbTimeStamp : dbTimeStamp
        }, function (result) {
            if (result) {
                if (allExtArray.length == 0 ||
                    new Date().getTime - dbTimeStamp > DB_UPDATE_INTERVAL) {
                    // 从本地文件中同步数据到数据库，再重新加载
                    syncData(function(result) {
                        callback(result ? allExtArray.length : 0);
                    });
                } else {
                    // 直接从数据库加载数据
                    callback(allExtArray.length);
                }
            } else {
                callback(0);
            }
        });

    //require('./faker').load({
    //    allExtArray : allExtArray,
    //    allExtMap : allExtMap,
    //    tagExtMap : tagExtMap,
    //    rawExtArray : rawExtArray,
    //    tagArray : tagArray,
    //    tagMap : tagMap
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
    callback(tagMap);
};

exports.addTag = function(tag, callback) {
    if (tagExtMap.hasOwnProperty(tag)) {// tag exist
        callback(false);
        return;
    }

    var tagObj = {
        name : tag,
        size : 0,
        createdTime : new Date().getTime(),
        order: tagArray.length // 新增的标签默认排在最后
    };
    var multi = client.multi();
    multi.sadd(DB_KEY_TAG_SET, tag);
    multi.hmset(DB_KEY_TAG_DATA_PREFIX + tag,
        ['name', tagObj.name, 'createdTime', tagObj.createdTime, 'order', tagObj.order]);
    multi.exec(function(err, reply) {
        if (err) {
            console.error(new Date().toString(), '[addTag]ERROR - Redis client [sadd & hmset] fail');
            callback(false);
            return;
        }
        tagMap[tag] = tagObj;
        tagExtMap[tag] = null;
        tagArray.push(tag);
        callback(true);
    });
};

exports.removeTag = function(tag, callback) {
    if (!tagExtMap.hasOwnProperty(tag)) {// tag not exist
        callback(false);
        return;
    }
    var changeExtensions = [];
    if (tagExtMap[tag]) {
        for (var i = 0; i < tagExtMap[tag].length; i++) {
            var ext = tagExtMap[tag][i];
            if (ext.tag && ext.tag.length > 0) {
                var index = ext.tag.indexOf(tag);
                if (index != -1) {
                    var cloneExt = deepClone(ext);
                    cloneExt.tag.splice(index, 1);
                    changeExtensions.push(cloneExt);
                }
            }
        }
    }
    var multi = client.multi();
    multi.srem(DB_KEY_TAG_SET, tag);
    multi.del(DB_KEY_TAG_DATA_PREFIX + tag);
    for (var j = 0; j < changeExtensions.length; j++) {
        var extension = toPlain(changeExtensions[j]);
        multi.hset(DB_KEY_EXTENSION_DATA_PREFIX + extension.id, 'tag', extension.tag);
    }
    multi.exec(function(err, replies) {
        if (err) {
            console.error(new Date().toString(), '[removeTag]ERROR - Redis client [srem & hmset] fail');
            callback(false);
            return;
        }
        console.log(new Date().toString(), '[removeTag]SUCCESS! MULTI got ' + replies.length + ' replies');
        var index1 = tagArray.indexOf(tag);
        if (index1 != -1) {
            tagArray.splice(index1, 1);
        }
        delete tagMap[tag];
        delete tagExtMap[tag];
        for (var j = 0; j < changeExtensions.length; j++) {
            var ext = allExtMap[changeExtensions[j].id];
            var index = ext.tag.indexOf(tag);
            if (index != -1) {
                ext.tag.splice(index, 1);
                // 这个extension已经没有tag了，归入rawExtArray
                if (ext.tag.length == 0) {
                    rawExtArray.push(ext);
                }
            }
        }
        callback(true);
    });
};

exports.addTagForExt = function(tag, extId, force, callback) {
    var ext = allExtMap[extId];
    if (!ext) {// extension not exist
        callback(false);
        return;
    }
    if (ext.tag && ext.tag.indexOf(tag) != -1) {// ext has the same tag
        callback(false);
        return;
    }
    var newTag = false;
    if (!tagExtMap.hasOwnProperty(tag)) {// tag not exist
        if (!force) {
            callback(false);
            return;
        } else {
            newTag = true;
        }
    }
    if (newTag) {
        exports.addTag(tag, function(result) {
            if (result) {
                _addTagForExt(tag, ext, callback);
            } else {
                callback(result);
            }
        });
    } else {
        _addTagForExt(tag, ext, callback);
    }
};
function _addTagForExt(tag, ext, callback) {
    var cloneExt = deepClone(ext);
    cloneExt.tag.push(tag);
    var extension = toPlain(cloneExt);
    client.hset(DB_KEY_EXTENSION_DATA_PREFIX + extension.id, 'tag', extension.tag,
        function (err, res) {
            if (err) {
                console.error(new Date().toString(), '[addTagForExt]ERROR - Redis client [hset] fail');
                callback(false);
                return;
            }
            console.log(new Date().toString(), '[addTagForExt]SUCCESS! - got res:' + res);
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
            tagMap[tag].size = tagExtMap[tag].length;
            callback(true);
        });
}

exports.removeTagForExt = function(tag, extId, force, callback) {
    var ext = allExtMap[extId];
    if (!ext) {// extension not exist
        callback(false);
        return;
    }
    if (!tagExtMap.hasOwnProperty(tag)) {// tag not exist
        callback(false);
        return;
    }
    if (!ext.tag || ext.tag.indexOf(tag) == -1) {// ext doesn't has the tag
        callback(false);
        return;
    }

    var cloneExt = deepClone(ext);
    var index = cloneExt.tag.indexOf(tag);
    if (index != -1) {
        cloneExt.tag.splice(index, 1);
    }
    var extension = toPlain(cloneExt);
    client.hset(DB_KEY_EXTENSION_DATA_PREFIX + extension.id, 'tag', extension.tag,
        function (err, res) {
            if (err) {
                console.error(new Date().toString(), '[removeTagForExt]ERROR - Redis client [hset] fail');
                callback(false);
                return;
            }
            console.log(new Date().toString(), '[removeTagForExt]SUCCESS! - got res:' + res);
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
                tagMap[tag].size = tagExtMap[tag].length;
            }
            if (tagExtMap[tag] && tagExtMap[tag].length == 0 && force) {
                exports.removeTag(tag, callback);
            } else {
                callback(true);
            }
        });
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