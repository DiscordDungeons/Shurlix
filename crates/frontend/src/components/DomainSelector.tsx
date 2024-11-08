import { useContext, useEffect } from 'preact/hooks'
import { DomainRepositoryContext } from '../context/DomainRepositoryContext'

type Props = {
	// eslint-disable-next-line no-unused-vars
	onSelect: (id: number) => void,
	value: string,
}

export const DomainSelector = ({
	onSelect,
	value,
}: Props) => {
	const { domains } = useContext(DomainRepositoryContext)

	useEffect(() => {
		if (domains[0]) onSelect(domains[0].id)
	}, [domains])

	return (
		<select
			class="border-none outline-none p-2 h-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200"
			onChange={(e) => {
				onSelect(parseInt(e.target.value, 10))
			}}
			value={value}
		>
			{domains.map(domain => (
				<option value={domain.id} key={domain.id}>{domain.domain}</option>
			))}
		</select>
	)
}
