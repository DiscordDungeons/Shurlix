import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import { RequireAdmin } from '../../components/HoC/RequireAdmin'
import { Dashboard } from '../../components/Layout/Dashboard/Dashboard'
import { Domain, DomainContext } from '../../context/DomainContext'
import { PaginatedTable } from '../../components/PaginatedTable'
import { Modal } from '../../components/Modal'
import { ConfigContext } from '../../context/ConfigContext'
import { stripProtocol } from '../../util/misc'
import { CreationState } from '../../context/types'
import { isValidUrl } from '../../util/validator'
import SliderCheckbox from '../../components/SliderCheck'

const InternalDomains = () => {
	const {
		currentPage, getDomains, perPage, setCurrentPage, setPerPage, items, totalCount,
		createDomain, deleteDomain, creationState, error, resetCreationState, updateDomain,
	} = useContext(DomainContext)

	const createLinkForm = useRef<HTMLFormElement>(null)
	const [ isCreationModalOpen, setIsCreationModalOpen ] = useState(false)
	const [ isUpdateModalOpen, setIsUpdateModalOpen ] = useState(false)

	const [ isDomainChanged, setIsDomainChanged ] = useState(false)
	const [ initialDomain, setInitialDomain ] = useState('')

	const [ formError, setFormError ] = useState<string>(null)
	const [ domain, setDomain ] = useState<string>(null)
	const [ isPublicChecked, setIsPublicChecked ] = useState(false)

	const { baseUrl } = useContext(ConfigContext)

	const [ deleteItemId, setDeleteItemId ] = useState<number>(null)
	const [ updateItemId, setUpdateItemId ] = useState<number>(null)
	const [ isDeleteModalOpen, setIsDeleteModalOpen ] = useState<boolean>(false)

	const totalPages = Math.ceil(totalCount / perPage)

	const onCloseDeleteModal = () => {
		setDeleteItemId(null)
		setIsDeleteModalOpen(false)
	}

	const onDeleteItem = () => {
		deleteDomain(deleteItemId)
		setDeleteItemId(null)
		setIsDeleteModalOpen(false)
	}

	const onCreateDomain = async () => {
		resetCreationState()
		setFormError(null)

		if (!createLinkForm.current.checkValidity()) {
			if (!isValidUrl(domain)) {
				setFormError('Please enter a valid URL.')
			}
			return
		}

		if(isCreationModalOpen) {
			await createDomain(isDomainChanged ? domain : null, isPublicChecked)
		} else if(isUpdateModalOpen) {
			await updateDomain(updateItemId, isDomainChanged ? domain : null, isPublicChecked)
		}
	}

	const onCloseCreationModal = () => {
		setFormError(null)
		setDomain(null)
		setIsPublicChecked(false)
		setIsCreationModalOpen(false)
		setIsUpdateModalOpen(false)
		resetCreationState()
	}

	const onUpdateDomain = (item: Domain) => {
		setIsPublicChecked(item.public)
		setDomain(item.domain)
		setInitialDomain(item.domain)
		setUpdateItemId(item.id)
		setIsUpdateModalOpen(true)
		setIsDomainChanged(false)
	}

	useEffect(() => {
		if (domain !== initialDomain) {
		  setIsDomainChanged(true)
		} else {
		  setIsDomainChanged(false)
		}
	  }, [domain])

	if (!items) {
		getDomains()
		return (
			<Dashboard>
				Please wait, loading.
			</Dashboard>
		)
	}

	return (
		<Dashboard>
			<Modal
				open={isDeleteModalOpen}
				title="Delete Domain?"
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
							onClick={onDeleteItem}
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
				open={isCreationModalOpen || isUpdateModalOpen}
				title={isCreationModalOpen ? 'Create Link' : 'Update domain'}
				onClose={onCloseCreationModal}
				actionButton={(
					<button
						onClick={onCreateDomain}
						class="bg-blue-500 text-white px-4 py-2 rounded-md"
					>
						{isCreationModalOpen ? 'Create' : 'Update' }
					</button>
				)}
			>
				{creationState == CreationState.CREATING && (
					<div class="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded w-full max-w-md dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300">
						Creating Domain...
					</div>
				)}

				{creationState == CreationState.CREATED && (
					<div class="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded w-full max-w-md dark:bg-green-900 dark:border-green-700 dark:text-green-300">
						Created Domain!
					</div>
				)}

				{error && (
					<div class="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded w-full max-w-md dark:bg-red-900 dark:border-red-700 dark:text-red-300">
						{error}
					</div>
				)}

				{formError && (
					<div class="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded w-full max-w-md dark:bg-red-900 dark:border-red-700 dark:text-red-300">
						{formError}
					</div>
				)}

				<form
					ref={createLinkForm}
					onSubmit={(e) => {
						e.preventDefault()
						onCreateDomain()
					}}
				>
					<div>
						<label for="domain" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Domain</label>
						<input
							required
							type="domain"
							id="domain" 
							class="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="example.com"
							value={domain}
							onChange={e => setDomain(e.target.value)}
						/>
					</div>

					<div class="flex justify-between pt-6">
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Public</label>

						<SliderCheckbox onChange={() => setIsPublicChecked(!isPublicChecked)} checked={isPublicChecked} />
					</div>
				</form>
			</Modal>

			<div class="flex flex-col p-2 ">
				<div class="flex justify-between">
					<div>
						<h1 class="text-2xl font-semibold mb-2">Domains</h1>
						<p class="text-gray-500 mb-6 text-sm">A list of all the configured domains.</p>
					</div>
					<div>
						<div class="mt-4">
							<button
								class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => {
									setIsCreationModalOpen(true)
									resetCreationState()
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
					setCurrentPage={setCurrentPage}
					currentPage={currentPage}
					data={items}
					titles={[ 'Domain', 'Public', 'Created at' ]}
					valueOrder={[ 'domain', 'public', 'created_at' ]}
					action={(item: Domain) => (
						<div class="flex justify-around">
							<button
								type="button"
								class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent dark:text-blue-400 dark:hover:text-blue-600 text-blue-600 hover:text-blue-800 focus:outline-none focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none"
								onClick={() => {
									onUpdateDomain(item)
								}}
								disabled={item.domain == stripProtocol(baseUrl)}
							>
								Update
							</button>
							<button
								type="button"
								class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-none focus:text-red-800 disabled:opacity-50 disabled:pointer-events-none"
								onClick={() => {
									setDeleteItemId(item.id)
									setIsDeleteModalOpen(true)
								}}
								disabled={item.domain == stripProtocol(baseUrl)}
							>
								Delete
							</button>
						</div>
					)}
				/>
			</div>
		</Dashboard>
	)
}

export const DomainsPage = RequireAdmin(InternalDomains)
