
// init
$(function () {
    var base =
        '<header class="main-header"><%- include(\'views/partials/header.ejs\') %></header>' +
        '<aside class="main-sidebar"><%- include(\'views/partials/left.ejs\', {user: user}) %></aside>' +
        '<div class="content-wrapper" id="page-right-content"></div>' +
        '<footer class="main-footer"><%- include(\'views/partials/footer.ejs\') %></footer>' +
        '<%- include(\'views/partials/right.ejs\') %>';

    // render content by ejs
    var html = ejs.render(base, {user:'Leung'});
    $('#page-body').html(html);
});