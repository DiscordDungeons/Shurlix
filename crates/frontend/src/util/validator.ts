// Taken from: https://gist.github.com/dperini/729294
// Licenced under MIT
const re_weburl = new RegExp(
	'^' +
	  // protocol identifier (optional)
	  // short syntax // still required
	  '(?:(?:(?:https?|ftp):)?\\/\\/)' +
	  // user:pass BasicAuth (optional)
	  '(?:\\S+(?::\\S*)?@)?' +
	  '(?:' +
		// IP address exclusion
		// private & local networks
		'(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
		'(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
		'(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
		// IP address dotted notation octets
		// excludes loopback network 0.0.0.0
		// excludes reserved space >= 224.0.0.0
		// excludes network & broadcast addresses
		// (first & last IP address of each class)
		'(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
		'(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
		'(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
	  '|' +
		// host & domain names, may end with dot
		// can be replaced by a shortest alternative
		// (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
		'(?:' +
		  '(?:' +
			'[a-z0-9\\u00a1-\\uffff]' +
			'[a-z0-9\\u00a1-\\uffff_-]{0,62}' +
		  ')?' +
		  '[a-z0-9\\u00a1-\\uffff]\\.' +
		')+' +
		// TLD identifier name, may end with dot
		'(?:[a-z\\u00a1-\\uffff]{2,}\\.?)' +
	  ')' +
	  // port number (optional)
	  '(?::\\d{2,5})?' +
	  // resource path (optional)
	  '(?:[/?#]\\S*)?' +
	'$', 'i',
)

// eslint-disable-next-line no-control-regex
const EMAIL_REGEX = new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)

export const isValidUrl = (url: string): boolean => {
	return re_weburl.test(url)
}


export const isValidEmail = (email: string): boolean => {
	return EMAIL_REGEX.test(email)
}
