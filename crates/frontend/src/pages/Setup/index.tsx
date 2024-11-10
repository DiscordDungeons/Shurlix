import { Route, Router } from 'preact-iso'
import { NotFound } from '../_404'
import { SetupLayout } from '../../components/Layout/Setup/SetupLayout'
import { useState } from 'preact/hooks';
import SliderCheckbox from '../../components/SliderCheck';


interface AccountOptionProps {
	title: string;
	description: string;
	icon: string;
	isSelected: boolean;
	onClick: () => void;
}


const EnvironmentSetup = () => {
	const [config, setConfig] = useState({
		databaseUrl: 'postgres://username:password@localhost/shurlix',
		shortenedLinkLength: 8,
		allowAnonymousShorten: true,
		jwtSecret: '',
		allowRegistering: true,
		minPasswordStrength: 4,
		baseUrl: window.location.origin,
		enableEmailVerification: true,
		emailVerificationTtl: '1h',
		smtpEnabled: true,
		smtpUsername: '',
		smtpPassword: '',
		smtpFrom: '',
		smtpHost: '',
		smtpPort: 587,
	})

	const handleChange = (e) => {
		const { name, type, value, checked } = e.target;
		setConfig(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	}

	return (
		<SetupLayout currentStep={1} completedSteps={[]}>
			<h2 class="text-xl font-semibold mb-2">Environment Variables Configuration</h2>
			<p class="text-gray-400 mb-6">
				Adjust your application’s environment settings to manage database connections, authentication, email, and link shortening services.
			</p>

			<form class="space-y-8">
				{/* Database Configuration */}
				<section>
					<h2 class="text-xl font-semibold mb-2">Database Configuration</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Settings for connecting to the database.</p>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Database URL
						<span class="text-red-500 ml-1">*</span>
					
					</label>
					<input type="text" name="databaseUrl" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						   value={config.databaseUrl} onChange={handleChange} required />
				</section>

				{/* Shortening Service Settings */}
				<section>
					<h2 class="text-xl font-semibold mb-2">Shortening Service Settings</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Settings for link shortening options and permissions.</p>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Shortened Link Length
						<span class="text-red-500 ml-1">*</span>
					</label>
					<input type="number" name="shortenedLinkLength" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						   value={config.shortenedLinkLength} onChange={handleChange} required />
					<div class="flex items-center mt-4 justify-between">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Anonymous Shortening</label>
						<SliderCheckbox checked={config.allowAnonymousShorten} onChange={handleChange} name="allowAnonymousShorten" />
					</div>
				</section>

				{/* Authentication and Security */}
				<section>
					<h2 class="text-xl font-semibold mb-2">Authentication & Security</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Options for managing user authentication and password security.</p>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						JWT Secret
						<span class="text-red-500 ml-1">*</span>
					</label>
					<input type="password" name="jwtSecret" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						   value={config.jwtSecret} onChange={handleChange} placeholder="Enter JWT secret" />
					<div class="flex items-center mt-4 justify-between">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Registering</label>
						<SliderCheckbox checked={config.allowRegistering} onChange={handleChange} name="allowRegistering" />
					</div>
					<label class="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 flex items-center justify-between">
						<span>
							Minimum Password Strength
							<span class="text-red-500 ml-1">*</span>
						</span>
						<span class="text-gray-500 cursor-pointer relative group">
							<span class="dark:text-gray-100 text-gray-800 font-semibold">?</span>
							<div class="absolute hidden group-hover:block bg-white text-gray-800 text-xs rounded py-2 px-3 bottom-full right-0 transform translate-x-1 mb-2 w-64 dark:bg-gray-700 dark:text-gray-100">
								Password strength is determined by the Zxcvbn score, which evaluates factors like password length, complexity, common patterns, and entropy. The score ranges from 0 (weakest) to 4 (strongest). A higher score indicates a stronger password.
							</div>
						</span>
						</label>
					<input type="number" name="minPasswordStrength" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						   value={config.minPasswordStrength} onChange={handleChange} required max={4} min={0} />
				</section>

				{/* Service and Verification Settings */}
				<section>
					<h2 class="text-xl font-semibold mb-2">Service & Verification Settings</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Set base URLs and email verification settings.</p>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Base URL</label>
					<input type="text" name="baseUrl" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						   value={config.baseUrl} onChange={handleChange} placeholder="Enter base URL" />
					<div class="flex items-center mt-4 justify-between">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Email Verification</label>
						<SliderCheckbox checked={config.enableEmailVerification} onChange={handleChange} name="enableEmailVerification" />
					</div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Email Verification TTL</label>
					<input type="text" name="emailVerificationTtl" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						   value={config.emailVerificationTtl} onChange={handleChange} />
				</section>

				{/* SMTP Settings */}
				<section>
					<h2 class="text-xl font-semibold mb-2">SMTP Settings</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Settings for configuring SMTP email notifications.</p>
					<div class="flex items-center mt-2 justify-between">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">Enable SMTP</label>
						<SliderCheckbox checked={config.smtpEnabled} onChange={handleChange} name="smtpEnabled" />
					</div>
					
					{
						config.smtpEnabled && (
							<>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
									SMTP Username
								</label>
								<input type="text" name="smtpUsername" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtpUsername} onChange={handleChange} placeholder="Enter SMTP username" />
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">SMTP Password</label>
								<input type="password" name="smtpPassword" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtpPassword} onChange={handleChange} placeholder="Enter SMTP password" />
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">SMTP From Address</label>
								<input type="text" name="smtpFrom" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtpFrom} onChange={handleChange} placeholder="Enter from email address" />
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">SMTP Host</label>
								<input type="text" name="smtpHost" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtpHost} onChange={handleChange} placeholder="Enter SMTP host" />
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">SMTP Port</label>
								<input type="number" name="smtpPort" class="mt-1 p-2 block w-full border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtpPort} onChange={handleChange} />
							</>
						)
					}
				</section>
			</form>	

			{/* Buttons */}
			<div class="flex justify-between pt-8">
				<button class="py-2 px-6 rounded-lg border border-gray-600 text-gray-300">Go Back</button>
				<button class="py-2 px-6 rounded-lg bg-blue-500 text-white">Continue</button>
			</div>

		</SetupLayout>
	)
}

export const SetupRouter = () => (
	<Router>
		<Route path="/" component={EnvironmentSetup} />
		<Route default component={NotFound} />
	</Router>
)
