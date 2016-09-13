/**
 *
 *   Hover push product
 *
 */

var gaqUrlReformat = function(url) {
    var urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
    var matches = urlParseRE.exec(url);
    var pathname = matches[13] || '';
    var search = matches[16] || '';
    return pathname + search;
};

var sharePopup = function(self, e) {
    e.preventDefault();
    var url = self.attr('href');
    var width = self.data('width') || '410';
    var height = self.data('height') || '284';
    var action = self.data('action');
    window.open(url, '_blank', 'width='+width+',height='+height);
};

(function ($) {
    $(function () {

        $(".rightRight img").css({ opacity: 0.5 });

        $('.socials2 a').click(function(e) {
            sharePopup($(this), e);
        });

        $("a.twButton").click(function(e) {sharePopup($(this), e)});

        /** hover sur les push produit ***/
        $(".rightRight .crossPdte").hover(
            function () {
                $(this).find('img').animate({ opacity: 1},500);
                $(this).children('.infoPdtHover').show();
            }, function () {
                $(this).find('img').animate({ opacity: 0.5}, 500);
                $(this).children('.infoPdtHover').hide();
            }
        );

        /*$(".visuelProduct, .categoriePdte").hover(
            function () {
                $(this).children('.infoPdtHover').show();
                $(this).children('.topProductCnt').hide();

            },
            function () {
                $(this).children('.infoPdtHover').hide();
                $(this).children('.topProductCnt').show();
            }
        );*/
        /** reset filtre **/

        $('.reset').hover(function () {
            var $this = $(this);
            $this.width($this.width());
            $this.html($this.data('cancel-label'));
        }, function () {
            var $this = $(this);
            $this.css('width', 'auto')
            $this.text($this.data('original-label'));
        });

        $("#listePdtMiniCart").mCustomScrollbar({
            theme:"dark-thick",
            autoHideScrollbar: "0",
            scrollInertia: "0"
        });

        /** menus header - mon panier **/
        $('.monMiniCart').hide();

        $('.monPanier').hover(function () {
                $(this).addClass('actif');
            $('.monMiniCart').show();





            //$('#blockLivraisonGratuite').hide();
            }, function () {
                $('.monMiniCart').hide();
                $('.monPanier').removeClass('actif');

            $('.monMiniCart').hover(function () {
                        $('.monPanier').addClass('actif');
                        $('.monMiniCart').show();

                    }, function () {
                $('.monMiniCart').hide();
                        $('.monPanier').removeClass('actif');
                        });
                $('.monMiniCart').slideUp();
        });
        /*
         $('#listePdtMiniCart').scrooly({
         step: 15,
         opacity: 0.5,
         speed: 200
         });*/

        /** Menu header - mon compte**/

        $('.monMenuProfile').hide();

        $('.monCompte').hover(function () {
            $(this).addClass('actif');
            $('.monMenuProfile').show();
        }, function () {
            $('.monMenuProfile').hide();
            $('.monCompte').removeClass('actif');
            $('.monMenuProfile').hover(function () {
                $('.monCompte').addClass('actif');
                $('.monMenuProfile').show();
            }, function () {
                $('.monMenuProfile').hide();
                $('.monCompte').removeClass('actif');
                });
            });

        if ($('.qte').val() <= 1) {
            $('.removeQte').hide();
        }


        if (typeof $.fn.mCustomScrollbar == 'function') {
            $("#listingMailSubscr ul").mCustomScrollbar({
                theme:"dark-thick",
                autoHideScrollbar: "0",
                scrollInertia: "0"
            });
            $("#listingMailWait ul").mCustomScrollbar({
                theme:"dark-thick",
                autoHideScrollbar: "0",
                scrollInertia: "0"
            });
            $("#listingMailInvite ul").mCustomScrollbar({
                theme:"dark-thick",
                autoHideScrollbar: "0",
                scrollInertia: "0",
                advanced:{
                    autoScrollOnFocus: false
                }
            });
        }


        /** Génération des dimensions */
        var value = '';
        $(".listeDimeSelect option").each(function () {
//                    alert ($(this).val());
            value += '<span class="dim">' + $(this).val() + '</span>';
        });

        $("#listeDimension").html(value);

        /** hover sur les push produit ***/
        $(".rightRight .crossPdte").hover(
            function () {
                $(this).find('img').animate({ opacity: 1},0);
                $(this).children('.infoPdtHover').show();
            }, function () {
                $(this).find('img').animate({ opacity: 0.5}, 0);
                $(this).children('.infoPdtHover').hide();
            }
        );

        /** hover sur les push produit ***/
        $(".crossPdte").hover(
            function () {
                $(this).children('.infoPdtHover').show();
            }, function () {
                $(this).children('.infoPdtHover').hide();
            }
        );

        /* Action sur le la loupe du formulaire de recherche général */

        $('.submitSearch').click(function () {
            $('#searchAction').submit();
        });

        $('.submitScrollSearch').click(function () {
            $('#searchScrollAction').submit();
        });

        // hide #back-top first
        $("#back-top").hide();

        // fade in #back-top

        var search = $("#search");
        var searchScroll = $("#scrollSearch");

        search.keyup(function() {
            searchScroll.val($(this).val());
        });
        searchScroll.keyup(function() {
            search.val($(this).val());
        });

        var scrolled = false;

        var poppin = $("#popinProduct");

        $(window).scroll(function () {

            if ($(this).scrollTop() > 320) {
                if (!scrolled) {
                    $('#searchScroll').show();
                    if (search.is(":focus")) {
                        searchScroll.focus();
                        var val = searchScroll.val();
                        searchScroll.val('');
                        searchScroll.val(val);
                    }
                    scrolled = true;
                }
            } else {
                if (scrolled) {
                    $('#searchScroll').hide();
                    if (searchScroll.is(":focus")) {
                        search.focus();
                        var val = search.val();
                        search.val('');
                        search.val(val);
                    }
                    scrolled = false;
                }
            }


            /*if (poppin.not(':visible').size()) {
                if ($(this).scrollTop() > 50) {
                    $('#blockLivraisonGratuite').hide();
                } else {
                    $('#blockLivraisonGratuite').show();
                }
            }*/


            if ($(window).width() < 1200) {
                $('#back-top').hide();
            } else {
                if ($(this).scrollTop() > 100) {
                    $('#back-top').show();
                } else {
                    $('#back-top').hide();
                }
            }
        });

        // scroll body to 0px on click
        $('#back-top a').click(function () {
            $('body,html').animate({
                scrollTop: 0
            }, 800);
            return false;
        });

        var pendingInvitationList = $('#listingMailWait');
        $(".resendfriends").one('click', function(e){
            var $this = $(this);
            $this.parent().html('<span class="stillSubscribe">' + pendingInvitationList.data('success-label') + '</span>');
            $.post(pendingInvitationList.data('resend-url'), {ids: [$this.data('id')]}).done(function(){
                $this.data('resent', true);
            });
        });
        $(".resendfriends", pendingInvitationList).hover(function(){
            var $this = $(this);
            if (!$this.data('resent')) {
                $this.text(pendingInvitationList.data('resend-label')).css('font-weight', 'bold');
            }
        }, function (){
            var $this = $(this);
            if (!$this.data('resent')) {
                $this.text($this.data('email')).css('font-weight', 'normal');
            }
        });

        $('.resendAll', $('.listingFriends')).on('click', function(e){
            e.preventDefault();
            var $this = $(this);

            //$this.addClass('active');
            var container = $this.closest(".contentCMS");
            var errorBox = container.find(".error");
            if (errorBox.length == 0) {
                container.prepend('<div class="error"></div>');
                errorBox = container.find(".error");
            }
            $.post(pendingInvitationList.data('resend-url'), function(data) {
                $this.removeClass('active');
                if (data.errors) {
                    errorBox.html('<p>' + data.errors.join('</p><p>') + '</p>')
                        .fadeIn(1000)
                        .delay(10000)
                        .fadeOut(1000)
                    ;
                }

                $('#listingMailWait li').html('<span class="stillSubscribe">' + pendingInvitationList.data('success-label') + '</span>');
            });
        });

        /** slideshow sur les images de pushs ***/

//   $('.visuelProduct .album').albumPreviews();

        $("#addPicture").click(function(){
            $("#addPictureOff").hide();
            $("#addPictureAction").show();
        });

        $('#addActionPicture').on('click', function(){
            $("form#addPictureAction").submit();
        });

        $("#annulerPicture").click(function(){
            $("#addPictureOff").show();
            $("#addPictureAction").hide();
        });

        /* HOME */

        $(".loginMember").click(function(){
            $(".formLogin").fadeIn();
            $(".formInscription").hide();
            $(".formForgot").hide();
            $(".messages").hide();
        });

        $(".newMember").click(function(){
            $(".formInscription").fadeIn();
            $(".formLogin").hide();
            $(".formForgot").hide();
            $(".messages").hide();
        });

        $('#mdpForget').click(function(){
            $(".formForgot").fadeIn();
            $(".formInscription").hide();
            $(".formLogin").hide();
            $(".messages").hide();
        });

        /* Fiche produit */

        $(".addToWishlist").hover(function(){
            $(".bulleTrack").show();
        }, function (){
            $(".bulleTrack").hide();
        });

         $('.addToWishlist').click(function () {
            $(this).val("");
             $(this).addClass("unTrack");
             $(this).removeClass("addToWishlist");
            $(".check").show();
         });

        $('.unTrack').click(function () {
            $(this).removeClass("unTrack");
            $(this).addClass("addToWishlist");
            $(this).val("track");
            $(".check").hide();
         });


        /* Profile */

        $("#formProfile").hide();
        $("#btnAddAddress").click(
            function () {
                $("#formProfile").hide();
            },function() {
                $("#formProfile").show();
            }
        );

        (function(){
            $(".btnEditProfile").one('click', function defaultCallback(e){
                e.preventDefault();
                var profiles = $(this).parent().closest(".editor").find(".inputProfile");
                profiles.show();
                var $this = $(this);
                $this.val($this.data('submit-label'));
                var errorBox = $(this).parent().closest(".contentCMS").find(".error");

                $this.on('click', function editCallback(e){
                    e.preventDefault();

                    $this.addClass('active');
                    var form = $(this).closest('form');
                    form.removeClass('invalid');
                    $.post(form.attr('action'), form.serializeArray()).done(function(data){
                        if (data.success) {
                            $this.off('click', editCallback).on('click', defaultCallback);
                        } else {
                            form.addClass('invalid');
                            $this.removeClass('active');
                            if (data.errors) {
                                errorBox.html('<p>' + data.errors.join('</p><p>') + '</p>')
                                    .fadeIn(1000)
                                    .delay(10000)
                                    .fadeOut(1000)
                                ;
                            }
                            return;
                        }
                        if (data.update) {
                            $('.valueBox', form.parent()).text(data.update);
                            profiles.hide();
                        }
                        $this.removeClass('active').val($this.data('edit-label'));
                    }).fail(function(){
                        form.addClass('invalid');
                        $this.removeClass('active');
                    });
                });
            });
        })();

        $(".addToWishlist").hover(function(){
            $(".bulleTrack").show();
        }, function (){
            $(".bulleTrack").hide();
        });

        $(".actAnnInvFr").click(function(){
            $("#bkgGeneralProduct").fadeOut();
            $("#popinContact").hide();
        });

        $(".inviteFriendsAct").click(function(){
            $("#bkgGeneralProduct").fadeIn();
            $("#popinContact").show();
            $('body,html').animate({
                scrollTop: 0
            }, 0);
        });

        $(".customer-account #bkgGeneralProduct").click(function(){
            $("#bkgGeneralProduct").fadeOut();
            $("#popinContact").hide();

        });
    });
})(jQuery);
jQuery(function(){
		if (jQuery('ol.carousel-indicators li').length < 2)
		jQuery('ol.carousel-indicators').remove();
});
