import { useContext, useEffect } from 'preact/hooks'
import { LoginContext } from '../../context/LoginContext'
import { Dashboard } from '../Layout/Dashboard/Dashboard'

export const RequireAdmin = (WrappedComponent: any) => {
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
			loginContext.fetchMe()
		}, [])

		if (!loginContext.user) {
			return (
				<h1>Please wait, loading...</h1>
			)
		}

		if (!loginContext.user.is_admin) {
			return (
				<Dashboard>
					<h1>You do not have access to this page.</h1>
				</Dashboard>
			)
		}
		
		return (
			<WrappedComponent {...props} />
		)
	}

	return newComponent
}
