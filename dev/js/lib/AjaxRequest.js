/**
 *  AjaxRequest
 *
 *  Create a new instance to make a new request, or just call the exported
 *  function because it will create a new instance automatically if needed. All
 *  options are optional. Url is not.
 *
 *  All functions (complete, success, and error) are passed the response text
 *  and the xhttp request as arguments.
 *
 *  @param url
 *  @param options {
 *    [method] : HTTP method to use, defaults to "GET"
 *    [data] : object of data to send
 *    [complete] : function to call when request is complete, successful or not
 *    [success] : function to call when request completes with status code 2xx
 *    [error] : function to call when request fails or completes with status code 4xx or 5xx
 *  }
 */

var AjaxRequest = function (url, options) {
  if (!(this instanceof AjaxRequest))
    return new AjaxRequest(url, options);

  options = options || {};
  options.type = options.type || "GET";
  this.options = options;

  // handle data
  var dataStr = "";
  for (var prop in options.data) {
		dataStr += (dataStr === "" ? "" : "&") + prop + "=" + encodeURI(options.data[prop]);
  }

  // make actual request
	var xhttp = this.xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
		if (xhttp.readyState === 4) {
			// done
			if (options.complete && typeof options.complete === 'function') {
				options.complete(xhttp.responseText, xhttp);
			}

			// success or fail
			if (xhttp.status === 200) {
				if (options.success && typeof options.success === 'function') {
					options.success(xhttp.responseText, xhttp);
				}
			}
			else if (options.error && typeof options.error === 'function') {
				options.error(xhttp.responseText, xhttp);
			}
		}
	}

	xhttp.open(options.type,(dataStr && options.type === 'GET' ? url + '?' + dataStr : url),true);
  // web-standards compliant x-requested-with
  xhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");
	if (options.type !== 'GET' && dataStr) {
		xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xhttp.send(dataStr);
	}
	else {
		xhttp.send();
	}
}

module.exports = AjaxRequest;
