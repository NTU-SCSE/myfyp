$(document).ready(function () {
  var $li = $('<li id="concept-tree"></li>');

  if (concept_tree == null) {
    $li.append('No concept identified for this section');
    $li.appendTo("#sidebar");
  } else {
    $li.append('<b>' + concept_tree.name + '</b>');
    $li.appendTo("#sidebar");

    var $ul = $('<ul></ul>');
    getList(concept_tree.children, $ul);
    $ul.appendTo("#concept-tree");
  }

  $('#sidebar').treed();

  $( "#concept-tree li > a" ).click(function() {
    var concept_id = this.id;
    $.get('/mappings/', {section:section_id, concepts: JSON.stringify([concept_id])}, function(data){
      
      var terms = data[concept_id];
      for (var i = 0; i < terms.length; i++) {
        console.log(terms[i][0]);
      }
    }, "json");

  });
});

// function highlightTerms() {
//
// }