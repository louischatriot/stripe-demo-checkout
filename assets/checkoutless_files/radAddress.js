var RaaadAddressPostcode = (function($){
    function RaaadAddressPostcode(container, postcodeInputSelector, countryInputSelector, citySelectSelector, options) {

        this.container = $(container);

        var defaults = {
            sizeSearch: 0,
            waitingTime: 100,
            loadingMsg: 'Loading ...',
            defaultMsg: 'Insert your city postcode',
            selectCityMsg: 'Please select your city'
        };

        this.postcodeInput = $(postcodeInputSelector, this.container);
        this.countrySelect = $(countryInputSelector, this.container);
        this.citySelectSelector = citySelectSelector;
        this.initCitySelect();
        this.options = $.extend({}, defaults, options);
        this.eventNamespace = 'hexaposte';
        this.cityToSelect = null;
        this.lastValSent = null;

        this.url = this.postcodeInput.data('postcode-url') || '';
        this.resultXHR = null;
    }

    RaaadAddressPostcode.prototype.initCitySelect = function() {
        this.citySelect = $(this.citySelectSelector, this.container);

        return this;
    };

    RaaadAddressPostcode.prototype.enableListeners = function() {
        var self = this;
        self.clear();
        self.postcodeInput.on(
            'input.' + self.eventNamespace +
            ' change.' + self.eventNamespace +
            ' paste.' + self.eventNamespace, function() {
            var reqData = self.requestData();
            if (reqData == self.lastValSent) {
                return;
            }
            clearTimeout(self.resultTimer);
            if (self.resultXHR) self.resultXHR.abort();
            if (reqData) {
                self.resultTimer = setTimeout(function() {
                    self.request(reqData, self.countrySelect.val());
                },self.options.waitingTime);
            } else {
                self.clear();
            }
        });
        self.postcodeInput.on('blur.' + self.eventNamespace, function() {
            self.applyPostcode();
            self.fixPostcode();
        });
        self.citySelect.on('change.' + self.eventNamespace, function() {
            self.applyPostcode();
        });

        if (self.postcodeInput.val() && self.countrySelect.val()) {
            if (self.citySelect.data('city')) {
                self.selectCity(self.citySelect.data('city'));
            }
            self.request();
        }
    };

    RaaadAddressPostcode.prototype.disableListeners = function() {
        var self = this;
        self.postcodeInput.off(
            'input.' + self.eventNamespace +
            ' change.' + self.eventNamespace +
            ' paste.' + self.eventNamespace);

        self.postcodeInput.off('blur.' + self.eventNamespace);

        self.citySelect.off('change.' + self.eventNamespace);
    };

    RaaadAddressPostcode.prototype.requestData = function() {
        var self = this;
        if (self.countrySelect.val() == 'GB') {
            var split = self.postcodeInput.val().split(' ');
            if (split.length > 1) {
                return split[0];
            }
        }
        else if (self.postcodeInput.val().length > self.options.sizeSearch) {
            return self.postcodeInput.val();
        }
        return null;
    };

    RaaadAddressPostcode.prototype.applyPostcode = function() {
        if (this.countrySelect.val() != 'GB' && this.citySelect.find(":selected").attr('title')) {
            this.postcodeInput.val(this.citySelect.find(":selected").attr('title'));
        }
    };

    RaaadAddressPostcode.prototype.fixPostcode = function() {
        if (this.countrySelect.val() == 'GB') {
            var postcode = this.postcodeInput.val();
            if (postcode.length > 4 && postcode.indexOf(' ') == -1) {
                var firstpart = postcode.substr(0, postcode.length-3);
                var secondpart = postcode.substr(-3);
                this.postcodeInput.val(firstpart+' '+secondpart);
                this.request();
            }
        }
    };

    RaaadAddressPostcode.prototype.request = function(postcodeCall, countryIdCall) {
        var self = this;
        var postcode = postcodeCall || self.requestData();
        var countryId = countryIdCall || self.countrySelect.val();
        if (self.citySelect.length === 0) {
            return false;
        }
        self.resultXHR = $.ajax({
            url: self.url,
            data: {
                postcode: postcode,
                country: countryId
            },
            beforeSend: function () {
                self.lastValSent = postcode;
                self.loading();
            }
        }).done(function(data) {
                self.citySelect.empty();
                if (data.success) {
                    self.feed(data);
                } else {
                    self.error(data);
                }
            });
        return true;
    };

    RaaadAddressPostcode.prototype.selectCity = function(cityName) {
        this.cityToSelect = cityName.toUpperCase() || null;
    };

    RaaadAddressPostcode.prototype.error = function (data) {
        this.citySelect.prop('disabled', true);
        this.citySelect.empty();
        $('<option>', {
            value: '',
            text:  data.errors
        }).appendTo(this.citySelect);

        return this;
    };

    RaaadAddressPostcode.prototype.loading = function () {
        this.citySelect.prop('disabled', true);
        this.citySelect.empty();
        $('<option>', {
            value: '',
            text:  this.options.loadingMsg
        }).appendTo(this.citySelect);

        return this;
    };

    RaaadAddressPostcode.prototype.clear = function() {
        this.citySelect.prop('disabled', true);
        this.lastValSent = null;
        this.citySelect.empty();
        $('<option>', {
            value: '',
            text:  this.options.defaultMsg
        }).appendTo(this.citySelect);

        return this;
    };

    RaaadAddressPostcode.prototype.feed = function(cityList) {
        this.citySelect.prop('disabled', false);
        $('<option>', {
            value: '',
            text:  this.options.selectCityMsg
        }).appendTo(this.citySelect);
        for (var i = 0; i < cityList.city.size(); i++) {
            $('<option>', {
                value: cityList.city[i].name,
                title: cityList.city[i].zipcode,
                text:  cityList.city[i].zipcode + ' ' + cityList.city[i].name
            }).appendTo(this.citySelect);
        }

        if (this.cityToSelect) {
            this.citySelect.val(this.cityToSelect);
            this.cityToSelect = null;
        }
        else {
            var children = this.citySelect.children();
            if (children.length > 2) {
                // If more than 1 city, show selectCityMsg
                children.eq(0).attr("selected", "selected")
            }
            else {
                // If only 1 city, select city
                children.eq(1).attr("selected", "selected")
            }
        }

        return this;
    };

    $.fn.addressPostcode = function(options) {
        return this.each(function() {
            var $this = $(this);

            var addressPostcode = $this.data('address-postcode');
            if (typeof addressPostcode == 'undefined') {
                var postcodeInputSelector = $this.data('address-postcode-input') || options.postcodeInputSelector;
                var countryInputSelector = $this.data('address-country-select') || options.countrySelectSelector;
                var citySelectSelector = $this.data('address-city-select') || options.citySelectSelector;

                addressPostcode = new RaaadAddressPostcode($this, postcodeInputSelector, countryInputSelector, citySelectSelector, options);

                $this.data('address-postcode', addressPostcode);
            }
        });
    };

    return RaaadAddressPostcode;
})(jQuery);
