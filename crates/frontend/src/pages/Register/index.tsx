import { useLocation } from 'preact-iso'
import { useContext, useRef, useState } from 'preact/hooks'
import { LoginContext } from '../../context/LoginContext'
import { JSX } from 'preact/jsx-runtime'
import { isValidEmail } from '../../util/validator'



export const RegisterPage = () => {	
	const { route } = useLocation()

	const [ formError, setFormError ] = useState<string>(null)

	const registerFormRef = useRef<HTMLFormElement>(null)

	const [ formData, setFormData ] = useState({
		username: '',
		email: '',
		confirmEmail: '',
		password: '',
		confirmPassword: '',
	})

	// TODO: Check this against the API endpoint
	const validatePassword = (pass: string) => true

	const validateForm = () => {
		const { username, email, confirmEmail, password, confirmPassword } = formData
	  
		// Reset form error before validation
		setFormError('')
	  
		if (!username.trim()) {
		  setFormError('Username is required.')
		  return false
		}
	  
		if (!isValidEmail(email)) {
		  setFormError('Please enter a valid email.')
		  return false
		}
	  
		if (email !== confirmEmail) {
		  setFormError('Emails do not match.')
		  return false
		}
	  
		if (!validatePassword(password)) {
		  setFormError('Password does not meet the criteria.')
		  return false
		}
	  
		if (password !== confirmPassword) {
		  setFormError('Passwords do not match.')
		  return false
		}
	  
		// All validations passed
		return true
	}

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	const onSubmit = (e: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (validateForm()) {
			console.log('register')
		}
	}

	return (
		<div class="bg-gray-50 dark:bg-gray-900 flex justify-center items-center h-screen flex-col">

			{formError && (
				<div class="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded w-full max-w-md">
					{formError}
				</div>
			)}

			<div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
				{/* <!-- Logo --> */}
				{/* <div class="flex justify-center mb-6">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.1 0 2.2 0 3.2-.5C17.6 6.5 19 5 19 3.5S17.6.5 15.2.5 12 2 12 3.5c0 .7-.6 1.2-1.2 1.5C9.2 5.5 7.8 7 7.8 8.5S9.2 12 10.8 12c1.1 0 2.2 0 3.2.5C17.6 13.5 19 15 19 16.5s-1.4 2.5-3.8 2.5S12 18 12 16.5c0-.7-.6-1.2-1.2-1.5C9.2 14.5 7.8 13 7.8 11.5S9.2 8.5 10.8 8.5c1.1 0 2.2 0 3.2-.5"></path>
					</svg>
				</div> */}
				

				<h2 class="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Register an account</h2>

				<form
					class="space-y-6"
					onSubmit={onSubmit}
					ref={registerFormRef}
				>
					<div>
						<label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
						<input
							required
							type="username"
							id="username"
							name="username"
							class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="Username"
							value={formData.username}
							onChange={handleChange}
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
						<input
							required
							type="email"
							id="email"
							name="email"
							class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="you@example.com"
							value={formData.email}
							onChange={handleChange}
						/>
					</div>

					<div>
						<label for="confirmEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Email address</label>
						<input
							required
							type="email"
							id="confirmEmail"
							name="confirmEmail"
							class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="you@example.com"
							value={formData.confirmEmail}
							onChange={handleChange}
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
						<input
							required
							type="password"
							id="password"
							name="password"
							class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="••••••••"
							value={formData.password}
							onChange={handleChange}
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
						<input
							required
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="••••••••"
							value={formData.confirmPassword}
							onChange={handleChange}
						/>
					</div>


					<div>
						<button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
							Register
						</button>
					</div>

					<p class="text-gray-500 text-xs text-center">
						Already have an account?&nbsp;
						<a href="#" class="text-blue-600 font-sm hover:underline" onClick={() => route('/dash/login')}>
							Login
						</a>
					</p>
				</form>

				{/* <!-- Or continue with -->
				<div class="mt-6">
					<div class="relative">
						<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
						</div>
						<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300">Or continue with</span>
						</div>
					</div>

					<div class="mt-6 grid grid-cols-2 gap-3">
						<div>
						<a href="#" class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
							<span class="sr-only">Sign in with Google</span>
							<img class="h-5 w-5" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google">
						</a>
						</div>

						<div>
						<a href="#" class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
							<span class="sr-only">Sign in with GitHub</span>
							<img class="h-5 w-5" src="https://www.svgrepo.com/show/448236/github.svg" alt="GitHub">
						</a>
						</div>
					</div>
				</div> */}
			</div>
		</div>
	)
}
