Validation.add('domtom-excluded','Désolé nous ne livrons pas dans les DOM-TOM.', function(v,elm) {
    if (document.getElementById(elm.getAttribute('data-country')).value.toLowerCase()=='fr') {
        return ['971','972','973','974','975','976','984','986','987','988'].indexOf(v.substr(0, 3)) < 0;
    }
    else {
        return true;
    }
});
