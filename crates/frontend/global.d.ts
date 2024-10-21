declare global {
	// eslint-disable-next-line no-unused-vars
	interface EventTarget {
		value?: string; // Add any other properties you want to make available
	}
}

// Ensure this file is treated as a module
export {}
