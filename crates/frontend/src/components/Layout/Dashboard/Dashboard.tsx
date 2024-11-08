import { ComponentChildren } from 'preact'
import { useContext } from 'preact/hooks'
import { LoginContext } from '../../../context/LoginContext'
import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import DarkModeToggle from './DarkToggle'

type Props = {
	children: ComponentChildren,
	title?: string
}


export const Dashboard = ({
	children,
	title = 'Dashboard',
}: Props) => {
	const { user, logoutUser } = useContext(LoginContext)

	return (
		<div class="bg-gray-50 dark:bg-gray-900 flex min-h-screen overflow-x-none">
			<ToastContainer />
			{/* Sidebar */}
			<aside class="w-64 bg-gray-800 text-white flex-shrink-0">
				<div class="p-4 font-bold text-xl">Shurlix</div>
				<nav class="mt-6">
					<ul class="space-y-4">
						<li>
							<a href="/dash/links" class="block px-4 py-2 hover:bg-gray-700">
								Links
							</a>
						</li>
						<li>
							<a href="/dash/me" class="block px-4 py-2 hover:bg-gray-700">
								User settings
							</a>
						</li>
						{user.is_admin && (
							<>
								<li>
									<a href="/dash/domains" class="block px-4 py-2 hover:bg-gray-700">
										Domains
									</a>
								</li>
							</>
						)}
						<li>
							<a href="#" class="block px-4 py-2 hover:bg-gray-700" onClick={logoutUser}>
								Logout
							</a>
						</li>
						
					</ul>
				</nav>
			</aside>

			{/* Main content */}
			<main class="flex-1 bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
				<header class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 px-6 py-4 flex justify-between items-center">
					{/* Dashboard title */}
					<div class="flex items-center px-3 py-2 w-1/3">
						<h1 class="text-lg">{title}</h1>
					</div>

					{/* Right side icons and profile */}
					<div class="flex items-center space-x-6">
						
						{/* Todo: add dark mode toggle  */}

						<DarkModeToggle />

						{/* Profile */}
						<div class="flex items-center space-x-2">
							<img src="https://via.placeholder.com/32" alt="Profile" class="rounded-full w-8 h-8" />
							<div>
								<span class="text-sm font-medium">{user.username}</span>
							</div>
							<button>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500">
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
						</div>
					</div>
				</header>
				<section class="p-6">
					{children}
				</section>
			</main>
		</div>
	)
}
