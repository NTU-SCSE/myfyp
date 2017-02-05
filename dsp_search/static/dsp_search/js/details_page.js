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
        $pdf_viewer = $('#pdf-viewer').contents();

    if ($(this).hasClass("active")) { // Show the term highlight in PDF. Two cases.
      if (mapped.indexOf(concept_id) > -1) {
        // C2t Mappings were retrieved before. Simply add two classes (.highlight & .mapping).
        $pdf_viewer
            .find("span[data-concept-id='" + concept_id + "']")
            .addClass("highlight mapping");
        shown.push(concept_id);
      } else {
        // GET the c2t mappings from server and add <span> to highlight the matched terms.
        addSpan(concept_id, true);
        mapped.push(concept_id);
        shown.push(concept_id);
      }
    } else { // Hide the term highlight in PDF. Simply remove two classes(.highlight & .mapping).
      $pdf_viewer
          .find("span[data-concept-id='" + concept_id + "']")
          .removeClass("highlight mapping");
      removeFromMapped(concept_id);
    }
  });
});


$(window).on('load', function(){
  var $pdf_viewer = $('#pdf-viewer').contents();

  $pdf_viewer.on("textlayerrendered", function() {
    for (var i = 0; i < mapped.length; i++) {
      if (shown.indexOf(mapped[i]) > -1) { // The concept is in shown[].
        addSpan(mapped[i], true);
      } else {
        addSpan(mapped[i], false);
      }
    }
  });

  $pdf_viewer.find("#findbar").on("keydown", function(event) {
    if (event.keyCode == 27) {  // Escape
      clearFindField();
    }
  });

  $pdf_viewer.find("#viewFind").on("click", function() {
    if (!$(this).hasClass("toggled")) {
      clearFindField();
    }
  });

  function clearFindField() {
    var $find_field = $pdf_viewer.find("#findInput");
    $find_field.val('');
    $find_field[0].dispatchEvent(new CustomEvent("input"));
  }
});


function removeFromMapped(concept_id) {
  var index = shown.indexOf(concept_id);
  if (index > -1) {
    shown.splice(index, 1);
  }
}


function addSpan(concept_id, show_highlight) {
  $.get('/mappings/', {section: section_id, concepts: JSON.stringify([concept_id])}, function (data) {
    var terms = data[concept_id];
    for (var i = 0; i < terms.length; i++) {
      addSpanForTerm(concept_id, terms[i][0], terms[i][1], show_highlight);
    }
  }, "json");
}


function addSpanForTerm(concept_id, term, nth_match, show_highlight) {
  var $pdf_viewer = $('#pdf-viewer').contents(),
      count = 0;

  $pdf_viewer
      .find("#viewer .textLayer > div:icontains('" + term + "')")
      .each(function() {
        var matches = getImatchIndexes($(this).text(), term);

        for (var i = 0; i < matches.length; i++) {
          count++;
          if (nth_match.indexOf(count) > -1) {
            var text = $(this).text(),
                $span = $("<span></span>");
            $span.attr("data-concept-id", concept_id);
            if (show_highlight) {
              $span.addClass("highlight mapping");
            }
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


