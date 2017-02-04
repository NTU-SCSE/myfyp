var mapped = [], shown = [];


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
    $(this).toggleClass("active");

    var concept_id = this.id,
        $pdfViewer = $('#pdf-viewer').contents();

    if ($(this).hasClass("active")) { // Show the term highlight in PDF.
      if (mapped.indexOf(concept_id) > -1) {
        // C2t Mappings were retrieved before. Simply add two classes (.highlight & .mapping).
        $pdfViewer
            .find("span[data-concept-id='" + concept_id + "']")
            .addClass("highlight mapping");
        shown.push(concept_id);
      } else {
        // GET the c2t mappings from server and add <span> to highlight the matched terms.
        addSpanTohighlightTerms(concept_id);
        mapped.push(concept_id);
        shown.push(concept_id);
      }
    } else { // Hide the term highlight in PDF. Simply remove two classes(.highlight & .mapping).
      $pdfViewer
          .find("span[data-concept-id='" + concept_id + "']")
          .removeClass("highlight mapping");
      removeFromMapped(concept_id);
    }
  });
});


$(window).on('load', function(){
  var $pdfViewer = $('#pdf-viewer').contents();
  $pdfViewer[0].addEventListener("pagerendered", function() {
    // console.log('hi');
  });
});


function removeFromMapped(concept_id) {
  var index = shown.indexOf(concept_id);
  if (index > -1) {
    shown.splice(index, 1);
  }
}


function addSpanTohighlightTerms(concept_id) {
  $.get('/mappings/', {section: section_id, concepts: JSON.stringify([concept_id])}, function (data) {
    var terms = data[concept_id];
    for (var i = 0; i < terms.length; i++) {
      addSpanForOneTerm(concept_id, terms[i][0], terms[i][1]);
    }
  }, "json");
}


function addSpanForOneTerm(concept_id, term, nth_match) {
  var $pdfViewer = $('#pdf-viewer').contents(),
      count = 0;

  $pdfViewer
      .find("#viewer .textLayer > div:icontains('" + term + "')")
      .each(function() {
        var matches = getImatchIndexes($(this).text(), term);

        for (var i = 0; i < matches.length; i++) {
          count++;
          if (nth_match.indexOf(count) > -1) {
            var text = $(this).text(),
                $span = $("<span class='highlight mapping'></span>");
            $span.attr("data-concept-id", concept_id);
            $span.text(term);
            $(this).html(text.substr(0, matches[i]) + $span[0].outerHTML + text.substr(matches[i] + term.length));
          }
        }
      });
}


$.expr[':'].icontains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};


function getImatchIndexes(str, term) {
  var term_length = term.length,
      index_matches = [],
      match,
      i = 0;

  str = str.toLowerCase();
  term = term.toLowerCase();

  while ((match = str.indexOf(term, i)) > -1) {
    index_matches.push(match);
    i = match + term_length;
  }

  return index_matches;
}


