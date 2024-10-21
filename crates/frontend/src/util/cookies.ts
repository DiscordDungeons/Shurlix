export const getCookie = (name: string): string | undefined => {
	const cookieString = document.cookie
	const nameEQ = `${name}=`
	const cookiesArray = cookieString.split('; ')

	for (let cookie of cookiesArray) {
		if (cookie.startsWith(nameEQ)) {
			return cookie.substring(nameEQ.length)
		}
	}

	return undefined // Return undefined if the cookie is not found
}

export const deleteCookie = (name: string) => {
	document.cookie = `${name  }=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`
}
