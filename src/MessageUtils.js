// Copyright 2017 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Retrieves the current message given an add-on event.
 * @param {Event} event - Add-on event
 * @return {Message}
 */
function getCurrentMessage(event) {
  var accessToken = event.messageMetadata.accessToken;
  var messageId = event.messageMetadata.messageId;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  return GmailApp.getMessageById(messageId);
}

function cleanRecord(record) {

  return record
      .replace('""', '"')
      .replace(/"gmail"|"jobvite"|-notifications|wixshoutout|calendar|schedule|private|[0-9\\.@<>,]/g, '')
      .trim();
}

function processRecord(record) {

  console.log('PROCESSING RECORD:\n'+record);

  //parse details from title
  const emailPrefixRe  = /\b[A-Za-z0-9._%+-]+@\b/gi;
  const emailPostfixRe  = /(\.)+[A-Z]{2,6}\b/gi;

  var recordWithCompany = record
      .replace(emailPrefixRe, '"')
      .replace(emailPostfixRe, '"');

  recordWithCompany = cleanRecord(recordWithCompany);

  console.log('RECORD AFTER CLEANING:\n>>>'+recordWithCompany+'<<<');

  //if no details in title
  if (recordWithCompany.length ===0)  {
    //parse name and last name from email
    recordWithCompany = getDetailsSingle(record);
  }

  console.log('RECORD AFTER PROCESSING:\n'+recordWithCompany);

  return recordWithCompany;

}

function containsMultipleEmails(record) {
  return record.match(/@/g).length > 1;
}

function getRecords(header) {
  var records = header
      .split(/>/)
      .map(function (rec) {
          return rec.trim();
      })
      .filter(function (x) {
          return x.length > 0;
    });

/*  _.each(records, function (x) {
    console.log('BEFORE MAPPING: rec:\n'+x);
  });*/

  records = _.flatMap(records, function (record) {
    if (containsMultipleEmails(record))  {
      var indexShtrudel =  record.indexOf('@');
      var indexSpace = record.indexOf(' ', indexShtrudel);
      var splittedRecord = [record.slice(0, indexSpace).trim(), record.slice(indexSpace).trim()];

      return splittedRecord;
    }

    return record;
  });

/*  _.each(records, function (x) {
    console.log('FINAL: rec:\n'+x);
  });*/

  return records;
}

/**
 * Retrieve the list of all participants in a conversation.
 *
 * @param {Message} message - Gmail message to extract from
 * @param {string[]} optBlacklist - Array of emails to exclude
 * @return {string[]} email addresses
 */
function extractRecipients(message, optBlacklist) {
  /*function extractEmails() {
    var emails = collectEmails_(message);
    emails = normalizeEmails_(emails);
    emails = filterEmails_(emails);
    if (!_.isEmpty(optBlacklist)) {
      emails = _.difference(emails, optBlacklist);
    }

    return emails;
  }*/

  console.log("from: "+message.getFrom());
  console.log("to: "+message.getTo());
  console.log("cc: "+message.getCc());
  console.log("bcc: "+message.getBcc());

  var headers = message.getTo()+' '+message.getCc()+' '+message.getFrom()+' '+message.getBcc();
  console.log('HEADERS: \n'+headers);
  var records = getRecords(headers);
  var details = _.map(records, function (record) {
      return processRecord(record);
  });

  console.log('DETAILS ARE: \n'+details);

  //TODO: remove duplicates
  //TODO: remove records that are included in other records
  return details.sort();
}

function extractCompany(email) {
  var company = email.split('@')[1].split(".")[0].trim();
  if (company === 'gmail') {
    return ''
  }

  return '"'+company+'"';
}


function getDetailsSingle(email) {

  function extractName(email) {

    const re = '[A-Za-z]+';
    return email.split('@')[0].match(re)[0];

  }

  var name = extractName(email);

  function extractLastName(email) {
    return email.split('@')[0].split('.')[1];

  }

  var lastName = extractLastName(email);


  var company = extractCompany(email);
  var fullName = name+' '+lastName;
  if (lastName === undefined)  {
    fullName = name;
  }

  console.log('fullname = '+fullName+", company="+company);
  return fullName+' '+company;
}


/**
 * extract name + last name from email
 * @param {string[]} emails
 * @return {string[]} details
 */
function extractDetails(emails) {
  var details  = [];



  for (email in emails)  {
    details.push(getDetailsSingle(emails[email]))
  }

  console.log('all extracted data: \n'+details);
  return details;
}


/**
 * Collect all email addresses appearing in the to/cc/from list
 * of a message.
 *
 * @param {Message} message - Gmail message to extract from
 * @return {string[]} email addresses
 */
function collectEmails_(message) {
  return _.union(
      splitRecipients_(message.getTo()),
      splitRecipients_(message.getCc()),
      splitRecipients_(message.getFrom())
  );
}

/**
 * Extracts all email addresses from a to/cc/from header
 *
 * @param {string} headerValue - Value of a to/cc/from header
 * @return {string[]} email addresses
 */
function splitRecipients_(headerValue) {
  var re = /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,6}\b/gi;
  return headerValue.match(re);
}

/**
 * Filters a list of email addresses to remove obvious non-user accounts.
 * @param {string[]} emailAddresses
 * @return {string[]}
 */
function normalizeEmails_(emailAddresses) {
  var re = /(.*)\+.*@(.*)/;
  return _.map(emailAddresses, function(email) {
    return email.replace(re, '$1@$2');
  });
}

/**
 * Filters a list of email addresses to remove obvious non-user accounts.
 * @param {string[]} emailAddresses
 * @return {string[]}
 */
function filterEmails_(emailAddresses) {
  var re = /(.*no-reply.*|.*noreply.*|.*@docs.google.com)/;
  return _.reject(emailAddresses, function(email) {
    return re.test(email);
  });
}

/*suite('[test][User][integrations]', () => {
  test('parse jane.kelly@jpmorgan.com', async (done) => {
    const email = 'jane.kelly@jpmorgan.com';

    var details = extractDetails([email])[0];

    /!*expect(details.name).to.equal('jane');
    expect(details.lastName).to.equal('kelly');
    expect(details.currentCompany).to.equal('jpmorgan')*!/

  });
})//end of suite*/
