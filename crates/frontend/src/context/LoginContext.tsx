import { createContext } from 'preact'
import { useState } from 'preact/hooks'
import { APIError, simpleDataFetch, simpleDataPost } from './contextUtils'
import { useLocation } from 'preact-iso'

type User = {
    id: number,
    username: string,
    email: string,
    verified_at: Date | null,
    created_at: Date,
    deleted_at: Date | null
}

type LoginResponse = {
	token: String,
	user: User,
}


export type ILoginContext = {
	user: User | null,
	error: string | null,
	loginRedirectMessage: string | null,
	loginRedirectTo: string | null,
	loginUser: (email: string, password: string) => Promise<void>,
	fetchMe: () => Promise<void>,
}

export const LoginContext = createContext<ILoginContext>(null)

export const LoginContextProvider = ({
	children,
}) => {
	const [ user, setUser ] = useState<User | null>(null)
	const [ error, setError ] = useState<string | null>(null)
	const [ loginRedirectMessage, setLoginRedirectMessage ] = useState<string | null>(null)
	const [ loginRedirectTo, setLoginRedirectTo ] = useState<string | null>(null)

	const { route, path } = useLocation()

	const loginUser = async (email: string, password: string) => {
		simpleDataPost<LoginResponse>('/api/user/login', { email, password }, (data) => {
			setError(null)
			setLoginRedirectMessage(null)

			setUser(data.user)
			localStorage.setItem('isLoggedIn', 'true')

			if (loginRedirectTo) {
				route(loginRedirectTo)
				setLoginRedirectTo(null)
			}
		}).catch((e: APIError) => {
			setError(e.message)
		})
	}

	const fetchMe = async () => {
		simpleDataFetch<User>('/api/user/me', data => {
			setError(null)
			setUser(data)
		}).catch(e => {
			setError(e.message)

			if (e.statusCode === 401) {
				setLoginRedirectMessage('Please login again.')
				setLoginRedirectTo(path)
				// localStorage.setItem('isLoggedIn', 'false')
				
				route('/dash/login')
			}
		})
	}


	return (
		<LoginContext.Provider
			value={{
				user,
				error,
				loginRedirectMessage,
				loginRedirectTo,
				loginUser,
				fetchMe,
			}}
		>
			{children}
		</LoginContext.Provider>
	)
}
