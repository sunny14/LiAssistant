
var DEBUG = true;
/**
 * Typedef for events passed from Gmail to the add-on. Supplied for
 * reference.
 *
 * @typedef {Object} Event
 * @property {Object} parameters - Request parameters. Must include a
 *    key "action" with the name of the action to dispatch
 * @property {Object} formInput - Values of input fields
 */

/**
 * Typedef for error handler callbacks. Provided for reference.
 *
 * @callback ErrorHandler
 * @param {Error} exception - Exception to handle
 * @Return {Card|ActionResponse|UnivseralActionResponse} optional card or action response to render
 */

/**
 * Entry point for the add-on. Handles an user event and
 * invokes the corresponding action
 *
 * @param {Event} event - user event to process
 * @return {UniversalActionResponse}
 */
function handleShowCard(event) {
  if (event.parameters == undefined) {
    event.parameters = {};
  }
  event.parameters.action = 'showLIForm';
  return dispatchActionInternal(event, universalActionErrorHandler);
}
/**
 * Entry point for secondary actions. Handles an user event and
 * invokes the corresponding action
 *
 * @param {Event} event - user event to process
 * @return {ActionResponse} Card or form action
 */
function dispatchAction(event) {
  return dispatchActionInternal(event, actionErrorHandler);
}

/**
 * Validates and dispatches an action.
 *
 * @param {Event} event - user event to process
 * @param {ErrorHandler} optErrorHandler - Handles errors, optionally
 *        returning a card or action response.
 * @return {ActionResponse|UniversalActionResponse|Card}
 */
function dispatchActionInternal(event, optErrorHandler) {
  console.time('dispatchActionInternal');
  console.log(event);

  try {
    var actionName = event.parameters.action;
    if (!actionName) {
      throw new Error('Missing action name.');
    }

    var actionFn = ActionHandlers[actionName];
    if (!actionFn) {
      throw new Error('Action not found: ' + actionName);
    }

    return actionFn(event);
  } catch (err) {
    console.error(err);
    if (optErrorHandler) {
      return optErrorHandler(err);
    } else {
      throw err;
    }
  } finally {
    if (DEBUG) {
      console.timeEnd('dispatchActionInternal');
    }
  }
}

/**
 * Handle unexpected errors for the main universal action entry points.
 *
 * @param {Error} err - Exception to handle
 * @Return {UnivseralActionResponse} - card or action response to render
 */
function universalActionErrorHandler(err) {
  var card = buildErrorCard({
    exception: err,
    showStackTrace: true,
  });
  return CardService.newUniversalActionResponseBuilder()
      .displayAddOnCards([card])
      .build();
}

/**
 * Handle unexpected errors for secondary actions.
 *
 * @param {Error} err - Exception to handle
 * @Return {ActionResponse} -  card or action response to render
 */
function actionErrorHandler(err) {
  var card = buildErrorCard({
    exception: err,
    showStackTrace: true,
  });
  return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(card))
      .build();
}
