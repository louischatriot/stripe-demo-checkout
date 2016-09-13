(function($) {

    function AutoAddressForm(form, countryIdSel, prefix, cityval) {
        var self = this;

        self.addressForm = form;

        self.modeAssoc = {
            hexaposte: ['GB'],
            smartystreet: ['US']
        };

        self.prefix = prefix ? prefix : 'shipping';

        self.currentMode = null;

        var countryIdSelector = $(countryIdSel);

        countryIdSelector.on('change', function()
        {
            self.startInputMode(countryIdSelector);
        });

        self.startInputMode(countryIdSelector, cityval);
    }

    AutoAddressForm.prototype.findMode = function(codeToFind) {
        for (var mode in this.modeAssoc) {
            if (this.modeAssoc.hasOwnProperty(mode) && this.modeAssoc[mode].indexOf(codeToFind) != -1) {
                return mode;
            }
        }
        return 'default';
    };

    AutoAddressForm.prototype.setInputDefault = function(container, cityval) {
        var elem = '<input type="text" name="' + this.prefix + '[city]" data-city="" class="input-text required-entry" id="' + this.prefix + ':city"';
        if (cityval) {
            elem += ' value="' + cityval + '"';
        }
        elem += ' />';

        container.append(elem);
    };

    AutoAddressForm.prototype.setInputHexaposte = function(container) {
        container.append('<select name="' + this.prefix + '[city]" data-city="" class="required-entry" id="' + this.prefix + ':city"></select>');
        this.addressForm.data('address-postcode').initCitySelect().enableListeners();
    };

    AutoAddressForm.prototype.clearInputHexaposte = function() {
        var addressPostcode = this.addressForm.data('address-postcode');
        addressPostcode.initCitySelect();
        addressPostcode.disableListeners();
    };

    AutoAddressForm.prototype.clearInputMode = function() {
        switch (this.currentMode) {
            case 'hexaposte':
                this.clearInputHexaposte();
                break;
        }
    };

    AutoAddressForm.prototype.onCurrentInputMode = function() {
        switch (this.currentMode) {
            case 'hexaposte':
                this.addressForm.data('address-postcode').request();
        }
    };

    AutoAddressForm.prototype.setInputMode = function(mode, cityval) {
        if (this.currentMode == mode) {
            this.onCurrentInputMode();
            return;
        }
        this.clearInputMode();
        var cityContainer = $('#shipping\\:citycontainer');
        cityContainer.empty();
        switch (mode) {
            case 'hexaposte':
                this.setInputHexaposte(cityContainer);
                break;
            default:
                this.setInputDefault(cityContainer, cityval);
                break;
        }
        this.currentMode = mode;
    };

    AutoAddressForm.prototype.startInputModeFromCode = function(countryCode, cityval) {
        var modeToUse = this.findMode(countryCode);
        this.setInputMode(modeToUse, cityval);
    };

    AutoAddressForm.prototype.startInputMode = function(data, cityval) {
        var countryCode = data.val();
        this.startInputModeFromCode(countryCode, cityval);
    };

    $.fn.AutoAddressForm = function(countryIdSel, prefix, cityval) {
        var autoAddressForm = new AutoAddressForm(this, countryIdSel, prefix, cityval);
        $(this).data('auto-address-form', autoAddressForm);
    };

})(jQuery);