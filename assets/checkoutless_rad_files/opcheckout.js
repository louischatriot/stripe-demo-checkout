/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE_AFL.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    design
 * @package     base_default
 * @copyright   Copyright (c) 2011 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */

function setEqualHeight(columns)
{
    var maxHeight = 0;
    $$(columns).each(function(element){
        var height = $(element).getHeight();
        if(height>maxHeight)
        {
            maxHeight = height;
        }
    })

    $$(columns).each(function(element){
        $(element).setStyle({
            height:maxHeight+'px'
        });
    });
}

var Checkout = Class.create();
Checkout.prototype = {
    initialize: function(accordion, userInfos, urls){
        this.accordion = accordion;
        this.userInfos = userInfos;
        this.progressUrl = urls.progress;
        this.reviewUrl = urls.review;
        this.saveMethodUrl = urls.saveMethod;
        this.failureUrl = urls.failure;
        this.billingForm = false;
        this.shippingForm= false;
        this.syncBillingShipping = false;
        this.method = '';
        this.payment = '';
        this.loadWaiting = false;
        this.steps = ['login', 'billing', 'shipping', 'payment'];

        //this.onSetMethod = this.nextStep.bindAsEventListener(this);

        this.accordion.disallowAccessToNextSections = true;
    },

    getActiveStep: function(){

        var activeStep = "";
        $$('li.section').each(function(element){
            if($(element).hasClassName('active'))
            {
                activeStep = $(element).id;
            }
        });

        activeStep = activeStep.replace('opc-', '');

        return activeStep;
    },

    back: function(){
        if (this.loadWaiting) return;

        var activeStep = this.getActiveStep();
        var gotoStep = '';

        $('checkout-progress-wrapper').removeClassName('payment-step');

        if(activeStep=='shipping')
        {
            location.href = this.failureUrl;
        }
        else if(activeStep=='payment')
        {
            gotoStep = 'shipping';
            this.accordion.openSection('opc-'+gotoStep);
            this.updateStepTrack(gotoStep);
        }
        else
        {
            this.accordion.openPrevSection(true);
        }
    },

    ajaxFailure: function(){
        location.href = this.failureUrl;
    },

    reloadProgressBlock: function(){
        var updater = new Ajax.Updater('checkout-progress-wrapper', this.progressUrl, {method: 'get', onFailure: this.ajaxFailure.bind(this), onComplete: function(e){

            $$('#checkout-step-payment button .please-wait').each(function(element){
                var spin = new CanvasLoader($(element).id);
                spin.setColor('#ffffff');
                spin.setShape('spiral');
                spin.setDiameter(18);
                spin.show();
            });

            $$('#checkout-progress-wrapper button .please-wait').each(function(element){
                var spin = new CanvasLoader($(element).id);
                spin.setColor('#ffffff');
                spin.setShape('spiral');
                spin.setDiameter(18);
                spin.show();
            });

            $$('#please-wait-2').each(function(element){
                var spin = new CanvasLoader($(element).id);
                spin.setColor('#ffffff');
                spin.setShape('spiral');
                spin.setDiameter(18);
                spin.show();
            });

            }}
        );
    },

    reloadReviewBlock: function(){
        var updater = new Ajax.Updater('checkout-review-load', this.reviewUrl, {method: 'get', onFailure: this.ajaxFailure.bind(this)});
    },

    _disableEnableAll: function(element, isDisabled) {
        var descendants = element.descendants();
        for (var k in descendants) {
            descendants[k].disabled = isDisabled;
        }
        element.disabled = isDisabled;
    },

    setLoadWaiting: function(step, keepDisabled) {
        var myThis=this;
        if (step) {
            if (this.loadWaiting) {
                this.setLoadWaiting(false);
            }
            var containers = $$('.'+step+'-buttons-container');
            containers.each(function(container){
                $(container).addClassName('disabled');
                myThis._disableEnableAll($(container), true);
            });

            $$('.'+step+'-button').each(function(element){
                $(element).addClassName('waiting');
                $(element).down('.button-span').hide();
                $(element).down('.please-wait').show();
            });

            jQuery('body').addClass('is-waiting');
            if (!jQuery('#wait-full-page').length) {
                jQuery('body').append('<div class="wait-full-page"><div id="wait-full-page"></div></div>');
                var spin = new CanvasLoader('wait-full-page');
                spin.setColor('#ffffff');
                spin.setShape('spiral');
                spin.setDiameter(50);
                spin.show();
            }
        } else {
            if (this.loadWaiting) {
                var containers = $$('.'+this.loadWaiting+'-buttons-container');
                var isDisabled = (keepDisabled ? true : false);
                containers.each(function(container){
                    if (!isDisabled) {
                        $(container).removeClassName('disabled');
                    }
                    myThis._disableEnableAll($(container), isDisabled);
                });

                $$('.'+this.loadWaiting+'-button').each(function(element){
                    $(element).removeClassName('waiting');
                    $(element).down('.button-span').show();
                    $(element).down('.please-wait').hide();
                });
                jQuery('body').removeClass('is-waiting');
            }
        }
        this.loadWaiting = step;
    },

    returnToBilling: function(flag)
    {
        if(!flag)
        {
            this.gotoSection('billing');
        }
        else
        {
            billing.setSameAsShipping(true);
            billing.save();
        }
    },

    backToSection: function(section)
    {
        if (this.loadWaiting) return;
        this.updateStepTrack(section);
        $('checkout-progress-wrapper').removeClassName('payment-step');
        this.accordion.openSection('opc-'+section);
    },

    gotoSection: function(section)
    {
        this.updateStepTrack(section);
        section = $('opc-'+section);
        section.addClassName('allow');
        this.accordion.openSection(section);
    },

    updateStepTrack: function(section){
        $$('.control-block li').each(function(element){
            $(element).removeClassName('current');
        });

        $$('.control-block .step-'+section).each(function(element){
            $(element).addClassName('current');
        });

        if(section=='payment')
            $('back_btn').innerHTML = Translator.translate('livraison');
        else
            $('back_btn').innerHTML = Translator.translate('Panier');
    },

    setMethod: function(){
        if ($('login:guest') && $('login:guest').checked) {
            this.method = 'guest';
            var request = new Ajax.Request(
                this.saveMethodUrl,
                {method: 'post', onFailure: this.ajaxFailure.bind(this), parameters: {method:'guest'}}
            );
            Element.hide('register-customer-password');
            this.gotoSection('billing');
        }
        else if($('login:register') && ($('login:register').checked || $('login:register').type == 'hidden')) {
            this.method = 'register';
            var request = new Ajax.Request(
                this.saveMethodUrl,
                {method: 'post', onFailure: this.ajaxFailure.bind(this), parameters: {method:'register'}}
            );
            Element.show('register-customer-password');
            this.gotoSection('shipping');
        }
        else{
            alert(Translator.translate('Please choose to register or to checkout as a guest'));
            return false;
        }
    },

    setBilling: function() {
        if (($('billing:use_for_shipping_yes')) && ($('billing:use_for_shipping_yes').checked)) {
            shipping.syncWithBilling();
            $('opc-shipping').addClassName('allow');
            this.gotoSection('shipping_method');
        } else if (($('billing:use_for_shipping_no')) && ($('billing:use_for_shipping_no').checked)) {
            $('shipping:same_as_billing').checked = false;
            this.gotoSection('shipping');
        } else {
            $('shipping:same_as_billing').checked = true;
            this.gotoSection('shipping');
        }

        // this refreshes the checkout progress column
        this.reloadProgressBlock();

//        if ($('billing:use_for_shipping') && $('billing:use_for_shipping').checked){
//            shipping.syncWithBilling();
//            //this.setShipping();
//            //shipping.save();
//            $('opc-shipping').addClassName('allow');
//            this.gotoSection('shipping_method');
//        } else {
//            $('shipping:same_as_billing').checked = false;
//            this.gotoSection('shipping');
//        }
//        this.reloadProgressBlock();
//        //this.accordion.openNextSection(true);
    },

    setShipping: function() {
        this.reloadProgressBlock();
        //this.nextStep();
        this.gotoSection('shipping_method');
        //this.accordion.openNextSection(true);
    },

    setShippingMethod: function() {
        this.reloadProgressBlock();
        //this.nextStep();
        this.gotoSection('payment');
        //this.accordion.openNextSection(true);
    },

    setPayment: function() {
        this.reloadProgressBlock();
        //this.nextStep();
        this.gotoSection('review');
        //this.accordion.openNextSection(true);
    },

    setReview: function() {
        this.reloadProgressBlock();
        //this.nextStep();
        //this.accordion.openNextSection(true);
    },

    setStepResponse: function(response){
        if (response.update_section) {
            $('checkout-'+response.update_section.name+'-load').update(response.update_section.html);
        }
        if (response.allow_sections) {
            response.allow_sections.each(function(e){
                $('opc-'+e).addClassName('allow');
            });
        }

        if(response.duplicateShippingInfo)
        {
            billing.setSameAsShipping(true);
        }

        if (response.goto_section) {
            this.reloadProgressBlock();
            this.gotoSection(response.goto_section);
            return true;
        }
        if (response.redirect) {
            location.href = response.redirect;
            return true;
        }
        return false;
    }
}

