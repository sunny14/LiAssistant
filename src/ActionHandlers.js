/**
 * Collection of functions to handle user interactions with the add-on.
 *
 * @constant
 */
var ActionHandlers = {
  /**
   * Displays the linkedin search card.
   *
   * @param {Event} e - Event from Gmail
   * @return {UniversalActionResponse}
   */
  showLIForm: function(e) {
    var settings = getSettingsForUser();
    var message = getCurrentMessage(e);
    console.log("from: "+message.getFrom());
    console.log("to: "+message.getTo());
    console.log("cc: "+message.getCc());
    console.log("bcc: "+message.getBcc());
    var headers = message.getTo()+' '+message.getCc()+' '+message.getFrom()+' '+message.getBcc();
    var details = extractRecipients(headers, settings.emailBlacklist);
    var opts = {
      contactDetails: details,
      location: 'il',
    };
    var card = buildLICard(opts);
    return [card];
  },
};
