export class APIError extends Error {
	statusCode: number
	error: any

	constructor(message: any, statusCode: number) {
		super(message)
		this.name = 'APIError'
		this.statusCode = statusCode
		this.error = message
	}
}


export const simpleDataFetch = async <T>(url: string, setFn: (data: T) => void): Promise<void> => {
	const request = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	const data = await request.json()

	if (request.ok) {
		setFn(data)
	} else {
		throw new APIError(data.message, request.status)
	}
}

export const simpleDataPost = async <T, T2 = Record<string, any>>(
	url: string,
	data: T2,
	setFn: (data: T) => void,
): Promise<void> => {
	const request = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	})

	const requestData = await request.json()

	if (request.ok) {
		setFn(requestData)
	} else {
		throw new APIError(requestData, request.status)
	}
}


export const simpleDataPut = async <T>(
	url: string,
	data: Record<string, any>,
	setFn: (data: T) => void,
): Promise<void> => {
	const request = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	})

	const requestData = await request.json()

	if (request.ok) {
		setFn(requestData)
	} else {
		throw new APIError(requestData.message, request.status)
	}
}



export const simpleDelete = async <T>(url: string, setFn: (data: T) => void): Promise<void> => {
	const request = await fetch(url, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	const data = await request.json()

	if (request.ok) {
		setFn(data)
	} else {
		throw new APIError(data.message, request.status)
	}
}

