import { createContext } from 'preact'
import { useState } from 'preact/hooks'
import { APIError, simpleDataFetch, simpleDataPost, simpleDelete } from './contextUtils'
import { useLocation } from 'preact-iso'
import { deleteCookie } from '../util/cookies'
import { toast } from 'react-toastify'

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
	isDeletingAccount: boolean,
	// eslint-disable-next-line no-unused-vars
	loginUser: (email: string, password: string) => Promise<void>,
	logoutUser: () => void,
	fetchMe: () => Promise<void>,
	deleteAccount: () => Promise<void>,
	// eslint-disable-next-line no-unused-vars
	changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>,
}

export const LoginContext = createContext<ILoginContext>(null)

export const LoginContextProvider = ({
	children,
}) => {
	const [ user, setUser ] = useState<User | null>(null)
	const [ error, setError ] = useState<string | null>(null)
	const [ loginRedirectMessage, setLoginRedirectMessage ] = useState<string | null>(null)
	const [ loginRedirectTo, setLoginRedirectTo ] = useState<string | null>(null)
	const [ isDeletingAccount, setIsDeletingAccount ] = useState<boolean>(false)

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
				localStorage.setItem('isLoggedIn', 'false')
				
				route('/dash/login')
			}
		})
	}

	const logoutUser = async (shouldRoute: boolean = true) => {
		setError(null)
		setUser(null)

		await simpleDataPost('/api/user/logout', {}, () => {
			localStorage.setItem('isLoggedIn', 'false')
			if (shouldRoute) {
				setLoginRedirectMessage('Logged out.')
				route('/dash/login')
			}
		}).catch(e => {
			toast.error('Logout failed?')
			console.error(e)
		})
	}

	const changePassword = async (password: string, new_password: string, confirm_password: string) => {
		setError(null)

		await simpleDataPost('/api/user/me/password', {
			password,
			new_password,
			confirm_password,
		}, () => {
			toast.success('Password updated.')
		}).catch((e: APIError) => {
			toast.error(`Failed to update password: ${e.message}`)
		})
	}

	const deleteAccount = async () => {
		setIsDeletingAccount(true)
		await simpleDelete('/api/user/me', async () => {
			setError(null)
			setUser(null)
			await logoutUser(false)
			setLoginRedirectMessage('Account deleted.')
			route('/dash/login')
		}).catch(() => {
			toast.error('Failed to delete user.')
		})
	}

	return (
		<LoginContext.Provider
			value={{
				user,
				error,
				loginRedirectMessage,
				loginRedirectTo,
				isDeletingAccount,
				loginUser,
				logoutUser,
				fetchMe,
				deleteAccount,
				changePassword,
			}}
		>
			{children}
		</LoginContext.Provider>
	)
}
