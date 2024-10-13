export const simpleDataFetch = async (url: string, setFn: (data: any) => void): Promise<void> => {
	const request = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	const data = await request.json()

	if (request.status === 200) setFn(data)
}