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
					class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75"
					onClick={handleClickOutside}
				>
					<div
						ref={modalRef}
						class="bg-white rounded-lg shadow-lg w-1/3 max-w-md p-6"
					>
						<div class="flex justify-between items-center">
							<h2 class="text-lg font-semibold">{title}</h2>
							<button onClick={onClose} class="text-gray-600 hover:text-gray-900">
								✕
							</button>
						</div>
						<div class="mt-4">
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

