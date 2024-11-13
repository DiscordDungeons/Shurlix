import { useContext, useRef, useState } from 'preact/hooks'
import { SetupLayout } from '../../components/Layout/Setup/SetupLayout'
import { RegisterContext, RegisterContextProvider, RegisterUserRequest } from '../../context/RegisterContext'
import { handleChange } from '../../util/form'
import { isValidEmail } from '../../util/validator'
import { LoginContext } from '../../context/LoginContext'
import { SetupContext } from '../../context/SetupContext'
import { DomainContext } from '../../context/DomainContext'
import { useLocation } from 'preact-iso'

const UserCreation = () => {
	const { validatePassword, registerUser, error, isLoading, passwordFeedback } = useContext(RegisterContext)
	const { loginUser, user } = useContext(LoginContext)
	const { baseUrl } = useContext(SetupContext)
	const { createDomain } = useContext(DomainContext)
	const { route } = useLocation()

	const [ formError, setFormError ] = useState<string>(null)

	const registerFormRef = useRef<HTMLFormElement>(null)

	const [ formData, setFormData ] = useState<RegisterUserRequest>({
		confirm_email: '',
		confirm_password: '',
		email: '',
		password: '',
		username: '',
	})

	const validateForm = () => {
		const { confirm_email, confirm_password, email, password, username } = formData
	  
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
	  
		if (email !== confirm_email) {
		  setFormError('Emails do not match.')
		  return false
		}
	  
		if (!validatePassword(password)) {
		  setFormError('Password does not meet the criteria.')
		  return false
		}
	  
		if (password !== confirm_password) {
		  setFormError('Passwords do not match.')
		  return false
		}
	  
		// All validations passed
		return true
	}

	

	const onSubmit = (e: any) => {
		e.preventDefault()

		if (validateForm()) {
			registerUser(formData, true, async () => {
				loginUser(formData.email, formData.password, async () => {
					await createDomain(baseUrl, true)

					route('/setup/finish')
				})
			})
		}
	}
		
	return (
		<SetupLayout currentStep={2} completedSteps={[1]}>
			{
				(error || formError) && (
					<div class="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded w-full dark:bg-red-900 dark:border-red-700 dark:text-red-300">
						{formError}
						{error}
					</div>
				)
			}

			{(passwordFeedback?.feedback.suggestion_string || passwordFeedback?.feedback.warning_string) && (
				<div className="mb-6 w-fullrounded">
					{passwordFeedback?.feedback.suggestion_string && (
						<div className="bg-yellow-100 border border-yellow-300 text-yellow-800 mb-4 p-4 rounded">
							<strong>Password Suggestion:</strong> {passwordFeedback?.feedback.suggestion_string}
						</div>
					)}
    
					{passwordFeedback?.feedback.warning_string && (
						<div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded">
							<strong>Password Warning:</strong> {passwordFeedback?.feedback.warning_string}
						</div>
					)}
				</div>
			)}

			<h2 class="text-xl font-semibold mb-2">Initial User Creation</h2>
			<p class="text-gray-400 mb-6">
				Create the initial user account to gain access to the application. This account will have administrative privileges to configure and manage settings.
			</p>

			<form class="space-y-8" onSubmit={e => e.preventDefault()} ref={registerFormRef}>

				<section>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Username
						<span class="text-red-500 ml-1">*</span>
					</label>
					<input type="text" name="username" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={formData.username} onChange={(e) => handleChange(e, setFormData)} placeholder="Enter your username" />
					
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Email
						<span class="text-red-500 ml-1">*</span>		
					</label>
					<input type="email" name="email" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={formData.email} onChange={(e) => handleChange(e, setFormData)} placeholder="you@example.com" />

					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Confirm Email
						<span class="text-red-500 ml-1">*</span>		
					</label>
					<input type="email" name="confirm_email" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={formData.confirm_email} onChange={(e) => handleChange(e, setFormData)} placeholder="you@example.com" />

					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Password
						<span class="text-red-500 ml-1">*</span>		
					</label>
					<input type="password" name="password" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={formData.password} onChange={(e) => handleChange(e, setFormData)} placeholder="••••••••" />

					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 pb-1">
						Confirm Password
						<span class="text-red-500 ml-1">*</span>		
					</label>
					<input type="password" name="confirm_password" class="mt-1 p-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
						value={formData.confirm_password} onChange={(e) => handleChange(e, setFormData)} placeholder="••••••••" />
				</section>
			</form>

			{/* Buttons */}
			<div class="flex justify-between pt-8">
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

export const UserCreationPage = () => (
	<RegisterContextProvider>
		<UserCreation />
	</RegisterContextProvider>
)
