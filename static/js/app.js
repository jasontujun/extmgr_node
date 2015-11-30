/**
 * Created by jason on 2015/11/9.
 */

/**
 * UI Component. ExpandListView
 * <pre>
 *     opt = {
 *          parentSelector:
 *          loadingSelector:
 *          itemTemplate:
 *          loadingTemplate:
 *          colCount: [number]
 *          httpFn: [function(callbcak([Object]data, [boolean]hasMore))] the ajax function to get more data.
 *          draggable: [boolean]
 *          droppable: [boolean]
 *          droppable_hover: [string]
 *          droppable_scope: [string]
 *          droppable_drop: [function(draggableElement, droppableElement, data, event)]
 *          droppable_over: [function(draggableElement, droppableElement, data, event)]
 *          droppable_out: [function(draggableElement, droppableElement, data, event)]
 *     }
 * </pre>
 * @param opt
 */
function ExpandListView(opt) {
    opt = opt || {};
    this.parentSelector = opt.parentSelector;
    this.loadingSelector = opt.loadingSelector;
    this.itemTemplate = opt.itemTemplate;
    this.loadingTemplate = opt.loadingTemplate;
    this.colCount = opt.colCount || 1;
    this.httpFn = opt.httpFn;
    this.draggable = opt.draggable;
    this.droppable = opt.droppable;
    this.droppable_hover = opt.droppable_hover;
    this.droppable_scope = opt.droppable_scope;
    this.droppable_drop = opt.droppable_drop;
    this.droppable_over = opt.droppable_over;
    this.droppable_out= opt.droppable_out;

    this.more = true;
    this.loading = false;
    this.scrollListener = null;

    this.loadMore = function () {
        if (!this.more || this.loading || !this.httpFn) {
            return;
        }
        this.loading = true;
        var loadingTip = $(this.loadingSelector);
        if (!loadingTip) {// loadingTip not exist, add
            $(this.parentSelector).html(ejs.renderFile(this.loadingTemplate, {word:'loading...'}, {cache:true}));
        }
        loadingTip.show();
        var that = this;
        this.httpFn(function (data, hasMore) {
            if (!hasMore) {
                that.more = false;
                //$('#list-loading-word').text('no more data');
            }
            if (data) {
                that.render(data);
            }
            $(that.loadingSelector).hide();
            that.loading = false;
        });
    };
    this.refreshItem = function(data) {
        var itemView = $('#expandlist-item-' + data.id);
        if (!itemView) {
            return;
        }
        var itemContent = ejs.renderFile(this.itemTemplate, data, {cache:true});
        itemView.html(itemContent);
        // set droppable
        if (this.droppable) {
            var that = this;
            var droppableElement = $('#expandlist-item-' + data.id).children();
            droppableElement.droppable({
                tolerance : 'intersect',
                hoverClass : this.droppable_hover,
                scope : this.droppable_scope ? this.droppable_scope : 'default',
                drop : function(event, ui) {
                    if (that.droppable_drop) {
                        that.droppable_drop(ui.draggable, droppableElement, data, event);
                    }
                },
                out : function(event, ui) {
                    if (that.droppable_out) {
                        that.droppable_out(ui.draggable, droppableElement, data, event);
                    }
                },
                over : function(event, ui) {
                    if (that.droppable_over) {
                        that.droppable_over(ui.draggable, droppableElement, data, event);
                    }
                }
            });
        }
    };
    this.render = function (data) {
        if (!data || data.length <= 0) return;

        var content = '';
        var index = 0;
        var rowCount = Math.ceil(data.length / this.colCount);
        for (var row = 0; row < rowCount; row++) {
            content = content + '<div class="row">';
            for (var i = 0; i < this.colCount; i++) {
                if (index >= data.length) {
                    break;
                }
                var item = '<div class="col-lg-3 col-xs-6" id="expandlist-item-'+ data[index].id + '">' +
                    ejs.renderFile(this.itemTemplate, data[index], {cache:true}) + '</div>';
                content = content + item;
                index++;
            }
            content = content + '</div>';
        }
        if (this.more) {
            var loadingTip = ejs.renderFile(this.loadingTemplate, {word:'loading...'}, {cache:true});
            content = content + loadingTip;
        }
        $(this.loadingSelector).remove();// 必须是remove..
        $(this.parentSelector).append(content);
        // set draggable
        if (this.draggable) {
            for (var j = 0; j < data.length; j++) {
                $('#expandlist-item-' + data[j].id).draggable({
                    zIndex: 1070,
                    revert: true,
                    opacity : 0.5,
                    cursor : 'move',
                    delay : 50, // prevent unwanted drags when clicking on an element
                    distance: 5 // prevent unwanted drags when clicking on an element
                });
            }
        }
        // set droppable
        if (this.droppable) {
            var that = this;
            for (var k = 0; k < data.length; k++) {
                var element = $('#expandlist-item-' + data[k].id).children();
                element.droppable({
                    tolerance : 'intersect',
                    hoverClass : this.droppable_hover,
                    scope : this.droppable_scope ? this.droppable_scope : 'default',
                    drop : function(droppableData, droppableElement) {
                        return function(event, ui) {
                            if (that.droppable_drop) {
                                that.droppable_drop(ui.draggable, droppableElement, droppableData, event);
                            }
                        }
                    }(data[k], element),
                    out : function(droppableData, droppableElement) {
                        return function(event, ui) {
                            if (that.droppable_out) {
                                that.droppable_out(ui.draggable, droppableElement, droppableData, event);
                            }
                        }
                    }(data[k], element),
                    over : function(droppableData, droppableElement) {
                        return function(event, ui) {
                            if (that.droppable_over) {
                                that.droppable_over(ui.draggable, droppableElement, droppableData, event);
                            }
                        }
                    }(data[k], element)
                });
            }
        }
    };
    this.clear = function () {
        $(this.parentSelector).html(ejs.renderFile(this.loadingTemplate, {word:'loading...'}, {cache:true}));
        $(this.loadingSelector).hide();
    };
    this.registerScrollListener = function () {
        if (this.scrollListener) return;
        var that = this;
        this.scrollListener = function () {
            // When scroll at bottom, invoked loadMore() function.
            if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                console.log(new Date().toString(), 'scroll bottom');
                if (that.more && !that.loading && that.httpFn) {
                    console.log(new Date().toString(), 'loadMore!');
                    that.loadMore();
                }
            }
        };
        $(window).bind('scroll', this.scrollListener);
    };
    this.unregisterScrollListener = function () {
        if (!this.scrollListener) return;
        $(window).unbind('scroll', this.scrollListener);
        this.scrollListener = null;
    };
}

