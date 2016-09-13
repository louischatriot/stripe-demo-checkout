;'use strict';

jQuery(function($){

    (function($){

        //var menu = $('#sticky-category');
        //if (!menu.length) {
        //    return ;
        //}
        //var stickyTop = menu.offset().top;
        //var offsetTop = $('.navbar.navbar-fixed-top').height() - 1;
        //var $body = $('body');
        //var basePaddingTop = parseInt($body.css('paddingTop'));
        //
        //
        //$(window).scroll(function(){
        //    if( $(window).scrollTop() > stickyTop - offsetTop ) {
        //        $body.css('paddingTop', basePaddingTop + offsetTop + 4);
        //        menu.css({position: 'fixed', top: offsetTop, left: 0, right: 0}).addClass('sticky');
        //    } else {
        //        $body.css('paddingTop', basePaddingTop);
        //        menu.css({position: 'static', top: 0}).removeClass('sticky');
        //    }
        //});
        //
        var $window = $(window);
        //var $body = $('body');
        var $menu = $('#sticky-header');
        //var replaceMenu = $('[data-sticky-replace]');
        //if (replaceMenu.length)
        //{
        //    var real = replaceMenu.eq(0);
        //    if (replaceMenu.length > 1) {
        //        var num = parseFloat(real.attr('data-sticky-replace'));
        //        replaceMenu.each(function(){
        //            if (parseFloat($(this).attr('data-sticky-replace')) > num) {
        //                real = $(this);
        //                num = parseFloat($(this).attr('data-sticky-replace'));
        //            }
        //        });
        //    }
        //    real.show().appendTo($menu.find('.container').eq(0).html(''));
        //}
        //
        //var item = jQuery('nav.categories').last().closest('.navbar');
        //var itemheight = item.height() + 4;
        //var position = item.position().top - 2;// - 5;
        //$window.on('scroll', function(){
        //    //if ($window.scrollTop() >  100) {
        //    if ($window.scrollTop() >  position) {
        //        item.addClass('fixed');
        //        $body.css('paddingTop', itemheight);
        //    }
        //    else {
        //        $body.css('paddingTop', 0);
        //        item.removeClass('fixed');
        //    }
        //});

        $menu.find('#search-top').click(function(e){
            e.preventDefault();
            $window.scrollTop(0);
            $('#search-header').click();
        });
    })(jQuery);
});

jQuery(function($){
    (function(){
        var $window = $(window);

        var isEnabled = function(){
            return $window.width() > 767;
        };

        var timer = null;
        $('li.dropdown').hover(function(){
            if (isEnabled()) {
                var $this = $(this);
                timer = setTimeout(function () {
                    $this.addClass('open');
                    if (0)
                    if ($this.is('nav.categories > ul > li')) {
                        var $sub = $this.find('.dropdown-menu');
                        if ($sub.length) {
                            $sub.css('margin-right', '');
                            var left = $sub.position().left + $sub.parent().position().left;
                            var width = $sub.parent().outerWidth();
                            var nav = $sub.closest('nav');

                            //position.top  += $sub.parent().position().top;
                            left += $sub.parent().position().left;
                            //window.$sub = $sub;

                            //
                            //console.log('sub.width', $sub.width());
                            //console.log('nav.width', );
                            //console.log('position.left', position.left);

                            //console.log('nav.width', $sub.closest('nav').width());
                            //console.log('left', left);
                            //console.log('width', width);
                            //$sub.css('margin-right', position.left - $sub.closest('nav').width());
                            $sub.css('margin-right', (($sub.parent().offset().left - nav.offset().left) + $sub.parent().outerWidth()) - nav.width());
                            //-62px
                        }
                    }
                    timer = null;
                }, 100);
            }
        }, function(){
            if (isEnabled()) {
                $(this).removeClass('open');
            }
            if (timer != null) {
                clearTimeout(timer);
                timer = null;
            }
        });
    })();

    jQuery('html.design_v4 .navbar.navbar-top nav.categories>ul>li>a.category-link').click(function(e){
        if (jQuery('body').width() > 767) {
            e.preventDefault();
            e.stopPropagation();
            location.href = jQuery(this).attr('href');
            return false;
        }
        else {
            var me = this;
            jQuery(me).closest('.dropdown').parent().find('.dropdown').show();
            setTimeout(function () {
                jQuery(me).closest('.dropdown').parent().find('.dropdown').show();
            }, 10);
            if (jQuery(this).closest('.dropdown').is('.open')) {
                e.preventDefault();
                e.stopPropagation();
                jQuery(this).closest('.dropdown').removeClass('open');
                return false;
            }
        }
    });
    jQuery('.dropdown-toggle[data-toggle="dropdown"]').click(function(){
        var me = jQuery(this);
        me.closest('.dropdown').show();
        setTimeout(function(){
            me.closest('.dropdown').show();
        }, 0);
    });
    jQuery('html.design_v4>body nav.categories>ul>li>ul a[href],html.design_v4 .navbar ul.dropdown-menu.links>li>a[href]').click(function(e){
        e.preventDefault();
        e.stopPropagation();
        location.href = jQuery(this).attr('href');
        return false;
    });
    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
    if(isAndroid) {
        jQuery('html').addClass('android');
    }

});