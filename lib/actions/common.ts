import type { PaginatedSearchParams } from "@/types";

export function getPagination(params: Pick<PaginatedSearchParams, "page" | "pageSize">) {
  const currentPage = Number(params.page) || 1;
  const limit = Number(params.pageSize) || 10;
  const skip = (currentPage - 1) * limit;

  return { currentPage, limit, skip };
}

export function getPaginationMetadata(
  totalItems: number,
  currentItemsCount: number,
  skip: number,
  limit: number
) {
  return {
    isNext: totalItems > skip + currentItemsCount,
    totalPages: Math.ceil(totalItems / limit),
  };
}

export function toPlainData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
