import { createContext } from 'preact'
import { Dispatch, StateUpdater, useState } from 'preact/hooks'
import { APIError, simpleDataFetch, simpleDataPost } from './contextUtils'

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
	NONE,
	CREATING,
	CREATED,
	FAILED,
}

export type IApiContext = {
	links: StateUpdater<Link[] | null>,
	linkCreationState: StateUpdater<LinkCreationState>,
	error: string | null,
	getMyLinks: () => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	createLink: (url: string, customSlug?: string) => Promise<void>,
	resetLinkCreationState: () => void,
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
			setLinks(data)
		})
	}

	const createLink = async (url: string, customSlug?: string) => {
		setLinkCreationState(LinkCreationState.CREATING)
		await simpleDataPost<Link>('/api/link/shorten', {
			link: url,
			custom_slug: customSlug, 
		}, (data) => {
			const newLinks = [ data, ...links ]
			setLinkCreationState(LinkCreationState.CREATED)

			setLinks(newLinks)
		}).catch((e: APIError) => {
			setLinkCreationState(LinkCreationState.FAILED)
			setError(e.message)
		})
	}


	return (
		<ApiContext.Provider
			value={{
				links,
				getMyLinks,
				createLink,
				resetLinkCreationState,
				linkCreationState,
				error,
			}}
		>
			{children}
		</ApiContext.Provider>
	)
}
