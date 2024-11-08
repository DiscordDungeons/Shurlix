import { useContext, useEffect } from 'preact/hooks'
import { LoginContext } from '../../context/LoginContext'


export const RequireLogin = (WrappedComponent: any) => {
	// const { route } = useLocation()

	const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

	if (!isLoggedIn) {
		const newComponent = () => {
			window.location.href = '/dash/login'

			return (
				<div>
					<h1>Not logged in</h1>
				</div>
			)
		}

		return newComponent
	}

	const newComponent = (props) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const loginContext = useContext(LoginContext)

		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (!loginContext.user) loginContext.fetchMe()
		}, [])

		if (!loginContext.user) {
			return (
				<h1>Please wait, loading...</h1>
			)
		}
		
		return (
			<WrappedComponent {...props} />
		)
	}

	return newComponent
}
