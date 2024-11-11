import { SetupLayout } from '../../components/Layout/Setup/SetupLayout'
import { useContext, useState } from 'preact/hooks'
import SliderCheckbox from '../../components/SliderCheck'
import { SetupContext } from '../../context/SetupContext'
import { Config } from './types'
import { generateSecret } from '../../util/misc'

export const EnvironmentSetup = () => {
	const { error, setConfig: setApiConfig } = useContext(SetupContext)

	console.log('error is', error)

	const [ config, setConfig ] = useState<Config>({
		db: {
			url: 'postgres://username:password@localhost/shurlix',
		},
		app: {
			shortened_link_length: 8,
			allow_anonymous_shorten: true,
			allow_registering: true,
			base_url: window.location.origin,
			enable_email_verification: true,
			email_verification_ttl: '1h',
		},
		security: {
			jwt_secret: '',
			min_password_strength: 3,
		},
		smtp: {
			enabled: true,
			username: '',
			password: '',
			from: '',
			host: '',
			port: 587,
		},
		setup: {
			setup_done: true,
		},
	})

	const handleChange = (e) => {
		const { name, type, value, checked } = e.target
		const keys = name.split('.') // Split the name into the nested keys

		setConfig(prev => {
			const newConfig = { ...prev }

			let current = newConfig
			for (let i = 0; i < keys.length - 1; i++) {
				current = current[keys[i]] as any
			}

			const lastKey = keys[keys.length - 1]
			
			if (type === 'checkbox') {
				current[lastKey] = checked
			} else if (type === 'number') {
				current[lastKey] = value ? parseFloat(value) : NaN
			} else {
				current[lastKey] = value
			}

			return newConfig
		})
	}

	const onSubmit = () => {
		setApiConfig(config)
	}

	const generateJWT = () => {
		setConfig(prevConfig => ({
			...prevConfig,
			security: {
				...prevConfig.security,
				jwt_secret: generateSecret(), // Set your JWT secret here
			},
		}))
	}

	return (
		<SetupLayout currentStep={1} completedSteps={[]}>
			{
				error && (
					<div class="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded w-full dark:bg-red-900 dark:border-red-700 dark:text-red-300">
						Failed to set variables:
						{typeof error === 'string' ? (error) : (Array.isArray(error) && error.map((err) => (
							<p key={err}>- {err}</p>
						)))}
					</div>
				)
			}
			
			<h2 class="text-xl font-semibold mb-2">Environment Variables Configuration</h2>
			<p class="text-gray-400 mb-6">
				Adjust your application's environment settings to manage database connections, authentication, email, and link shortening services.
			</p>

			<form class="space-y-8" onSubmit={e => e.preventDefault()}>
				{/* Database Configuration */}
				<section>
					<h2 class="text-xl font-semibold mb-2">Database Configuration</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Settings for connecting to the database.</p>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 pb-1">
						Database URL
						<span class="text-red-500 ml-1">*</span>
			
					</label>
					<input type="text" name="db.url" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						   value={config.db.url} onChange={handleChange} required />
				</section>

				{/* Shortening Service Settings */}
				<section>
					<h2 class="text-xl font-semibold mb-2">Shortening Service Settings</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Settings for link shortening options and permissions.</p>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 pb-1">
						Shortened Link Length
						<span class="text-red-500 ml-1">*</span>
					</label>
					<input type="number" name="app.shortened_link_length" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						   value={config.app.shortened_link_length} onChange={handleChange} required />
					<div class="flex items-center mt-4 justify-between">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Anonymous Shortening</label>
						<SliderCheckbox checked={config.app.allow_anonymous_shorten} onChange={handleChange} name="app.allow_anonymous_shorten" />
					</div>
				</section>

				{/* Authentication and Security */}
				<section>
					<h2 class="text-xl font-semibold mb-2">Authentication & Security</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Options for managing user authentication and password security.</p>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 pb-1">
							JWT Secret
							<span class="text-red-500 ml-1">*</span>
						</label>
						<div class="flex items-center border border-gray-200 rounded-lg overflow-hidden dark:border-gray-800">
							<input 
								type="text" 
								name="security.jwt_secret" 
								class="p-2 block w-full border-none rounded-l-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200 outline-none" 
								value={config.security.jwt_secret} 
								onChange={handleChange} 
								placeholder="Enter JWT secret" 
							/>
							<button class="p-2 text-white rounded-r-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800" onClick={generateJWT}>
								Generate
							</button>
						</div>
					</div>
					<div class="flex items-center mt-4 justify-between">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Registering</label>
						<SliderCheckbox checked={config.app.allow_registering} onChange={handleChange} name="app.allow_registering" />
					</div>
					<label class="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 flex items-center justify-between pb-1">
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
					<input type="number" name="security.min_password_strength" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						   value={config.security.min_password_strength} onChange={handleChange} required max={4} min={0} />
				</section>

				{/* Service and Verification Settings */}
				<section>
					<h2 class="text-xl font-semibold mb-2">Service & Verification Settings</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Set base URLs and email verification settings.</p>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Base URL</label>
					<input type="text" name="app.base_url" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200 pb-1"
						   value={config.app.base_url} onChange={handleChange} placeholder="Enter base URL" />
					<div class="flex items-center mt-4 justify-between">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Email Verification</label>
						<SliderCheckbox checked={config.app.enable_email_verification} onChange={handleChange} name="app.enable_email_verification" />
					</div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Email Verification TTL</label>
					<input type="text" name="app.email_verification_ttl" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200 pb-1"
						   value={config.app.email_verification_ttl} onChange={handleChange} />
				</section>

				{/* SMTP Settings */}
				<section>
					<h2 class="text-xl font-semibold mb-2">SMTP Settings</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Settings for configuring SMTP email notifications.</p>
					<div class="flex items-center mt-2 justify-between">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">Enable SMTP</label>
						<SliderCheckbox checked={config.smtp.enabled} onChange={handleChange} name="smtp.enabled" />
					</div>
					
					{
						config.smtp.enabled && (
							<>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
									SMTP Username
									<span class="text-red-500 ml-1">*</span>
									
								</label>
								<input type="text" name="smtp.username" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtp.username} onChange={handleChange} placeholder="Enter SMTP username" />
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
									SMTP Password
									<span class="text-red-500 ml-1">*</span>
								</label>
								<input type="password" name="smtp.password" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtp.password} onChange={handleChange} placeholder="Enter SMTP password" />
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
									SMTP From Address
									<span class="text-red-500 ml-1">*</span>
								</label>
								<input type="text" name="smtp.from" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtp.from} onChange={handleChange} placeholder="Enter from email address" />
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
									SMTP Host
									<span class="text-red-500 ml-1">*</span>
								</label>
								<input type="text" name="smtp.host" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtp.host} onChange={handleChange} placeholder="Enter SMTP host" />
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
									SMTP Port
									<span class="text-red-500 ml-1">*</span>
								</label>
								<input type="number" name="smtp.port" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
									value={config.smtp.port} onChange={handleChange} />
							</>
						)
					}
				</section>
			</form>	

			{/* Buttons */}
			<div class="flex justify-between pt-8">
				<button class="py-2 px-6 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-400" disabled>Go Back</button>
				<button class="py-2 px-6 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={onSubmit}>Continue</button>
			</div>

		</SetupLayout>
	)
}
