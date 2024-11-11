import { createContext } from 'preact'
import { useState } from 'preact/hooks'
import { Config } from '../pages/Setup/types'

interface SetConfigErrorResponse {
	errors: string[],
}

type SetConfigResponse = string | SetConfigErrorResponse

export type ISetupContext = {
	// eslint-disable-next-line no-unused-vars
	setConfig: (config: Config) => Promise<void>,
	error: SetConfigResponse | null,
}

export const SetupContext = createContext<ISetupContext>(null)

export const SetupContextProvider = ({
	children,
}) => {
	let [ error, setError ] = useState(null)

	const setConfig = async (config: Config) => {
		const request = await fetch('/api/setup/set', {
			method: 'POST',
			body: JSON.stringify(config),
			headers: {
				'Content-Type': 'application/json',
			},
		})
	
		const requestData = await request.json()
	
		if (request.ok) {
			console.log('data is', requestData)
		} else if (typeof requestData === 'string') {
			setError(requestData)
		} else {
			setError(requestData.errors)
		}
	}

	return (
		<SetupContext.Provider
			value={{
				setConfig,
				error,
			}}
		>
			{children}
		</SetupContext.Provider>
	)
}
