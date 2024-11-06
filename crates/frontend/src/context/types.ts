export type PaginationContext<T> = {
	items: T[] | null,
	currentPage: number,
	perPage: number,
	totalCount: number,
	// eslint-disable-next-line no-unused-vars
	setCurrentPage: (page: number) => void,
	// eslint-disable-next-line no-unused-vars
	setPerPage: (page: number) => void,
}
