"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useTranslations } from "@/context/Language";
import { formUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

interface Props {
  page: number | undefined | string;
  isNext?: boolean;
  totalPages?: number;
  minVisiblePages?: number;
  containerClasses?: string;
}

const Pagination = ({
  page = 1,
  isNext = false,
  totalPages,
  minVisiblePages = 3,
  containerClasses,
}: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(page) || 1;
  const t = useTranslations();
  const resolvedTotalPages =
    typeof totalPages === "number"
      ? totalPages
      : isNext
        ? Math.max(currentPage + 2, minVisiblePages)
        : currentPage;
  const safeTotalPages = Math.max(0, resolvedTotalPages);
  const maxVisiblePages = Math.min(Math.max(minVisiblePages, 3), 5);

  if (safeTotalPages <= 1) return null;

  const handleNavigation = (nextPageNumber: number) => {
    if (nextPageNumber < 1 || nextPageNumber > safeTotalPages) return;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });

    router.push(newUrl);
  };

  const getPageRange = () => {
    const visiblePages = Math.min(safeTotalPages, maxVisiblePages);
    const half = Math.floor(visiblePages / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = startPage + visiblePages - 1;

    if (endPage > safeTotalPages) {
      endPage = safeTotalPages;
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
  };

  const pageRange = getPageRange();
  const showLeadingEllipsis = pageRange[0] > 2;
  const showTrailingEllipsis = pageRange[pageRange.length - 1] < safeTotalPages - 1;
  const showFirstPage = pageRange[0] > 1;
  const showLastPage = pageRange[pageRange.length - 1] < safeTotalPages;
  const baseButtonClasses =
    "light-border-2 btn flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border px-3 transition-all duration-300";
  const inactiveButtonClasses =
    "background-light900_dark300 text-dark200_light900 hover:-translate-y-0.5 hover:shadow-light-300 dark:hover:shadow-dark-300";
  const activeButtonClasses =
    "primary-gradient border-transparent text-light-900 shadow-light-300";

  return (
    <div
      className={cn(
        "mt-5 flex w-full flex-wrap items-center justify-center gap-2",
        containerClasses
      )}
    >
      <Button
        onClick={() => handleNavigation(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          baseButtonClasses,
          inactiveButtonClasses,
          "min-w-[92px]",
          currentPage <= 1 && "pointer-events-none opacity-50"
        )}
      >
        <p className="body-medium">{t("pagination.prev")}</p>
      </Button>

      {showFirstPage && (
        <Button
          onClick={() => handleNavigation(1)}
          className={cn(baseButtonClasses, inactiveButtonClasses)}
        >
          <span className="body-medium">1</span>
        </Button>
      )}

      {showLeadingEllipsis && (
        <span className="body-medium text-dark400_light700 px-1">...</span>
      )}

      {pageRange.map((pageNumber) => {
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            onClick={() => handleNavigation(pageNumber)}
            className={cn(
              baseButtonClasses,
              isActive ? activeButtonClasses : inactiveButtonClasses
            )}
          >
            <span className="body-medium">{pageNumber}</span>
          </Button>
        );
      })}

      {showTrailingEllipsis && (
        <span className="body-medium text-dark400_light700 px-1">...</span>
      )}

      {showLastPage && (
        <Button
          onClick={() => handleNavigation(safeTotalPages)}
          className={cn(baseButtonClasses, inactiveButtonClasses)}
        >
          <span className="body-medium">{safeTotalPages}</span>
        </Button>
      )}

      <Button
        onClick={() => handleNavigation(currentPage + 1)}
        disabled={currentPage >= safeTotalPages}
        className={cn(
          baseButtonClasses,
          inactiveButtonClasses,
          "min-w-[92px]",
          currentPage >= safeTotalPages && "pointer-events-none opacity-50"
        )}
      >
        <p className="body-medium">{t("pagination.next")}</p>
      </Button>
    </div>
  );
};

export default Pagination;
