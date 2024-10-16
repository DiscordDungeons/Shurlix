import { createContext } from 'preact'
import { useState } from 'preact/hooks'
import { simpleDataFetch, simpleDataPost } from './contextUtils'

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
	loginUser: (email: string, password: string) => Promise<void>,
	fetchMe: () => Promise<void>,
}

export const LoginContext = createContext<ILoginContext>(null)

export const LoginContextProvider = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null)

	const loginUser = async (email: string, password: string) => {
		simpleDataPost<LoginResponse>("/api/user/login", { email, password }, (data) => {
			setUser(data.user)
			localStorage.setItem('isLoggedIn', 'true');
		})
	}

	const fetchMe = async () => {
		console.log("get me")
		simpleDataFetch<User>("/api/user/me", data => {
			setUser(data)
		})
	}


	return (
		<LoginContext.Provider
			value={{
				user,
				loginUser,
				fetchMe,
			}}
		>
			{children}
		</LoginContext.Provider>
	)
}