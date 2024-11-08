import { createContext } from 'preact'
import { StateUpdater, useEffect, useState } from 'preact/hooks'
import { APIError, simpleDataFetch, simpleDataPost, simpleDelete } from './contextUtils'
import { toast } from 'react-toastify'
import { CreationState } from './types'

export type Link = {
    id: number;
    slug: string;
    custom_slug?: string;
    original_link: string;
    owner_id?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
};

export type PaginatedResponse<T> = {
	items: T[]
	total_count: number,
}


export type IApiContext = {
	links: Link[] | null,
	linkCreationState: StateUpdater<CreationState>,
	error: string | null,
	currentLinkPage: number,
	perPage: number,
	totalLinkCount: number,
	getMyLinks: () => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	createLink: (url: string, domainId: number, customSlug?: string) => Promise<void>,
	resetLinkCreationState: () => void,
	// eslint-disable-next-line no-unused-vars
	deleteLink: (slug: string) => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	setCurrentLinkPage: (page: number) => void,
	// eslint-disable-next-line no-unused-vars
	setPerPage: (count: number) => void,
}

export const ApiContext = createContext<IApiContext>(null)


export const ApiContextProvider = ({
	children,
}) => {
	const [ error, setError ] = useState<string>(null)
	
	const [ links, setLinks ] = useState<Link[]>(null)
	const [ totalLinkCount, setTotalLinkCount ] = useState<number>(0)
	const [ currentLinkPage, setCurrentLinkPage ] = useState<number>(1)
	const [ perPage, setPerPage ] = useState(10)

	const [ linkCreationState, setLinkCreationState ] = useState<CreationState>(CreationState.NONE)

	const resetLinkCreationState = () => setLinkCreationState(CreationState.NONE)


	const getMyLinks = async () => {
		simpleDataFetch<PaginatedResponse<Link>>(`/api/user/me/links?page=${currentLinkPage}&per_page=${perPage}`, data => {
			setError(null)

			setTotalLinkCount(data.total_count)

			setLinks(data.items)
		})
	}

	const createLink = async (url: string, domainId: number, customSlug?: string) => {
		setLinkCreationState(CreationState.CREATING)
		await simpleDataPost<Link>('/api/link/shorten', {
			link: url,
			domain_id: domainId,
			custom_slug: customSlug, 
		}, (data) => {
			setError(null)
			const newLinks = [ data, ...links ]
			setLinkCreationState(CreationState.CREATED)
			setLinks(newLinks)
			setTotalLinkCount(totalLinkCount + 1)
		}).catch((e: APIError) => {
			setLinkCreationState(CreationState.FAILED)
			setError(e.message)
		})
	}

	const deleteLink = async (slug: string) => {
		await simpleDelete(`/api/link/${slug}`, () => {
			const linkClone = [...links]

			const newLinks = linkClone.filter(link => link.slug !== slug)

			setLinks(newLinks)

			toast.success('Link deleted.')
			setError(null)
			setTotalLinkCount(totalLinkCount - 1)
		}).catch((e: APIError) => {
			toast.error(e.message)
		})
	} 

	useEffect(() => {
		getMyLinks()
	}, [ currentLinkPage, perPage ])

	return (
		<ApiContext.Provider
			value={{
				links,
				currentLinkPage,
				perPage,
				totalLinkCount,
				setPerPage,
				setCurrentLinkPage,
				getMyLinks,
				createLink,
				resetLinkCreationState,
				deleteLink,
				linkCreationState,
				error,
			}}
		>
			{children}
		</ApiContext.Provider>
	)
}
