let taskCommentsServices = {};

taskCommentsServices.theCommentIsStillEditable =
    function theCommentIsStillEditable (user, comment, editableTimeIntervalInMinutes) {
        let weAreWithinEditableTime = new Date(comment.date) >
            (Date.now() - (editableTimeIntervalInMinutes*60*1000));

        let itIsThisUsersComment =
            String(comment.author._id) === String(user._id);

        if (user.admin || weAreWithinEditableTime){
            if (itIsThisUsersComment) {
                return true;
            }
        }

        return false;
}

module.exports = taskCommentsServices;
