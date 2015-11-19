/**
 * Created by jason on 2015/11/9.
 */

/**
 * UI Component. ExpandListView
 */
function ExpandListView(colCount, httpFn) {
    this.more = true;
    this.loading = false;
    this.colCount = colCount;
    this.scrollListener = null;
    /**
     * the ajax function to get more data. function(callbcak(<Object>data, <boolean>hasMore))
     */
    this.httpFn = httpFn;

    if (typeof this.loadMore != 'function') {
        /**
         * Get extensions data by page.
         */
        ExpandListView.prototype.loadMore = function () {
            if (!this.more || this.loading || !this.httpFn) {
                return;
            }
            this.loading = true;
            var that = this;
            this.httpFn(function (data, hasMore) {
                if (!hasMore) {
                    that.more = false;
                    $('#ext-loading-word').text('no more data');
                }
                if (data) {
                    that.renderExtList(data);
                }
                $('#ext-loading').hide();
                that.loading = false;
            });
        };
        /**
         * exts=[{id:asdf6asdfasa3sdfasdfasasdfasdfas, name:HelloWord, size:704, tag:['娱乐']}, ...]
         * @param exts
         */
        ExpandListView.prototype.renderExtList = function (exts) {
            if (!exts || exts.length <= 0) return;

            var content = '';
            var index = 0;
            var rowCount = Math.ceil(exts.length / this.colCount);
            for (var row = 0; row < rowCount; row++) {
                content = content + '<div class="row">';
                for (var i = 0; i < this.colCount; i++) {
                    if (index >= exts.length) {
                        break;
                    }
                    var ext = exts[index];
                    content = content + '<div class="col-lg-3 col-xs-6"><div class="small-box bg-aqua">' +
                    '<div class="inner"><h3>' + ext.size + '</h3><p>' + ext.name + '</p></div>' +
                    '<div class="icon"><i class="ion ion-bag"></i></div>' +
                    '<a href="#" class="small-box-footer">More info <i class="fa fa-arrow-circle-right"></i></a></div></div>';
                    index++;
                }
                content = content + '</div>';
            }
            content = content + '<div class="col-lg-12  col-xs-12" style="height:60px" id="ext-loading">' +
            '<div style="position:absolute;top:50%;left:50%;font-size:30px">' +
            '<i class="fa fa-refresh fa-spin"></i><small style="margin-left:30px" id="ext-loading-word">loading...</small>' +
            '</div></div>';
            $('#ext-loading').remove();// 必须是remove..
            $('#ext-list').append(content);
        };
        ExpandListView.prototype.clearExtList = function () {
            $('#ext-list').html('<div class="col-lg-12  col-xs-12" style="height:60px" id="ext-loading">' +
            '<div style="position:absolute;top:50%;left:50%;font-size:30px">' +
            '<i class="fa fa-refresh fa-spin"></i><small style="margin-left:30px" id="ext-loading-word">loading...</small>' +
            '</div></div>');
            $('#ext-loading').hide();
        };
        ExpandListView.prototype.registerScrollListener = function () {
            if (this.scrollListener) return;
            var that = this;
            this.scrollListener = function () {
                // When scroll at bottom, invoked loadMore() function.
                if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                    console.log(new Date().toString(), 'scroll bottom');
                    if (that.more && !that.loading && that.httpFn) {
                        console.log(new Date().toString(), 'loadMore!');
                        that.loadMore(that.httpFn);
                    }
                }
            };
            $(window).bind('scroll', this.scrollListener);
        };
        ExpandListView.prototype.unregisterScrollListener = function () {
            if (!this.scrollListener) return;
            $(window).unbind('scroll', this.scrollListener);
            this.scrollListener = null;
        }
    }
}

/**
 * UI Component. FullHeightIFrame
 */
