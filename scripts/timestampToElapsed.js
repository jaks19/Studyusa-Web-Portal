window.onload = function (e) {
    // Taking the date and converting to local time zone and to desired format
    var spansList = $('.comment > .timestring');

    $.each(spansList, function( i, val ) {
          var timeDateText = $(val).text();
          var momentObj = moment(timeDateText);
          /// We have our String e.g. 5 seconds ago, a year ago ...
          var timespent = momentObj.fromNow();
          $(this).text(timespent);
    });
};
