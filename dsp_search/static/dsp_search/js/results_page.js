$(document).ready(function () {
  var $li = $('<li id="concept-tree"></li>');

  if (conceptTree == null) {
    $li.append('No concept identified from search results');
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