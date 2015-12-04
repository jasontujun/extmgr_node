/**
 * Created by jason on 2015/12/2.
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
    "pic1": "https://lh6.googleusercontent.com/hjsK65p6OgZR9OAKmOIOEs0xui_Vr1OVWFYFLZanm3-1pkUbI22PbXWPdqkcNLha-GgkrCw0Lw=s26-h26-e365",// 小图标
    "pic2": "https://lh6.googleusercontent.com/2QcThdHoan7lTAfudi8NXOdRRF_-oIq1LbRsgTtfhmSMOXPUrG9nkOjdJr6wbqqy9t4ljtQi=s220-h140-e365"// 列表中型图片
    "pic3": "https://lh5.googleusercontent.com/SnkdjEkQY1goBark6p9SHVm1Asxqy2p9-MdeJkkJKiXHq03yawtgc-9pcs3gonPCuDKvE_d3S9g=s460-h340-e365",// 列表大型图片
    "pic4": "https://lh6.googleusercontent.com/hjsK65p6OgZR9OAKmOIOEs0xui_Vr1OVWFYFLZanm3-1pkUbI22PbXWPdqkcNLha-GgkrCw0Lw=s128-h128-e365",// 列表正方形图片
    // ======= self-define ======= //
    "tag": ['tag1', 'tag2', .....]
 * }
 */

var fs = require('fs'),
    path = require('path');

/**
 *
 * @param dir
 * @param initTag
 * @param result {
                    allExtArray : allExtArray,
                    allExtMap : allExtMap,
                    tagExtMap : tagExtMap,
                    rawExtArray : rawExtArray,
                    tagArray : tagArray,
                    tagSizeMap : tagSizeMap
                  }
 * @param callback
 */
exports.loadFromFile = function(dir, initTag, result, callback) {
    if (!dir) {
        console.log(new Date().toString(), 'load error! dir is empty!');
        callback(false);
        return;
    }

    fs.readdir(dir, function(err, files) {
        if (err) {
            console.log(new Date().toString(), 'load error! dir=' + dir + ',err=' + err);
            callback(false);
            return;
        }

        var count = 0;
        for (var i = 0; i < files.length; i++) {
            var fileName = files[i];
            var absPath = path.join(dir, fileName);
            var extension = require(absPath);
            if (extension.id) {
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
                    console.log(new Date().toString(), 'id duplicate! id =' + extension.id + ',file=' + absPath);
                }
            } else {
                console.log(new Date().toString(), 'id not exist! file=' + absPath);
            }
        }
        for (var k = 0; k < result.tagArray.length; k++) {
            result.tagSizeMap[result.tagArray[k]] = result.tagExtMap[result.tagArray[k]] ? result.tagExtMap[result.tagArray[k]].length : 0;
        }
        console.log(new Date().toString(), 'load successfully! totally load ' + count + ' data under ' + dir);
        callback(true);
    });
};

exports.loadFromDb = function(callback) {

};