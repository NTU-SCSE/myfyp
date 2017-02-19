var filter_with = [],
    filter_without = [],
    clabel_popped;


$(document).ready(function () {
  var $li = $('<li id="concept-tree"></li>');

  if (ctree_rnode == null) {
    $li.append('No concept identified from search results');
    $li.appendTo("#sidebar");
  } else {
    $li.append('<b>' + ctree_rnode.name + '</b>');
    $li.appendTo("#sidebar");

    var $ul = $('<ul></ul>');
    getList(ctree_rnode.children, $ul);
    $ul.appendTo("#concept-tree");
  }

  getSectionCounts();

  $('#sidebar').treed();

  setPageNavHref();

  // Enable concept popover
  var $li_a = $(".tree li a");
  $li_a.popover({
    html : true,
    content: function() {
      var $popover = $("#concept-popover-content");
      return $popover.html();
    },
    title: function() {
      return $(this).text();
    }
  });

  $li_a.click(function() {
    clabel_popped = $(this).attr("data-concept-label");
  });

  $('body').on('click', function (e) {
    $('[data-toggle=popover]').each(function () {
      // Hide any open popovers when the anywhere else in the body is clicked
      if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        $(this).popover('hide');
      }
    });
  });


  $('#filter').on('click', function () {
    var with_str = encodeURIComponent(JSON.stringify(filter_with)),
        without_str = encodeURIComponent(JSON.stringify(filter_without));
    window.open("/results/?q=" + query + "&with=" + with_str + "&without=" + without_str, "_self");
  });


  $('#reset-all').on('click', function () {
    for (var i = 0; i < filter_with.length; i++) {
      $('a[data-concept-label="' + filter_with[i] +'"]').removeClass('filter-with');
    }
    for (var i = 0; i < filter_without.length; i++) {
      $('a[data-concept-label="' + filter_without[i] +'"]').removeClass('filter-without');
    }
    filter_with = [];
    filter_without = [];
  });
});


// Trigger actions when with-concept anchor is clicked
$(document).on('click', '.with-concept', function() {
  $('a[data-concept-label="' + clabel_popped +'"]').addClass('filter-with');
  filter_with.push(clabel_popped);
});


// Trigger actions when without-concept anchor is clicked
$(document).on('click', '.without-concept', function() {
  $('a[data-concept-label="' + clabel_popped +'"]').addClass('filter-without');
  filter_without.push(clabel_popped);
});


// Trigger actions when reset anchor is clicked
$(document).on('click', '.reset', function() {
  $('a[data-concept-label="' + clabel_popped +'"]').removeClass('filter-with filter-without');
  if (filter_with.indexOf(clabel_popped) > -1) {
    filter_with = removeFromArray(clabel_popped, filter_with);
  } else if (filter_without.indexOf(clabel_popped) > -1) {
    filter_without = removeFromArray(clabel_popped, filter_without);
  }

});


function getSectionCounts () {
  for (var label in section_counts) {
    if (section_counts.hasOwnProperty(label)) {
      $('a[data-concept-label="' + label + '"]').after(function () {
        return " <span class='badge'>" + section_counts[label] + "</span>";
      });
    }
  }
}


function setPageNavHref() {
  var $a_prev = $('#a-prev'),
      $a_next = $('#a-next'),
      params = getURLParameters(),
      prev_href = "?",
      next_href = "?";

  for (var key in params) {
    if (key != "page" && params.hasOwnProperty(key)) {
      prev_href = prev_href.concat(key + "=" + params[key] + "&");
      next_href = next_href.concat(key + "=" + params[key] + "&");
    }
  }
  prev_href = prev_href.concat("page=" + $a_prev.attr("data-prev-page-num"));
  next_href = next_href.concat("page=" + $a_next.attr("data-next-page-num"));

  $a_prev.attr('href', prev_href);
  $a_next.attr('href', next_href);
}


function getURLParameters() {
  var paramURL = window.location.search.substring(1),
      params = paramURL.split('&'),
      object = {};
  for (var i = 0; i < params.length; i++) {
    var param = params[i].split('=');
    object[param[0]] = param[1]
  }
  return object;
}

