/**
 * Created by jason on 2015/11/9.
 */

/**
 * UI Component. ExpandListView
 */
function ExpandListView(colCount) {
    this.more = true;
    this.loading = false;
    this.colCount = colCount;
    this.scrollListener = null;
    /**
     * Get extensions data by page.
     * @param url
     * @param httpOption contains 'offset' and 'count'
     * @param callback
     */
    this.getExtByPage = function(url, httpOption, callback) {
        if (!this.more || this.loading) {
            if(callback) {
                callback(null);
            }
            return;
        }
        this.loading = true;
        var that = this;
        $('#ext-loading').show();
        setTimeout(function(){
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: httpOption,
                success: function(data, textStatus, xhr) {
                    var loadedCount = parseInt(data.count);
                    if (loadedCount < httpOption.count) {
                        // no more data.
                        that.more = false;
                        $('#ext-loading-word').text('no more data');
                    }
                    if (loadedCount == -1) {
                        console.log(new Date().toString(), 'no more data!');
                        that.loading = false;
                        if(callback) {
                            callback(null);
                        }
                        return;
                    }
                    if (data.exts) {
                        that.renderExtList(data.exts);
                        if(callback) {
                            callback(data.exts);
                        }
                    } else {
                        if(callback) {
                            callback(null);
                        }
                    }
                    $('#ext-loading').hide();
                    that.loading = false;
                },
                error: function(xmlHttpRequest, textStatus, errorThrown) {
                    $('#ext-loading').hide();
                    console.log(new Date().toString(), 'error!' + errorThrown.toString());
                    that.loading = false;
                    if(callback) {
                        callback(null);
                    }
                }
            });
        }, 3000);
    };
    /**
     * exts=[{id:asdf6asdfasa3sdfasdfasasdfasdfas, name:HelloWord, size:704, tag:['娱乐']}, ...]
     * @param exts
     */
    this.renderExtList = function(exts) {
        if (!exts || exts.length <= 0) return;

        var content = '';
        var index = 0;
        var rowCount = Math.ceil(exts.length / this.colCount);
        for(var row = 0; row < rowCount; row++) {
            content = content + '<div class="row">';
            for(var i = 0; i < this.colCount; i++) {
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
    this.clearExtList = function() {
        $('#ext-list').html('<div class="col-lg-12  col-xs-12" style="height:60px" id="ext-loading">' +
        '<div style="position:absolute;top:50%;left:50%;font-size:30px">' +
        '<i class="fa fa-refresh fa-spin"></i><small style="margin-left:30px" id="ext-loading-word">loading...</small>' +
        '</div></div>');
        $('#ext-loading').hide();
    };
    this.registerScrollListener = function(url, httpOptionFn, callback) {
        if(this.scrollListener) return;
        var that = this;
        this.scrollListener = function() {
            // When scroll at bottom, invoked getExtByPage() function.
            if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                console.log(new Date().toString(), 'scroll bottom');
                if (that.more && !that.loading) {
                    var httpOption = httpOptionFn();
                    console.log(new Date().toString(), 'getMore data, offset:' + httpOption.offset);
                    that.getExtByPage(url, httpOption, callback);
                }
            }
        };
        $(window).bind('scroll', this.scrollListener);
    };
    this.unregisterScrollListener = function() {
        if(!this.scrollListener) return;
        $(window).unbind('scroll', this.scrollListener);
        this.scrollListener = null;
    }
}

/**
 * UI Component. FullHeightIFrame
 */
function FullHeightIFrame(frameId, wrapperHeight) {
    this.frameId = frameId;
    this.wrapperHeight = wrapperHeight;
    this.resizeListener = null;
    this.setContent = function(url){
        var iframe = $(this.frameId);
        if (iframe) {
            iframe.attr('src', url);
            // set height
            var content_height = parseInt($('#page-right-content').css('min-height'));
            console.log(new Date().toString(), 'init! content_min_height:' + content_height);
            iframe.attr('height', content_height - this.wrapperHeight);
        }
    };
    this.registerResizeListener = function() {
        if(this.resizeListener) return;
        var that = this;
        this.resizeListener = function() {
            var iframe = $(that.frameId);
            if (iframe) {
                var content_height = parseInt($('#page-right-content').css('min-height'));
                console.log(new Date().toString(), 'resize! content_min_height:' + content_height);
                iframe.attr('height', content_height - that.wrapperHeight);
            }
        };
        $(window).bind('resize', this.resizeListener);
    };
    this.unregisterResizeListener = function() {
        if(!this.resizeListener) return;
        $(window).unbind('resize', this.resizeListener);
        this.resizeListener = null;
    };
}

$.ShanFox = {
    url : {
        tagged : 'ext/tagged/getAllByPage',
        raw : 'ext/raw/getAllByPage'
    },
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
        taggedList : new ExpandListView(4),
        rawList : new ExpandListView(4),
        marketIFrame : new FullHeightIFrame('#market-iframe', 40)
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
         * exts = {
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
         *     ...
         * ]
         */
        rawExts: []
    }
};

$.ShanFox.switchTag = function(tag) {
    $.ShanFox.ui.currentTag = tag;
    $.ShanFox.ui.taggedList.clearExtList();
    if (!$.ShanFox.data.taggedExts[tag] || $.ShanFox.data.taggedExts[tag].length == 0) {
        $.ShanFox.ui.taggedList.getExtByPage($.ShanFox.url.tagged,
            {
                offset : 0,
                count : 24,
                tag : $.ShanFox.ui.currentTag
            }, function(exts) {
                if (exts && exts.length > 0) {
                    if(!$.ShanFox.data.taggedExts[tag]) {
                        $.ShanFox.data.taggedExts[tag] = [];
                    }
                    $.ShanFox.data.taggedExts[tag] = $.ShanFox.data.taggedExts[tag].concat(exts);
                }
            });
    } else {
        $.ShanFox.ui.taggedList.renderExtList($.ShanFox.data.taggedExts[$.ShanFox.ui.currentTag]);
    }
};

