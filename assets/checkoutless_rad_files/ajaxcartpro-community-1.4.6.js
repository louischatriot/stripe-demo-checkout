/**
 * aheadWorks Co.
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the EULA
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://ecommerce.aheadworks.com/LICENSE-M1.txt
 *
 * @category   AW
 * @package    AW_Ajaxcartpro
 * @copyright  Copyright (c) 2009-2010 aheadWorks Co. (http://www.aheadworks.com)
 * @license    http://ecommerce.aheadworks.com/LICENSE-M1.txt
 */

window.intPrevious = setInterval(function() {
    if(typeof AW_ACP != 'undefined' && document.body) {
        if(typeof aw_cartDivClass == 'undefined') {
            aw_cartDivClass =
            AW_ACP.theme == 'blank' ?
            '.header-cart-content' :
            '.mini-cart';

            if(!$$(aw_cartDivClass).length || !$$(aw_cartDivClass)[0].tagName) {
                aw_cartDivClass =  '.header-cart-content'
            }
        }
        if(typeof aw_topLinkCartClass == 'undefined') {
            aw_topLinkCartClass = '.popup-holder3 > .open';
        }
        if(typeof aw_addToCartButtonClass == 'undefined') {
            aw_addToCartButtonClass = '.form-button';
        }
        if(typeof aw_bigCartClass == 'undefined') {
            if (typeof($$('.layout-1column')[0]) != 'undefined')
                aw_bigCartClass = '.layout-1column';
            else if (typeof($$('.col-main')[0]) != 'undefined')
                aw_bigCartClass = '.col-main';
            else
                aw_bigCartClass = '.cart';
        }
        if(typeof aw_wishlistClass == 'undefined') {
            if (typeof($$('.my-wishlist')[0]) != 'undefined')
                aw_wishlistClass = '.my-wishlist';
            else
                aw_wishlistClass = '.padder';
        }
        if(typeof(aw_wishlistSidebarClass) == 'undefined') {
            aw_wishlistSidebarClass = '.block-wishlist';
        }

        if(typeof aw_topWishlistLinkCartClass == 'undefined') {
            if ($$('.top-link-wishlist a').length) aw_topWishlistLinkCartClass = '.top-link-wishlist a';
            else aw_topWishlistLinkCartClass = '.top-link-wishlist';
        }

        if (window.location.toString().search('/product_compare/') != -1) {
            win = window.opener;
        } else {
            win = window;
        }
        clearInterval(intPrevious)
    }
}, 500);

function ajaxcartprodelete(url) {
    showProgressAnimation();
    url = getCommonUrl(url)
    if(typeof aw_acp_retries == 'undefined') aw_acp_retries = 0;

    new Ajax.Request(url, {
        onSuccess: function(resp) {
            try {
                if (typeof(resp.responseText) == 'string') eval('resp = ' + resp.responseText);
            } catch(e) {
                return;
            }
            if(resp && resp.error && resp.error == 'quote error' && aw_acp_retries == 0) {
                aw_acp_retries = 1;
                return ajaxcartprodelete(url);
            }
            aw_acp_retries = 0;
            hideProgressAnimation();
            __onACPRender();
            jQuery('#cart-header-container').replaceWith(resp.cart);
            jQuery('#cart-count').text(resp.cart_qty);
            jQuery('#cart-count-hidder').show();
            jQuery('#icon-count-mobile').text(resp.cart_qty);

            try {
                var storeId = jQuery('#cart-count').attr('data-store');
                localStorage.setItem('cart.count.' + storeId, resp.cart_qty);
                localStorage.setItem('cart.html.' + storeId, resp.cart);
                localStorage.setItem('cart.date.' + storeId, (new Date()).getTime() + 120000);
            } catch (e) {
            }
            updateCartView(resp, '');
        }
    });
}

function updateCartBar(resp){
    var __cartObj = $$(aw_cartDivClass)[0];

    if(__cartObj)
    {
        if (typeof(__cartObj.length) == 'number') __cartObj = __cartObj[0];
        var oldHeight = __cartObj.offsetHeight;

        var tmpDiv = win.document.createElement('div');
        tmpDiv.innerHTML = resp.cartbar;
        $(tmpDiv).cleanWhitespace();

        var tmpParent = __cartObj.parentNode;
        tmpParent.replaceChild($(tmpDiv).select(aw_cartDivClass)[0], __cartObj);

        /* Details popup support */

        var __cartObj = $$(aw_cartDivClass)[0];
        var newHeight = __cartObj.offsetHeight;

        addEffectACP(__cartObj, aw_ajaxcartpro_cartanim);
        truncateOptions();
    }
    updateDeleteLinks();
    updateTopLinks(resp);
    if(typeof(resp.custom) != 'undefined') updateCustomBlocks(resp.custom);
}