// billing
var Billing = Class.create();
Billing.prototype = {
    initialize: function(form, addressUrl, saveUrl){
        this.form = form;
        if ($(this.form)) {
            $(this.form).observe('submit', function(event){this.save();Event.stop(event);}.bind(this));
        }
        this.addressUrl = addressUrl;
        this.saveUrl = saveUrl;
        this.onAddressLoad = this.fillForm.bindAsEventListener(this);
        this.onSave = this.nextStep.bindAsEventListener(this);
        this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);

        var buttons = $$('#' + $(this.form).id + ' .use-address');
        buttons.each(function(button) {
            Event.observe(button,'click',this.useCustomerAddress.bindAsEventListener(this));
        }.bind(this));

        var editButtons = $$('#' + $(this.form).id + ' .edit-address');
        editButtons.each(function(editButton) {
            Event.observe(editButton,'click',this.editCustomerAddress.bindAsEventListener(this));
        }.bind(this));

        var fields = $$('#' + $(this.form).id + ' input');
        fields.each(function(field) {
            Event.observe(field,'keyup',this.fieldChange.bindAsEventListener(this));
        }.bind(this));
    },

    fieldChange: function(event) {
        this.setAddressId(false);
    },

    editCustomerAddress: function(event) {

        var addressBlock = $(Event.element(event)).up('li');
        if(addressBlock.dataset !== undefined)
        {
            var addressId = addressBlock.dataset.addressid;
        }
        else
        {
            var addressId = addressBlock.getAttribute('data-addressid');
        }

        this.setAddressId(false);
        this.setAddress(addressId);
        Event.stop(event);
    },

    useCustomerAddress: function(event) {
        this.setSameAsShipping(false);

        var addressBlock = $(Event.element(event)).up('li');
        if(addressBlock.dataset !== undefined)
        {
            var addressId = addressBlock.dataset.addressid;
        }
        else
        {
            var addressId = addressBlock.getAttribute('data-addressid');
        }

        this.setAddressId(addressId);
        Event.stop(event);
        this.save();
    },

    setAddressId: function(addressId) {

        $$('#' + $(this.form).id + ' .customer-address').each(function(el){
            $(el).removeClassName('used-address');
        });

        if(addressId)
        {
            $('billing-address-id').value = addressId;
            $('billing_address_'+addressId).addClassName('used-address');
        }
        else
        {
            $('billing-address-id').value = "";
        }
    },

    setAddress: function(addressId){
        if (addressId) {
            request = new Ajax.Request(
                this.addressUrl+addressId,
                {method:'get', onSuccess: this.onAddressLoad, onFailure: checkout.ajaxFailure.bind(checkout)}
            );
        }
        else {
            this.fillForm(false);
        }
    },

    newAddress: function(isNew){
        if (isNew) {
            this.resetSelectedAddress();
            Element.show('billing-new-address-form');
        } else {
            Element.hide('billing-new-address-form');
        }
    },

    resetSelectedAddress: function(){
        var selectElement = $('billing-address-select')
        if (selectElement) {
            selectElement.value='';
        }
    },

    fillForm: function(transport){
        var elementValues = {};
        if (transport && transport.responseText){
            try{
                elementValues = eval('(' + transport.responseText + ')');
            }
            catch (e) {
                elementValues = {};
            }
        }
        else{
            this.resetSelectedAddress();
        }
        var newAddrForm = jQuery('#billing-new-address-form');
        var hexaposte = newAddrForm.data('address-postcode');
        arrElements = Form.getElements(this.form);
        for (var elemIndex in arrElements) {
            if (arrElements[elemIndex].id) {
                var fieldName = arrElements[elemIndex].id.replace(/^billing:/, '');

                if(fieldName!='save_in_address_book')
                {
                    arrElements[elemIndex].value = elementValues[fieldName] ? elementValues[fieldName] : '';
                }

                if(fieldName=='address_id')
                {
                    arrElements[elemIndex].value = elementValues['entity_id'];
                }

                if (fieldName == 'country_id'){
                    billingRegionUpdater.update();
                }

                if (hexaposte != undefined && fieldName == 'city' && elementValues[fieldName]){
                    hexaposte.selectCity(elementValues[fieldName]);
                }
            }
        }
        if (hexaposte != undefined) {
            hexaposte.request();
        }

        jQuery('body,html').animate({
            scrollTop: newAddrForm.offset().top
        }, 800);
    },

    toggleTitle: function(mode) {

        $$('#' + $(this.form).id + ' .form-title span').each(function(el){
            $(el).hide();
        });
        $$('#' + $(this.form).id + ' .form-title span.'+mode).each(function(el){
            $(el).show();
        });
    },

    setSameAsShipping: function(flag) {
        /*$('billing:same_as_shipping').checked = flag;*/
        /*$('shipping:use_for_billing_yes').value = 0;*/

        if (flag) {
            this.syncWithShipping();
        }
    },

    syncWithShipping: function () {
        /*$('billing:same_as_shipping').checked = true;*/
        if (!$('shipping-address-id') || !$('shipping-address-id').value) {
            arrElements = Form.getElements(this.form);
            var newAddrForm = jQuery('#billing-new-address-form');
            var hexaposte = newAddrForm.data('address-postcode');
            for (var elemIndex in arrElements) {
                if (arrElements[elemIndex].id) {
                    var sourceField = $(arrElements[elemIndex].id.replace(/^billing:/, 'shipping:'));
                    if (sourceField){
                        arrElements[elemIndex].value = sourceField.value;
                    }
                    if (hexaposte != undefined && sourceField.id == 'shipping:city' && sourceField.value) {
                        hexaposte.selectCity(sourceField.value);
                    }
                }
            }
            if (hexaposte != undefined) {
                hexaposte.request();
            }
            billingRegionUpdater.update();
            $('billing:region_id').value = $('shipping:region_id').value;
            $('billing:region').value = $('shipping:region').value;
        } else {
            $('billing-address-id').value = $('shipping-address-id').value;
        }
    },

    save: function(){
        if (checkout.loadWaiting!=false) return;

        var success = false;

        if(!$('billing-address-id').value)
        {
            var validator = new Validation(this.form);
            if (validator.validate()) {
                success = true;
            }
        }
        else
        {
            success = true;
        }

        if(success)
        {
            checkout.setLoadWaiting('billing');

            if (typeof analytics != 'undefined') {

                if($('billing-address-id').value) {
                    analytics.track('Added Billing Address', {
                        user_id: checkout.userInfos['user_id'],
                        device_type: checkout.userInfos['device_type'],
                        saved_address: $('billing-address-id').value
                    })
                }
                else {
                    analytics.track('Added Billing Address', {
                        user_id: checkout.userInfos['user_id'],
                        device_type: checkout.userInfos['device_type'],
                        firstname: $('billing:firstname').value,
                        lastname: $('billing:lastname').value,
                        telephone: $('billing:telephone').value,
                        address: $('billing:street1').value,
                        address_precisions: $('billing:street2').value,
                        postal_code: $('billing:postcode').value,
                        city: $('billing:city').value,
                        country_code: $('billing:country_id').value
                    })
                }
            }

            var request = new Ajax.Request(
                this.saveUrl,
                {
                    method: 'post',
                    onComplete: this.onComplete,
                    onSuccess: this.onSave,
                    onFailure: checkout.ajaxFailure.bind(checkout),
                    parameters: Form.serialize(this.form)
                }
            );
        }
    },

    resetLoadWaiting: function(transport){
        checkout.setLoadWaiting(false);
    },

    /**
     This method recieves the AJAX response on success.
     There are 3 options: error, redirect or html with shipping options.
     */
    nextStep: function(transport){
        if (transport && transport.responseText){
            try{
                response = eval('(' + transport.responseText + ')');
            }
            catch (e) {
                response = {};
            }
        }

        if (response.error){
            if ((typeof response.message) == 'string') {
                console.log('ALERT', response.message);
                alert(response.message);
            } else {
                if (window.billingRegionUpdater) {
                    billingRegionUpdater.update();
                }

                console.log('ALERT', response.message.join("\n"));
                alert(response.message.join("\n"));
            }

            return false;
        }

        //checkout.setStepResponse(response);

        if (response.update_section) {
            $('checkout-'+response.update_section.name+'-load').replace(response.update_section.html);
        }

        if (response.allow_sections) {
            response.allow_sections.each(function(e){
                $('opc-'+e).addClassName('allow');
            });
        }

        //payment.initWhatIsCvvListeners();
        //payment.initCCNumberListener();

        if (response.goto_section) {
            checkout.gotoSection(response.goto_section);
            checkout.reloadProgressBlock();
            return;
        }

        if (response.payment_methods_html) {
            $('checkout-payment-method-load').replace(response.payment_methods_html);
        }

        // DELETE
        //alert('error: ' + response.error + ' / redirect: ' + response.redirect + ' / shipping_methods_html: ' + response.shipping_methods_html);
        // This moves the accordion panels of one page checkout and updates the checkout progress
        //checkout.setBilling();
    }
}

