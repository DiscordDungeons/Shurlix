import { createContext } from 'preact'
import { useState } from 'preact/hooks'
import { simpleDataFetch } from './contextUtils'

export type IConfigContext = {
	allowCreateAnonymousLinks: boolean,
}

export const ConfigContext = createContext<IConfigContext>({
	allowCreateAnonymousLinks: false,
})

type ConfigResponse = {
	allow_anonymous_shorten: boolean,
}

export const ConfigContextProvider = ({
	children,
}) => {
	const [allowCreateAnonymousLinks, setAllowCreateAnonymousLinks] = useState(false)

	simpleDataFetch<ConfigResponse>("/api/config", (data) => {
		setAllowCreateAnonymousLinks(data.allow_anonymous_shorten)
	})

	return (
		<ConfigContext.Provider
			value={{
				allowCreateAnonymousLinks,
			}}
		>
			{children}
		</ConfigContext.Provider>
	)
}