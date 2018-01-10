
// Content script
chrome.runtime.onMessage.addListener(
	function(request) {
	  if(typeof request.status !== undefined && request.status &&  request.message) {
		  alert(request.message);
		}
	}
);