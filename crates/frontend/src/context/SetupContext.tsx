import { createContext } from 'preact'
import { useState } from 'preact/hooks'
import { Config } from '../pages/Setup/types'
import { checkUrlWithRetries } from '../util/checkUrlWithRetries'
import { useLocation } from 'preact-iso'

interface SetConfigErrorResponse {
	errors: string[],
}

type SetConfigResponse = string | SetConfigErrorResponse

export type ISetupContext = {
	// eslint-disable-next-line no-unused-vars
	setConfig: (config: Config) => Promise<void>,
	isLoading: boolean,
	error: SetConfigResponse | null,
	completedSteps: number[],
	baseUrl: string,
}

export const SetupContext = createContext<ISetupContext>(null)

export const SetupContextProvider = ({
	children,
}) => {
	const { route } = useLocation()
	
	let [ error, setError ] = useState(null)
	let [ isLoading, setIsLoading ] = useState(false)
	let [ completedSteps, setCompletedSteps ] = useState([])
	let [ baseUrl, setBaseUrl ] = useState('')

	const setConfig = async (config: Config) => {
		setIsLoading(true)
		const request = await fetch('/api/setup/set', {
			method: 'POST',
			body: JSON.stringify(config),
			headers: {
				'Content-Type': 'application/json',
			},
		})
	
		const requestData = await request.json()
	
		if (request.ok) {
			setError(null)
			setBaseUrl(config.app.base_url)

			try {
				const response = await checkUrlWithRetries('/api/health', 3, 1000)
				// Redirect after the promise resolves successfully
				if (response.ok) {
					setIsLoading(false)
					setCompletedSteps([ ...completedSteps, 1 ])

					route('/setup/user')  // replace with your actual redirect URL
				}
			} catch (error) {
				console.error('Error checking URL with retries:', error)
				setError('Failed to find server?')
				setIsLoading(false)
			}

		} else if (typeof requestData === 'string') {
			setIsLoading(false)
			setError(requestData)
		} else {
			setIsLoading(false)
			setError(requestData.errors)
		}
	}

	return (
		<SetupContext.Provider
			value={{
				setConfig,
				error,
				completedSteps,
				isLoading,
				baseUrl,
			}}
		>
			{children}
		</SetupContext.Provider>
	)
}
