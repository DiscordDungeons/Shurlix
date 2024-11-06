import { createContext } from 'preact'
import { PaginationContext } from './types'
import { useEffect, useState } from 'preact/hooks'
import { simpleDataFetch } from './contextUtils'
import { PaginatedResponse } from './ApiContext'

export type Domain = {
	id: number,
	domain: string,
	created_at: string,
	updated_at: string,
}

export type IDomainContext = PaginationContext<Domain> & {
	getDomains: () => Promise<void>,
}

export const DomainContext = createContext<IDomainContext>(null)


export const DomainContextProvider = ({
	children,
}) => {
	const [ items, setItems ] = useState<Domain[]>(null)
	const [ totalCount, setTotalCount ] = useState(0)
	const [ currentPage, setCurrentPage ] = useState(1)
	const [ perPage, setPerPage ] = useState(10)

	const getDomains = async () => {
		simpleDataFetch<PaginatedResponse<Domain>>(`/api/domains?page=${currentPage}&per_page=${perPage}`, data => {
			setTotalCount(data.total_count)

			setItems(data.items)
		})
	}

	useEffect(() => {
		getDomains()
	}, [ currentPage, perPage ])

	return (
		<DomainContext.Provider
			value={{
				getDomains,
				items,
				totalCount,
				currentPage,
				perPage,
				setCurrentPage,
				setPerPage,
			}}
		>
			{children}
		</DomainContext.Provider>
	)
}
