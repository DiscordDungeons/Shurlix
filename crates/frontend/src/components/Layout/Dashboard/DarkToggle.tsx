import { useContext } from 'preact/hooks'

import './style.css'
import { ThemeContext } from '../../../context/ThemeContext'

const DarkModeToggle = () => {
	const { theme, setTheme } = useContext(ThemeContext)

	return (
		<label className="flex items-center cursor-pointer select-none">
			<div className="relative">
				<input
					type="checkbox"
					checked={theme === 'dark'}
					onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					className="sr-only" // Hide the default checkbox
				/>
				<div className="block bg-gray-200 dark:bg-gray-700 w-14 h-8 rounded-full" />
				<div
					className={`dot flex items-center justify-center absolute left-1 top-1 w-6 h-6 rounded-full transition-transform ${
						theme === 'dark' ? 'translate-x-full bg-gray-800' : 'bg-white'
					}`}
				>
					{theme === 'dark' ? '🌙' : '☀️'}
				</div>
			</div>
		</label>
	)
}

export default DarkModeToggle
