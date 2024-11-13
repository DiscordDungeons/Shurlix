import { createContext } from 'preact'
import { APIError, simpleDataPost } from './contextUtils'
import { useContext, useState } from 'preact/hooks'
import { ConfigContext } from './ConfigContext'
import { toast } from 'react-toastify'
import { useLocation } from 'preact-iso'
import { LoginContext } from './LoginContext'

type PasswordFeedback = {
	warning: string | null,
	warning_string: string | null,
	suggestions: string[] | null,
	suggestion_string: string | null,
}

type CheckPasswordResponse = {
	score: number,
	feedback: PasswordFeedback | null,
}

export type RegisterUserRequest = {
	username: string,
	password: string,
	confirm_password: string,
	email: string,
	confirm_email: string,
}

type RegisterUserResponse = {
	id: number,
	username: string,
	email: string,
}

export type IRegisterContext = {
	// eslint-disable-next-line no-unused-vars
	validatePassword: (password: string) => Promise<boolean>,
	// eslint-disable-next-line no-unused-vars
	registerUser: (data: RegisterUserRequest) => Promise<void>,
	passwordFeedback: CheckPasswordResponse | null,
	error: string | null,
}

export const RegisterContext = createContext<IRegisterContext>(null)

export const RegisterContextProvider = ({
	children,
}) => {
	const { setLoginRedirectMessage } = useContext(LoginContext)
	const { minPasswordStrength } = useContext(ConfigContext)
	const { route } = useLocation()

	const [ passwordFeedback, setPasswordFeedback ] = useState(null)
	const [ error, setError ] = useState<string>(null)

	const validatePassword = async (password: string): Promise<boolean> => {
		await simpleDataPost<CheckPasswordResponse>('/api/user/password', { password }, (data) => {
			if (data.score >= minPasswordStrength) return true
			setPasswordFeedback(data)

			toast.error('Password is not strong enough.')
			return false
		})

		return
	}

	const registerUser = async (data: RegisterUserRequest) => {
		await simpleDataPost<RegisterUserResponse, RegisterUserRequest>('/api/user/register', data, () => {
			toast.success('Registered!')
			setLoginRedirectMessage('Registered, please login!')

			route('/dash/login')


			return
		}).catch((e: APIError) => {
			setError(e.message)
		}) 
	}

	return (
		<RegisterContext.Provider
			value={{
				validatePassword,
				registerUser,
				passwordFeedback,
				error,
			}}
		>
			{children}
		</RegisterContext.Provider>
	)
}
