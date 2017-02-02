$.fn.extend({

  treed: function (o) {

    var openedClass = 'glyphicon-minus-sign';
    var closedClass = 'glyphicon-plus-sign';

    if (typeof o != 'undefined'){
      if (typeof o.openedClass != 'undefined'){
        openedClass = o.openedClass;
      }
      if (typeof o.closedClass != 'undefined'){
        closedClass = o.closedClass;
      }
    }

    // Initialize each of the top levels
    var $tree = $(this);
    $tree.addClass("tree");
    $tree.find('li').has("ul").each(function () {
      var $branch = $(this); //li with children ul
      $branch.prepend("<i class='indicator glyphicon " + openedClass + "'></i>");
      $branch.addClass('branch');
    });

    // Fire event from the dynamically added icon
    $tree.find('.branch .indicator').each(function(){
      $(this).on('click', function () {
        $(this).toggleClass(openedClass + " " + closedClass);
        $(this).closest('li').children().children().toggle();
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
  var lastWindowWidth = $window.width();
  var $icon = $('#arrow-icon');
  var breakpoint = 768;

  // Add class based on screen size
  if(lastWindowWidth < breakpoint) {
    $icon.addClass('glyphicon-menu-right');
  } else {
    $icon.addClass('glyphicon-menu-left');
  }

  // Toggle sidebar on screen size change
  $window.on('resize', function(){
    var windowWidth = $window.width();
    if (lastWindowWidth !== windowWidth) {
      if ((lastWindowWidth < breakpoint && windowWidth >= breakpoint) || (lastWindowWidth >= breakpoint && windowWidth < breakpoint)) {
        $icon.toggleClass('glyphicon-menu-left glyphicon-menu-right');
      }
      lastWindowWidth = windowWidth;
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
      var $anchor = $('<a href="#">' + item.name + '</a>');
      $anchor.attr('id', item.id);
      $li.append($anchor);
    }
    if (item.children && item.children.length) {
      var $sublist = $("<ul />");
      getList(item.children, $sublist);
      $li.append($sublist);
    }
    $list.append($li);
  }
}
