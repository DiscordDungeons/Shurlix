import { createContext } from 'preact'
import { CreationState, PaginationContext } from './types'
import { StateUpdater, useEffect, useState } from 'preact/hooks'
import { APIError, simpleDataFetch, simpleDataPost, simpleDataPut, simpleDelete } from './contextUtils'
import { PaginatedResponse } from './ApiContext'
import { toast } from 'react-toastify'

export type Domain = {
	id: number,
	domain: string,
	public: boolean,
	created_at: string,
	updated_at: string,
}

export type IDomainContext = PaginationContext<Domain> & {
	getDomains: () => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	createDomain: (url: string, isPublic: boolean) => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	deleteDomain: (id: number) => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	updateDomain: (id: number, url: string, isPublic: boolean) => Promise<void>,
	resetCreationState: () => void,
	creationState: StateUpdater<CreationState>,
	error: string | null,
}

export const DomainContext = createContext<IDomainContext>(null)


export const DomainContextProvider = ({
	children,
}) => {
	const [ error, setError ] = useState<string>(null)

	const [ items, setItems ] = useState<Domain[]>([])
	const [ totalCount, setTotalCount ] = useState(0)
	const [ currentPage, setCurrentPage ] = useState(1)
	const [ perPage, setPerPage ] = useState(10)
	const [ creationState, setCreationState ] = useState<CreationState>(CreationState.NONE)

	const resetCreationState = () => setCreationState(CreationState.NONE)


	const getDomains = async () => {
		simpleDataFetch<PaginatedResponse<Domain>>(`/api/domains?page=${currentPage}&per_page=${perPage}`, data => {
			setTotalCount(data.total_count)

			setItems(data.items)
		})
	}

	const deleteDomain = async (id: number) => {
		await simpleDelete(`/api/domains/${id}`, () => {
			const itemClone = [...items]

			const newItems = itemClone.filter(item => item.id !== id)

			setItems(newItems)

			toast.success('Domain deleted.')
			setTotalCount(totalCount - 1)
		}).catch((e: APIError) => {
			toast.error(e.message)
		})
	}

	const updateDomain = async (id: number, domain: string, isPublic: boolean) => {
		await simpleDataPut(`/api/domains/${id}`, { domain, public: isPublic }, () => {
			const itemClone = [...items]

			const updatedItems = itemClone.map(item =>
				item.id === id ? { ...item, domain } : item,
			)

			setItems(updatedItems)

			toast.success('Domain updated.')
		}).catch((e: APIError) => {
			toast.error(e.message)
		})
	}

	const createDomain = async (domain: string, isPublic: boolean) => {
		setCreationState(CreationState.CREATING)
		await simpleDataPost<Domain>('/api/domains/create', { domain, public: isPublic }, (data) => {
			setError(null)
			setCreationState(CreationState.CREATED)
			setItems([ data, ...items ])
			setTotalCount(totalCount + 1)
		}).catch((e: APIError) => {
			setCreationState(CreationState.FAILED)
			setError(e.message)
		})
	}

	useEffect(() => {
		getDomains()
	}, [ currentPage, perPage ])

	return (
		<DomainContext.Provider
			value={{
				error,
				items,
				totalCount,
				currentPage,
				perPage,
				creationState,
				getDomains,
				setCurrentPage,
				setPerPage,
				deleteDomain,
				updateDomain,
				createDomain,
				resetCreationState,
			}}
		>
			{children}
		</DomainContext.Provider>
	)
}
