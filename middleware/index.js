var middlewareObj = {};

// Takes in a list of Submissions and returns a list of submissions ordered per folder
// to meet specs of fileSubmissionHistory.ejs
middlewareObj.sortSubs = function sortSubs(list){
    var subsSeen = [];
    var orderedSubs = []
    list.forEach(function(sub){
        var folder = sub['folder'];
        if (subsSeen.indexOf(folder) == -1){
            subsSeen.push(folder);
            list.forEach(function(s){
                if (s['folder'] == folder){
                    orderedSubs.push(s);
                }
            });
        }
        else{return;}
    });
    return orderedSubs;
}

module.exports = middlewareObj;