// shipping
var Shipping = Class.create();
Shipping.prototype = {
    initialize: function(form, addressUrl, saveUrl, methodsUrl){
        this.form = form;
        if ($(this.form)) {
            $(this.form).observe('submit', function(event){this.save();Event.stop(event);}.bind(this));
        }
        this.addressUrl = addressUrl;
        this.saveUrl = saveUrl;
        this.methodsUrl = methodsUrl;
        this.onAddressLoad = this.fillForm.bindAsEventListener(this);
        this.onSave = this.nextStep.bindAsEventListener(this);
        this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);

        var buttons = $$('#' + $(this.form).id + ' .use-address');
        buttons.each(function(button) {
            Event.observe(button,'click',this.useCustomerAddress.bindAsEventListener(this));
        }.bind(this));

        var editButtons = $$('#' + $(this.form).id + ' .edit-address');
        editButtons.each(function(editButton) {
            Event.observe(editButton,'click',this.editCustomerAddress.bindAsEventListener(this));
        }.bind(this));

        var fields = $$('#' + $(this.form).id + ' input');
        fields.each(function(field) {
            Event.observe(field,'keyup',this.fieldChange.bindAsEventListener(this));
        }.bind(this));

        document.observe("dom:loaded", function() {
            setEqualHeight('.address-book li');
        });

        if (typeof SMARTYSTREETS_KEY !== 'undefined') {
            jQuery.LiveAddress({
                key: SMARTYSTREETS_KEY,
                autocomplete:false,
                autoVerify:false,
                addresses: [{
                    id: 'shipping',
                    street: '#shipping\\:street1',
                    street2:'#shipping\\:street2',
                    city: '#shipping\\:city',
                    state: '#shipping\\:region_id',
                    zipcode: '#shipping\\:postcode',
                    country: '#shipping\\:country_id'
                }]
            });
        }
    },

    fieldChange: function(event) {
        this.setAddressId(false);
    },

    editCustomerAddress: function(event) {

        var addressBlock = $(Event.element(event)).up('li');
        if(addressBlock.dataset !== undefined)
        {
            var addressId = addressBlock.dataset.addressid;
        }
        else
        {
            var addressId = addressBlock.getAttribute('data-addressid');
        }

        this.setAddressId(false);
        this.setAddress(addressId);
        Event.stop(event);
    },

    useCustomerAddress: function(event) {

        var addressBlock = $(Event.element(event)).up('li');
        if(addressBlock.dataset !== undefined)
        {
            var addressId = addressBlock.dataset.addressid;
        }
        else
        {
            var addressId = addressBlock.getAttribute('data-addressid');
        }

        this.setAddressId(addressId);
        Event.stop(event);
        this.save();
    },

    setAddressId: function(addressId) {

        $$('#' + $(this.form).id + ' .customer-address').each(function(el){
            $(el).removeClassName('used-address');
        });

        if(addressId)
        {
            $('shipping-address-id').value = addressId;
            $('shipping_address_'+addressId).addClassName('used-address');
        }
        else
        {
            $('shipping-address-id').value = "";
        }
    },

    setAddress: function(addressId){
        if (addressId) {
            request = new Ajax.Request(
                this.addressUrl+addressId,
                {method:'get', onSuccess: this.onAddressLoad, onFailure: checkout.ajaxFailure.bind(checkout)}
            );
        }
        else {
            this.fillForm(false);
        }
    },

    newAddress: function(isNew){
        if (isNew) {
            this.resetSelectedAddress();
            Element.show('shipping-new-address-form');
        } else {
            Element.hide('shipping-new-address-form');
        }
        shipping.setSameAsBilling(false);
    },

    resetSelectedAddress: function(){
        var selectElement = $('shipping-address-select')
        if (selectElement) {
            selectElement.value='';
        }
    },

    fillForm: function(transport){
        this.toggleTitle('edit');
        var elementValues = {};
        if (transport && transport.responseText){
            try{
                elementValues = eval('(' + transport.responseText + ')');
            }
            catch (e) {
                elementValues = {};
            }
        }
        else{
            this.resetSelectedAddress();
        }
        var newAddrForm = jQuery('#shipping-new-address-form');
        var hexaposte = newAddrForm.data('address-postcode');
        var autoAddrForm = newAddrForm.data('auto-address-form');
        arrElements = Form.getElements(this.form);
        for (var elemIndex in arrElements) {
            if (arrElements[elemIndex].id) {
                var fieldName = arrElements[elemIndex].id.replace(/^shipping:/, '');

                if(fieldName!='use_for_billing_yes' && fieldName!='save_in_address_book')
                {
                    arrElements[elemIndex].value = elementValues[fieldName] ? elementValues[fieldName] : '';
                }
                if(fieldName=='address_id')
                {
                    arrElements[elemIndex].value = elementValues['entity_id'];
                }

                if (fieldName == 'country_id'){
                    var countryCode = elementValues[fieldName];
                    shippingRegionUpdater.update();
                }

                if (fieldName == 'city' && elementValues[fieldName]){
                    var cityName = elementValues[fieldName];
                    if (hexaposte != undefined) {
                        hexaposte.selectCity(elementValues[fieldName]);
                    }
                }
            }
        }
        if (autoAddrForm != undefined && countryCode != undefined && cityName != undefined) {
            autoAddrForm.startInputModeFromCode(countryCode, cityName);
        }
        if (hexaposte != undefined) {
            hexaposte.request();
        }

        jQuery('body,html').animate({
            scrollTop: newAddrForm.offset().top
        }, 800);
    },

    toggleTitle: function(mode) {

        $$('#' + $(this.form).id + ' .form-title-alt span').each(function(el){
            $(el).hide();
        });
        $$('#' + $(this.form).id + ' .form-title-alt span.'+mode).each(function(el){
            $(el).show();
        });
    },

    setUseForBilling: function(flag) {
        /*$('billing:same_as_shipping').checked = flag;*/
    },

    syncWithBilling: function () {
        $('billing-address-select') && this.newAddress(!$('billing-address-select').value);
        $('shipping:same_as_billing').checked = true;
        if (!$('billing-address-select') || !$('billing-address-select').value) {
            arrElements = Form.getElements(this.form);
            for (var elemIndex in arrElements) {
                if (arrElements[elemIndex].id) {
                    var sourceField = $(arrElements[elemIndex].id.replace(/^shipping:/, 'billing:'));
                    if (sourceField){
                        arrElements[elemIndex].value = sourceField.value;
                    }
                }
            }
            //$('shipping:country_id').value = $('billing:country_id').value;
            shippingRegionUpdater.update();
            $('shipping:region_id').value = $('billing:region_id').value;
            $('shipping:region').value = $('billing:region').value;
            //shippingForm.elementChildLoad($('shipping:country_id'), this.setRegionValue.bind(this));
        } else {
            $('shipping-address-select').value = $('billing-address-select').value;
        }
    },

    setRegionValue: function(){
        $('shipping:region').value = $('billing:region').value;
    },

    save: function(){
        if (checkout.loadWaiting!=false) return;

        var success = false;

        if(!$('shipping-address-id').value)
        {
            var validator = new Validation(this.form);
            if (validator.validate()) {
                success = true;
            }

            billing.setSameAsShipping(1);
        }
        else
        {
            success = true;
        }

        if(success)
        {
            checkout.setLoadWaiting('shipping');
            if (typeof analytics != 'undefined') {
                if ($('shipping-address-id').value) {
                    analytics.track('Added Shipping Address', {
                        user_id: checkout.userInfos['user_id'],
                        device_type: checkout.userInfos['device_type'],
                        saved_address: $('shipping-address-id').value
                    })
                }
                else {
                    analytics.track('Added Shipping Address', {
                        user_id: checkout.userInfos['user_id'],
                        device_type: checkout.userInfos['device_type'],
                        firstname: $('shipping:firstname').value,
                        lastname: $('shipping:lastname').value,
                        telephone: $('shipping:telephone').value,
                        address: $('shipping:street1').value,
                        address_precisions: $('shipping:street2').value,
                        postal_code: $('shipping:postcode').value,
                        city: $('shipping:city').value,
                        country_code: $('shipping:country_id').value
                    })
                }
            }
            var request = new Ajax.Request(
                this.saveUrl,
                {
                    method:'post',
                    onComplete: this.onComplete,
                    onSuccess: this.onSave,
                    onFailure: checkout.ajaxFailure.bind(checkout),
                    parameters: Form.serialize(this.form)
                }
            );
        }
    },

    resetLoadWaiting: function(transport){
        checkout.setLoadWaiting(false);
    },

    nextStep: function(transport){
        if (transport && transport.responseText){
            try{
                response = eval('(' + transport.responseText + ')');
            }
            catch (e) {
                response = {};
            }
        }
        if (response.error){
            if ((typeof response.message) == 'string') {
                console.log('ALERT', response.message);
                alert(response.message);
            } else {
                if (window.shippingRegionUpdater) {
                    shippingRegionUpdater.update();
                }
                console.log('ALERT', response.message.join("\n"));
                alert(response.message.join("\n"));
            }

            return false;
        }

        //checkout.setStepResponse(response);

        if (response.update_section) {
            $('checkout-'+response.update_section.name+'-load').replace(response.update_section.html);
        }

        //payment.initWhatIsCvvListeners();
        //payment.initCCNumberListener();

        if (response.allow_sections) {
            response.allow_sections.each(function(e){
                $('opc-'+e).addClassName('allow');
            });
        }

        if (response.goto_section) {
            checkout.gotoSection(response.goto_section);
            checkout.reloadProgressBlock();
            return;
        }

        if (response.payment_methods_html) {
            $('checkout-payment-method-load').replace(response.payment_methods_html);
        }

        /*
         var updater = new Ajax.Updater(
         'checkout-shipping-method-load',
         this.methodsUrl,
         {method:'get', onSuccess: checkout.setShipping.bind(checkout)}
         );
         */
        //checkout.setShipping();
    }
}

