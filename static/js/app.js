/**
 * Created by jason on 2015/11/9.
 */


$.ShanFox = {};

/**
 * Get extensions data by page.
 * @param options contains 'offset' and 'count'
 * @param callback
 */
$.ShanFox.getExtByPage = function(options, callback) {
    if (!$.ShanFox.more || $.ShanFox.loading) {
        if(callback) {
            callback(false);
        }
        return;
    }
    $.ShanFox.loading = true;
    setTimeout(function(){
        $.ajax({
            url: 'exts/getByPage',
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: {offset : options.offset, count : options.count},
            success: function(data, textStatus, xhr) {
                var loadedCount = parseInt(data.count);
                if (loadedCount < options.count) {
                    // no more data.
                    $.ShanFox.more = false;
                    $('#ext-loading-word').text('no more data');
                }
                if (loadedCount == -1) {
                    console.log(new Date().toString(), 'no more data!');
                    $.ShanFox.loading = false;
                    if(callback) {
                        callback(false);
                    }
                    return;
                }
                if (data.exts) {
                    //if (options.offset == 0) {
                    renderExts(data.exts);
                    //}
                    options.offset = options.offset + loadedCount;
                    if(callback) {
                        callback(true);
                    }
                } else {
                    if(callback) {
                        callback(false);
                    }
                }
                $('#ext-loading').hide();
                $.ShanFox.loading = false;
            },
            error: function(xmlHttpRequest, textStatus, errorThrown) {
                $('#ext-loading').hide();
                console.log(new Date().toString(), 'error!' + errorThrown.toString());
                $.ShanFox.loading = false;
                if(callback) {
                    callback(false);
                }
            }
        });
    }, 3000);

};

// init
$(function () {
    $.ShanFox.myOpt = {
        offset:0,
        count:40
    };
    $.ShanFox.more = true;
    $.ShanFox.loading = false;
    $('#ext-loading').show();
    $.ShanFox.getExtByPage($.ShanFox.myOpt);
    registerScrollListener();
});

function registerScrollListener() {
    $(window).scroll(function() {
        // When scroll at bottom, invoked getData() function.
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            console.log(new Date().toString(), 'scroll bottom');
            if ($.ShanFox.more && !$.ShanFox.loading) {
                console.log(new Date().toString(), 'getMore data, offset:' + $.ShanFox.myOpt.offset);
                $('#ext-loading').show();
                $.ShanFox.getExtByPage($.ShanFox.myOpt);
            }
        }
    });
}

function renderExts(exts) {
    if (!exts || exts.length <= 0) return;

    var content = '';
    var index = 0;
    var rowCount = Math.ceil(exts.length / 4);
    for(var row = 0; row < rowCount; row++) {
        content = content + '<div class="row">';
        for(var i = 0; i < 4; i++) {
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
    $('#ext-loading').remove();
    $('#ext-list').append(content);
}