function updateCartView(resp){

    if (AW_ACP.isCartPage) return updateBigCartView(resp);

    var __cartObj = $$(aw_cartDivClass)[0];
    var __cartLink = $$(aw_topLinkCartClass)[0];


    if(__cartObj)
    {
        if (typeof(__cartObj.length) == 'number') __cartObj = __cartObj[0];
        var oldHeight = __cartObj.offsetHeight;

        var tmpDiv = win.document.createElement('div');
        tmpDiv.innerHTML = resp.cart;

        $(tmpDiv).cleanWhitespace();

        var tmpParent = __cartObj.parentNode;
        tmpParent.replaceChild($(tmpDiv).select(aw_cartDivClass)[0], __cartObj);

        __cartLink.innerHTML = resp.cart_qty;
        //jcf.customForms.destroyAll();

        jQuery('.popup-holder3').addClass('popup-active');
        if(jQuery('.popup-holder3 .popup').css('display')=='none')
        {
            jQuery('.popup-holder3 .popup').css('visibility', 'hidden').show();
            jcf.customForms.replaceAll();
            jcf.customForms.refreshAll();
            jQuery('.popup-holder3 .popup').css('visibility', 'visible').hide();
        }
        else
        {
            jcf.customForms.replaceAll();
            jcf.customForms.refreshAll();
        }

        __intId9 = setInterval(
            function(){
                jQuery('.popup-holder3 .popup').stop().animate({opacity:0}, {duration:500, complete:function(){
                    jQuery('.popup-holder3 .popup').css({display: '', opacity:''});
                    jQuery('.popup-holder3').removeClass('popup-active');
                }});

                clearInterval(__intId9);
            },
            3000
        );
        /* Details popup support */

        var __cartObj = $$(aw_cartDivClass)[0];
        var newHeight = __cartObj.offsetHeight;

        //addEffectACP(__cartObj, aw_ajaxcartpro_cartanim);
        truncateOptions();
    }
    updateDeleteLinks();
    if(typeof(resp.custom) != 'undefined') updateCustomBlocks(resp.custom);

    //initOpenCart();
}

function updateWishlist(resp) {
    if(typeof(resp.wishlist) == 'undefined') return;
    var wishlistObj = $$(aw_wishlistClass)[0];
    if(wishlistObj) {
        var tmpDiv = win.document.createElement('div');
        tmpDiv.innerHTML = resp.wishlist;
        var tmpParent = wishlistObj.parentNode;
        tmpParent.replaceChild(tmpDiv.firstChild, wishlistObj);
    }
    var wishlistSidebar = $$(aw_wishlistSidebarClass).first();
    if(wishlistSidebar) {
        wishlistSidebar.replace(resp.wishlist_sidebar);
        updateAddLinks();
    }
}


jQuery(function(){
    var $cartCount = jQuery('#cart-count');
    var storeId = $cartCount.attr('data-store');
    var date = new Date();

    var cacheDate = localStorage.getItem('cart.date.' + storeId);
    console.log('dates', date.getTime(), parseInt(cacheDate));

    if (cacheDate === null || date.getTime() > parseInt(cacheDate)) {
        localStorage.removeItem('cart.date.'  + storeId);
        localStorage.removeItem('cart.count.' + storeId);
        localStorage.removeItem('cart.html.'  + storeId);
    }

    // date.getTime() + 120000

    if (localStorage.getItem('cart.count.' + storeId) === null || localStorage.getItem('cart.count.' + storeId) == 'undefined') {
        jQuery.ajax({
            url: $cartCount.attr('data-refresh'),
            dataType: 'json',
            success: function (data) {
                console.log('data',data);
                localStorage.setItem('cart.count.' + storeId, data.cart_qty);
                localStorage.setItem('cart.html.' + storeId, data.cart);
                localStorage.setItem('cart.date.' + storeId, (new Date()).getTime() + 120000);

                jQuery('#cart-header-container').replaceWith(data.cart);
                jQuery('#cart-count-hidder').show();
                $cartCount.show().text(data.cart_qty);
                updateDeleteLinks();
            }
        });
    }
    else {
        var count = localStorage.getItem('cart.count.' + storeId);
        var html  = localStorage.getItem('cart.html.' + storeId);

        jQuery('#cart-header-container').replaceWith(html);
        jQuery('#cart-count-hidder').show();
        $cartCount.show().text(count);
        updateDeleteLinks();
    }

});