/**
 * UI Component. EditableListView
 * <pre>
 *     opt = {
 *          prefix:
 *          parentSelector:
 *          addBtnSelector:
 *          confirmBtnSelector:
 *          inputSelector:
 *          itemTemplate:
 *          addFn:
 *          removeFn:
 *          selectFn:
 *          selectClass: [string] the class of css when selectable
 *          draggable: [boolean]
 *          droppable_scope: [string]
 *          droppable_start: [function(event, ui)]
 *          droppable_stop: [function(event, ui)]
 *     }
 * </pre>
 * @param opt
 */
function EditableListView(opt) {
    opt = opt || {};
    this.prefix = opt.prefix;
    this.parentSelector = opt.parentSelector;
    this.addBtnSelector = opt.addBtnSelector;
    this.confirmBtnSelector = opt.confirmBtnSelector;
    this.inputSelector = opt.inputSelector;
    this.itemTemplate = opt.itemTemplate;
    this.addFn = opt.addFn;
    this.removeFn = opt.removeFn;
    this.selectFn = opt.selectFn;
    this.selectClass = opt.selectClass;
    this.draggable = opt.draggable;
    this.draggable_scope = opt.draggable_scope;
    this.draggable_start = opt.draggable_start;
    this.draggable_stop = opt.draggable_stop;
    this.render = function (tags) {
        if (!tags) return;
        // generate html
        var index = 0;
        var content = '';
        for (var tag in tags) {
            var html = ejs.renderFile(this.itemTemplate, {
                itemId : this.prefix + '-item-id-' + index,
                removeBtnId : this.prefix + '-item-remove-id-' + index,
                tag : tag,
                tagCount: tags[tag]
            }, {cache:true});
            content = content + html;
            index++;
        }
        $(this.parentSelector).html(content);
        // register draggable, select, remove listener
        var that = this;
        index = 0;
        for (var tag2 in tags) {
            var item = $('#' + this.prefix + '-item-id-' + index);
            if (this.draggable) {// set draggable
                item.data('data', tag2);
                item.draggable({
                    scope : this.draggable_scope ? this.draggable_scope : 'default',
                    zIndex: 1070,
                    revert: true,
                    cursor : 'move',
                    opacity : 0.5,
                    delay : 50, // prevent unwanted drags when clicking on an element
                    distance: 5, // prevent unwanted drags when clicking on an element
                    start: function(element) {
                        return function (event, ui) {
                            if (that.selectClass) {
                                element.removeClass(that.selectClass);
                            }
                            if (that.draggable_start) {
                                that.draggable_start(event, ui);
                            }
                        }
                    }(item),
                    stop: function(element) {
                        return function (event, ui) {
                            if (that.selectClass) {
                                element.addClass(that.selectClass);
                            }
                            if (that.draggable_end) {
                                that.draggable_end(event, ui);
                            }
                        }
                    }(item)
                });
            }
            if (this.selectClass) {// set clickable cursor when hover
                item.addClass(this.selectClass);
            }
            if (this.selectFn) {//  set selectFn
                item.click(tag2, function (event) {
                    that.selectFn(event.data);
                });
            }
            $('#' + this.prefix + '-item-remove-id-' + index).click(tag2, function (event) {
                event.preventDefault();
                event.stopPropagation();
                var element = $(this);
                // invoke removeFn
                if (that.removeFn) {
                    that.removeFn(event.data, function(result) {
                        if (result) {
                            $.AdminLTE.boxWidget.remove($(element));
                        }
                    });
                }
            });
            index++;
        }
    };
    this.registerClickListener = function() {
        var that = this;
        $(this.addBtnSelector).click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            var element = $(this);
            var box = element.parents(".box").first();
            //Find the body and the footer
            var box_content = box.find("> .box-body > .box-body");
            if (!box.hasClass("collapsed-subbox")) {
                //Convert minus into plus
                element.children(":first")
                    .removeClass('fa-angle-up')
                    .addClass('fa-edit');
                //Hide the content
                box_content.slideUp($.AdminLTE.boxWidget.animationSpeed, function () {
                    box.addClass("collapsed-subbox");
                });
            } else {
                //Convert plus into minus
                element.children(":first")
                    .removeClass('fa-edit')
                    .addClass('fa-angle-up');
                //Show the content
                box_content.slideDown($.AdminLTE.boxWidget.animationSpeed, function () {
                    box.removeClass("collapsed-subbox");
                });
            }
        });
        $(this.confirmBtnSelector).click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            var inputComponent = $(that.inputSelector);
            var inputTag = inputComponent.val();
            inputComponent.val('');// 清空
            // invoke addFn
            if (that.addFn) {
                that.addFn(inputTag, function(newTags) {
                    if (newTags) {
                        // render new tagList
                        that.render(newTags);
                    }
                    // 触发add-btn的点击事件，使添加的控件收缩回去
                    $(that.addBtnSelector).click()
                });
            }
        });
    }
}

