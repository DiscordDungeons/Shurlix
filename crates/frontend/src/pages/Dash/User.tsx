import { RequireLogin } from '../../components/HoC/RequireLogin'
import { Dashboard } from '../../components/Layout/Dashboard/Dashboard'

const InternalUserPage = () => {
	return (
		<Dashboard>
			<div class="bg-gray-100 min-h-screen">
				<div class="w-full max-w-full px-8 py-12">
					<div class="grid grid-cols-2 gap-8">
						{/* Left Column */}
						<div>
							<h2 class="text-2xl font-semibold mb-4">Personal information</h2>
							<p class="text-gray-600">Use a permanent address where you can receive mail.</p>
						</div>

						{/* Right Column */}
						<div>
							<form>
								<div class="mb-4">
									<label class="block text-gray-700 mb-2" for="username">Username</label>
									<input
										id="username"
										type="text"
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									/>
								</div>
			
			
								{/* Confirm Password */}
								<div class="mb-6">
									<label class="block text-gray-700 mb-2" for="email">Email</label>
									<input
										id="email"
										type="email"
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									/>
								</div>

								{/* Save Button */}
								<button
									type="submit"
									class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
							<h2 class="text-2xl font-semibold mb-4">Change password</h2>
							<p class="text-gray-600">Update your password associated with your account.</p>
						</div>

						{/* Right Column */}
						<div>
							<form>
								{/* Current Password */}
								<div class="mb-4">
									<label class="block text-gray-700 mb-2" for="current-password">Current password</label>
									<input
										id="current-password"
										type="password"
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									/>
								</div>
          
								{/* New Password */}
								<div class="mb-4">
									<label class="block text-gray-700 mb-2" for="new-password">New password</label>
									<input
										id="new-password"
										type="password"
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									/>
								</div>
          
								{/* Confirm Password */}
								<div class="mb-6">
									<label class="block text-gray-700 mb-2" for="confirm-password">Confirm password</label>
									<input
										id="confirm-password"
										type="password"
										class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									/>
								</div>

								{/* Save Button */}
								<button
									type="submit"
									class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
							<h2 class="text-2xl font-semibold mb-4">Delete account</h2>
							<p class="text-gray-600">This action is not reversible. All information related to this account will be deleted permanently.</p>
						</div>

						{/* Right Column */}
						<div>
							<button
								type="submit"
								class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
