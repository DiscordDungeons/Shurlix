import { render } from 'preact'
import { LocationProvider, Router, Route } from 'preact-iso'

import { Home } from './pages/Home/index.jsx'
import { NotFound } from './pages/_404.jsx'
import './style.scss'

import {ConfigContextProvider} from './context/ConfigContext'
import { LoginContextProvider } from './context/LoginContext.js'
import { LoginPage } from './pages/Login/index.js'
import { LinkList } from './pages/Dash/Links.js'
import { ApiContextProvider } from './context/ApiContext.js'

export function App() {
	return (
		<LocationProvider>
			<ConfigContextProvider>
				<LoginContextProvider>
					<ApiContextProvider>
						<Router>
							<Route path="/" component={Home} />
							<Route path="/dash/login" component={LoginPage} />
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

// // On page load or when changing themes, best to add inline in `head` to avoid FOUC
// if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
// 	document.documentElement.classList.add('dark')
// } else {
// 	document.documentElement.classList.remove('dark')
// }
  
// // Whenever the user explicitly chooses light mode
// localStorage.theme = 'light'
  
// // Whenever the user explicitly chooses dark mode
// localStorage.theme = 'dark'
  
// // Whenever the user explicitly chooses to respect the OS preference
// localStorage.removeItem('theme')