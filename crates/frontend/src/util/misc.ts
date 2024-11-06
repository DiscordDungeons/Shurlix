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
