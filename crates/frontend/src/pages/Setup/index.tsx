import { Route, Router } from 'preact-iso'
import { NotFound } from '../_404'
import { SetupContextProvider } from '../../context/SetupContext'
import { EnvironmentSetup } from './Environment'
import { SetupLayout } from '../../components/Layout/Setup/SetupLayout'
import { UserCreationPage } from './UserCreation'
import { FinishPage } from './Finish'
import { useContext } from 'preact/hooks'
import { ConfigContext } from '../../context/ConfigContext'


export const SetupRouter = () => {
	const { setupDone } = useContext(ConfigContext)

	return setupDone ? (
		<SetupLayout completedSteps={[ 1,2,3 ]} currentStep={3}>
			All Done!
		</SetupLayout>
	) : (
		<SetupContextProvider>
			<Router>
				<Route path="/" component={EnvironmentSetup} />
				<Route path="/user" component={UserCreationPage} />
				<Route path="/finish" component={FinishPage} />
				<Route default component={NotFound} />
			</Router>
		</SetupContextProvider>
	)
}
