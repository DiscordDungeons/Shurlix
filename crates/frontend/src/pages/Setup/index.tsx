import { Route, Router } from 'preact-iso'
import { NotFound } from '../_404'
import { SetupLayout } from '../../components/Layout/Setup/SetupLayout'


const Home = () => (
	<SetupLayout>
		Hello.
	</SetupLayout>
)

export const SetupRouter = () => (
	<Router>
		<Route path="/" component={Home} />
		<Route default component={NotFound} />
	</Router>
)
