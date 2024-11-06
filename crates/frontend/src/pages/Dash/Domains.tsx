import { useContext, useEffect } from 'preact/hooks'
import { RequireAdmin } from '../../components/HoC/RequireAdmin'
import { Dashboard } from '../../components/Layout/Dashboard/Dashboard'
import { Domain, DomainContext } from '../../context/DomainContext'
import { PaginatedTable } from '../../components/PaginatedTable'

const InternalDomains = () => {
	const { currentPage, getDomains, perPage, setCurrentPage, setPerPage, items, totalCount } = useContext(DomainContext)

	useEffect(() => {
		if (!items) getDomains()
	}, [])

	const totalPages = Math.ceil(totalCount / perPage)

	return (
		<Dashboard>
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
									// setIsModalOpen(true)
									// resetLinkCreationState()
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
					titles={[ 'Domain', 'Created at' ]}
					valueOrder={[ 'domain', 'created_at' ]}
					action={(item: Domain) => (
						<button
							type="button"
							class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-none focus:text-red-800 disabled:opacity-50 disabled:pointer-events-none"
							onClick={() => {
								// setDeleteDomainId(link.slug)
								// setIsDeleteModalOpen(true)
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

export const DomainsPage = RequireAdmin(InternalDomains)
