import { createContext } from 'preact'
import { useEffect, useState } from 'preact/hooks'

export type AppTheme = 'dark' | 'light'

export type IThemeContext = {
	theme: AppTheme,
	// eslint-disable-next-line no-unused-vars
	setTheme: (theme: AppTheme) => void,
}

export const ThemeContext = createContext<IThemeContext>(null)

export const ThemeContextProvider = ({
	children,
}) => {
	const [ theme, setTheme ] = useState<AppTheme>(() => {
		const savedTheme = localStorage.getItem('theme')
		console.log("saved theme", savedTheme)

		return savedTheme === 'dark' ? 'dark' : 'light'
	})

	useEffect(() => {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		}
	}, [theme])

	return (
		<ThemeContext.Provider
			value={{
				theme,
				setTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}
