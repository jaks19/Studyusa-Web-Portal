// Converts timestamps in elements of class timestring, under parent of class comment 
// to amount of time elapsed since

  var spansList = $('.comment > .timestring');
  
  $.each(spansList, function( i, val ) {
        var timeDateText = $(val).text();
        var momentObj = moment(timeDateText);
        var timespent = momentObj.fromNow();
        $(this).text(timespent);
  });