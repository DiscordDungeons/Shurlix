import { useState } from 'preact/hooks'
import './style.css'

export const Home = () => {
	const [ longLink, setLongLink ] = useState('')
	const [ shortLink, setShortLink ] = useState('')

	const onSubmit = async () => {
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

		setShortLink(data.slug)
	}

	return (
		<div class="home">
			{shortLink && (<h2>Shortened: {window.location.origin}/{shortLink}</h2>)}
			<h1>Enter link</h1>
			<input type="url" value={longLink} onChange={e => setLongLink(e.target.value)} />
			<button onClick={onSubmit}>Shorten</button>
		</div>
	)
}
