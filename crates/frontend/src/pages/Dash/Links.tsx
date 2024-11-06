import { useContext, useRef, useState } from 'preact/hooks'
import { RequireLogin } from '../../components/HoC/RequireLogin'
import { Dashboard } from '../../components/Layout/Dashboard/Dashboard'
import { ApiContext, Link } from '../../context/ApiContext'
import { Modal } from '../../components/Modal'
import { isValidUrl } from '../../util/validator'
import { PaginatedTable } from '../../components/PaginatedTable'
import { CreationState } from '../../context/types'

const InternalLinkList = () => {
	const {
		links, getMyLinks, createLink, linkCreationState, resetLinkCreationState, error, deleteLink,
		totalLinkCount, perPage, setPerPage, setCurrentLinkPage, currentLinkPage,
	} = useContext(ApiContext)
	const createLinkForm = useRef<HTMLFormElement>(null)
	const [ isModalOpen, setIsModalOpen ] = useState(false)

	const [ url, setURL ] = useState<string>(null)
	const [ customSlug, setCustomSlug ] = useState<string>(null)

	const [ formError, setFormError ] = useState<string>(null)

	const [ deleteLinkSlug, setDeleteLinkSlug ] = useState<string>(null)
	const [ isDeleteModalOpen, setIsDeleteModalOpen ] = useState<boolean>(false)

	// Calculate total pages
	const totalPages = Math.ceil(totalLinkCount / perPage)

	// Handler for changing pages
	


	if (!links) {
		getMyLinks()

		return (
			<Dashboard>
				Please wait, loading.
			</Dashboard>
		)
	}

	const onCreateLink = async () => {
		resetLinkCreationState()
		setFormError(null)

		if (!createLinkForm.current.checkValidity()) {
			if (!isValidUrl(url)) {
				setFormError('Please enter a valid URL.')
			}
			return
		}

		await createLink(url, customSlug)
	}

	const onCloseModal = () => {
		setFormError(null)
		setIsModalOpen(false)
		resetLinkCreationState()
	}

	const onCloseDeleteModal = () => {
		setDeleteLinkSlug(null)
		setIsDeleteModalOpen(false)
	}

	const onDeleteLink = () => {
		console.log('Delete slug', deleteLinkSlug)
		deleteLink(deleteLinkSlug)
		setDeleteLinkSlug(null)
		setIsDeleteModalOpen(false)
	}

	return (
		<Dashboard>
			<Modal
				open={isDeleteModalOpen}
				title="Delete Link?"
				onClickOutside={onCloseDeleteModal}
				onClose={onCloseDeleteModal}
				actionButton={(
					<>
						<button
							onClick={onCloseDeleteModal}
							class="bg-gray-400 text-white px-4 py-2 rounded-md mx-4"
						>
							Cancel
						</button>

						<button
							onClick={onDeleteLink}
							class="bg-red-500 text-white px-4 py-2 rounded-md"
						>
							Delete
						</button>
					</>
				)}
			>
				Are you sure you want to delete this link?
			</Modal>
			<Modal
				open={isModalOpen}
				title="Create Link"
				onClose={onCloseModal}
				actionButton={(
					<button
						onClick={onCreateLink}
						class="bg-blue-500 text-white px-4 py-2 rounded-md"
					>
						Create
					</button>
				)}
			>
				{linkCreationState == CreationState.CREATING && (
					<div class="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded w-full max-w-md">
						Creating Link...
					</div>
				)}

				{linkCreationState == CreationState.CREATED && (
					<div class="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded w-full max-w-md">
						Created Link!
					</div>
				)}

				{error && (
					<div class="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded w-full max-w-md">
						{error}
					</div>
				)}

				{formError && (
					<div class="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded w-full max-w-md">
						{formError}
					</div>
				)}

				<form
					ref={createLinkForm}
					onSubmit={(e) => {
						e.preventDefault()
						onCreateLink()
					}}
				>
					<div>
						<label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
						<input
							required
							type="url"
							id="url" 
							class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="example.com"
							value={url}
							onChange={e => setURL(e.target.value)}
						/>
					</div>
					<div>
						<label for="custom-slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Slug</label>
						<input
							type="text"
							id="custom-slug" 
							class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="example"
							value={customSlug}
							onChange={e => setCustomSlug(e.target.value)}
						/>
					</div>
				</form>
			</Modal>
			
			<div class="flex flex-col p-2 ">
				<div class="flex justify-between">
					<div>
						<h1 class="text-2xl font-semibold mb-2">Links</h1>
						<p class="text-gray-500 mb-6 text-sm">A list of all the links in your account.</p>
					</div>
					<div>
						<div class="mt-4">
							<button
								class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => {
									setIsModalOpen(true)
									resetLinkCreationState()
								}}
							>
								Create new
							</button>
						</div>
					</div>
				</div>
				<PaginatedTable
					perPage={perPage}
					totalPages={totalPages}
					setPerPage={setPerPage}
					setCurrentPage={setCurrentLinkPage}
					currentPage={currentLinkPage}
					data={links}
					titles={[ 'Slug', 'Custom Slug', 'Original Link', 'Created At', 'Updated At' ]}
					valueOrder={[ 'slug', 'custom_slug', 'original_link', 'created_at', 'updated_at' ]}
					action={(link: Link) => (
						<button
							type="button"
							class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-none focus:text-red-800 disabled:opacity-50 disabled:pointer-events-none"
							onClick={() => {
								setDeleteLinkSlug(link.slug)
								setIsDeleteModalOpen(true)
							}}
						>
							Delete
						</button>
					)}
				/>
			</div>
		</Dashboard>
	)
}

export const LinkList = RequireLogin(InternalLinkList)
