import { SetupLayout } from '../../components/Layout/Setup/SetupLayout'

const Finish = () => {
	return (
		<SetupLayout completedSteps={[ 1,2,3 ]} currentStep={3}>
			All Done!
		</SetupLayout>
	)
}

export const FinishPage = () => (
	<Finish />
)