function FullHeightIFrame(frameId, wrapperHeight) {
    this.frameId = frameId;
    this.wrapperHeight = wrapperHeight;
    this.resizeListener = null;

    if (typeof this.setContent != 'function') {
        FullHeightIFrame.prototype.setContent = function (url) {
            var iframe = $(this.frameId);
            if (iframe) {
                iframe.attr('src', url);
                // set height
                var content_height = parseInt($('#page-right-content').css('min-height'));
                console.log(new Date().toString(), 'init! content_min_height:' + content_height);
                iframe.attr('height', content_height - this.wrapperHeight);
            }
        };
        FullHeightIFrame.prototype.registerResizeListener = function () {
            if (this.resizeListener) return;
            var that = this;
            this.resizeListener = function () {
                var iframe = $(that.frameId);
                if (iframe) {
                    var content_height = parseInt($('#page-right-content').css('min-height'));
                    console.log(new Date().toString(), 'resize! content_min_height:' + content_height);
                    iframe.attr('height', content_height - that.wrapperHeight);
                }
            };
            $(window).bind('resize', this.resizeListener);
        };
        FullHeightIFrame.prototype.unregisterResizeListener = function () {
            if (!this.resizeListener) return;
            $(window).unbind('resize', this.resizeListener);
            this.resizeListener = null;
        };
    }
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
        contentEjs : [
            '<%- include(\'views/partials/content-tagged.ejs\') %>',
            '<%- include(\'views/partials/content-raw.ejs\') %>',
            '<%- include(\'views/partials/content-market.ejs\') %>'
        ],
        taggedList : {},
        rawList : null,
        marketIFrame : new FullHeightIFrame('#market-iframe', 40),
        // ========================== ui function [start] ========================== //
        onClickRemoveTag : function(event, element, tag) {
            event.preventDefault();
            event.stopPropagation();
            $.ShanFox.ajax.tag.remove(tag, function(result) {
                if (result) {
                    $.AdminLTE.boxWidget.remove($(element));
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
            });
        },
        onClickAddTag : function(tag) {
            $.ShanFox.ajax.tag.add(tag, function(result) {
                if (result) {
                    // render new tagList
                    $.ShanFox.ui.renderTagList($.ShanFox.data.tags);
                    // if currentTag is null. switch to new added tag
                    if (!$.ShanFox.ui.currentTag) {
                        $.ShanFox.ui.switchTag(tag);
                    }
                } else {
                    alert('添加标签[' + tag + ']失败!');
                }
                // 触发#tag-add-btn的onClickEdit逻辑
                $("#tag-add-btn").click()
            });
        },
        onClickEdit : function(event, element) {
            event.preventDefault();
            event.stopPropagation();
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
        },
        renderTagList : function(tags) {
            if (!tags) return;

            var content = '';
            for(var tag in tags) {
                content = content + '<li class="box" onclick="$.ShanFox.ui.switchTag(\'' + tag + '\')">' +
                '<a href="#"><i class="fa fa-circle-o text-yellow"></i>' + tag +
                '<span class="badge bg-yellow" style="margin-left:10px">' + tags[tag] + '</span>' +
                '</a>' +
                '<div style="position:absolute;right:10px;top:10px" class="pull-right">' +
                '<button type="button" class="btn btn-box-tool" onclick="$.ShanFox.ui.onClickRemoveTag(event,this,\'' + tag + '\')">' +
                '<i class="fa fa-times"></i></button></div></li>';
            }
            $('#tag-list').html(content);
        },
        switchTag : function(tag) {
            $.ShanFox.ui.currentTag = tag;
            if (!tag) {// tag is null, clear the page
                $('#header-selected-tag').html('当前无标签，请添加');
                $('#ext-list').html('');
            } else {
                $('#header-selected-tag').html(tag + '  <small>共' + $.ShanFox.data.tags[tag] + '个</small>');
                if (!$.ShanFox.ui.taggedList[tag]) {// new taggList for [tag]
                    $.ShanFox.ui.taggedList[tag] = new ExpandListView(4, $.ShanFox.ajax.extension.getTaggedByPage);
                }
                $.ShanFox.ui.taggedList[tag].registerScrollListener();
                $.ShanFox.ui.taggedList[tag].clearExtList();
                if (!$.ShanFox.data.taggedExts[tag] || $.ShanFox.data.taggedExts[tag].length == 0) {
                    $.ShanFox.ui.taggedList[tag].loadMore();
                } else {
                    $.ShanFox.ui.taggedList[tag].renderExtList($.ShanFox.data.taggedExts[$.ShanFox.ui.currentTag]);
                }
            }
        },
        switchContent : function(index, market) {
            if (index < 0 || index >= $.ShanFox.ui.contentEjs.length) {
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
            var html = ejs.render($.ShanFox.ui.contentEjs[index], $.ShanFox.data.ejs);
            var pageRightContent = $('#page-right-content');
            pageRightContent.html(html);

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

            // render right content
            for (var tag in $.ShanFox.ui.taggedList) {
                $.ShanFox.ui.taggedList[tag].unregisterScrollListener();
            }
            if ($.ShanFox.ui.rawList) {
                $.ShanFox.ui.rawList.unregisterScrollListener();
            }
            $.ShanFox.ui.marketIFrame.unregisterResizeListener();
            switch (index) {
                case 0:
                    $('#left-tagged').addClass('active');
                    //$('#tag-add-btn').click(function() {
                    //    console.log(new Date().toString(), 'click add btn!');
                    //    $.ShanFox.ui.showInputDialog('添加标签','请输入标签(不能重复)','确定', function(input) {
                    //        $.ShanFox.ui.onClickAddTag(input)
                    //    });
                    //});
                    $('#tag-add-btn').click(function(event) {
                        $.ShanFox.ui.onClickEdit(event, $(this));
                    });
                    $('#tag-add-confirm-btn').click(function(event) {
                        event.preventDefault();
                        event.stopPropagation();
                        var inputComponent = $('#tag-input');
                        var input = inputComponent.val();
                        inputComponent.val('');// 清空
                        $.ShanFox.ui.onClickAddTag(input)
                    });
                    if (!$.ShanFox.data.tags) {
                        $.ShanFox.ajax.tag.getAll(function(tags) {
                            $.ShanFox.ui.renderTagList($.ShanFox.data.tags);
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
                        $.ShanFox.ui.renderTagList($.ShanFox.data.tags);
                        $.ShanFox.ui.switchTag($.ShanFox.ui.currentTag);
                    }
                    break;
                case 1:
                    $('#left-raw').addClass('active');
                    if (!$.ShanFox.ui.rawList) {// new rawList
                        $.ShanFox.ui.rawList = new ExpandListView(4, $.ShanFox.ajax.extension.getRawByPage);
                    }
                    if ($.ShanFox.data.rawExts.length == 0) {
                        $.ShanFox.ui.rawList.loadMore();
                    } else {
                        $.ShanFox.ui.rawList.renderExtList($.ShanFox.data.rawExts);
                    }
                    $.ShanFox.ui.rawList.registerScrollListener();
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
        showInputDialog : function(titile, message, btnTxt, okCallback, closeCallback) {
            $(document.body).append('<div id="input-dialog" style="position: fixed;top:0;right:0;bottom:0;left:0;z-index:9999">' +
            '<div style="position:fixed;top:0;right:0;bottom:0;left:0;background-color:#000;opacity: 0.5"></div>' +
            '<div class="login-box">' +
            '<div class="box box-primary box-solid">' +
            '<div class="box-header with-border">' +
            '<h3 class="box-title">' + titile + '</h3>' +
            '<div class="box-tools pull-right">' +
            '<button type="button" class="btn btn-box-tool" id="dialog-close-btn">' +
            '<i class="fa fa-times"></i></button>' +
            '</div>' +
            '</div>' +
            '<div class="box-body">' + message + '</div>' +
            '<div class="box-footer">' +
            '<div class="input-group">' +
            '<input type="text" id="dialog-input" class="form-control">' +
            '<span class="input-group-btn"><button class="btn btn-primary btn-flat" id="dialog-ok-btn">' + btnTxt + '</button></span>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');
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

