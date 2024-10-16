export const simpleDataFetch = async <T>(url: string, setFn: (data: T) => void): Promise<void> => {
	const request = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	const data = await request.json()

	if (request.status === 200) setFn(data)
}

export const simpleDataPost = async <T>(url: string, data: Record<string, any>, setFn: (data: T) => void): Promise<void> => {
	const request = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	})

	const requestData = await request.json()

	if (request.status === 200) setFn(requestData)
}