import { ComponentChildren } from 'preact'


type Props = {
	children: ComponentChildren,
}


export const Dashboard = ({
	children
}: Props) => {
	return (
		<div class="bg-gray-50 dark:bg-gray-900 flex h-screen">
			{/* Sidebar */}
			<aside class="w-64 bg-gray-800 text-white flex-shrink-0">
				<div class="p-4 font-bold text-xl">Dashboard</div>
				<nav class="mt-6">
				<ul class="space-y-4">
					<li>
					<a href="#" class="block px-4 py-2 hover:bg-gray-700">
						Home
					</a>
					</li>
					<li>
					<a href="#" class="block px-4 py-2 hover:bg-gray-700">
						Analytics
					</a>
					</li>
					<li>
					<a href="#" class="block px-4 py-2 hover:bg-gray-700">
						Settings
					</a>
					</li>
					<li>
					<a href="#" class="block px-4 py-2 hover:bg-gray-700">
						Logout
					</a>
					</li>
				</ul>
				</nav>
			</aside>

			{/* Main content */}
			<main class="flex-1 bg-gray-100 text-black">
				<header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
					{/* Search Bar */}
					<div class="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-1/3">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
						type="text"
						class="bg-gray-100 ml-3 focus:outline-none text-sm"
						placeholder="Type to search..."
						/>
					</div>

					{/* Right side icons and profile */}
					<div class="flex items-center space-x-6">
						{/* Notification icons */}
						<button class="relative focus:outline-none">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-500">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v1.5m0-1.5a5 5 0 01-5-5h10a5 5 0 01-5 5zm0-10.5a5 5 0 00-5 5h10a5 5 0 00-5-5zm0-3.5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<span class="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
						</button>

						<button class="relative focus:outline-none">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-500">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v1.5m0-1.5a5 5 0 01-5-5h10a5 5 0 01-5 5zm0-10.5a5 5 0 00-5 5h10a5 5 0 00-5-5zm0-3.5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<span class="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
						</button>

						{/* Profile */}
						<div class="flex items-center space-x-2">
						<img src="https://via.placeholder.com/32" alt="Profile" class="rounded-full w-8 h-8" />
						<div>
							<span class="text-sm font-medium">Thomas Anree</span>
							<span class="text-xs text-gray-500 block">UX Designer</span>
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