/**
 * UI Component. FullHeightIFrame
 */
function FullHeightIFrame(frameSelector, parentSelector, wrapperHeight) {
    this.frameSelector = frameSelector;
    this.parentSelector = parentSelector;
    this.wrapperHeight = wrapperHeight;
    this.resizeListener = null;

    this.setContent = function (url) {
        var iframe = $(this.frameSelector);
        if (iframe) {
            iframe.attr('src', url);
            // set height
            var content_height = parseInt($(this.parentSelector).css('min-height'));
            console.log(new Date().toString(), 'init! content_min_height:' + content_height);
            iframe.attr('height', content_height - this.wrapperHeight);
        }
    };
    this.registerResizeListener = function () {
        if (this.resizeListener) return;
        var that = this;
        this.resizeListener = function () {
            var iframe = $(that.frameSelector);
            if (iframe) {
                var content_height = parseInt($(that.parentSelector).css('min-height'));
                console.log(new Date().toString(), 'resize! content_min_height:' + content_height);
                iframe.attr('height', content_height - that.wrapperHeight);
            }
        };
        $(window).bind('resize', this.resizeListener);
    };
    this.unregisterResizeListener = function () {
        if (!this.resizeListener) return;
        $(window).unbind('resize', this.resizeListener);
        this.resizeListener = null;
    };
}

