import { useContext, useState } from 'preact/hooks'
import { RequireLogin } from '../../components/HoC/RequireLogin'
import { Dashboard } from '../../components/Layout/Dashboard/Dashboard'
import { LoginContext } from '../../context/LoginContext'
import { Modal } from '../../components/Modal'

const InternalUserPage = () => {
	const { changePassword, deleteAccount, isDeletingAccount, updateUser } = useContext(LoginContext)
	const [ isDeletionModalOpen, setDeletionModalOpen ] = useState(false)

	const [ formData, setFormData ] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
		username: '',
		email: '',
	})

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	const onSubmitPasswordChange = (e) => {
		e.preventDefault()

		changePassword(formData.currentPassword, formData.newPassword, formData.confirmPassword)
	}

	const onUpdateAccount = (e) => {
		e.preventDefault()

		updateUser({
			email: formData.email === '' ? null : formData.email,
			username: formData.username === '' ? null : formData.username,
		})
	} 

	return (
		<Dashboard>
			<Modal
				title="Confirm Account Deletion"
				open={isDeletionModalOpen}
				onClose={() => setDeletionModalOpen(false)}
				actionButton={!isDeletingAccount && (
					<div class="flex justify-end">
						<button class="bg-gray-300 text-gray-700 hover:bg-gray-400 font-semibold py-2 px-4 rounded-md mr-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" onClick={() => setDeletionModalOpen(false)}>Cancel</button>
						<button class="bg-red-500 text-white hover:bg-red-600 font-semibold py-2 px-4 rounded-md dark:bg-red-700 dark:hover:bg-red-600" onClick={() => deleteAccount()}>Delete Account</button>
					</div>
				)}	
			>
				{
					!isDeletingAccount
						? <p class="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete your account? This action cannot be undone.</p>
						: (
							<div class="flex items-center justify-center flex-col">
								<div class="loader border-4 border-b-transparent border-blue-500 animate-spin border-solid w-16 h-16 rounded-full" />
								<span class="text-gray-700 dark:text-gray-300">Deleting...</span>
							</div>
						)
				}
			</Modal>
			
			<div class="bg-gray-100 min-h-screen dark:bg-gray-900">
				<div class="w-full max-w-full px-8 py-12">
					<div class="grid grid-cols-2 gap-8">
						{/* Left Column */}
						<div>
							<h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Personal information</h2>
							<p class="text-gray-600 dark:text-gray-300">Use a permanent address where you can receive mail.</p>
						</div>
						{/* Right Column */}
						<div>
							<form onSubmit={onUpdateAccount}>
								<div class="mb-4">
									<label class="block text-gray-700 dark:text-gray-300 mb-2" for="username">Username</label>
									<input
										id="username"
										name="username"
										type="text"
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-indigo-400"
										onChange={handleChange}
										value={formData.username}
									/>
								</div>
			
			
								{/* Confirm Password */}
								<div class="mb-6">
									<label class="block text-gray-700 dark:text-gray-300 mb-2" for="email">Email</label>
									<input
										id="email"
										name="email"
										type="email"
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-indigo-400"
										onChange={handleChange}
										value={formData.email}
									/>
								</div>

								{/* Save Button */}
								<button
									type="submit"
									class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-400"
								>
										Save
								</button>
							</form>
						</div>
					</div>

					<div class="h-24" />


					<div class="grid grid-cols-2 gap-8">
						{/* Left Column */}
						<div>
							<h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Change password</h2>
							<p class="text-gray-600 dark:text-gray-300">Update your password associated with your account.</p>
						</div>

						{/* Right Column */}
						<div>
							<form onSubmit={onSubmitPasswordChange}>
								{/* Current Password */}
								<div class="mb-4">
									<label class="block text-gray-700 dark:text-gray-300 mb-2" for="currentPassword">Current password</label>
									<input
										id="currentPassword"
										type="password"
										name="currentPassword"
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-indigo-400"
										value={formData.currentPassword}
										onChange={handleChange}
									/>
								</div>
          
								{/* New Password */}
								<div class="mb-4">
									<label class="block text-gray-700 dark:text-gray-300 mb-2" for="newPassword">New password</label>
									<input
										id="newPassword"
										type="password"
										name="newPassword"
										value={formData.newPassword}
										onChange={handleChange}
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-indigo-400"
									/>
								</div>
          
								{/* Confirm Password */}
								<div class="mb-6">
									<label class="block text-gray-700 dark:text-gray-300 mb-2" for="confirmPassword">Confirm password</label>
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										value={formData.confirmPassword}
										onChange={handleChange}
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-indigo-400"
									/>
								</div>

								{/* Save Button */}
								<button
									type="submit"
									class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-400"
								>
            						Save
								</button>
							</form>
						</div>
					</div>

					<div class="h-24" />

					<div class="grid grid-cols-2 gap-8">
						{/* Left Column */}
						<div>
							<h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Delete account</h2>
							<p class="text-gray-600 dark:text-gray-300">This action is not reversible. All information related to this account will be deleted permanently.</p>
						</div>

						{/* Right Column */}
						<div>
							<button
								type="submit"
								class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
								onClick={() => setDeletionModalOpen(true)}
							>
        						Delete my account
							</button>
						</div>
					</div>
				</div>
			</div>
		</Dashboard>
	)
}


export const UserPage = RequireLogin(InternalUserPage)
