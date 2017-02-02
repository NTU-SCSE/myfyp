$(document).ready(function(){
  // Toggle sidebar on click
  $('#sidebar-toggle').click(function(e) {
    e.preventDefault();
    $('#wrapper').toggleClass('toggled');
  });

  // Expand sidebar on big window size
  $(window).on('resize', function(){
    const breakpoint = 768;
    const window_width = $(window).width();
    const $wrapper = $('#wrapper');
    if (window_width >= breakpoint && $wrapper.hasClass('toggled')) {
      $wrapper.removeClass('toggled');
    }
  });
});