$(document).ready(function () {
  var $li = $('<li id="concept-tree"></li>');

  if (conceptTree == null) {
    $li.append('No concept identified for this section');
    $li.appendTo("#sidebar");
  } else {
    $li.append('<b>' + conceptTree.name + '</b>');
    $li.appendTo("#sidebar");

    var $ul = $('<ul></ul>');
    getList(conceptTree.children, $ul);
    $ul.appendTo("#concept-tree");
  }

  $('#sidebar').treed();
});


function getList(item, $list) {
  if($.isArray(item)){
    $.each(item, function (key, value) {
      getList(value, $list);
    });
    return;
  }
  if (item) {
    var $li = $('<li />');
    if (item.name) {
      $li.append('<a href="#">' + item.name + '</a>');
    }
    if (item.children && item.children.length) {
      var $sublist = $("<ul/>");
      getList(item.children, $sublist);
      $li.append($sublist);
    }
    $list.append($li);
  }
}