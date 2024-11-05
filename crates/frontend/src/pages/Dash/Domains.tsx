import { RequireAdmin } from '../../components/HoC/RequireAdmin'
import { Dashboard } from '../../components/Layout/Dashboard/Dashboard'

const InternalDomains = () => {
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
				<div class="-m-1.5 overflow-x-auto">
					<div className="mt-4">
						<label htmlFor="perPage" className="text-sm text-gray-600 mr-2">Items per page:</label>
						<select
							id="perPage"
							value={perPage}
							onChange={(e) => setPerPage(Number(e.target.value))}
							className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="5">5</option>
							<option value="10">10</option>
							<option value="20">20</option>
						</select>
					</div>
					<div class="p-1.5 min-w-full inline-block align-middle">
						<div class="overflow-hidden border">
							<table class="min-w-full divide-y divide-gray-200 overflow-x-hidden">
								<thead>
									<tr>
										<th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Slug</th>
										<th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Custom Slug</th>
										<th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Original Link</th>
										<th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Created At</th>
										<th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Updated At</th>
										<th scope="col" class="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Action</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200">
									{links.map((link) => (
										<tr class="odd:bg-white even:bg-gray-100" key={link.id}>
											<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{link.slug}</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{link.custom_slug}</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{link.original_link}</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{link.created_at}</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{link.updated_at}</td>
											{/* <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
												<button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-none focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">Edit</button>
											</td> */}
											<td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
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
											</td>
										</tr>
									))}
								</tbody>
							</table>

							<div className="flex items-center justify-between mt-4">
								<button
									onClick={() => handlePageChange(currentLinkPage - 1)}
									disabled={currentLinkPage === 1}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Previous
								</button>
        
								<span className="text-sm text-gray-600">Page {currentLinkPage} of {totalPages}</span>
        
								<button
									onClick={() => handlePageChange(currentLinkPage + 1)}
									disabled={currentLinkPage === totalPages}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Dashboard>
	)
}

export const DomainsPage = RequireAdmin(InternalDomains)
