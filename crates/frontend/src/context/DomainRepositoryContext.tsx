// Handles fetching domains for the link creation selects

import { createContext } from 'preact'
import { Domain } from './DomainContext'
import { LoginContext } from './LoginContext'
import { useContext, useEffect, useState } from 'preact/hooks'
import { simpleDataFetch } from './contextUtils'

export type IDomainRepositoryContext = {
	getDomainsForUser: () => Promise<void>,
	domains: Domain[],
}

export const DomainRepositoryContext = createContext<IDomainRepositoryContext>(null)

export const DomainRepositoryContextProvider = ({
	children,
}) => {
	const [ domains, setDomains ] = useState<Domain[]>([])
	const { user } = useContext(LoginContext)

	const getDomainsForUser = async () => {
		await simpleDataFetch<Domain[]>('/api/domains/all', (data) => {
			setDomains(data)
		})
	}

	useEffect(() => {
		getDomainsForUser()
	}, [user])

	return (
		<DomainRepositoryContext.Provider
			value={{
				getDomainsForUser,
				domains,
			}}
		>
			{children}
		</DomainRepositoryContext.Provider>
	)
}
