import { ComponentChildren } from 'preact'

type Props = {
	children: ComponentChildren,
	currentStep: number,
	completedSteps: number[]
}

interface StepProps {
	title: string;
	isCompleted?: boolean;
	isActive?: boolean;
}


function Step({ title, isCompleted, isActive }: StepProps) {
	return (
	  <div
			class={`flex items-center transition-colors duration-200 ${
		  isActive
					? 'text-blue-600 dark:text-blue-300 font-semibold'  // Darker blue for light mode, lighter for dark mode
					: 'text-gray-600 dark:text-gray-400'  // Darker gray for inactive states
			}`}
	  >
			<span
		  class={`w-8 h-8 flex items-center justify-center rounded-full mr-3 transition-all duration-200 ${
					isCompleted
			  ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-green-200'  // Higher contrast with white text
			  : isActive
			  ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-300 dark:border-blue-300'
			  : 'border border-gray-500 text-gray-600 dark:border-gray-500 dark:text-gray-400'
		  }`}
			>
		  {isCompleted ? '✔' : title.charAt(0).toUpperCase()}
			</span>
			<span>{title}</span>
	  </div>
	)
}

export const SetupLayout = ({
	children,
	completedSteps,
	currentStep,
}: Props) => {
	return (
		<div class="flex p-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
			{/* Sidebar */}
			<div class="w-1/4 pr-8">
				<nav class="space-y-6">
					<Step title="Environment" isCompleted={completedSteps.includes(1)} isActive={currentStep === 1} />
					<Step title="Initial Account" isCompleted={completedSteps.includes(2)} isActive={currentStep === 2}  />
				</nav>
			</div>

			{/* Main Content */}
			<div class="flex-1 bg-gray-200 dark:bg-gray-800 p-8 rounded-lg shadow-lg">
				{children}
			</div>
		</div>
	)
}
