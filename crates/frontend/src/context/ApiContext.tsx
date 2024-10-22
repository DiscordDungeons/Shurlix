import { createContext } from 'preact'
import { StateUpdater, useState } from 'preact/hooks'
import { APIError, simpleDataFetch, simpleDataPost, simpleDelete } from './contextUtils'
import { toast } from 'react-toastify'

type Link = {
    id: number;
    slug: string;
    custom_slug?: string;
    original_link: string;
    owner_id?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
};

export enum LinkCreationState {
	NONE = 'NONE',
	CREATING = 'CREATING',
	CREATED = 'CREATED',
	FAILED = 'FAILED',
}

export type IApiContext = {
	links: Link[] | null,
	linkCreationState: StateUpdater<LinkCreationState>,
	error: string | null,
	getMyLinks: () => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	createLink: (url: string, customSlug?: string) => Promise<void>,
	resetLinkCreationState: () => void,
	// eslint-disable-next-line no-unused-vars
	deleteLink: (slug: string) => Promise<void>,
}

export const ApiContext = createContext<IApiContext>(null)


export const ApiContextProvider = ({
	children,
}) => {
	const [ links, setLinks ] = useState<Link[]>(null)
	const [ error, setError ] = useState<string>(null)

	const [ linkCreationState, setLinkCreationState ] = useState<LinkCreationState>(LinkCreationState.NONE)

	const resetLinkCreationState = () => setLinkCreationState(LinkCreationState.NONE)


	const getMyLinks = async () => {
		simpleDataFetch<Link[]>('/api/user/me/links', data => {
			setError(null)
			setLinks(data)
		})
	}

	const createLink = async (url: string, customSlug?: string) => {
		setLinkCreationState(LinkCreationState.CREATING)
		await simpleDataPost<Link>('/api/link/shorten', {
			link: url,
			custom_slug: customSlug, 
		}, (data) => {
			setError(null)
			const newLinks = [ data, ...links ]
			setLinkCreationState(LinkCreationState.CREATED)

			setLinks(newLinks)
		}).catch((e: APIError) => {
			setLinkCreationState(LinkCreationState.FAILED)
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
		}).catch((e: APIError) => {
			toast.error(e.message)
		})
	} 


	return (
		<ApiContext.Provider
			value={{
				links,
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
