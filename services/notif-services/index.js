var notifServices = {};

notifServices.getUnseenNotifs = 
    function getUnseenNotifs(notifs) {
      var unseenNotifs = [];
      notifs.slice(0).forEach(function(notif) {
        if (!notif.seen) {
            unseenNotifs.push(notif);
        }
      });
      return unseenNotifs;
    }
    
module.exports = notifServices;