$(document).ready(function() {
    var $item = $('div.item'), // Number of items to have in carousel
        visible = 4, // Set the number of items that will be visible at a time
        index = 0, // Starting index
        endIndex = ( $item.length / visible ) - 1; //End index

    $('div#arrowR').click(function(){
        if(index < endIndex ){
          index++;
          $item.animate({'left':'-=300px'});
        }
    });

    $('div#arrowL').click(function(){
        if(index > 0){
          index--;
          $item.animate({'left':'+=300px'});
        }
    });

    $('#quick-view').draggable();

});

// On Mouseenter, make the card rise by 3 px
$('.item').mouseenter( function(){ $(this).css('bottom', '+=3') });

// On Mouseleave, make the card fall by 3 px
$('.item').mouseleave( function(){ $(this).css('bottom', '-=3') });
