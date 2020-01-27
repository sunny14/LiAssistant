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
    var details = extractRecipients(message, settings.emailBlacklist);
    var opts = {
      contactDetails: details,
      location: 'il',
    };
    var card = buildLICard(opts);
    return [card];
  },
};
