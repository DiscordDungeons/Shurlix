import { useState } from 'preact/hooks'
import { SetupLayout } from '../../components/Layout/Setup/SetupLayout'
import { RegisterUserRequest } from '../../context/RegisterContext'
import { handleChange } from '../../util/form'



export const UserCreation = () => {
	const isLoading = false

	const [ user, setUser ] = useState<RegisterUserRequest>({
		confirm_email: '',
		confirm_password: '',
		email: '',
		password: '',
		username: '',
	})

	const onSubmit = () => {}
		
	return (
		<SetupLayout currentStep={2} completedSteps={[1]}>
			<h2 class="text-xl font-semibold mb-2">Initial User Creation</h2>
			<p class="text-gray-400 mb-6">
				Create the initial user account to gain access to the application. This account will have administrative privileges to configure and manage settings.
			</p>

			<form class="space-y-8" onSubmit={e => e.preventDefault()}>

				<section>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Username
						<span class="text-red-500 ml-1">*</span>
					</label>
					<input type="text" name="username" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={user.username} onChange={(e) => handleChange(e, setUser)} placeholder="Enter your username" />
					
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Email
						<span class="text-red-500 ml-1">*</span>		
					</label>
					<input type="email" name="email" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={user.email} onChange={(e) => handleChange(e, setUser)} placeholder="you@example.com" />

					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Confirm Email
						<span class="text-red-500 ml-1">*</span>		
					</label>
					<input type="email" name="confirm_email" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={user.confirm_email} onChange={(e) => handleChange(e, setUser)} placeholder="you@example.com" />

					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Password
						<span class="text-red-500 ml-1">*</span>		
					</label>
					<input type="password" name="password" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={user.password} onChange={(e) => handleChange(e, setUser)} placeholder="••••••••" />

					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Confirm Password
						<span class="text-red-500 ml-1">*</span>		
					</label>
					<input type="password" name="confirm_password" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={user.confirm_password} onChange={(e) => handleChange(e, setUser)} placeholder="••••••••" />
				</section>
			</form>

			{/* Buttons */}
			<div class="flex justify-between pt-8">
				<button class="py-2 px-6 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-400">Go Back</button>
				<button class="py-2 px-6 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={onSubmit}>
					{isLoading ? (
						<span class="animate-spin inline-block w-5 h-5 border-4 border-t-transparent border-white rounded-full" />
					) : (
						'Continue'
					)}
				</button>
			</div>
		</SetupLayout>
	)
}	
