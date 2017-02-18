$.fn.extend({

  treed: function (o) {

    var opened_class = 'glyphicon-minus-sign';
    var closed_class = 'glyphicon-plus-sign';

    if (typeof o != 'undefined'){
      if (typeof o.opened_class != 'undefined'){
        opened_class = o.opened_class;
      }
      if (typeof o.closed_class != 'undefined'){
        closed_class = o.closed_class;
      }
    }

    // Initialize each of the top levels
    var $tree = $(this);
    $tree.addClass("tree");
    $tree.find('li').has("ul").each(function () {
      var $branch = $(this); //li with children ul
      $branch.prepend("<i class='indicator glyphicon " + opened_class + "'></i>");
      $branch.addClass('branch');
    });

    // Fire event from the dynamically added icon
    $tree.find('.branch .indicator').each(function(){
      $(this).on('click', function () {
        $(this).toggleClass(opened_class + " " + closed_class);
        $(this).closest('li').children('ul').children().toggle();
      });
    });

    // Fire event to open branch if the li contains an anchor instead of text
    $tree.find('.branch>a').each(function () {
      $(this).on('click', function (e) {
        $(this).closest('li').click();
        e.preventDefault();
      });
    });

    // Fire event to open branch if the li contains a button instead of text
    $tree.find('.branch>button').each(function () {
      $(this).on('click', function (e) {
        $(this).closest('li').click();
        e.preventDefault();
      });
    });
  }
});


$(document).ready(function(){

  var $window = $(window);
  var last_window_width = $window.width();
  var $icon = $('#arrow-icon');
  var breakpoint = 768;

  // Add class based on screen size
  if(last_window_width < breakpoint) {
    $icon.addClass('glyphicon-menu-right');
  } else {
    $icon.addClass('glyphicon-menu-left');
  }

  // Toggle sidebar on screen size change
  $window.on('resize', function(){
    var window_width = $window.width();
    if (last_window_width !== window_width) {
      if ((last_window_width < breakpoint && window_width >= breakpoint) ||
          (last_window_width >= breakpoint && window_width < breakpoint)) {
        $icon.toggleClass('glyphicon-menu-left glyphicon-menu-right');
      }
      last_window_width = window_width;
    }
  });

  // Toggle sidebar on click
  $('#sidebar-toggle').click(function(e) {
    e.preventDefault();
    $('#wrapper').toggleClass('toggled');
    $icon.toggleClass('glyphicon-menu-left glyphicon-menu-right');
  });
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
      var $a = $('<a href="#">' + item.name + '</a>');
      $a.attr({
        'data-concept-label': item.label,
        'data-toggle': 'popover',
        'data-container': 'body'
      });
      $li.append($a);
    }
    if (item.children && item.children.length) {
      var $sublist = $("<ul />");
      getList(item.children, $sublist);
      $li.append($sublist);
    }
    $list.append($li);
  }
}


function findNode(rnode, nlabel) {
  if (rnode.label == nlabel) {
    return rnode;
  } else {
    for (var i = 0; i < rnode.children.length; i++) {
      var node = findNode(rnode.children[i], nlabel);
      if (node !== null) {
        return node;
      }
    }
    return null;
  }
}


function getDescendants(node) {
  var label_list = [],
      children = node.children;

  for (var i = 0; i < children.length; i++) {
    label_list.push(children[i].label);
    $.merge(label_list, getDescendants(children[i]));
  }

  return label_list;
}



