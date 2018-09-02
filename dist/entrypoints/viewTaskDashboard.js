require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({5:[function(require,module,exports){
// Exposed backend variables:
// task,
// user,
// taskSubscriber

var taskQuickViewUsersTemplate = require('../../views/partials/taskQuickViewUsers.ejs');
var taskQuickViewUsersHTML = taskQuickViewUsersTemplate({task: task});
$('#quick-view').append($.parseHTML(taskQuickViewUsersHTML));
var taskQuickViewUsersScript = require('../../scripts/viewScripts/partials/taskQuickViewUsers.js');

},{"../../scripts/viewScripts/partials/taskQuickViewUsers.js":3,"../../views/partials/taskQuickViewUsers.ejs":6}],6:[function(require,module,exports){
module.exports=(function() {var t = function anonymous(locals, filters, escape, rethrow
) {
escape = escape || function(html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<!-- Already should prevent any admin from being a taskSubscriber so we enter here with this assumption -->\n');2; if (task.taskSubscribers.length != 0){ ; buf.push('\n\n    <!-- Make the processing be in js in future -->\n    <div id="container" style=\'width:auto; margin-left:3%; margin-top:-10%;\'>\n\n        <div id="arrowL">\n            <span class=\'glyphicon glyphicon-menu-left\' style=\'margin-top:300%; color:#949494;\'></span>\n        </div>\n\n        <div id="list-container" style=\'width:94%; background-color:red;\'>\n            <div class=\'lister\' style=\'float:left;\'>\n\n                <!-- Your repeats go here see commented-out example -->\n                <!--  Use js to enter the divs inside the div class=\'list\' using this example-->\n                <!-- <div class=\'item\'>\n                </div> -->\n                ');18; task.taskSubscribers.forEach(function(taskSubscriber){ ; buf.push('\n\n                    ');20; if (!taskSubscriber.user.admin) { ; buf.push('\n\n                            <div class=\'item\' style=\'height:auto;\'>\n                                <!-- Make both the image and the name be the link -->\n                                <a class=\'names\' href="/index/', escape((24, user.username)), '/tasks/', escape((24, task._id)), '/dashboard/', escape((24, taskSubscriber.user._id)), '" class="user-link" style="font-size:12px;">\n\n                                    <div id=\'hovy\' style=\'height:50px;\'>\n                                        <img src="https://bootdey.com/img/Content/user_1.jpg" alt="">\n                                    </div>\n\n                                    <div id=\'bott\' style=\'height:10px;\'>\n                                        ', escape((31, taskSubscriber.user.name.slice(0,1).toUpperCase() + taskSubscriber.user.name.slice(1,30))), '\n\n                                    </div>\n                                </a>\n\n                            </div>\n                    ');37; } ; buf.push('\n\n                ');39; });; buf.push('\n            </div>\n        </div>\n\n        <div class="arrow-right" id="arrowR">\n            <span class=\'glyphicon glyphicon-menu-right\' style=\'margin-top:300%; color:#949494;\'></span>\n        </div>\n\n    </div>\n\n');49; } ; buf.push('\n\n\n\n\n<style>\n\n#list-container {\noverflow:hidden;\nfloat:left;\n}\n\n.lister{\n    background:#e6e4e4;\n    min-width:1400px;\n    float:left;\n    height:90px;\n}\n\n#arrowR{\n    width:3%;\n    height:90px;\n    float:right;\n    cursor:pointer;\n    z-index:10;\n}\n\n#arrowL{\n    width:3%;\n    height:90px;\n    float:left;\n    cursor:pointer;\n    z-index:10;\n}\n\n.item {\n    /* Fix width of the card */\n    width:5%;\n    height:100%;\n    margin:5px;\n    float:left;\n    position:relative;\n\n    opacity: 0.7;\n    filter: alpha(opacity=70); /* For IE8 and earlier */\n    position: relative;\n    z-index:10;\n}\n\n.item:hover {\n    opacity: 0.85;\n    filter: alpha(opacity=85); /* For IE8 and earlier */\n}\n\na.names:link,\na.names:visited,\na.names:hover,\na.names:active\n{\n   color: #5aa4e0;\n   text-decoration: none;\n}\n\n</style>\n\n\n<script src=/scripts/views/partials/taskQuickViewUsers.js></script>\n\n\n<style>\n\n    a {\n        color: #3498db;\n        outline: none !important;\n    }\n\n    img {\n        max-width: 50px;\n        max-height: 50px;\n    }\n\n</style>\n'); })();
} 
return buf.join('');
}; return function(l) { return t(l) }}())
},{}],3:[function(require,module,exports){
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

},{}]},{},[5]);
