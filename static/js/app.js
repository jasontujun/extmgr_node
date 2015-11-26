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
 *          droppable_scope: [string]
 *          droppable_drop: [function(event, ui, data)]
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
    this.droppable_scope = opt.droppable_scope;
    this.droppable_drop = opt.droppable_drop;

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
            $('#expandlist-item-' + data.id + '> .small-box').droppable({
                tolerance : 'intersect',
                hoverClass : 'bg-aqua-active',
                scope : this.droppable_scope ? this.droppable_scope : 'default',
                drop : function(event, ui) {
                    if (that.droppable_drop) {
                        that.droppable_drop(event, ui, data);
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
                $('#expandlist-item-' + data[k].id + '> .small-box').droppable({
                    tolerance : 'intersect',
                    hoverClass : 'bg-aqua-active',
                    scope : this.droppable_scope ? this.droppable_scope : 'default',
                    drop : function(droppableData) {
                        return function(event, ui) {
                            if (that.droppable_drop) {
                                that.droppable_drop(event, ui, droppableData);
                            }
                        }
                    }(data[k])
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
 *          draggable: [boolean]
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
    this.draggable = opt.draggable;
    this.draggable_scope = opt.draggable_scope;
    this.render = function (tags) {
        if (!tags) return;
        // generate html
        var index = 0;
        var content = '';
        for(var tag in tags) {
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
            if (this.draggable) {// set draggable
                var item = $('#' + this.prefix + '-item-id-' + index);
                item.data('data', tag2);
                item.css({cursor: 'move'});
                item.draggable({
                    scope : this.draggable_scope ? this.draggable_scope : 'default',
                    zIndex: 1070,
                    revert: true,
                    cursor : 'move',
                    opacity : 0.5,
                    delay : 50, // prevent unwanted drags when clicking on an element
                    distance: 5 // prevent unwanted drags when clicking on an element
                });
            }
            if (this.selectFn) {//  set selectFn
                var item = $('#' + this.prefix + '-item-id-' + index);
                item.css({cursor: 'pointer'});
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


$.ShanFox = {
    marketUrl : {
        chrome: 'https://chrome.google.com/webstore/category/extensions?hl=zh-CN',
        baidu: 'http://chajian.baidu.com/',
        sougou: 'http://ie.sogou.com/app/',
        '360jisu' : 'https://ext.chrome.360.cn/webstore/category/%E5%85%A8%E9%83%A8/%E6%9C%AC%E5%91%A8%E7%83%AD%E9%97%A8',
        '360anquan' : 'https://ext.se.360.cn/webstore/home',
        liebao: 'http://store.liebao.cn/',
        uc: 'http://extensions.uc.cn/newindex.htm#!hot/recommendation'
    },
    ui : {
        currentTag: null,
        currentIndex : -1,
        currentMarket : null,
        template : {
            0: 'views/partials/content-tagged.ejs',
            1: 'views/partials/content-raw.ejs',
            2: 'views/partials/content-market.ejs',
            extItem : 'views/partials/item-extension.ejs',
            tagItem : 'views/partials/item-tag.ejs',
            loading : 'views/partials/list-loading.ejs',
            inputDialog : 'views/partials/dialog-input.ejs'
        },
        taggedTagList : null,
        taggedList : {},// {tagName : ExpandListView}
        rawTagList : null,
        rawList : null,
        marketIFrame : new FullHeightIFrame('#market-iframe', '#page-right-content', 35),
        // ========================== ui function [start] ========================== //
        createTagList : function(prefix, draggable, selectFn) {
            return new EditableListView({
                prefix: prefix,
                parentSelector : '#tag-list',
                addBtnSelector : '#tag-add-btn',
                confirmBtnSelector : '#tag-add-confirm-btn',
                inputSelector : '#tag-input',
                itemTemplate : $.ShanFox.ui.template.tagItem,
                addFn : function(inputTag, callback) {
                    $.ShanFox.ajax.tag.add(inputTag, function(result) {
                        if (result) {
                            // if currentTag is null. switch to new added tag
                            if (!$.ShanFox.ui.currentTag) {
                                $.ShanFox.ui.switchTag(inputTag);
                            }
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
                            // remove taggedList for [tag]
                            delete $.ShanFox.ui.taggedList[tag];
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
                selectFn : selectFn,
                draggable : draggable
            });
        },
        switchTag : function(tag) {
            $.ShanFox.ui.currentTag = tag;
            if (!tag) {// tag is null, clear the page
                $('#header-selected-tag').html('当前无标签，请添加');
                $('#ext-list').html('');
            } else {
                $('#header-selected-tag').html(tag + '  <small>共' + $.ShanFox.data.tags[tag] + '个</small>');
                if (!$.ShanFox.ui.taggedList[tag]) {// new taggList for [tag]
                    $.ShanFox.ui.taggedList[tag] = new ExpandListView({
                        parentSelector : '#ext-list',
                        loadingSelector : '#list-loading',
                        itemTemplate : $.ShanFox.ui.template.extItem,
                        loadingTemplate : $.ShanFox.ui.template.loading,
                        colCount : 4,
                        httpFn : $.ShanFox.ajax.extension.getTaggedByPage
                    });
                }
                $.ShanFox.ui.taggedList[tag].registerScrollListener();
                $.ShanFox.ui.taggedList[tag].clear();
                if (!$.ShanFox.data.taggedExts[tag] || $.ShanFox.data.taggedExts[tag].length == 0) {
                    $.ShanFox.ui.taggedList[tag].loadMore();
                } else {
                    $.ShanFox.ui.taggedList[tag].render($.ShanFox.data.taggedExts[$.ShanFox.ui.currentTag]);
                }
            }
        },
        switchContent : function(index, market) {
            if (index < 0 || index >= $.ShanFox.ui.template.length) {
                return;
            }
            if ($.ShanFox.ui.currentIndex === index) {
                if (index == 2 && market && $.ShanFox.ui.currentMarket !== market) {
                    $.ShanFox.ui.currentMarket = market;
                } else {
                    return;
                }
            }
            $.ShanFox.ui.currentIndex = index;

            // ejs template to html
            var html = ejs.renderFile($.ShanFox.ui.template[index], $.ShanFox.data.ejs, {cache:true});
            $('#page-right-content').html(html);

            // refresh left menu
            $('#left-tagged').removeClass('active');
            $('#left-raw').removeClass('active');
            $('#left-market').removeClass('active');
            $('#left-market-chrome').removeClass('active');
            $('#left-market-baidu').removeClass('active');
            $('#left-market-sougou').removeClass('active');
            $('#left-market-360jisu').removeClass('active');
            $('#left-market-360anquan').removeClass('active');
            $('#left-market-liebao').removeClass('active');
            $('#left-market-uc').removeClass('active');

            // clear listener
            for (var tag in $.ShanFox.ui.taggedList) {
                $.ShanFox.ui.taggedList[tag].unregisterScrollListener();
            }
            if ($.ShanFox.ui.rawList) {
                $.ShanFox.ui.rawList.unregisterScrollListener();
            }
            $.ShanFox.ui.marketIFrame.unregisterResizeListener();
            // render right content
            switch (index) {
                case 0:
                    $('#left-tagged').addClass('active');
                    if (!$.ShanFox.ui.taggedTagList) {
                        $.ShanFox.ui.taggedTagList = $.ShanFox.ui.createTagList('tagged-tag-list',
                            false, $.ShanFox.ui.switchTag);
                    }
                    $.ShanFox.ui.taggedTagList.registerClickListener();
                    if (!$.ShanFox.data.tags) {
                        $.ShanFox.ajax.tag.getAll(function(tags) {
                            $.ShanFox.ui.taggedTagList.render($.ShanFox.data.tags);
                            var tag = null;
                            if (tags) {
                                for(var t1 in tags) {
                                    tag = t1;
                                    break;
                                }
                            }
                            if(!tag) return;
                            $.ShanFox.ui.switchTag(tag);
                        });
                    } else {
                        $.ShanFox.ui.taggedTagList.render($.ShanFox.data.tags);
                        $.ShanFox.ui.switchTag($.ShanFox.ui.currentTag);
                    }
                    break;
                case 1:
                    $('#left-raw').addClass('active');
                    if (!$.ShanFox.ui.rawTagList) {
                        $.ShanFox.ui.rawTagList = $.ShanFox.ui.createTagList('raw-tag-list', true, null);
                    }
                    $.ShanFox.ui.rawTagList.registerClickListener();
                    if (!$.ShanFox.data.tags) {
                        $.ShanFox.ajax.tag.getAll(function(tags) {
                            $.ShanFox.ui.rawTagList.render($.ShanFox.data.tags);
                            $.ShanFox.ui.showRawList();
                        });
                    } else {
                        $.ShanFox.ui.rawTagList.render($.ShanFox.data.tags);
                        $.ShanFox.ui.showRawList();
                    }
                    break;
                case 2:
                    $('#left-market').addClass('active');
                    $('#left-market-' + $.ShanFox.ui.currentMarket).addClass('active');
                    $.ShanFox.ui.marketIFrame.registerResizeListener();
                    var marketUrl = $.ShanFox.marketUrl[$.ShanFox.ui.currentMarket];
                    $.ShanFox.ui.marketIFrame.setContent(marketUrl);
                    break;
            }
        },
        showRawList : function() {
            if (!$.ShanFox.ui.rawList) {// new rawList
                $.ShanFox.ui.rawList = new ExpandListView({
                    parentSelector : '#ext-list',
                    loadingSelector : '#list-loading',
                    itemTemplate : $.ShanFox.ui.template.extItem,
                    loadingTemplate : $.ShanFox.ui.template.loading,
                    colCount : 4,
                    httpFn : $.ShanFox.ajax.extension.getRawByPage,
                    droppable : true,
                    droppable_drop : function(event, ui, data) {
                        console.log(new Date().toString(), '[droppable_drop] dataId:' + data.id + ',dataName:' + data.name);
                        var tag = ui.draggable.data('data');
                        var extTags = data.tag ? data.tag : [];
                        if (extTags.indexOf(tag) != -1) {
                            // tag exist, cannot add again!
                            alert('扩展[' + data.name + ']已包含标签[' + tag + ']，不可重复添加!');
                        } else {
                            var extId = data.id;
                            $.ShanFox.ajax.extension.addTag(extId, tag, function(result) {
                                if (result) {
                                    $.ShanFox.ui.rawList.refreshItem(data);
                                } else {
                                    alert('给扩展[' + data.name + ']添加标签[' + tag + ']失败!');
                                }
                            });
                        }
                    }
                });
            }
            if ($.ShanFox.data.rawExts.length == 0) {
                $.ShanFox.ui.rawList.loadMore();
            } else {
                $.ShanFox.ui.rawList.render($.ShanFox.data.rawExts);
            }
            $.ShanFox.ui.rawList.registerScrollListener();
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
    },
    data : {
        /**
         * tags = {
         *   '购物': 112,
         *   '娱乐'：12344，
         *   ...
         * }
         */
        tags: null,

        /**
         * taggedExts = {
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
        taggedExts : {},

        /**
         * rawExts = [
         *    {
         *         id:asdf6asdfasa3sdfasdfasasdfasdfas,
         *         name:HelloWord,
         *         size:704,
         *         tag:['娱乐']
         *     },
         *     ...]
         */
        rawExts: []
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
                            if($.ShanFox.data.tags) {
                                delete $.ShanFox.data.tags[tag];
                                delete $.ShanFox.data.taggedExts[tag];
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
                $.getJSON('tag/getAll', function(data) {
                    $.ShanFox.data.tags = data;
                    if(callback) {
                        callback(data);
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
                var offset = $.ShanFox.data.taggedExts[tag] ? $.ShanFox.data.taggedExts[tag].length : 0;
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
                            if(!$.ShanFox.data.taggedExts[tag]) {
                                $.ShanFox.data.taggedExts[tag] = [];
                            }
                            $.ShanFox.data.taggedExts[tag] = $.ShanFox.data.taggedExts[tag].concat(data.exts);
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
                var offset = $.ShanFox.data.rawExts.length;
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
                        if (data.exts && data.exts.length > 0) {
                            $.ShanFox.data.rawExts = $.ShanFox.data.rawExts.concat(data.exts);
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
                            var ext = null;
                            for (var i = 0; i < $.ShanFox.data.rawExts.length; i++) {
                                if(extId === $.ShanFox.data.rawExts[i].id) {
                                    ext = $.ShanFox.data.rawExts[i];
                                    break;
                                }
                            }
                            if (ext) {
                                if (ext.tag) {
                                    ext.tag.push(tag);
                                } else {
                                    ext.tag.push = [tag];
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
    }
};


// ========================== init logic [start] ========================== //
$(function () {
    $('#left-tagged').click(function(){
        $.ShanFox.ui.switchContent(0);
    });
    $('#left-raw').click(function(){
        $.ShanFox.ui.switchContent(1);
    });
    $('#left-market-chrome').click(function(){
        $.ShanFox.ui.switchContent(2, 'chrome');
    });
    $('#left-market-baidu').click(function(){
        $.ShanFox.ui.switchContent(2, 'baidu');
    });
    $('#left-market-sougou').click(function(){
        $.ShanFox.ui.switchContent(2, 'sougou');
    });
    $('#left-market-360jisu').click(function(){
        $.ShanFox.ui.switchContent(2, '360jisu');
    });
    $('#left-market-360anquan').click(function(){
        $.ShanFox.ui.switchContent(2, '360anquan');
    });
    $('#left-market-liebao').click(function(){
        $.ShanFox.ui.switchContent(2, 'liebao');
    });
    $('#left-market-uc').click(function(){
        $.ShanFox.ui.switchContent(2, 'uc');
    });
    // init default right content
    $.ShanFox.ui.switchContent(0);
});
// ========================== init logic [end] ========================== //

