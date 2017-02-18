var visited = [],
    selected = [],
    highlighted = [],
    clabel_popped,
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
        var $popover = $("#concept-popover-content"),
            $actions = $popover.find(".show-highlight, .hide-highlight");
        if (actions_disabled.indexOf($(this).attr("data-concept-label")) > -1) {
          $actions.attr('disabled', '');
        } else {
          if ($(this).hasClass('select-show')) {
            $popover.find(".hide-highlight").removeAttr('disabled');
            $popover.find(".show-highlight").attr('disabled', '');
          } else {
            $popover.find(".show-highlight").removeAttr('disabled');
            $popover.find(".hide-highlight").attr('disabled', '');
          }
        }

        return $popover.html();
      },
      title: function() {
        return $(this).text();
      }
  });

  $li_a.click(function() {
    clabel_popped = $(this).data("concept-label").toString();
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
  $('a[data-concept-label="' + clabel_popped +'"]').addClass('select-show');
  $('a[class="show-highlight"]').attr('disabled', '');
  $('a[class="hide-highlight"]').removeAttr('disabled');

  var clabel = clabel_popped,
      node = findNode(ctree_rnode, clabel),
      clabel_list = [clabel],
      $pdf_viewer = $('#pdf-viewer').contents();

  clabel_list = clabel_list.concat(getDescendants(node));

  for (var i = 0; i < clabel_list.length; i++) {
    // Disable show/hide actions in child concepts.
    if (i > 0 && actions_disabled.indexOf(clabel_list[i]) < 0) {
      actions_disabled.push(clabel_list[i]);
    }

    if (selected.indexOf(clabel_list[i]) < 0) {
      if (visited.indexOf(clabel_list[i]) > -1) {
        // C2t Mappings were retrieved before. Simply add two classes (.highlight & .mapping).
        $pdf_viewer
            .find("span[data-concept-label='" + clabel_list[i] + "']")
            .addClass("highlight mapping");
      } else {
        // GET the c2t mappings from server and add <span> to highlight the matched terms.
        addSpan(clabel_list[i], true);
        visited.push(clabel_list[i]);
      }
    }
  }

  selected.push(clabel);
  updateHighlighted();
});


// Trigger actions when hide-highlight anchor is clicked
$(document).on('click', '.hide-highlight', function() {
  $('a[data-concept-label="' + clabel_popped +'"]').removeClass('select-show');
  $('a[class="hide-highlight"]').attr('disabled', '');
  $('a[class="show-highlight"]').removeAttr('disabled');

  var clabel = clabel_popped,
      node = findNode(ctree_rnode, clabel),
      clabel_list = [clabel],
      $pdf_viewer = $('#pdf-viewer').contents(),
      exempted = [];

  clabel_list = clabel_list.concat(getDescendants(node));

  for (var i = 0; i < selected.length; i++) {
    if (selected[i] != clabel && clabel_list.indexOf(selected[i] > -1)) {
      exempted.push(selected[i]);
      exempted = exempted.concat(getDescendants(findNode(ctree_rnode, selected[i])));
    }
  }

  for (var i = 0; i < clabel_list.length; i++) {
    // Enable show/hide actions in child concepts.
    if (i > 0) {
      actions_disabled.splice(actions_disabled.indexOf(clabel_list[i]), 1);
    }

    if (exempted.indexOf(clabel_list[i]) < 0) {
      $pdf_viewer
          .find("span[data-concept-label='" + clabel_list[i] + "']")
          .removeClass("highlight mapping");
      removeFromSelected(clabel_list[i]);
    }
  }

  updateHighlighted();
});


$(window).on('load', function(){
  var $pdf_viewer = $('#pdf-viewer').contents();

  $pdf_viewer.on("textlayerrendered", function() {
    for (var i = 0; i < visited.length; i++) {
      if (highlighted.indexOf(visited[i]) > -1) { // The concept is in selected[].
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


function removeFromSelected(concept_label) {
  var index = selected.indexOf(concept_label);
  if (index > -1) {
    selected.splice(index, 1);
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
                $span = $("<span></span>"),
                cname = $(".tree li a[data-concept-label='" + concept_label + "']").text();

            $span.attr({
              "data-concept-label": concept_label,
              "title": "Concept: " + cname
            });
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


function updateHighlighted() {
  highlighted = [];
  for (var i = 0; i < selected.length; i++) {
    highlighted.push(selected[i]);
    highlighted = highlighted.concat(getDescendants(findNode(ctree_rnode, selected[i])));
  }
}

