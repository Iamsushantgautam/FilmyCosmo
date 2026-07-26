/**
 * Slice movies array for current active page
 */
export function getPaginatedData(items, page = 1, pageSize = 30) {
  if (!Array.isArray(items)) return { data: [], totalPages: 1, totalItems: 0 };

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIdx = (currentPage - 1) * pageSize;
  const data = items.slice(startIdx, startIdx + pageSize);

  return {
    data,
    currentPage,
    totalPages,
    totalItems,
    pageSize
  };
}
