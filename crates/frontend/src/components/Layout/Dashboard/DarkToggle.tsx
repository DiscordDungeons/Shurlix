import { useState, useEffect } from 'preact/hooks'

import './style.css'

const DarkModeToggle = () => {
	const [ isDarkMode, setIsDarkMode ] = useState(() => {
		// Check local storage for saved theme on initial render
		const savedTheme = localStorage.getItem('theme')
		return savedTheme === 'dark' // Set initial state based on saved theme
	})

	const toggleDarkMode = () => {
		setIsDarkMode((prev) => !prev)
	}

	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		}
	}, [isDarkMode])

	return (
		<label className="flex items-center cursor-pointer">
			<div className="relative">
				<input
					type="checkbox"
					checked={isDarkMode}
					onChange={toggleDarkMode}
					className="sr-only" // Hide the default checkbox
				/>
				<div className="block bg-gray-200 dark:bg-gray-700 w-14 h-8 rounded-full" />
				<div
					className={`dot flex items-center justify-center absolute left-1 top-1 w-6 h-6 rounded-full transition-transform ${
						isDarkMode ? 'translate-x-full bg-gray-800' : 'bg-white'
					}`}
				>
					{isDarkMode ? '🌙' : '☀️'}
				</div>
			</div>
		</label>
	)
}

export default DarkModeToggle
