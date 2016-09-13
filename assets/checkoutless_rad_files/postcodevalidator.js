Validation.add('postcode-validated','Please enter a valid postcode', function(v,elm) {
    switch(document.getElementById(elm.getAttribute('data-country')).value.toLowerCase()) {
        case 'fr':
            return new RegExp('^\\d{5}$').test(v.toUpperCase());
        case 'gb':
            return new RegExp('^[^\\W_]{2,4}( )\\w{3}$').test(v.toUpperCase());
    }
    return true;
});