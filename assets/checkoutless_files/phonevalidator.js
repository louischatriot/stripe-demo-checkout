goog.require('i18n.phonenumbers.PhoneNumberUtil');

Validation.add('required-phone','Phone number is required', function(v) {
    return v ? true : false;
});
Validation.add('validate-phoneCustom','Please enter a valid phone number', function(v,elm) {
    var phoneFormatted = phoneNumberParser(v, document.getElementById(elm.getAttribute('data-country')).value.toLowerCase());
    if (phoneFormatted) {
        elm.value = phoneFormatted;
    }
    return phoneFormatted ? true : false;
});

function phoneNumberParser(phoneNumber,regionCode) {
    try {
        var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
        var number = phoneUtil.parseAndKeepRawInput(phoneNumber, regionCode);
        return phoneUtil.isPossibleNumber(number) ? (phoneUtil.isValidNumber(number) ?
            phoneUtil.format(number, i18n.phonenumbers.PhoneNumberFormat.E164) : '') : '';
    } catch (e) {
        return '';
    }
}

goog.exportSymbol('phoneNumberParser', phoneNumberParser);
