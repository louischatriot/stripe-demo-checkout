/**
 * Mageplace Google Connector
 *
 * @category	Mageplace_Google
 * @package		Mageplace_Google_Connect
 * @copyright	Copyright (c) 2011 Mageplace. (http://www.mageplace.com)
 * @license		http://www.mageplace.com/disclaimer.html
 */

var googleWin = null;
var redirectUrl = '';

function openGoogleWin(elHref) {
	googleWin = window.open(elHref,'GoogleConnectorPopup','width=700,height=600,left=100,top=100,location=no,status=yes,scrollbars=yes,resizable=yes');
	googleWin.focus();
	var watchClose = setInterval(function() {
		if (googleWin && googleWin.closed) {
			clearTimeout(watchClose);
			if(redirectUrl) {
				window.location.href = redirectUrl;
			} else {
				window.location.reload();
			}
		}
	}, 200);
}

Event.observe(window, 'load', function() {
	$$('a.gg-connect').each(function(el) {
		el.setAttribute('onclick', "openGoogleWin('"+el.href+"')");
		el.onclick = Function("openGoogleWin('"+el.href+"')");
		el.href = 'javascript:void(0);';
	});
});
