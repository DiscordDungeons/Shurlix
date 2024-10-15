import { useContext, useState } from 'preact/hooks'
import { LoginContext } from '../../context/LoginContext'


export const LoginPage = () => {
	const {loginUser, user} = useContext(LoginContext)

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")

	const login = async () => {
		await loginUser(email, password)
	}


	return (
		<div class="bg-gray-50 dark:bg-gray-900 flex justify-center items-center h-screen">
			{user && (
				<pre>{JSON.stringify(user, null, 2)}</pre>
			)}

			<div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
				{/* <!-- Logo --> */}
				{/* <div class="flex justify-center mb-6">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.1 0 2.2 0 3.2-.5C17.6 6.5 19 5 19 3.5S17.6.5 15.2.5 12 2 12 3.5c0 .7-.6 1.2-1.2 1.5C9.2 5.5 7.8 7 7.8 8.5S9.2 12 10.8 12c1.1 0 2.2 0 3.2.5C17.6 13.5 19 15 19 16.5s-1.4 2.5-3.8 2.5S12 18 12 16.5c0-.7-.6-1.2-1.2-1.5C9.2 14.5 7.8 13 7.8 11.5S9.2 8.5 10.8 8.5c1.1 0 2.2 0 3.2-.5"></path>
					</svg>
				</div> */}

				<h2 class="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Sign in to your account</h2>

				<form class="space-y-6" onSubmit={(e) => {
					e.preventDefault()
					login()
				}}>
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
						<input type="email" id="email" class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
						<input type="password" id="password" class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} />
					</div>

					<div class="flex items-center justify-between">
						<div class="flex items-center">
						<input id="remember_me" name="remember_me" type="checkbox" class="h-4 w-4 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 border-gray-300 dark:border-gray-500 rounded" />
						<label for="remember_me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">Remember me</label>
						</div>

						<div class="text-sm">
							<a href="#" class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Forgot your password?</a>
						</div>
					</div>

					<div>
						<button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={login}>Sign in</button>
					</div>
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