/**
 * 控件震动动画
 * @param element 控件
 * @param time 震动时间长——短循环长度
 * @param wh 震动幅度px
 * @param fx 动画速度s
 */
function shake(element, time, wh, fx) {
    $(function(){var offset = element.offset();
        var x = offset.left;
        var y = offset.top;
        for (var i = 1; i <= time; i++) {
            if (i % 2 == 0) {
                element.animate({left: '+' + wh + 'px'}, fx);
            } else {
                element.animate({left: '-' + wh + 'px'}, fx);
            }
        }
        element.animate({left:0}, fx);
        element.offset({ left: x, top: y });
    })
}

$.ShanFox = {
    data : {
        marketUrl : {
            chrome: 'https://chrome.google.com/webstore/category/extensions?hl=zh-CN',
            baidu: 'http://chajian.baidu.com/',
            sougou: 'http://ie.sogou.com/app/',
            '360jisu' : 'https://ext.chrome.360.cn/webstore/category/%E5%85%A8%E9%83%A8/%E6%9C%AC%E5%91%A8%E7%83%AD%E9%97%A8',
            '360anquan' : 'https://ext.se.360.cn/webstore/home',
            liebao: 'http://store.liebao.cn/',
            uc: 'http://extensions.uc.cn/newindex.htm#!hot/recommendation'
        },

        /**
         * 所有缓存的extension对象
         * allExtMap = {
         *     id : {extension},
         *     ...
         * }
         */
        allExtension : {},

        /**
         * 按照tag分类的extension对象
         * taggedExtension = {
         *          '娱乐':[{
         *                     id:asdf6asdfasa3sdfasdfasasdfasdfas,
         *                     name:HelloWord,
         *                     size:704,
         *                     tag:['娱乐']
         *                   },
         *                   ...],
         *           ...
         *         }
         */
        taggedExtension : {},

        /**
         * 没有tag的extension对象的有序集合
         * rawExtension = [
         *    {
         *         id:asdf6asdfasa3sdfasdfasasdfasdfas,
         *         name:HelloWord,
         *         size:704,
         *         tag:['娱乐']
         *     },
         *     ...]
         */
        rawExtension: [],
        /**
         * 没有tag的extension总数
         */
        rawExtSize: 0,

        /**
         * 所有tag的集合
         * tags = {
         *   '购物': 112,
         *   '娱乐'：12344，
         *   ...
         * }
         */
        tags: null
    },
    ajax : {
        tag : {
            add : function(tag, callback) {
                $.ajax({
                    url: 'tag/add',
                    type: 'POST',
                    data: {tag : tag},
                    success: function(data, textStatus, xhr) {
                        var result = data && data.result;
                        if (result) {
                            if(!$.ShanFox.data.tags) {
                                $.ShanFox.data.tags = {};
                            }
                            $.ShanFox.data.tags[tag] = 0;
                        }
                        if (callback) {
                            callback(result);
                        }
                    },
                    error: function(xmlHttpRequest, textStatus, errorThrown) {
                        console.log(new Date().toString(), '[tag.add]error!' + errorThrown.toString());
                        if (callback) {
                            callback(false);
                        }
                    }
                });
            },
            remove : function(tag, callback) {
                $.ajax({
                    url: 'tag/remove',
                    type: 'POST',
                    data: {tag : tag},
                    success: function(data, textStatus, xhr) {
                        var result = data && data.result;
                        if (result) {
                            if ($.ShanFox.data.taggedExtension[tag]) {
                                for (var i = 0; i < $.ShanFox.data.taggedExtension[tag].length; i++) {
                                    if ($.ShanFox.data.taggedExtension[tag][i].tag) {
                                        var index = $.ShanFox.data.taggedExtension[tag][i].tag.indexOf(tag);
                                        if (index != -1) {
                                            $.ShanFox.data.taggedExtension[tag][i].tag.splice(index, 1);
                                            if ($.ShanFox.data.taggedExtension[tag][i].tag.length === 0) {
                                                // TODO refresh raw size and rawList
                                            }
                                        }
                                    }
                                }
                            }
                            if ($.ShanFox.data.tags) {
                                delete $.ShanFox.data.tags[tag];
                                delete $.ShanFox.data.taggedExtension[tag];
                            }
                        }
                        if (callback) {
                            callback(result);
                        }
                    },
                    error: function(xmlHttpRequest, textStatus, errorThrown) {
                        console.log(new Date().toString(), '[tag.add]error!' + errorThrown.toString());
                        if (callback) {
                            callback(false);
                        }
                    }
                });
            },
            getAll : function(callback) {
                $.getJSON('tag/getAll', {withRaw : true}, function(data) {
                    $.ShanFox.data.tags = data.tags;
                    $.ShanFox.data.rawExtSize = data.raw ? data.raw : 0;
                    if (callback) {
                        callback(data.tags);
                    }
                })
            }
        },
        extension : {
            getTaggedByPage : function(callback) {
                var tag = $.ShanFox.ui.currentTag;
                if (!tag) {
                    console.log(new Date().toString(), '[getTaggedByPage]tag not exsit!do nothing!');
                    if (callback) {
                        callback(null, true);
                    }
                    return;
                }
                var offset = $.ShanFox.data.taggedExtension[tag] ? $.ShanFox.data.taggedExtension[tag].length : 0;
                $.ajax({
                    url: 'ext/tagged/getAllByPage',
                    type: 'GET',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: {
                        offset : offset,
                        count : 24,
                        tag : tag
                    },
                    success: function(data, textStatus, xhr) {
                        if (data.exts && data.exts.length > 0) {
                            for (var i = 0; i < data.exts.length; i++) {
                                if (!$.ShanFox.data.allExtension[data.exts[i].id]) {
                                    // cache new extension data
                                    $.ShanFox.data.allExtension[data.exts[i].id] = data.exts[i];
                                    // add to taggedExtension
                                    if(!$.ShanFox.data.taggedExtension[tag]) {
                                        $.ShanFox.data.taggedExtension[tag] = [];
                                    }
                                    $.ShanFox.data.taggedExtension[tag].push($.ShanFox.data.allExtension[data.exts[i].id]);
                                } else {
                                    // update local extension data
                                    for(var property in data.exts[i]) {
                                        $.ShanFox.data.allExtension[data.exts[i].id][property] = data.exts[i][property];
                                    }
                                }
                            }
                        }
                        var loadedCount = parseInt(data.count);
                        var hasMore = loadedCount == 24;
                        console.log(new Date().toString(), '[getTaggedByPage]success!tag=' + tag +
                        ',offset=' + offset + ',count=' + 24 + ',returnCount=' + loadedCount + ',returnExts=' + data.exts);
                        if (callback) {
                            callback(data.exts, hasMore);
                        }
                    },
                    error: function(xmlHttpRequest, textStatus, errorThrown) {
                        console.log(new Date().toString(), '[getTaggedByPage]error!' + errorThrown.toString());
                        if (callback) {
                            callback(null, true);
                        }
                    }
                });
            },
            getRawByPage : function(callback) {
                var offset = $.ShanFox.data.rawExtension.length;
                $.ajax({
                    url: 'ext/raw/getAllByPage',
                    type: 'GET',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: {
                        offset : offset,
                        count : 24
                    },
                    success: function(data, textStatus, xhr) {
                        if (data.exts) {
                            for (var i = 0; i < data.exts.length; i++) {
                                if (!$.ShanFox.data.allExtension[data.exts[i].id]) {
                                    // cache new extension data
                                    $.ShanFox.data.allExtension[data.exts[i].id] = data.exts[i];
                                    // add to rawExtension
                                    $.ShanFox.data.rawExtension.push($.ShanFox.data.allExtension[data.exts[i].id]);
                                } else {
                                    // update local extension data
                                    for(var property in data.exts[i]) {
                                        $.ShanFox.data.allExtension[data.exts[i].id][property] = data.exts[i][property];
                                    }
                                }
                            }
                        }
                        var loadedCount = parseInt(data.count);
                        var hasMore = loadedCount == 24;
                        console.log(new Date().toString(), '[getRawByPage]success!offset=' + offset +
                        ',count=' + 24 + ',returnCount=' + loadedCount + ',returnExts=' + data.exts);
                        if (callback) {
                            callback(data.exts, hasMore);
                        }
                    },
                    error: function(xmlHttpRequest, textStatus, errorThrown) {
                        console.log(new Date().toString(), '[getRawByPage]error!' + errorThrown.toString());
                        if (callback) {
                            callback(null, true);
                        }
                    }
                });
            },
            addTag : function(extId, tag, callback) {
                $.ajax({
                    url: 'ext/addTag',
                    type: 'POST',
                    data: {ext : extId, tag : tag},
                    success: function(data, textStatus, xhr) {
                        var result = data && data.result;
                        if (result) {
                            $.ShanFox.data.tags[tag]++;
                            var ext = $.ShanFox.data.allExtension[extId];
                            if (ext) {
                                if (ext.tag) {
                                    ext.tag.push(tag);
                                } else {
                                    ext.tag.push = [tag];
                                    // TODO refresh raw size and rawList
                                }
                            }
                        }
                        if (callback) {
                            callback(result);
                        }
                    },
                    error: function(xmlHttpRequest, textStatus, errorThrown) {
                        console.log(new Date().toString(), '[tag.add]error!' + errorThrown.toString());
                        if (callback) {
                            callback(false);
                        }
                    }
                });
            },
            removeTag : function(extId, tag, callback) {
                $.ajax({
                    url: 'ext/removeTag',
                    type: 'POST',
                    data: {ext : extId, tag : tag},
                    success: function(data, textStatus, xhr) {
                        var result = data && data.result;
                        if (result) {
                            $.ShanFox.data.tags[tag]--;
                            var ext = $.ShanFox.data.allExtension[extId];
                            if (ext) {
                                var index = ext.tag.indexOf(tag);
                                if (index != -1) {
                                    ext.tag.splice(index, 1);
                                    if (ext.tag.length === 0) {
                                        // TODO refresh raw size and rawList
                                    }
                                }
                            }
                        }
                        if (callback) {
                            callback(result);
                        }
                    },
                    error: function(xmlHttpRequest, textStatus, errorThrown) {
                        console.log(new Date().toString(), '[tag.add]error!' + errorThrown.toString());
                        if (callback) {
                            callback(false);
                        }
                    }
                });
            }
        }
    },
    ui : {
        currentTag: null,
        currentMarket : null,
        template : {
            extensionContent: 'views/partials/content-extension.ejs',
            marketContent: 'views/partials/content-market.ejs',
            extItem : 'views/partials/item-extension.ejs',
            tagItem : 'views/partials/item-tag.ejs',
            loading : 'views/partials/list-loading.ejs',
            inputDialog : 'views/partials/dialog-input.ejs'
        },
        tagList : null,
        rawList : null,//
        extensionList : {},// {tagName : ExpandListView}
        marketIFrame : new FullHeightIFrame('#market-iframe', '#page-right-content', 35),
        // ========================== ui function [start] ========================== //
        clearScrollListener : function() {
            for (var tag in $.ShanFox.ui.extensionList) {
                $.ShanFox.ui.extensionList[tag].unregisterScrollListener();
            }
            if ($.ShanFox.ui.rawList) {
                $.ShanFox.ui.rawList.unregisterScrollListener();
            }
        },
        clearAllListener : function() {
            $.ShanFox.ui.clearScrollListener();
            if ($.ShanFox.ui.marketIFrame) {
                $.ShanFox.ui.marketIFrame.unregisterResizeListener();
            }
        },
        clearLeftMenuActive : function() {
            $('#left-ext').removeClass('active');
            $('#left-market').removeClass('active');
            $('#left-market-menu').children().removeClass('active');
        },
        switchTag : function(tag) {
            $.ShanFox.ui.currentTag = tag;
            $.ShanFox.ui.clearScrollListener();
            if (!tag) {// tag is null, clear the page
                $('#header-selected-tag').html('当前的扩展无标签，请拖动标签到扩展里以添加标签'
                + '  <small>共' + $.ShanFox.data.rawExtSize + '个</small>');
            } else {
                $('#header-selected-tag').html(tag + '  <small>共' + $.ShanFox.data.tags[tag] + '个</small>');
            }
            var listView = tag ? $.ShanFox.ui.extensionList[tag] : $.ShanFox.ui.rawList;
            var dataList = tag ? $.ShanFox.data.taggedExtension[tag] : $.ShanFox.data.rawExtension;
            if (!listView) {// new taggList for [tag]
                listView = new ExpandListView({
                    parentSelector : '#ext-list',
                    loadingSelector : '#list-loading',
                    itemTemplate : $.ShanFox.ui.template.extItem,
                    loadingTemplate : $.ShanFox.ui.template.loading,
                    colCount : 4,
                    httpFn : tag ? $.ShanFox.ajax.extension.getTaggedByPage : $.ShanFox.ajax.extension.getRawByPage,
                    droppable : true,
                    droppable_hover : 'bg-gray-active',
                    droppable_drop : function(draggableElement, droppableElement, data) {
                        console.log(new Date().toString(), '[droppable_drop] dataId:' + data.id + ',dataName:' + data.name);
                        var dragTag = draggableElement.data('data');
                        var extTags = data.tag ? data.tag : [];
                        if (extTags.indexOf(dragTag) != -1) {
                            // tag exist, cannot add again!
                            //alert('扩展[' + data.name + ']已包含标签[' + tag + ']，不可重复添加!');
                            shake(droppableElement, 6, 10, 100);
                            var btn = droppableElement.find('.btn-group');
                            btn.removeClass('open');
                        } else {
                            var extId = data.id;
                            $.ShanFox.ajax.extension.addTag(extId, dragTag, function(result) {
                                if (result) {
                                    listView.refreshItem(data);
                                    $.ShanFox.ui.tagList.render($.ShanFox.data.tags);
                                } else {
                                    alert('给扩展[' + data.name + ']添加标签[' + dragTag + ']失败!');
                                }
                            });
                        }
                    },
                    droppable_over : function(draggableElement, droppableElement, data) {
                        var btn = droppableElement.find('.btn-group');
                        btn.addClass('open');
                    },
                    droppable_out : function(draggableElement, droppableElement, data) {
                        var btn = droppableElement.find('.btn-group');
                        btn.removeClass('open');
                    }
                });
                if (tag) {
                    $.ShanFox.ui.extensionList[tag] = listView;
                } else {
                    $.ShanFox.ui.rawList = listView;
                }
            }
            listView.registerScrollListener();
            listView.clear();
            if (!dataList || dataList.length == 0) {
                listView.loadMore();
            } else {
                listView.render(dataList);
            }
        },
        showExtension : function() {
            // left menu
            $.ShanFox.ui.clearLeftMenuActive();
            $('#left-ext').addClass('active');
            // clear global listener
            $.ShanFox.ui.clearAllListener();
            // ejs template to html
            var html = ejs.renderFile($.ShanFox.ui.template.extensionContent, $.ShanFox.data.ejs, {cache:true});
            $('#page-right-content').html(html);
            // init extension list
            if (!$.ShanFox.ui.tagList) {
                $.ShanFox.ui.tagList = new EditableListView({
                    prefix: 'tagged-tag-list',
                    parentSelector : '#tag-list',
                    addBtnSelector : '#tag-add-btn',
                    confirmBtnSelector : '#tag-add-confirm-btn',
                    inputSelector : '#tag-input',
                    itemTemplate : $.ShanFox.ui.template.tagItem,
                    addFn : function(inputTag, callback) {
                        $.ShanFox.ajax.tag.add(inputTag, function(result) {
                            if (result) {
                                // render new tagList
                                callback($.ShanFox.data.tags)
                            } else {
                                alert('添加标签[' + inputTag + ']失败!');
                                // render new tagList
                                callback(null);
                            }
                        });
                    },
                    removeFn : function (tag, callback) {
                        $.ShanFox.ajax.tag.remove(tag, function(result) {
                            if (result) {
                                // remove extensionList for [tag]
                                delete $.ShanFox.ui.extensionList[tag];
                                // if currentTag is removed. switch to another tag
                                if ($.ShanFox.ui.currentTag === tag) {
                                    var nextTag = null;
                                    for (var t in $.ShanFox.data.tags) {
                                        nextTag = t;
                                        break;
                                    }
                                    $.ShanFox.ui.switchTag(nextTag);
                                }
                            } else {
                                alert('删除标签[' + tag + ']失败!');
                            }
                            // refresh tagList
                            callback(result);
                        });
                    },
                    selectFn : $.ShanFox.ui.switchTag,
                    selectClass : 'sfhoverbox',
                    draggable : true
                });
            }
            $.ShanFox.ui.tagList.registerClickListener();
            $('#tag-raw').click(function() {
                $.ShanFox.ui.switchTag(null);
            });
            if (!$.ShanFox.data.tags) {
                // no tags data, request
                $.ShanFox.ajax.tag.getAll(function(tags) {
                    $('#tag-raw-size').text($.ShanFox.data.rawExtSize);
                    $.ShanFox.ui.tagList.render($.ShanFox.data.tags);
                    // 默认选择无标签的列表
                    $.ShanFox.ui.switchTag(null);
                });
            } else {
                $('#tag-raw-size').text($.ShanFox.data.rawExtSize);
                $.ShanFox.ui.tagList.render($.ShanFox.data.tags);
                $.ShanFox.ui.switchTag($.ShanFox.ui.currentTag);
            }
        },
        showMarket : function(market) {
            if ($.ShanFox.ui.currentMarket === market) {
                return;
            }
            $.ShanFox.ui.currentMarket = market;
            // left menu
            $.ShanFox.ui.clearLeftMenuActive();
            $('#left-market').addClass('active');
            $('#left-market-' + $.ShanFox.ui.currentMarket).addClass('active');
            // clear global listener
            $.ShanFox.ui.clearAllListener();
            // ejs template to html
            var html = ejs.renderFile($.ShanFox.ui.template.marketContent, $.ShanFox.data.ejs, {cache:true});
            $('#page-right-content').html(html);
            // init market content
            $.ShanFox.ui.marketIFrame.registerResizeListener();
            var marketUrl = $.ShanFox.data.marketUrl[$.ShanFox.ui.currentMarket];
            $.ShanFox.ui.marketIFrame.setContent(marketUrl);
        },
        showInputDialog : function(titile, message, btnTxt, okCallback, closeCallback) {
            $(document.body).append(ejs.renderFile($.ShanFox.ui.template.inputDialog,
                {title:titile, message:message, btnTxt:btnTxt}, {cache:true}));
            $('#dialog-ok-btn').click(function(){
                var input = $('#dialog-input').val();
                $('#input-dialog').remove();// 必须是remove..
                if (okCallback) {
                    okCallback(input);
                }
            });
            $('#dialog-close-btn').click(function(){
                $('#input-dialog').remove();// 必须是remove..
                if (closeCallback) {
                    closeCallback();
                }
            });
        }
        // ========================== ui function [end] ========================== //
    }
};


// ========================== init logic [start] ========================== //
$(function () {
    $('#left-market-chrome').click(function(){
        $.ShanFox.ui.showMarket('chrome');
    });
    $('#left-market-baidu').click(function(){
        $.ShanFox.ui.showMarket('baidu');
    });
    $('#left-market-sougou').click(function(){
        $.ShanFox.ui.showMarket('sougou');
    });
    $('#left-market-360jisu').click(function(){
        $.ShanFox.ui.showMarket('360jisu');
    });
    $('#left-market-360anquan').click(function(){
        $.ShanFox.ui.showMarket('360anquan');
    });
    $('#left-market-liebao').click(function(){
        $.ShanFox.ui.showMarket('liebao');
    });
    $('#left-market-uc').click(function(){
        $.ShanFox.ui.showMarket('uc');
    });
    var extensionMenu = $('#left-ext');
    extensionMenu.click(function(){
        $.ShanFox.ui.showExtension(0);
    });
    // default show extension
    extensionMenu.click();
});
// ========================== init logic [end] ========================== //

