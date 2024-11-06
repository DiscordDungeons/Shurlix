import { createContext } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { simpleDataFetch } from './contextUtils'

export type IConfigContext = {
	allowCreateAnonymousLinks: boolean,
	allowRegistering: boolean,
	minPasswordStrength: number,
	baseUrl: string,
}

export const ConfigContext = createContext<IConfigContext>({
	allowCreateAnonymousLinks: false,
	allowRegistering: false,
	minPasswordStrength: 0,
	baseUrl: null,
})

type ConfigResponse = {
	allow_anonymous_shorten: boolean,
	allow_registering: boolean,
	min_password_strength: number,
	base_url: string,
}

export const ConfigContextProvider = ({
	children,
}) => {
	const [ config, setConfig ] = useState<IConfigContext>({
		allowCreateAnonymousLinks: false,
		allowRegistering: true,
		minPasswordStrength: 0,
		baseUrl: null,
	})

	useEffect(() => {
		simpleDataFetch<ConfigResponse>('/api/config', (data) => {
			setConfig({
				allowCreateAnonymousLinks: data.allow_anonymous_shorten,
				allowRegistering: data.allow_registering,
				minPasswordStrength: data.min_password_strength,
				baseUrl: data.base_url,
			})
		})
	}, [])


	

	return (
		<ConfigContext.Provider
			value={config}
		>
			{children}
		</ConfigContext.Provider>
	)
}
