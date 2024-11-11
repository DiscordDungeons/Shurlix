export const checkUrlWithRetries = async (
	url: string,
	maxTries: number,
	delayMs: number
): Promise<Response> => {
	let tries = 0;

	while (tries < maxTries) {
		try {
		const response = await fetch(url);
		
		if (response.ok) {
			return response;
		}
		} catch (error) {
			console.error(`Error fetching ${url}: ${error}`);
		}

		tries++;
		if (tries < maxTries) {
			console.log(`Retrying... attempt ${tries + 1}`);
			await new Promise<void>(resolve => setTimeout(resolve, delayMs));
		}
	}

	throw new Error(`Max retries reached for ${url}`);
};