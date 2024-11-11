import { Route, Router } from 'preact-iso'
import { NotFound } from '../_404'
import { SetupContextProvider } from '../../context/SetupContext'
import { EnvironmentSetup } from './Environment'




export const SetupRouter = () => (
	<SetupContextProvider>
		<Router>
			<Route path="/" component={EnvironmentSetup} />
			<Route default component={NotFound} />
		</Router>
	</SetupContextProvider>
)
