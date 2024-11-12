import { useState } from 'preact/hooks'
import { SetupLayout } from '../../components/Layout/Setup/SetupLayout'

export const UserCreation = () => {
	const [ user, setUser ] = useState({

	})

	return (
		<SetupLayout currentStep={2} completedSteps={[1]}>
			Hello World
		</SetupLayout>
	)
}	
