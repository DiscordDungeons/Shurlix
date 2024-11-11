import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
	plugins: [preact()],
	css: {
		postcss: {
			plugins: [
				tailwindcss,
				autoprefixer,
			],
		},
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://172.28.255.240:3000',
				//target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		outDir: '../web-server/static',  // Ensure this points to your backend's static folder
	},
})
