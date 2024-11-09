import { Route, Router } from 'preact-iso'
import { NotFound } from '../_404'
import { SetupLayout } from '../../components/Layout/Setup/SetupLayout'
import { useState } from 'preact/hooks';


interface AccountOptionProps {
    title: string;
    description: string;
    icon: string;
    isSelected: boolean;
    onClick: () => void;
}

function AccountOption({ title, description, icon, isSelected, onClick }: AccountOptionProps) {
    return (
		<div
			onClick={onClick}
			class={`p-4 border rounded-lg cursor-pointer flex items-start space-x-4 ${
			isSelected
				? 'border-blue-500 bg-blue-900 text-white'
				: 'border-gray-600 bg-gray-800 text-gray-300'
			}`}
		>
			<div class="text-2xl">{icon}</div>
			<div>
				<h3 class="text-lg font-semibold">{title}</h3>
				<p class="text-gray-400">{description}</p>
			</div>
		</div>
    );
}

const Home = () => {
	const [teamSize, setTeamSize] = useState<string>('1-10');
    const [selectedAccount, setSelectedAccount] = useState<string>('Designer');

	return (
		<SetupLayout>
			<h2 class="text-xl font-semibold mb-2 text-white">Account Settings</h2>
			<p class="text-gray-400 mb-6">
			Choose what type of account you need carefully as billing is based upon your account type
			</p>

			{/* Account Name */}
			<div class="mb-4">
			<label class="block text-gray-200 mb-2">Account Name</label>
			<input
				type="text"
				placeholder='For example "Alpha"'
				class="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-3"
			/>
			</div>

			{/* Team Size */}
			<div class="mb-6">
			<label class="block text-gray-200 mb-2">Team Size</label>
			<div class="flex space-x-4">
				{['1-1', '1-10', '10-50', '50+'].map(size => (
				<button
					key={size}
					onClick={() => setTeamSize(size)}
					class={`py-2 px-4 rounded-lg ${
					teamSize === size
						? 'bg-blue-500 text-white'
						: 'bg-gray-800 text-gray-300'
					}`}
				>
					{size}
				</button>
				))}
			</div>
			</div>

			{/* Specify Account */}
			<div class="mb-8">
			<label class="block text-gray-200 mb-2">Specify Account</label>
			<div class="space-y-4">
				<AccountOption
					title="Developer Account"
					description="This is just the right package for you, it's worth a lot more than any other offer."
					icon="🏆"
					isSelected={selectedAccount === 'Developer'}
					onClick={() => setSelectedAccount('Developer')}
				/>
				<AccountOption
					title="Designer Account"
					description="This is just the right package for you, it's worth a lot more than any other offer."
					icon="🎨"
					isSelected={selectedAccount === 'Designer'}
					onClick={() => setSelectedAccount('Designer')}
				/>
			</div>
			</div>

			{/* Buttons */}
			<div class="flex justify-between">
			<button class="py-2 px-6 rounded-lg border border-gray-600 text-gray-300">Go Back</button>
			<button class="py-2 px-6 rounded-lg bg-blue-500 text-white">Continue</button>
			</div>

		</SetupLayout>
	)
}

export const SetupRouter = () => (
	<Router>
		<Route path="/" component={Home} />
		<Route default component={NotFound} />
	</Router>
)
