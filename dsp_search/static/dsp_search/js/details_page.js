var visited = [],
    shown = [],
    popped_concept_label,
    actions_disabled = [];


$(document).ready(function () {

  // Build the concept tree in sidebar
  var $li = $('<li id="concept-tree"></li>');

  if (ctree_rnode == null) {
    $li.append('No concept identified for this section');
    $li.appendTo("#sidebar");
  } else {
    $li.append('<b>' + ctree_rnode.name + '</b>');
    $li.appendTo("#sidebar");

    var $ul = $('<ul></ul>');
    getList(ctree_rnode.children, $ul);
    $ul.appendTo("#concept-tree");
  }

  $("#sidebar").treed();

  // Enable concept popover
  var $li_a = $(".tree li a");
  $li_a.popover({
      html : true,
      content: function() {
        // var $actions = $("#concept-popover-content").find(".show-highlight, .hide-highlight, .reset-highlight");
        // if (actions_disabled.indexOf($(this).data("concept-label")) > -1) {
        //   $actions.attr('disabled', '');
        // } else {
        //   $actions.removeAttr('disabled');
        // }
        return $("#concept-popover-content").html();
      },
      title: function() {
        return $(this).text();
      }
  });

  $li_a.click(function() {
    popped_concept_label = $(this).data("concept-label").toString();
  });

  $('body').on('click', function (e) {
    $('[data-toggle=popover]').each(function () {
      // Hide any open popovers when the anywhere else in the body is clicked
      if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        $(this).popover('hide');
      }
    });
  });
});


// Trigger actions when show-highlight anchor is clicked
$(document).on('click', '.show-highlight', function() {
  $('a[data-concept-label="' + popped_concept_label +'"]').removeClass('select-hide').addClass('select-show');

  var clabel = popped_concept_label,
      node = findNode(ctree_rnode, clabel),
      clabel_list = [clabel],
      $pdf_viewer = $('#pdf-viewer').contents();

  clabel_list = clabel_list.concat(getDescendants(node));

  for (var i = 0; i < clabel_list.length; i++) {

    if (visited.indexOf(clabel_list[i]) > -1) {
      // C2t Mappings were retrieved before. Simply add two classes (.highlight & .mapping).
      $pdf_viewer
          .find("span[data-concept-label='" + clabel_list[i] + "']")
          .addClass("highlight mapping");
      shown.push(clabel_list[i]);
    } else {
      // GET the c2t mappings from server and add <span> to highlight the matched terms.
      addSpan(clabel_list[i], true);
      visited.push(clabel_list[i]);
      shown.push(clabel_list[i]);
    }

  }
});


// // Trigger actions when hide-highlight anchor is clicked
// $(document).on('click', '.hide-highlight', function() {
//   $('a[data-concept-label="' + popped_concept_label +'"]').removeClass('select-show').addClass('select-hide');
//   var node = findNode(ctree_rnode, popped_concept_label);
//   actions_disabled = actions_disabled.concat(getDescendants(node));
// });


// Trigger actions when reset-highlight anchor is clicked
$(document).on('click', '.reset-highlight', function() {
  $('a[data-concept-label="' + popped_concept_label +'"]').removeClass('select-show select-hide');

  var clabel = popped_concept_label,
      node = findNode(ctree_rnode, clabel),
      clabel_list = [clabel],
      $pdf_viewer = $('#pdf-viewer').contents();

  clabel_list = clabel_list.concat(getDescendants(node));

  for (var i = 0; i < clabel_list.length; i++) {
    $pdf_viewer
        .find("span[data-concept-label='" + clabel_list[i] + "']")
        .removeClass("highlight mapping");
    removeFromShown(cid_list[i]);
  }
});


$(window).on('load', function(){
  var $pdf_viewer = $('#pdf-viewer').contents();

  $pdf_viewer.on("textlayerrendered", function() {
    for (var i = 0; i < visited.length; i++) {
      if (shown.indexOf(visited[i]) > -1) { // The concept is in shown[].
        addSpan(visited[i], true);
      } else {
        addSpan(visited[i], false);
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


function removeFromShown(concept_label) {
  var index = shown.indexOf(concept_label);
  if (index > -1) {
    shown.splice(index, 1);
  }
}


function addSpan(concept_label, show_highlight) {
  $.get('/mappings/', {section: section_id, concepts: JSON.stringify([concept_label])}, function (data) {
    var terms = data[concept_label];
    for (var i = 0; i < terms.length; i++) {
      addSpanForTerm(concept_label, terms[i][0], terms[i][1], show_highlight);
    }
  }, "json");
}


function addSpanForTerm(concept_label, term, nth_match, show_highlight) {
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
            $span.attr("data-concept-label", concept_label);
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


