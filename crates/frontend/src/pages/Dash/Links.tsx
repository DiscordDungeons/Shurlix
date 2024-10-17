import { useContext } from "preact/hooks"
import { RequireLogin } from "../../components/HoC/RequireLogin"
import { Dashboard } from "../../components/Layout/Dashboard/Dashboard"
import { ApiContext } from "../../context/ApiContext"

const InternalLinkList = () => {
	const { links, getMyLinks } = useContext(ApiContext)

	if (!links) {
		getMyLinks()

		return (
			<Dashboard>
				Please wait, loading.
			</Dashboard>
		)
	}

	return (
		<Dashboard>
			<div class="flex flex-col p-2 ">
				<div class="flex justify-between">
					<div>
						<h1 class="text-2xl font-semibold mb-2">Links</h1>
						<p class="text-gray-500 mb-6 text-sm">A list of all the links in your account.</p>
					</div>
					<div>
						<div class="mt-4">
							<button class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
								Create new
							</button>
						</div>
					</div>
				</div>
				<div class="-m-1.5 overflow-x-auto">
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
									{links.map(link => (
										<tr class="odd:bg-white even:bg-gray-100">
											<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{link.slug}</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{link.custom_slug}</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{link.original_link}</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{link.created_at}</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{link.updated_at}</td>
											<td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
												<button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-none focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">Edit</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</Dashboard>
	)
}

export const LinkList = RequireLogin(InternalLinkList)