import { ComponentChildren } from 'preact'
import { HTMLInputTypeAttribute } from 'preact/compat'

export type Props = {
	type: HTMLInputTypeAttribute,
	value?: string,
	onInput: (event: InputEvent) => void,
	buttonText: string,
	buttonDisabled: boolean,
	icon: ComponentChildren,
	onSubmit: () => void,
	placeholder: string,
	select?: ComponentChildren,
}

export const Input = ({
	type,
	value,
	onInput,
	buttonText,
	buttonDisabled,
	icon,
	onSubmit,
	placeholder,
	select,
}: Props) => {
	return (
		<div class="flex items-center border border-gray-200 rounded-lg overflow-hidden dark:border-gray-800">
			{icon && (
				<span class="text-gray-400 px-2 dark:text-gray-200">
					{icon}
				</span>
			)}

			{select}
			<input
				type={type}
				class="w-full border-none outline-none placeholder-gray-400 p-2 h-12 dark:placeholder-gray-200"
				id="input"
				placeholder={placeholder}
				value={value}
				onInput={onInput}
			/>
			<button
				class="
					bg-blue-500
					text-white px-4
					hover:bg-blue-600
					h-12
					disabled:bg-gray-300
					disabled:text-gray-500
					disabled:cursor-not-allowed
					dark:disabled:bg-gray-500
					dark:disabled:text-gray-400
					dark:bg-indigo-500
					dark:hover:bg-indigo-600
				"
				disabled={buttonDisabled}
				onClick={onSubmit}
			>
				{buttonText}
			</button>
		</div>
	)
}
