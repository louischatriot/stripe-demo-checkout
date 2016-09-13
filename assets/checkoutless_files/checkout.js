var MagentoOmetria = Class.create();

// Core Ometria JS Class
MagentoOmetria.prototype = {
    initialize: function() {

    },

    // Update universal variable with checkout stage
    setCheckoutStage: function(stage) {
        // Set global variable
        if (window.universal_variable) window.universal_variable.page['om:checkout_stage'] = stage;
        if (window.ometria) ometria.trackCheckout(stage);
    },

    identifyUser: function(email, name) {
        if (!window.ometria) return;
        if (typeof name == "undefined") {
            ometria.identify(email);
        } else {
            ometria.identify(email, {'name': name});
        }
    }
};

// Core Ometria JS
var magentoOmetria = new MagentoOmetria();

document.observe("dom:loaded", function () {
    // We want to know when the checkout step changes
    // Overwrite the original gotoSection function in opcheckout.js and update our variable
    if (typeof Checkout != 'undefined'){
        var originalCheckout = Checkout.prototype.gotoSection
        Checkout.prototype.gotoSection = function () {
            try{
                magentoOmetria.setCheckoutStage(arguments[0]);
            } catch(e){}
            originalCheckout.apply(this, arguments);
        };
    }

    // Identify customers at checkout
    if ($('billing\:email')) $('billing\:email').observe('blur', function(el) {
        email      = $('billing\:email') ? $('billing\:email').value : '';
        firstname  = $('billing\:firstname') ? $('billing\:firstname').value : '';
        lastname   = $('billing\:lastname') ? $('billing\:lastname').value : '';
        if (email != "" && firstname != "" && lastname != "") {
            magentoOmetria.identifyUser(email, firstname + " " + lastname);
        } else if (email != "") {
            magentoOmetria.identifyUser(email);
        }
    });
});
