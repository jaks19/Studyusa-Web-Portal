var groupServices = {};

groupServices.getCheckedUsers = function getCheckedUsers(req, res) {
  if (req.body.incoming == null && req.body.outgoing == null){
      req.flash('error', "Error, group not created! You did not choose any user!");
      return res.redirect('back');
  }

  var checkedIncoming;
  if (!Array.isArray(req.body.incoming)) { checkedIncoming = [req.body.incoming] }
  else { checkedIncoming = req.body.incoming }

  var checkedOutgoing;
  if (!Array.isArray(req.body.outgoing)) { checkedOutgoing = [req.body.outgoing] }
  else { checkedOutgoing = req.body.outgoing }

  return [checkedIncoming, checkedOutgoing];
}

module.exports = groupServices;
