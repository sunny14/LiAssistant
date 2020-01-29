/**
 * creates 'keywords' LinkedIn url parameter
 * @param opts
 * @return {string} 'keywords' parameter
 */
function getKeywordsParam(opts) {
  var keywordsParam='';
  _.each(opts.contactDetails, function (str) {
    var suffix = '(' + str + ')';
    if (keywordsParam !== '') {
      suffix = ' OR ' + suffix;
    }
    keywordsParam = keywordsParam + suffix;
  });
  keywordsParam = keywordsParam.trim();
  return keywordsParam;
}

/**
 * creates parameters for LinkedIn url
 * @param opts
 * @return {string} parameters for LinkedIn url
 */
function getParams(opts) {
  var keywordsParam = getKeywordsParam(opts);
  var params = '?facetGeoRegion=["' + opts.location + ':0"]&keywords=' + keywordsParam;
  console.log('LI params: ' + params);
  return params;
}

/**
 * creates checkbox group with search details
 * @param opts
 * @return {*}
 */
function createCheckboxGroup(opts) {
  var checkboxGroup = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.CHECK_BOX)
      .setFieldName('participants');
  _.each(opts.contactDetails, function (str) {
    checkboxGroup.addItem(str, str, true);
  });
  return checkboxGroup;
}

/**
 * Builds a card that displays the search options for linkedin search.
 *
 * @param {Object} opts Parameters for building the card
 * @param {string[]} opts.contactDetails - contactDetails of participants
 * @param {string} opts.location
 * @return {Card}
 */
function buildLICard(opts) {
  var participantSection = CardService.newCardSection().setHeader(
      'Choose one or more recipients'
  );
  var checkboxGroup = createCheckboxGroup(opts);
  participantSection.addWidget(checkboxGroup);

  var params = getParams(opts);
  var  path = '/search/results/people/';
  var url = encodeURI('https://www.linkedin.com'+path+params);
  console.log('final url is:\n '+url);

  participantSection.addWidget(
      CardService.newButtonSet().addButton(
          CardService.newTextButton()
              .setText('Find in LinkedIn')
              .setOpenLink(CardService.newOpenLink().setUrl(url)
              )
      )
  );
  return CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle('Who would you like to check @ LinkedIn?'))
      .addSection(participantSection)
      .build();
}

/**
 * Builds a card that displays details of an error.
 *
 * @param {Object} opts Parameters for building the card
 * @param {Error} opts.exception - Exception that caused the error
 * @param {string} opts.errorText - Error message to show
 * @param {boolean} opts.showStackTrace - True if full stack trace should be displayed
 * @return {Card}
 */
function buildErrorCard(opts) {
  var errorText = opts.errorText;

  if (opts.exception && !errorText) {
    errorText = opts.exception.toString();
  }

  if (!errorText) {
    errorText = 'No additional information is available.';
  }

  var card = CardService.newCardBuilder();
  card.setHeader(
      CardService.newCardHeader().setTitle('An unexpected error occurred')
  );
  card.addSection(
      CardService.newCardSection().addWidget(
          CardService.newTextParagraph().setText(errorText)
      )
  );

  if (opts.showStackTrace && opts.exception && opts.exception.stack) {
    var stack = opts.exception.stack.replace(/\n/g, '<br/>');
    card.addSection(
        CardService.newCardSection()
            .setHeader('Stack trace')
            .addWidget(CardService.newTextParagraph().setText(stack))
    );
  }

  return card.build();
}