// shipping method
var ShippingMethod = Class.create();
ShippingMethod.prototype = {
    initialize: function(form, saveUrl){
        this.form = form;
        if ($(this.form)) {
            $(this.form).observe('submit', function(event){this.save();Event.stop(event);}.bind(this));
        }
        this.saveUrl = saveUrl;
        this.validator = new Validation(this.form);
        this.onSave = this.nextStep.bindAsEventListener(this);
        this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);
    },

    validate: function() {
        var methods = document.getElementsByName('shipping_method');
        if (methods.length==0) {
            alert(Translator.translate('Your order cannot be completed at this time as there is no shipping methods available for it. Please make necessary changes in your shipping address.'));
            return false;
        }

        if(!this.validator.validate()) {
            return false;
        }

        for (var i=0; i<methods.length; i++) {
            if (methods[i].checked) {
                return true;
            }
        }
        alert(Translator.translate('Please specify shipping method.'));
        return false;
    },

    save: function(){

        if (checkout.loadWaiting!=false) return;
        if (this.validate()) {
            checkout.setLoadWaiting('shipping-method');
            var request = new Ajax.Request(
                this.saveUrl,
                {
                    method:'post',
                    onComplete: this.onComplete,
                    onSuccess: this.onSave,
                    onFailure: checkout.ajaxFailure.bind(checkout),
                    parameters: Form.serialize(this.form)
                }
            );
        }
    },

    resetLoadWaiting: function(transport){
        checkout.setLoadWaiting(false);
    },

    nextStep: function(transport){
        if (transport && transport.responseText){
            try{
                response = eval('(' + transport.responseText + ')');
            }
            catch (e) {
                response = {};
            }
        }

        if (response.error) {
            console.log('ALERT', response.message);
            alert(response.message);
            return false;
        }

        if (response.update_section) {
            $('checkout-'+response.update_section.name+'-load').update(response.update_section.html);
        }

        payment.initWhatIsCvvListeners();
        payment.initCCNumberListener();

        if (response.goto_section) {
            checkout.gotoSection(response.goto_section);
            checkout.reloadProgressBlock();
            return;
        }

        if (response.payment_methods_html) {
            $('checkout-payment-method-load').update(response.payment_methods_html);
        }

        checkout.setShippingMethod();
    }
}


