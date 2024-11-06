import { createContext } from 'preact'
import { PaginationContext } from './types'
import { useEffect, useState } from 'preact/hooks'
import { APIError, simpleDataFetch, simpleDelete } from './contextUtils'
import { PaginatedResponse } from './ApiContext'
import { toast } from 'react-toastify'

export type Domain = {
	id: number,
	domain: string,
	created_at: string,
	updated_at: string,
}

export type IDomainContext = PaginationContext<Domain> & {
	getDomains: () => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	createDomain: (url: string) => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	deleteDomain: (id: number) => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	updateDomain: (id: number, url: string) => Promise<void>,
}

export const DomainContext = createContext<IDomainContext>(null)


export const DomainContextProvider = ({
	children,
}) => {
	const [ items, setItems ] = useState<Domain[]>([])
	const [ totalCount, setTotalCount ] = useState(0)
	const [ currentPage, setCurrentPage ] = useState(1)
	const [ perPage, setPerPage ] = useState(10)

	const getDomains = async () => {
		simpleDataFetch<PaginatedResponse<Domain>>(`/api/domains?page=${currentPage}&per_page=${perPage}`, data => {
			setTotalCount(data.total_count)

			setItems(data.items)
		})
	}

	const deleteDomain = async (id: number) => {
		await simpleDelete(`/api/domain/${id}`, () => {
			const itemClone = [...items]

			const newItems = itemClone.filter(item => item.id !== id)

			setItems(newItems)

			toast.success('Domain deleted.')
			setTotalCount(totalCount - 1)
		}).catch((e: APIError) => {
			toast.error(e.message)
		})
	}

	const updateDomain = async (id: number, url: string) => {

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
				deleteDomain,
				updateDomain,
			}}
		>
			{children}
		</DomainContext.Provider>
	)
}
