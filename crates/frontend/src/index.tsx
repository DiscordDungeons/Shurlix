import { render } from 'preact'
import { LocationProvider, Router, Route } from 'preact-iso'

import { Home } from './pages/Home/index.jsx'
import { NotFound } from './pages/_404.jsx'
import './style.scss'

import { ConfigContextProvider } from './context/ConfigContext'
import { LoginContextProvider } from './context/LoginContext.js'
import { LinkList } from './pages/Dash/Links'
import { ApiContextProvider } from './context/ApiContext'
import { LoginPage } from './pages/Login/index'
import { RegisterPage } from './pages/Register/index.js'
import { UserPage } from './pages/Dash/User.js'

export function App() {
	return (
		<LocationProvider>
			<ConfigContextProvider>
				<LoginContextProvider>
					<ApiContextProvider>
						<Router>
							<Route path="/" component={Home} />
							<Route path="/dash/login" component={LoginPage} />
							<Route path="/dash/me" component={UserPage} />
							<Route path="/dash/register" component={RegisterPage} />
							<Route path="/dash/links" component={LinkList} />
							<Route default component={NotFound} />
						</Router>
					</ApiContextProvider>
				</LoginContextProvider>
			</ConfigContextProvider>
		</LocationProvider>
	)
}

render(<App />, document.getElementById('app'))