$.ShanFox.switchContent = function(index, market) {
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
    $.ShanFox.ui.rawList.unregisterScrollListener();
    $.ShanFox.ui.taggedList.unregisterScrollListener();
    $.ShanFox.ui.marketIFrame.unregisterResizeListener();
    switch (index) {
        case 0:
            $('#left-tagged').addClass('active');
            if (!$.ShanFox.data.tags) {
                getAllTags(function(tags) {
                    var tag = null;
                    if (tags) {
                        for(var t1 in tags) {
                            tag = t1;
                            break;
                        }
                    }
                    if(!tag) return;
                    $.ShanFox.switchTag(tag);
                });
            } else {
                renderTagList($.ShanFox.data.tags);
                $.ShanFox.switchTag($.ShanFox.ui.currentTag);
            }
            $.ShanFox.ui.taggedList.registerScrollListener($.ShanFox.url.tagged,
                function() {
                    return {
                        offset : $.ShanFox.data.taggedExts[$.ShanFox.ui.currentTag] ?
                            $.ShanFox.data.taggedExts[$.ShanFox.ui.currentTag].length : 0,
                        count : 24,
                        tag : $.ShanFox.ui.currentTag
                    };
                }, function(exts) {
                    if (exts && exts.length > 0) {
                        if(!$.ShanFox.data.taggedExts[$.ShanFox.ui.currentTag]) {
                            $.ShanFox.data.taggedExts[$.ShanFox.ui.currentTag] = [];
                        }
                        $.ShanFox.data.taggedExts[$.ShanFox.ui.currentTag] =
                            $.ShanFox.data.taggedExts[$.ShanFox.ui.currentTag].concat(exts);
                    }
                });

            break;
        case 1:
            $('#left-raw').addClass('active');
            if ($.ShanFox.data.rawExts.length == 0) {
                $.ShanFox.ui.rawList.getExtByPage($.ShanFox.url.raw,
                    function() {
                        return {
                            offset : $.ShanFox.data.rawExts.length,
                            count : 24
                        };
                    }, function(exts) {
                        if (exts && exts.length > 0) {
                            $.ShanFox.data.rawExts = $.ShanFox.data.rawExts.concat(exts);
                        }
                    });
            } else {
                $.ShanFox.ui.rawList.renderExtList($.ShanFox.data.rawExts);
            }
            $.ShanFox.ui.rawList.registerScrollListener($.ShanFox.url.raw,
                {
                    offset : $.ShanFox.data.rawExts.length,
                    count : 24
                }, function(exts) {
                    if (exts && exts.length > 0) {
                        $.ShanFox.data.rawExts = $.ShanFox.data.rawExts.concat(exts);
                    }
                });
            break;
        case 2:
            $('#left-market').addClass('active');
            $('#left-market-' + $.ShanFox.ui.currentMarket).addClass('active');
            $.ShanFox.ui.marketIFrame.registerResizeListener();
            var marketUrl = $.ShanFox.marketUrl[$.ShanFox.ui.currentMarket];
            $.ShanFox.ui.marketIFrame.setContent(marketUrl);
            break;
    }
};


// init
$(function () {
    $('#left-tagged').click(function(){
        $.ShanFox.switchContent(0);
    });
    $('#left-raw').click(function(){
        $.ShanFox.switchContent(1);
    });
    $('#left-market-chrome').click(function(){
        $.ShanFox.switchContent(2, 'chrome');
    });
    $('#left-market-baidu').click(function(){
        $.ShanFox.switchContent(2, 'baidu');
    });
    $('#left-market-sougou').click(function(){
        $.ShanFox.switchContent(2, 'sougou');
    });
    $('#left-market-360jisu').click(function(){
        $.ShanFox.switchContent(2, '360jisu');
    });
    $('#left-market-360anquan').click(function(){
        $.ShanFox.switchContent(2, '360anquan');
    });
    $('#left-market-liebao').click(function(){
        $.ShanFox.switchContent(2, 'liebao');
    });
    $('#left-market-uc').click(function(){
        $.ShanFox.switchContent(2, 'uc');
    });
    // init default right content
    $.ShanFox.switchContent(0);
});


function getAllTags(callback) {
    $.getJSON('ext/getAllTag', function(data) {
        $.ShanFox.data.tags = data;
        renderTagList(data);
        if(callback) {
            callback(data);
        }
    })
}

function onClickTag(tag) {
    console.log(new Date().toString(), 'onClickTag!tag:' + tag);
    $.ShanFox.switchTag(tag);
}

/**
 * tags = {
 *   '购物': 112,
 *   '娱乐'：12344，
 *   ...
 * }
 * @param tags
 */
function renderTagList(tags) {
    if (!tags) return;

    var content = '';
    for(var tag in tags) {
        content = content + '<li onclick="onClickTag(\'' + tag + '\')">' +
        '<a href="#"><i class="fa fa-circle-o text-yellow"></i>' + tag +
        '<span class="badge bg-yellow" style="margin-left:10px">' + tags[tag] + '</span>' +
        '</a>' +
        '<div style="position:absolute;right:10px;top:10px" class="pull-right">' +
        '<button type="button" class="btn btn-box-tool">' +
        '<i class="fa fa-times"></i></button></div></li>';
    }
    $('#tag-list').html(content);
}