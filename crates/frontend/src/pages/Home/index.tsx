import { useContext, useState } from 'preact/hooks'
import './style.css'
import { Input } from '../../components/Input'
import { ConfigContext } from '../../context/ConfigContext'

export const Home = () => {
	const { allowCreateAnonymousLinks, baseUrl } = useContext(ConfigContext)

	const [ longLink, setLongLink ] = useState('')
	const [ shortLink, setShortLink ] = useState('')
	const [ canCreateLink, setCanCreateLink ] = useState(false)

	const onSubmit = async () => {
		// Todo: Notification about having shortened
		
		const res = await fetch('/api/link/shorten', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				link: longLink,
			}),
		})

		const data = await res.json()

		setShortLink(`${baseUrl}/${data.slug}`)
	}

	const onEditLink = (e: InputEvent) => {
		setLongLink(e.target.value)

		try {
			new URL(e.target.value)
			setCanCreateLink(true)
		} catch (e) {
			setCanCreateLink(false)
		}
	}

	const copyLink = async () => {
		try {
			// Todo: Notification about having copied
			await navigator.clipboard.writeText(shortLink)
			console.log('Copied to clipboard:', shortLink)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	if (!allowCreateAnonymousLinks) {
		return (
			<div class="home h-full w-full flex items-center justify-center dark:bg-gray-600">
				<div>
					<h1 class="text-9xl font-sans text-violet-600 font-bold my-8 dark:text-rose-400">Shurlix</h1>
				</div>
			</div>
		)
	}

	return (
		<div class="home h-full w-full flex items-center justify-center dark:bg-gray-600">
			<div>
				<h1 class="text-9xl font-sans text-violet-600 font-bold my-8 dark:text-rose-400">Shurlix</h1>
				<form class="" onSubmit={(e) => e.preventDefault()}>
					{shortLink && (
						<div class="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded w-full max-w-md">
							{shortLink}
						</div>
					)}

					{shortLink ? (
						<Input
							type="text"
							buttonText={'Copy'}
							icon={(
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
								</svg>
							)}
							value={shortLink}
							onInput={() => {}}
							buttonDisabled={false}
							onSubmit={copyLink}
							placeholder={'Shortened link'}
						/>
					) : (
						<Input
							type="url"
							buttonText={'Shorten'}
							icon={(
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
								</svg>
							)}
							value={longLink}
							onInput={onEditLink}
							buttonDisabled={!canCreateLink}
							onSubmit={onSubmit}
							placeholder={'Enter link'}
						/>
					)}
				</form>
			</div>
		</div>
	)
}