// payment
var Payment = Class.create();
Payment.prototype = {
    beforeInitFunc:$H({}),
    afterInitFunc:$H({}),
    beforeValidateFunc:$H({}),
    afterValidateFunc:$H({}),
    initialize: function(form, saveUrl, successUrl){
        this.pixelAlreadyFired = false;
        this.pixelAlreadyFired2 = false;
        this.form = form;
        this.saveUrl = saveUrl;
        this.successUrl = successUrl;
        this.onSave = this.nextStep.bindAsEventListener(this);
        this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);
    },

    addBeforeInitFunction : function(code, func) {
        this.beforeInitFunc.set(code, func);
    },

    beforeInit : function() {
        (this.beforeInitFunc).each(function(init){
            (init.value)();;
        });
    },

    init : function () {
        this.beforeInit();

        if($('checkout-progress-wrapper'))
            $('checkout-progress-wrapper').addClassName('payment-step');

        var elements = Form.getElements(this.form);
        if ($(this.form)) {
            $(this.form).observe('submit', function(event){this.save();Event.stop(event);}.bind(this));
        }
        var method = null;
        for (var i=0; i<elements.length; i++) {
            if (elements[i].name=='payment[method]') {
                if (elements[i].checked) {
                    method = elements[i].value;
                }
            } else if(!elements[i].hasClassName('no-disable')) {
                elements[i].disabled = true;
            }
            elements[i].setAttribute('autocomplete','off');
        }
        if (method) this.switchMethod(method);
        this.afterInit();
    },

    addAfterInitFunction : function(code, func) {
        this.afterInitFunc.set(code, func);
    },

    afterInit : function() {
        (this.afterInitFunc).each(function(init){
            (init.value)();
        });
    },

    switchMethod: function(method){
        if (this.currentMethod && $('payment_form_'+this.currentMethod)) {
            //this.changeVisible(this.currentMethod, true);
            $('payment_form_'+this.currentMethod).fire('payment-method:switched-off', {method_code : this.currentMethod});
        }
        if ($('payment_form_'+method)){
            this.changeVisible(method, false);
            $('payment_form_'+method).fire('payment-method:switched', {method_code : method});
        } else {
            //Event fix for payment methods without form like "Check / Money order"
            document.body.fire('payment-method:switched', {method_code : method});
        }

        if (method != 'cryozonic_stripe') {
            jQuery('#payment_form_cryozonic_stripe.stripe-new').removeClass('stripe-new');
            jQuery('#payment_form_cryozonic_stripe').find('.required-entry').removeClass('required-entry').attr('data-was-required', 1);
            jQuery('#payment_form_cryozonic_stripe input[type="radio"][name!="payment[method]"]').each(function(){ jQuery(this).prop('checked', false); });
        }
        else {
            console.log(window.useStripeCard);
            var item = jQuery('#payment_form_cryozonic_stripe');
            if (!window.useStripeCard) {
                item.find('[data-was-required]').addClass('required-entry');
                item.addClass('stripe-new');
            }
        }
        //
        //if(method=='ops_paypal')
        //{
        //    $$('.cc-button').each(function(element){
        //        $(element).hide();
        //    });
        //
        //    $$('.paypal-button').each(function(element){
        //        $(element).show();
        //    });
        //}
        //else if($('paypal-payment-button'))
        //{
            $$('.paypal-button').each(function(element){
                $(element).hide();
            });

            $$('.cc-button').each(function(element){
                $(element).show();
            });
        //}
        if (method) {
            this.lastUsedMethod = method;
        }
        this.currentMethod = method;
        setTimeout(function(){ jQuery('input[name="payment[method]"][value="' + method + '"]').prop('checked', true); }, 0);
    },

    changeVisible: function(method, mode) {
        var block = 'payment_form_' + method;
        [block + '_before', block, block + '_after'].each(function(el) {
            element = $(el);
            if (element) {
                element.style.display = (mode) ? 'none' : '';
                element.select('input', 'select', 'textarea', 'button').each(function(field) {
                    field.disabled = mode;
                });
            }
        });
    },

    addBeforeValidateFunction : function(code, func) {
        this.beforeValidateFunc.set(code, func);
    },

    beforeValidate : function() {
        var validateResult = true;
        var hasValidation = false;
        (this.beforeValidateFunc).each(function(validate){
            hasValidation = true;
            if ((validate.value)() == false) {
                validateResult = false;
            }
        }.bind(this));
        if (!hasValidation) {
            validateResult = false;
        }
        return validateResult;
    },

    validate: function() {
        var result = this.beforeValidate();
        if (result) {
            return true;
        }
        var methods = document.getElementsByName('payment[method]');
        if (methods.length==0) {
            alert(Translator.translate('Your order cannot be completed at this time as there is no payment methods available for it.'));
            return false;
        }
        for (var i=0; i<methods.length; i++) {
            if (methods[i].checked) {
                return true;
            }
        }
        result = this.afterValidate();
        if (result) {
            return true;
        }
        alert(Translator.translate('Please specify payment method.'));
        return false;
    },

    addAfterValidateFunction : function(code, func) {
        this.afterValidateFunc.set(code, func);
    },

    afterValidate : function() {
        var validateResult = true;
        var hasValidation = false;
        (this.afterValidateFunc).each(function(validate){
            hasValidation = true;
            if ((validate.value)() == false) {
                validateResult = false;
            }
        }.bind(this));
        if (!hasValidation) {
            validateResult = false;
        }
        return validateResult;
    },

    save: function(){
        if (checkout.loadWaiting!=false) return;
        var validator = new Validation(this.form);
        if (this.validate() && validator.validate()) {
            this.firePrePurchaseEvent();
            checkout.setLoadWaiting('payment');
            var request = new Ajax.Request(
                this.saveUrl,
                {
                    method:'post',
                    onSuccess: this.onSave,
                    onFailure: checkout.ajaxFailure.bind(checkout),
                    parameters: Form.serialize(this.form)
                }
            );
        }
    },

    firePrePurchaseEvent: function() {
        if (typeof quoteBaseGrandTotal != 'undefined' && typeof fbq != 'undefined' && !this.pixelAlreadyFired) {
            fbq('trackCustom', 'PrePurchase', {
                value: quoteBaseGrandTotal
            });
            this.pixelAlreadyFired = true;
        }
        if (typeof quoteBaseGrandTotal != 'undefined' && typeof analytics != 'undefined' && !this.pixelAlreadyFired2) {
            analytics.track('Added Payment Info', {
                user_id: checkout.userInfos['user_id'],
                device_type: checkout.userInfos['device_type'],
                total: quoteBaseGrandTotal
            });
            this.pixelAlreadyFired2 = true;
        }
    },

    resetLoadWaiting: function(){
        checkout.setLoadWaiting(false);
    },

    nextStep: function(transport){
        if (transport && transport.responseText){
            try{
                response = eval('(' + transport.responseText + ')');
            }
            catch (e) {
                response = {};
            }

            if (response.redirect) {
                /*$$('.payment-button').each(function(element){
                    $(element).hide();
                });*/
                this.isSuccess = true;
                location.href = response.redirect;
                return;
            }
            if (response.success) {
                $$('.payment-button').each(function(element){
                    $(element).hide();
                });
                this.isSuccess = true;
                window.location=this.successUrl;
            }
            else{
                this.resetLoadWaiting();

                var msg = response.error_messages;
                if (typeof(msg)=='object') {
                    msg = msg.join("\n");
                }
                if (msg) {
                    var _item = jQuery('#error-msg');
                    if (_item.length) {
                        _item.text(msg);
                    }
                    else {
                        alert(msg);
                    }
                }
            }

            if (response.update_section) {
                $('checkout-'+response.update_section.name+'-load').update(response.update_section.html);
            }

            if (response.goto_section) {
                checkout.gotoSection(response.goto_section);
                checkout.reloadProgressBlock();
            }
        }
        /*
         * if there is an error in payment, need to show error message
         */
        if (response.error) {
            if (response.fields) {
                var fields = response.fields.split(',');
                for (var i=0;i<fields.length;i++) {
                    var field = null;
                    if (field = $(fields[i])) {
                        Validation.ajaxError(field, response.error);
                    }
                }
                return;
            }
            var item = jQuery('#error-msg');
            if (item.length) {
                if (response.error !== true) {
                    item.text(response.error);
                }
            }
            else {
                alert(response.error);
            }
            return;
        }

        checkout.setStepResponse(response);
    },

    ccNumberChange: function(){
        if($('OPS_CC_CARDNO'))
        {
            var visaReg=new RegExp("^4","g");
            var mastercardReg=new RegExp("^5[1-5]","g");
            var amexReg=new RegExp("^3[47]","g");

            $('OPS_CC_CARDNO').removeClassName('visa-type');
            $('OPS_CC_CARDNO').removeClassName('mastercard-type');
            $('OPS_CC_CARDNO').removeClassName('amex-type');
            $('OPS_CC_BRAND').value = '';

            if(visaReg.test($('OPS_CC_CARDNO').value))
            {
                $('OPS_CC_BRAND').value = 'VISA';
                $('OPS_CC_CARDNO').addClassName('visa-type');
            }
            else if(mastercardReg.test($('OPS_CC_CARDNO').value))
            {
                $('OPS_CC_BRAND').value = 'MasterCard';
                $('OPS_CC_CARDNO').addClassName('mastercard-type');
            }
            else if(amexReg.test($('OPS_CC_CARDNO').value))
            {
                $('OPS_CC_BRAND').value = 'American Express';
                $('OPS_CC_CARDNO').addClassName('amex-type');
            }
        }
    },

    initWhatIsCvvListeners: function(){
        $$('.cvv-what-is-this').each(function(element){
            Event.observe(element, 'click', toggleToolTip);
        });

        Event.observe($('payment-tool-tip-close'), 'click', toggleToolTip);
    },

    initCCNumberListener: function(){
        Event.observe($('OPS_CC_CARDNO'),'keyup',this.ccNumberChange.bindAsEventListener(this));
    }
}
