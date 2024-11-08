import { ComponentChildren } from 'preact'

type Props = {
	children: ComponentChildren,
}

export const SetupLayout = ({
	children,
}: Props) => {
	return (
		<div class="bg-gray-50 dark:bg-gray-900 flex min-h-screen overflow-x-none text-black">
			<aside class="w-1/3 p-16">
				<div class="flex">
					<div class="box w-8 h-8 bg-gray-300">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
							<path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
						</svg>
					</div>
					
					Account Type
				</div>

				<div class="flex">
					<div class="box active">
						2
					</div>
					
					Account Settings
				</div>

				<div class="flex">
					<div class="box">
						3
					</div>
					
					Business Information
				</div>

			</aside>
			<main class="flex-1 p-16">
				{children}
			</main>
		</div>
	)
}
