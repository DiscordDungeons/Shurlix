import { ComponentChildren } from 'preact'

type Props = {
	children: ComponentChildren,
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
				isActive ? 'text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500'
			}`}
		>
			<span
				class={`w-8 h-8 flex items-center justify-center rounded-full mr-3 transition-all duration-200 ${
					isCompleted
						? 'bg-blue-500 text-green-200'
						: isActive
						? 'border-2 border-blue-400 text-blue-400 dark:text-blue-300 dark:border-blue-300'
						: 'border border-gray-500 text-gray-500 dark:border-gray-600 dark:text-gray-500'
				}`}
			>
				{isCompleted ? '✔' : title.charAt(0).toUpperCase()}
			</span>
			<span>{title}</span>
		</div>
	);
}

export const SetupLayout = ({
	children,
}: Props) => {
	

	return (
		<div class="flex p-8 bg-gray-900 text-gray-200 min-h-screen">
			{/* Sidebar */}
			<div class="w-1/4 pr-8">
				<nav class="space-y-6">
					<Step title="Account Type" isCompleted />
					<Step title="Account Settings" isActive />
					<Step title="Business Information" />
					<Step title="Billing Details" />
					<Step title="Finished" />
				</nav>
			</div>

			{/* Main Content */}
			<div class="flex-1 bg-gray-800 p-8 rounded-lg shadow-lg">
				{children}
			</div>
		</div>
	);
}
