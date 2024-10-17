import { createContext } from 'preact'
import { useState } from 'preact/hooks'
import { simpleDataFetch } from './contextUtils'

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

export type IApiContext = {
	links: Link[] | null,
	getMyLinks: () => Promise<void>,
}

export const ApiContext = createContext<IApiContext>(null)


export const ApiContextProvider = ({
	children,
}) => {
	const [links, setLinks] = useState<Link[]>(null)

	const getMyLinks = async () => {
		simpleDataFetch<Link[]>("/api/user/me/links", data => {
			setLinks(data)
		})
	}


	return (
		<ApiContext.Provider
			value={{
				links,
				getMyLinks,
			}}
		>
			{children}
		</ApiContext.Provider>
	)
}