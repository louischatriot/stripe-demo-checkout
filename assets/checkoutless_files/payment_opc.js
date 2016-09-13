Event.observe(window, 'load', function() {
    payment.save = payment.save.wrap(function(originalSaveMethod) {
        console.log('ICI');
        console.log('payment.currentMethod', payment.currentMethod);
        payment.originalSaveMethod = originalSaveMethod;
        //this form element is always set in payment object this.form or payment.form no need to bind to specific
        var opsValidator = new Validation(payment.form);
        if (!opsValidator.validate()) {
            return;
        }
        console.log('ICI');
        if (payment.currentMethod == 'cryozonic_stripe' &&
            jQuery('[name="payment[cc_saved]"]').is(':checked') || jQuery('[name="payment[cc_number]"]').is(':visible')
        ) {
            payment.stripeCard(originalSaveMethod);
        }
        if ('ops_directDebit' == payment.currentMethod) {
            payment.saveOpsDirectDebit();
            return; //return as you have another call chain here
        }
//        if ('ops_cc' == payment.currentMethod) {
//            payment.saveOpsCcBrand();
//            return; //return as you have another call chain here
//        }

        originalSaveMethod();
    });

    payment.stripeCard = function(originalSaveMethod){
        if (/^\/fr/.test(location.pathname)) {
            console.log('Stripe FR');
            Stripe.setLanguage('fr');
        }
	else  if (/^\/de/.test(location.pathname)) {
            console.log('Stripe DE');
            Stripe.setLanguage('de');
        }
	else {
	    console.log('NON FR');
	}

        checkout.setLoadWaiting(true);

        var cardDetails = {
            name: 	jQuery('[name="payment[cc_owner]"]').val(),
            number:	jQuery('[name="payment[cc_number]"]').val(),
            cvc:	jQuery('[name="payment[cc_cid]"]').val(),
            exp_month:	jQuery('[name="payment[cc_exp_month]"]').val(),
            exp_year:	jQuery('[name="payment[cc_exp_year]"]').val()
        };
	console.log('createToken');
        Stripe.card.createToken(cardDetails, function (status, response) {
            checkout.setLoadWaiting(false);
            if (response.error)
            {
                if (typeof IWD != "undefined")
                {
                    IWD.OPC.Checkout.hideLoader();
                    IWD.OPC.Checkout.xhr = null;
                    IWD.OPC.Checkout.unlockPlaceOrder();
                }
                jQuery('#error-msg').text(response.error.message);
            }
            else
            {
		console.log('response', response);
                stripeTokens[JSON.stringify(cardDetails)] = response.id;
                setStripeToken(response.id);
                originalSaveMethod();
            }
        });
	console.log('!createToken');
    };

    payment.saveOpsDirectDebit = function() {
        checkout.setLoadWaiting('payment');
        var countryId = $('ops_directdebit_country_id').value;
        var accountNo = $('ops_directdebit_account_no').value;
        var bankCode  = $('ops_directdebit_bank_code').value;
        var CN        = $('ops_directdebit_CN').value;
        new Ajax.Request(opsDirectDebitUrl, {
            method: 'post',
            parameters: { country : countryId, account : accountNo, bankcode : bankCode, CN : CN },
            onSuccess: function(transport) {
                checkout.setLoadWaiting(false);
                payment.originalSaveMethod();
            },
            onFailure: function(transport) {
                checkout.setLoadWaiting(false);
                if (transport.responseText && 0 < transport.responseText.length) {
                    message = transport.responseText;
                } else {
                    message = 'Payment failed. Please select another payment method.';
                }
                alert(Translator.translate(message));
                checkout.setLoadWaiting(false);
                payment.holdOneStepCheckout = true;
            }
        });
    };

    payment.saveOpsCcBrand = function() {
        checkout.setLoadWaiting('payment');
        var owner = $('OPS_CC_CN').value;
        new Ajax.Request(opsSaveCcBrandUrl, {
            method: 'post',
            parameters: { brand : $('OPS_CC_BRAND').value, cn: owner },
            onSuccess: function(transport) {
                if (-1 < opsCcBrandsForAliasInterface.indexOf($('OPS_CC_BRAND').value)) {
                    payment.requestOpsCcAlias();
                } else {
                    checkout.setLoadWaiting(false);
                    //moved inside else otherwise called twice if previous condition is true
                    payment.originalSaveMethod();
                }
            },
            onFailure: function(transport) {
                alert(Translator.translate('Payment failed. Please select another payment method.'));
                checkout.setLoadWaiting(false);
            }
        });
    };

    payment.requestOpsCcAlias = function() {
        checkout.setLoadWaiting('payment');
        var iframe = $('ops_iframe_' + payment.currentMethod);
        var doc = null;

        if(iframe.contentDocument) {
            doc = iframe.contentDocument;
        } else if(iframe.contentWindow) {
            doc = iframe.contentWindow.document;
        } else if(iframe.document) {
            doc = iframe.document;
        }

        doc.body.innerHTML="";
        iframe.alreadySet = false;
        if (payment.opsStoredAliasPresent == false) {
            if ('true' != iframe.alreadySet) {
                form = doc.createElement('form');
                form.id = 'ops_request_form';
                form.method = 'post';
                form.action = opsUrl;
                submit = doc.createElement('submit');
                form.appendChild(submit);

                var cardholder = doc.createElement('input');
                cardholder.id = 'CN';
                cardholder.name = 'CN';
                cardholder.value = $('OPS_CC_CN').value;

                var cardnumber = doc.createElement('input');
                cardnumber.id = 'CARDNO';
                cardnumber.name = 'CARDNO';
                cardnumber.value = $('OPS_CC_CARDNO').value;

                var verificationCode = doc.createElement('input');
                verificationCode.id = 'CVC';
                verificationCode.name = 'CVC';
                verificationCode.value = $('OPS_CC_CVC').value;

                var brandElement = doc.createElement('input');
                brandElement.id = 'BRAND';
                brandElement.name = 'BRAND';
                brandElement.value = $('OPS_CC_BRAND').value;

                var edElement = doc.createElement('input');
                edElement.id = 'ED';
                edElement.name = 'ED';
                edElement.value = $('OPS_CC_ECOM_CARDINFO_EXPDATE_MONTH').value + $('OPS_CC_ECOM_CARDINFO_EXPDATE_YEAR').value;

                var pspidElement = doc.createElement('input');
                pspidElement.id = 'PSPID';
                pspidElement.name = 'PSPID';
                pspidElement.value = opsPspid;

                var orderIdElement = doc.createElement('input');
                orderIdElement.name = 'ORDERID';
                orderIdElement.id = 'ORDERID';
                orderIdElement.value = opsOrderId;

                var acceptUrlElement = doc.createElement('input');
                acceptUrlElement.name = 'ACCEPTURL';
                acceptUrlElement.id = 'ACCEPTURL';
                acceptUrlElement.value = opsAcceptUrl;

                var exceptionUrlElement = doc.createElement('input');
                exceptionUrlElement.name = 'EXCEPTIONURL';
                exceptionUrlElement.id = 'EXCEPTIONURL';
                exceptionUrlElement.value = opsExceptionUrl;

                var paramplusElement = doc.createElement('input');
                paramplusElement.name = 'PARAMPLUS';
                paramplusElement.id = 'PARAMPLUS';
                paramplusElement.value = 'RESPONSEFORMAT=JSON';

                var aliasElement = doc.createElement('input');
                aliasElement.name = 'ALIAS';
                aliasElement.id = 'ALIAS';
                aliasElement.value = opsAlias;

                form.appendChild(pspidElement);
                form.appendChild(brandElement);
                form.appendChild(cardholder);
                form.appendChild(cardnumber);
                form.appendChild(verificationCode);
                form.appendChild(edElement);
                form.appendChild(acceptUrlElement);
                form.appendChild(exceptionUrlElement);
                form.appendChild(orderIdElement);
                form.appendChild(paramplusElement);
                form.appendChild(aliasElement);

                var hash = doc.createElement('input');
                hash.id = 'SHASIGN';
                hash.name = 'SHASIGN';
                saveAliasData = 0;
                if ($('ops_alias_save') && $('ops_alias_save').checked) {
                    saveAliasData = 1;
                }
                new Ajax.Request(opsHashUrl, {
                    method: 'get',
                    parameters: {
                        brand: brandElement.value,
                        orderid: opsOrderId,
                        paramplus: paramplusElement.value,
                        alias: aliasElement.value,
                        saveAlias: saveAliasData,
                        storedAlias: payment.opsStoredAlias
                    },
                    onSuccess: function(transport) {
                        var data = transport.responseText.evalJSON();
                        hash.value = data.hash;
                        aliasElement.value = data.alias;
                        form.appendChild(hash);
                        doc.body.appendChild(form);
                        iframe.alreadySet = 'true';

                        form.submit();

                        doc.body.innerHTML = '{ "result" : "waiting" }';
                        setTimeout("payment.processOpsResponse(500)", 500);
                    }
                });
            }
        } else {
            new Ajax.Request(opsAcceptUrl, {
                method: 'get',
                parameters: {
                    Alias: payment.opsStoredAlias,
                    CVC: $('OPS_CC_CVC').value,
                    CN: $('OPS_CC_CN').value
                },
                onSuccess: function(transport) {
                    doc.body.innerHTML = transport.responseText;
                    setTimeout("payment.processOpsResponse(500)", 500);
                }
            });
        }
    };

    payment.processOpsResponse = function(timeOffset) {
        try {
            var responseIframe = $('ops_iframe_' + payment.currentMethod);
            var responseResult;

            /* payment fails after 30s without response */
            var maxOffset = 30000;

            if(responseIframe.contentDocument) {
                responseResult = responseIframe.contentDocument;
            } else if(responseIframe.contentWindow) {
                responseResult = responseIframe.contentWindow.document;
            } else if(responseIframe.document) {
                responseResult = responseIframe.document;
            }

            //Remove links in JSON response
            //can happen f.e. on iPad <a href="tel:0301125679">0301125679</a> if alias is interpreted as a phone number
            var htmlResponse = responseResult.body.innerHTML.replace(/<a\b[^>]*>/i, '');
            htmlResponse = htmlResponse.replace(/<\/a>/i, '');

            if ("undefined" == typeof(responseResult)) {
                currentStatus = '{ "result" : "waiting" }'.evalJSON();
            } else {
                var currentStatus = htmlResponse.evalJSON();
                if ("undefined" == typeof(currentStatus) || "undefined" == typeof(currentStatus.result)) {
                    currentStatus = '{ "result" : "waiting" }'.evalJSON();
                }
            }
        } catch (e) {
            currentStatus = '{ "result" : "waiting" }'.evalJSON();
        }

        if ('waiting' == currentStatus.result && timeOffset <= maxOffset) {
            setTimeout("payment.processOpsResponse(" + (500+timeOffset) + ")", 500);
            return false;
        } else if ('success' == currentStatus.result) {
            new Ajax.Request(opsCcSaveAliasUrl, {
                method: 'post',
                parameters: { alias : currentStatus.alias,
                              CVC : currentStatus.CVC,
                              CN: $('OPS_CC_CN').value
                },
                onSuccess: function(transport) {
                    var data = transport.responseText;
                    checkout.setLoadWaiting(false);
                    $('OPS_CC_CVC').value='';
                    payment.stashCcData();
                    payment.originalSaveMethod();

                },
                onFailure: function(transport) {
                    payment.applyStashedCcData();
                    //reset the buttons on failure
                    checkout.setLoadWaiting(false);
                }
            });

            return true;
        }

        alert(Translator.translate('Payment failed. Please review your input or select another payment method.'));
        checkout.setLoadWaiting(false);
        return false;
    };

    payment.criticalOpsCcData = ['CN', 'CARDNO', 'CVC'];
    payment.stashedOpsCcData = new Array();

    payment.stashCcData = function() {
        payment.criticalOpsCcData.each(function(item) {
            if (!payment.stashedOpsCcData[item] || $('OPS_CC_' + item).value.length) {
                payment.stashedOpsCcData[item] = $('OPS_CC_' + item).value;
                $('OPS_CC_' + item).removeClassName('required-entry');
                $('OPS_CC_' + item).value = '';
                $('OPS_CC_' + item).disable();
            }
        });
    };

    payment.applyStashedCcData = function() {
        payment.criticalOpsCcData.each(function(item) {
            if ($('OPS_CC_' + item)) {
                if (payment.stashedOpsCcData[item] && 0 < payment.stashedOpsCcData[item].length) {
                    $('OPS_CC_' + item).value = payment.stashedOpsCcData[item];
                }
                $('OPS_CC_' + item).addClassName('required-entry');
                $('OPS_CC_' + item).enable();
            }
        });
    };

    payment.toggleOpsDirectDebitInputs = function(country) {
        var bankcode = 'ops_directdebit_bank_code';
        var showInput = function(id) {
            $$('#' + id)[0].up().show();
            $(id).addClassName('required-entry');
        };
        var hideInput = function(id) {
            $$('#' + id)[0].up().hide();
            $(id).removeClassName('required-entry');
        };
        if ('NL' == country) {
            hideInput(bankcode);
        }
        if ('DE' == country || 'AT' == country) {
            showInput(bankcode);
        }
    };

    payment.toggleOpsCcInputs = function() {
        if (-1 < opsCcBrandsForAliasInterface.indexOf($('OPS_CC_BRAND').value)) {
            $('ops_cc_data').show();
        } else {
            $('ops_cc_data').hide();
        }
    };

    if(typeof accordion != 'undefined'){
        accordion.openSection = accordion.openSection.wrap(function(originalOpenSectionMethod, section) {

            if (section.id == 'opc-payment' || section == 'opc-payment') {
                payment.applyStashedCcData();
            }
            if ((section.id == 'opc-payment' || section == 'opc-payment') && 'ops_cc' == payment.currentMethod) {
                if ($('OPS_CC_CN') && $('OPS_CC_CN').hasAttribute('disabled')) {
                    $('OPS_CC_CN').removeAttribute('disabled');
                }
                if ($('OPS_CC_CARDNO') && $('OPS_CC_CARDNO').hasAttribute('disabled')) {
                    $('OPS_CC_CARDNO').removeAttribute('disabled');
                }
                if ($('OPS_CC_CVC') && $('OPS_CC_CVC').hasAttribute('disabled')) {
                    $('OPS_CC_CVC').removeAttribute('disabled');
                }
            }
            originalOpenSectionMethod(section);
        });
    }

    payment.clearOpsCcInputs = function() {
        if (payment.opsStoredAliasPresent == true) {
            $('OPS_CC_CN').value = '';
            $('OPS_CC_CN').removeAttribute('readonly');
            $('OPS_CC_CN').removeClassName('readonly');
            $('OPS_CC_CN').readOnly = false;
            $('OPS_CC_CARDNO').value = '';
            $('OPS_CC_CARDNO').removeClassName('readonly');
            $('OPS_CC_CARDNO').addClassName('validate-cc-number');
            $('OPS_CC_CARDNO').addClassName('validate-cc-type');
            $('OPS_CC_CARDNO').removeAttribute('readonly');
            $('OPS_CC_CARDNO').readOnly = false;;
            $('OPS_CC_ECOM_CARDINFO_EXPDATE_MONTH').selectedIndex = 0;
            $('OPS_CC_ECOM_CARDINFO_EXPDATE_MONTH').removeClassName('readonly');
            $('OPS_CC_ECOM_CARDINFO_EXPDATE_MONTH').removeAttribute('readonly');
            $('OPS_CC_ECOM_CARDINFO_EXPDATE_MONTH').readOnly = false;
            $('OPS_CC_ECOM_CARDINFO_EXPDATE_YEAR').selectedIndex = 0;
            $('OPS_CC_ECOM_CARDINFO_EXPDATE_YEAR').removeClassName('readonly');
            $('OPS_CC_ECOM_CARDINFO_EXPDATE_YEAR').removeAttribute('readonly');
            $('OPS_CC_ECOM_CARDINFO_EXPDATE_YEAR').readOnly = false;
            $('ops_save_alias_li').show();
            payment.opsStoredAliasPresent = false;
        }
    };

    payment.jumpToLoginStep = function() {
        if(typeof accordion != 'undefined'){
            accordion.openSection('opc-login');
            $('login:register').checked = true;
        }
    };
});
