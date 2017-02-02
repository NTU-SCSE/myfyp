$(document).ready(function () {
  var $li = $('<li id="concept-tree"></li>');

  if (concept_tree == null) {
    $li.append('No concept identified from search results');
    $li.appendTo("#sidebar");
  } else {
    $li.append('<b>' + concept_tree.name + '</b>');
    $li.appendTo("#sidebar");

    var $ul = $('<ul></ul>');
    getList(concept_tree.children, $ul);
    $ul.appendTo("#concept-tree");
  }

  $('#sidebar').treed();
});