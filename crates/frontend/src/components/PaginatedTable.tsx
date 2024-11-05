import { ComponentChildren } from 'preact'

type Props = {
	perPage: number,
	totalPages: number,
	currentPage: number,
	// eslint-disable-next-line no-unused-vars
	setPerPage: (perPage: number) => void, 
	// eslint-disable-next-line no-unused-vars
	setCurrentPage: (page: number) => void,
	data: Record<string, any>,
	titles: string[],
	valueOrder: string[],
	// eslint-disable-next-line no-unused-vars
	action?: ComponentChildren | ((entry: Record<string, any>) => ComponentChildren),
}


export const PaginatedTable = ({
	perPage,
	setPerPage,
	setCurrentPage,
	currentPage,
	totalPages,
	data,
	titles,
	valueOrder,
	action,
}: Props) => {
	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage)
		}
	}

	const mapAction = (entry: Record<string, any>) => {
		if (typeof action === 'function') {
			return action(entry)
		}

		return action
	}
	
	return (
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
								{titles.map((title) => (
									<th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase" key={title}>{title}</th>
								))}
								{action && (<th scope="col" class="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Action</th>)}
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{data.map((entry, i) => (
								<tr class="odd:bg-white even:bg-gray-100" key={`entry-${i}`}>
									{valueOrder.map((value, j) => (
										<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800" key={`item-${i}-${j}`}>{entry[value]}</td>
									))}
									{action &&
										<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
											{mapAction(entry)}
										</td>
									}
								</tr>
							))}
							
						</tbody>
					</table>

					<div className="flex items-center justify-between mt-4">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
        
						<span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
        
						<button
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
