import { createContext } from 'preact'
import { useState } from 'preact/hooks'
import { simpleDataFetch } from './contextUtils'

export type IConfigContext = {
	allowCreateAnonymousLinks: boolean,
	allowRegistering: boolean,
	minPasswordStrength: number,
}

export const ConfigContext = createContext<IConfigContext>({
	allowCreateAnonymousLinks: false,
	allowRegistering: false,
	minPasswordStrength: 0,
})

type ConfigResponse = {
	allow_anonymous_shorten: boolean,
	allow_registering: boolean,
	min_password_strength: number,
}

export const ConfigContextProvider = ({
	children,
}) => {
	const [ config, setConfig ] = useState<IConfigContext>({
		allowCreateAnonymousLinks: false,
		allowRegistering: true,
		minPasswordStrength: 0,
	})


	simpleDataFetch<ConfigResponse>('/api/config', (data) => {
		setConfig({
			allowCreateAnonymousLinks: data.allow_anonymous_shorten,
			allowRegistering: data.allow_registering,
			minPasswordStrength: data.min_password_strength,
		})
	})

	return (
		<ConfigContext.Provider
			value={config}
		>
			{children}
		</ConfigContext.Provider>
	)
}
