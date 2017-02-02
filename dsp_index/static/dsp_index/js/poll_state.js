// Acquire the CSRF token
function getCookie(name) {
  var cookie_value = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookie_value = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookie_value;
}

var csrftoken = getCookie('csrftoken');


// Set the header on AJAX request while protecting the CSRF token from being sent to other domains
function csrfSafeMethod(method) {
  // These HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


// Poll state of the current task
var stop = 0;

var updateLastCrawl = function() {
  $.get('/admin/last_crawl/', function(data) {
    document.getElementById('last-crawl').innerHTML = "Last crawl: " + data[0];
  });
};

var pollState = function(task_id) {
  $.ajax({
   url: "poll_state/",
   type: "POST",
   data: "task_id=" + task_id,
  }).done(function(data){
    var $status = document.getElementById('status-div');
    if (data['state'] == 'SUCCESS') {
      stop = 1;
      if (data['result']) { // Crawl successful (data['result'] == task_id)
        $status.innerHTML = "Done! The documents are successfully crawled.";
        $status.className = "alert alert-success";
        updateLastCrawl();
      } else { // data['result'] == null
        $status.innerHTML = "Warning! Another crawling process is running. Please wait till the process finishes.";
        $status.className = "alert alert-warning";
      }
      window.setTimeout(function() {
        $(".alert-success,.alert-warning").fadeTo(500, 0).slideUp(500, function(){
            $(this).remove();
        });
      }, 4000);
    } else if (data['state'] == 'PENDING' || data['state'] == 'STARTED') {
      $status.innerHTML = "Crawling in progress...";
      $status.className = "alert alert-info";
    } else { // data['state'] == 'FAILURE'
      $status.innerHTML = "Oh snap! Fail to crawl documents. Try again later.";
      $status.className = "alert alert-danger";
    }
  });
};


$(document).ready(function() {
  updateLastCrawl();

  // Avoid polling state when there is no crawl task found
  // crawl_task_id is retrieved from current session, if not yet expired
  if (crawl_task_id == '') {
    stop = 1;
  }

  // Poll state every 0.5 second
  var refresh_interval_id = setInterval(function() {
    if(stop == 1){
      clearInterval(refresh_interval_id);
    } else {
      pollState(crawl_task_id);
    }
  },2000);

});