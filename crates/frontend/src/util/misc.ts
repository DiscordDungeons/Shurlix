export const stripProtocol = (urlStr: string): string => {
	try {
	  const url = new URL(urlStr)
  
	  // Get the host and port
	  const hostWithPort = url.port 
			? `${url.hostname}:${url.port}` 
			: url.hostname
  
	  return hostWithPort
	} catch (error) {
	  throw new Error('Invalid URL')
	}
}

export const generateSecret = () => {
	const secretLength = 32 // 256 bits
	let secret = ''

	for (let i = 0; i < secretLength; i++) {
		// Generate a random number between 0 and 255
		const randomValue = Math.floor(Math.random() * 256)

		// Format it as a two-digit hexadecimal string and append to the secret
		secret += randomValue.toString(16).padStart(2, '0')
	}

	return secret
}
