import { ComponentChildren, h } from 'preact'
import { useRef } from 'preact/hooks'

type Props = {
	open: boolean,
	title: ComponentChildren,
	onClose?: () => void,
	onClickOutside?: () => void,
	children?: ComponentChildren,
	actionButton?: ComponentChildren,
}

export const Modal = ({
	open,
	onClose,
	onClickOutside,
	children,
	title,
	actionButton,
}: Props) => {
	const modalRef = useRef(null)

	const handleClickOutside = (e) => {
		if (modalRef.current && !modalRef.current.contains(e.target)) {
			if(onClickOutside) onClickOutside()
		}
	}

	return (
		<div>
			{open && (
				<div
					class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 dark:bg-gray-900 dark:bg-opacity-80"
					onClick={handleClickOutside}
				>
					<div
						ref={modalRef}
						class="bg-white rounded-lg shadow-lg w-1/3 max-w-md p-6 dark:bg-gray-800 dark:text-gray-200 dark:border dark:border-gray-700"
					>
						<div class="flex justify-between items-center">
							<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
							<button onClick={onClose} class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
            ✕
							</button>
						</div>
						<div class="mt-4 text-gray-800 dark:text-gray-300">
							{children}
						</div>
						<div class="mt-6 flex justify-end">
							{actionButton}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

