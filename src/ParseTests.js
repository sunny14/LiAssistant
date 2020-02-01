if ((typeof GasTap)==='undefined') { // GasT Initialization. (only if not initialized yet.)
    var cs = CacheService.getScriptCache().get('gast');
    if(!cs){
        cs = UrlFetchApp.fetch('https://raw.githubusercontent.com/zixia/gast/master/src/gas-tap-lib.js').getContentText();
        CacheService.getScriptCache().put('gast', cs, 21600);
    }
    eval(cs);
} // Class GasTap is ready for use now!

var test = new GasTap();

function gastTestRunner() {

    /**
     * parse title with name and email
     */
    test('parse title: name lastname email', function (t) {
        var header = 'jane pain <jane@utest.com>';
        var result = extractRecipients(header).toString();
        var resultExpected = ['Jane Pain "Utest"'].toString();
        t.ok(result === resultExpected, 'name lastname email');
    });

    /**
     * parse title with two records, parse email when name is missing
     */
    test('parse title: email1 name2 lastname2 email2', function (t) {
        var header = '<peter.howard@apple.com> jane pain <jane@utest.com>';
        var result = extractRecipients(header).sort().toString();
        var resultExpected = ['Peter Howard "Apple"' ,'Jane Pain "Utest"'].sort().toString();
        t.ok(result === resultExpected, 'email1 name2 lastname2 email2');
    });

    /**
     * eliminate duplicates, eliminate included records
     */
    test('parse title: <peter.howard@apple.com> <no-reply@apple.com>', function (t) {
        var header = '<peter.howard@apple.com> <no-reply@apple.com>';
        var result = extractRecipients(header).sort().toString();
        var resultExpected = ['Peter Howard "Apple"'].sort().toString();
        t.ok(result===resultExpected, '<peter.howard@apple.com> <no-reply@apple.com>');
    });

    /**
     * eliminate only unnesessary duplicates
     */
    test('parse title: <peter.howarddddd@apple.com> <peter.howard@apple.com>', function (t) {
        var header = '<peter.howarddddd@apple.com> <peter.howard@apple.com>';
        var result = extractRecipients(header).sort().toString();
        var resultExpected = ['Peter Howarddddd "Apple"','Peter Howard "Apple"'].sort().toString();
        t.ok(result===resultExpected, '<peter.howarddddd@apple.com> <peter.howard@apple.com>');
    });

    /**
     * if we have the only one record with company name - present company
     */
    /*test('noreply@apple.com', function (t) {
        var header = '<peter.howarddddd@apple.com> <peter.howard@apple.com> <no-reply@apple.com>';
        var url = //
        var resultExpected = //url
        t.equal(resultExpected, result, '');
    });*/

    test.finish()
}

/*function gastTestRunner() {
    test('calculation', function (t) {
        var i = 3 + 4;
        t.equal(i, 7, 'calc 3 + 4 = 7 right')
    });

    test('number convertion', function (t) {
        var i = parseInt('0e0', 16);
        t.equal(i, 224, 'parseInt')
    });

    test.finish()
}*/
