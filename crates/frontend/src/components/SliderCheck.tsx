import { HTMLAttributes, useRef } from "preact/compat"

type Props = HTMLAttributes<HTMLInputElement> & {}

const SliderCheckbox = ({
	checked,
	onChange,
	...props
}: Props) => {
	let inputRef = useRef(null)

	const handleSpanClick = () => {
		if (inputRef.current) inputRef.current.click()
	}

	return (
		<div class="flex items-center space-x-2">
			<div class="relative">
				<input
					id="slider"
					type="checkbox"
					checked={checked}
					ref={inputRef}
					onChange={onChange}
					class="appearance-none h-6 w-12 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer transition duration-300 ease-in-out z-10 peer"
					{...props}
				/>
				<span
					class="w-6 h-6 bg-white dark:bg-gray-700 rounded-full absolute top-0 left-0 transition-transform duration-300 ease-in-out peer-checked:translate-x-6 peer-checked:bg-green-400 dark:peer-checked:bg-green-600 hover:cursor-pointer"
					onClick={handleSpanClick}
				/>
			</div>
		</div>
	)
}

export default SliderCheckbox
