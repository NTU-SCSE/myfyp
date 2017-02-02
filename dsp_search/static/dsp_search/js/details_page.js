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

  // $( "#concept-tree li > a" ).click(function() {
  //   var $pdfViewer = $('#pdf-viewer').contents();
  //   // var $match = $pdfViewer.find("#viewer .textLayer > div:contains('networks')").eq(2);
  //   // var newText = $match.text().replace("networks", "</span class='highlight selected'>networks<span>");
  //   // console.log(newText);
  //   // $match.html(newText);
  //   });
});


