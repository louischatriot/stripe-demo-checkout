/**
 * Created with JetBrains PhpStorm.
 * User: RAD_Tech
 * Date: 19/08/13
 * Time: 18:00
 * To change this template use File | Settings | File Templates.
 */
(function ($) {
    $(function (){
        (function (imgPaiement) {
            imgPaiement.click (function() {
                imgPaiement.removeClass("actifPaiement");
                $(this).addClass("actifPaiement");
                var labelID = $(this).parent().attr('for');
                $('#'+labelID).trigger('click');
        });
        })($('.method-selection div label img'));
    });
})(jQuery);
