import { render } from 'preact'
import { LocationProvider, Router, Route } from 'preact-iso'
import { Suspense, lazy } from 'preact/compat'


const Home = lazy(async () => (await import('./pages/Home/index')).Home)
const LoginPage = lazy(async () => (await import('./pages/Login/index')).LoginPage)
const UserPage = lazy(async () => (await import('./pages/Dash/User')).UserPage)
const RegisterPage = lazy(async () => (await import('./pages/Register/index')).RegisterPage)
const LinkList = lazy(async () => (await import('./pages/Dash/Links')).LinkList)
const DomainsPage = lazy(async () => (await import('./pages/Dash/Domains')).DomainsPage)
const SetupRouter = lazy(async () => (await import('./pages/Setup/index')).SetupRouter)
const NotFound = lazy(async () => (await import('./pages/_404')).NotFound)


import './style.scss'

import { ConfigContextProvider } from './context/ConfigContext'
import { LoginContextProvider } from './context/LoginContext.js'
import { ApiContextProvider } from './context/ApiContext'
import { ProviderComposer } from './components/ProviderComposer.js'
import { DomainContextProvider } from './context/DomainContext.js'
import { DomainRepositoryContextProvider } from './context/DomainRepositoryContext.js'
import { ThemeContextProvider } from './context/ThemeContext.js'

const providers = [
	ThemeContextProvider,
	LocationProvider,
	ConfigContextProvider,
	LoginContextProvider,
	ApiContextProvider,
	DomainContextProvider,
	DomainRepositoryContextProvider,
]

export function App() {
	return (
		<ProviderComposer providers={providers}>
			<Suspense fallback={<div>Loading...</div>}>
				<Router>
					<Route path="/" component={Home} />
					<Route path="/dash/login" component={LoginPage} />
					<Route path="/dash/me" component={UserPage} />
					<Route path="/dash/register" component={RegisterPage} />
					<Route path="/dash/links" component={LinkList} />
					<Route path="/dash/domains" component={DomainsPage} />
					<Route path="/setup" component={SetupRouter} />
					<Route path="/setup/*" component={SetupRouter} />
					<Route default component={NotFound} />
				</Router>
			</Suspense>
		</ProviderComposer>
	)
}

render(<App />, document.getElementById('app'))
