// eslint-disable-next-line no-unused-vars
type SetterFunction = (prev: Record<string, any>) => void

export const handleChange = (e: any, setFunction: SetterFunction) => {
	const { name, type, value, checked } = e.target
	const keys = name.split('.') // Split the name into the nested keys

	setFunction(prev => {
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
