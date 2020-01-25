/**
 * Builds a card that displays the search options for linkedin search.
 *
 * @param {Object} opts Parameters for building the card
 * @param {string[]} opts.emailAddresses - Email addresses of participants
 * @return {Card}
 */
function buildLICard(opts) {
  var participantSection = CardService.newCardSection().setHeader(
      'Choose one or more recipients'
  );

  var checkboxGroup = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.CHECK_BOX)
      .setFieldName('participants');
  _.each(opts.emailAddresses, function(email) {
    checkboxGroup.addItem(name+" "+lastName, email, true);
  });
  participantSection.addWidget(checkboxGroup);

  participantSection.addWidget(
      CardService.newButtonSet().addButton(
          CardService.newTextButton()
              .setText('Find in LinkedIn')
              .setOpenLink(CardService.newOpenLink().setUrl('https://www.linkedin.com/')
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

