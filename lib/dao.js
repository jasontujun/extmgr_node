/**
 * Created by jason on 2015/11/9.
 */

var allExtArray = [];// 所有extension的排序集合(有tag和无tag)
var allExtMap = {};// 所有extension的以id为索引的集合
var tagExtMap = {};// 按tag分类的extension
var rawExtArray = []; // 没有tag的extension
var tagArray = ['开发者工具', '社交与通讯', '购物', '天气与新闻', '娱乐', '照片', '博客'];
var tagSizeMap = {};

var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var extImages = [
    {
        image : 'https://lh4.googleusercontent.com/VXl245zLPUB4wUOx4XOLZP-I6bddY7fs9tSyJaVhi9nSxftrtetMMYwY3jNH0U3tVP0bHKRcjvs=s220-h140-e365-rw',
        icon : 'https://lh6.googleusercontent.com/WFtYQhR-aU3poebQGVppfijWNMOEkrhisxNUJAX3EMS_t4GoXZoEsEvrsQ69GMpyCmUgWyEg=s26-h26-e365-rw'
    },
    {
        image : 'https://lh5.googleusercontent.com/2a09a8b9gQimiQadzxZzm6KDDQQF1U5bTbY1z0BYZI6FfvHn-SPrIMU2Qlu6uwZfVjKMMiK0=s220-h140-e365-rw',
        icon : 'https://lh4.googleusercontent.com/w4W1i13rPfZyubnT2M8POcWDiG695Arilom81l4oklDwKA47Q66U7UgSdpSJn1sMuDPsA10CEro=s26-h26-e365-rw'
    },
    {
        image : 'https://lh3.googleusercontent.com/PM_BsVg_QvxNMS68bsCluGm1-pBkHMu5XHkWSJhWLmQRurNQJ341Rc7mgPj5ClMQDuR_FSQfTA=s220-h140-e365-rw',
        icon : 'https://lh6.googleusercontent.com/BoNxx96VUH0agRKjoLuwkijp7BzQVzXVuhsVbsOGxfrd4mrXrv7MQXXRQYx4XuipW-bKYNix=s26-h26-e365-rw'
    },
    {
        image : 'https://lh4.googleusercontent.com/3W0Fq_Fz2YAuQSvufvSFsJM9Kf8NcMli5QUzFmS2P7HtTN1m8LtIZbsOQM_w4PlQP0QNkkml_A=s220-h140-e365-rw',
        icon : 'https://lh4.googleusercontent.com/1TOVHOccYLI8AwGU2DiN3FSTotFzSbBYd-x-pb2FBp1zu_J0qxldtZeqtMsxblnhe390XoK32P8=s26-h26-e365-rw'
    },
    {
        image : 'https://lh6.googleusercontent.com/0dGTvYyns0176eYEyceMf21mDhOWhyaNuvczWTgSoQB6mREZN0J5aD1o-gn1jR-iEUeBw-yDAQ=s220-h140-e365-rw',
        icon : 'https://lh5.googleusercontent.com/QvKrsdah5FLfOZ_sQZs_-Uw6jDzlffvHzpge5zsDNnGc0xU2Zi9pDlWJqKk8omOzlrtb3qgYww=s26-h26-e365-rw'
    },
    {
        image : 'https://lh5.googleusercontent.com/JNzsDOneslqPTik9zLvYz1taBMiugDhn3vdfK0YvDdsFtdODPFygBICSjggWB07LWs13vEWPCi4=s220-h140-e365-rw',
        icon : 'https://lh5.googleusercontent.com/gAY55aameVL8GpW2kAXCm6GV_qDqmtVilk8z_59EXNA-dX7H_wngp_nH8D2owf2EGyGtFC5N7Q=s26-h26-e365-rw'
    },
    {
        image : 'https://lh6.googleusercontent.com/52jq9nB7mQzOzqFqu7-whJgvWslnaNOi-zhIKeWrgn6v-tU5K6u9Z6POJMgqbevTytHmuOh91A=s220-h140-e365-rw',
        icon : 'https://lh4.googleusercontent.com/GbofQF4Opez_MhVn120xtqCcMLlgwLfLl9fMbHx7KqZdD-0IMUAb_XXG8yHtWfwZYs0nYflKIA=s26-h26-e365-rw'
    },
    {
        image : 'https://lh6.googleusercontent.com/SxrZzM1fMeyka9gLQRxv5ks-opyMUL_C5-wI2KxhRMasC2FyV4SGSAOz-oi7cBgWKZPHChh02w=s220-h140-e365-rw',
        icon : 'https://lh5.googleusercontent.com/jEJ8FlrHXXGskk80sojXh74KilacSpxTzXchq0aVWOhPeBIXOfqkCJtgJgI96WWhTY2GiGctXg=s26-h26-e365-rw'
    },
    {
        image : 'https://lh4.googleusercontent.com/4SwJ6cfKKxb5kIl9hVpLQddHYsvQurb42V507tkomqFVTv3FrMNjSP4Ja14BN6XCaV-H59e_e3w=s220-h140-e365-rw',
        icon : 'https://lh3.googleusercontent.com/p8nfTyhgql-KxZQlcXHR5EpMflDS2Fe8efIchvLAwapVDKfY6XTDZl5Trjk5ftMEaC2RVCZ5Ihk=s26-h26-e365-rw'
    },
    {
        image : 'https://lh5.googleusercontent.com/o8DZD6_bhjtU0ADuen10DIM3C1pYSh_dEUkPjQJ_vgHcKhGRDHkE5007ST5KO5FuKkbUY5LQCTI=s220-h140-e365-rw',
        icon : 'https://lh3.googleusercontent.com/IOtErF9Ps98kb6vjW8-DwGyl0ik_2IXnW4qvoZ8g-NSb9KzHnhY0Rva9C8jxGfSU2fc_QF28r74=s26-h26-e365-rw'
    },
    {
        image : 'https://lh4.googleusercontent.com/rv5ERSz1j0S5WJVwPxlBCDYzJto-Te15isazmCFiRMreO4iypQhLkqyiP9HD2t7F25dZTZsu=s220-h140-e365-rw',
        icon : 'https://lh4.googleusercontent.com/C9J_NTzgPyF3OGKEqhvuNSZ5aScuBGtA5bf8DTVxQtuM6BU-uqo6fTKoxr073T96mej5_kfHnTk=s26-h26-e365-rw'
    },
    {
        image : 'https://lh3.googleusercontent.com/bbU8nxxeY595-7Rh51BTpOel_39P985K0NOtqZhdMnbesQQaEzVCI5t80_dkoK62MkeO5kpYjZc=s220-h140-e365-rw',
        icon : 'https://lh6.googleusercontent.com/EpilQRAhPM6vd2T--IsmS7o_bV1mZni_Wt8PATGSpzabWbHnoNbsN8SU_Lj49bf7POYY1dz7FQ=s26-h26-e365-rw'
    }];

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
        var extImage = extImages[getRandomNum(0, extImages.length)];
        var ext = {
            id : getRandomId(32),
            name : getRandomStr(10),
            description : 'description...',
            size : getRandomNum(1, 1000),
            image : extImage.image,
            icon : extImage.icon,
            tag : []
        };
        if (getRandomNum(0, 100) < 50) {// 50%的extension有tag
            ext.tag.push(tagArray[getRandomNum(0, tagArray.length)]);
        }
        if (!allExtMap[ext.id]) {
            allExtArray.push(ext);
            allExtMap[ext.id] = ext;
            if (ext.tag.length > 0) {
                for (var j = 0; j < ext.tag.length; j++) {
                    if (tagExtMap[ext.tag[j]]) {
                        tagExtMap[ext.tag[j]].push(ext);
                    } else {
                        tagExtMap[ext.tag[j]] = [ext];
                    }
                }
            } else {
                rawExtArray.push(ext);
            }
            size++;
        }
    }
    for (var k = 0; k < tagArray.length; k++) {
        tagSizeMap[tagArray[k]] = tagExtMap[tagArray[k]] ? tagExtMap[tagArray[k]].length : 0;
    }
    callback(size)
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