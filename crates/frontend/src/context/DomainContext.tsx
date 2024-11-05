import { createContext } from 'preact'

export type Domain = {}

type PaginatedDomains = {
	domains: Domain[]
	total_count: number,
}

export type IDomainContext = {

}

export const DomainContext = createContext<IDomainContext>(null)


export const DomainContextProvider = ({
	children,
}) => {

	return (
		<DomainContext.Provider
			value={{}}
		>
			{children}
		</DomainContext.Provider>
	)
}
