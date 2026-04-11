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
    "btn flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl border px-2.5 transition-all duration-300 xs:min-h-[40px] xs:min-w-[40px] xs:px-3";
  const inactiveButtonClasses =
    "background-light900_dark400 !border-light-700/90 dark:!border-light-400/12 !text-dark-300 dark:!text-light-700 hover:-translate-y-0.5 hover:!border-primary-500/35 hover:!text-dark-200 hover:shadow-light-300 dark:hover:!border-primary-500/45 dark:hover:!text-light-900 dark:hover:bg-dark-400 dark:hover:shadow-dark-200";
  const activeButtonClasses =
    "primary-gradient !border-primary-500/70 !text-dark-100 shadow-[0_16px_40px_-20px_rgba(255,112,0,0.9)] dark:shadow-[0_18px_45px_-22px_rgba(255,112,0,0.95)]";
  const buttonLabelClasses =
    "body-semibold font-space-grotesk tracking-[0.01em]";

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
        variant="outline"
        className={cn(
          baseButtonClasses,
          inactiveButtonClasses,
          "min-w-[74px] xs:min-w-[92px]",
          currentPage <= 1 && "pointer-events-none opacity-50"
        )}
      >
        <p className={buttonLabelClasses}>{t("pagination.prev")}</p>
      </Button>

      {showFirstPage && (
        <Button
          onClick={() => handleNavigation(1)}
          variant="outline"
          className={cn(baseButtonClasses, inactiveButtonClasses)}
        >
          <span className={buttonLabelClasses}>1</span>
        </Button>
      )}

      {showLeadingEllipsis && (
        <span className="body-semibold px-1 text-dark400_light800 dark:!text-light-500">
          ...
        </span>
      )}

      {pageRange.map((pageNumber) => {
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            onClick={() => handleNavigation(pageNumber)}
            variant="outline"
            aria-current={isActive ? "page" : undefined}
            className={cn(
              baseButtonClasses,
              isActive ? activeButtonClasses : inactiveButtonClasses
            )}
          >
            <span className={buttonLabelClasses}>{pageNumber}</span>
          </Button>
        );
      })}

      {showTrailingEllipsis && (
        <span className="body-semibold px-1 text-dark400_light800 dark:!text-light-500">
          ...
        </span>
      )}

      {showLastPage && (
        <Button
          onClick={() => handleNavigation(safeTotalPages)}
          variant="outline"
          className={cn(baseButtonClasses, inactiveButtonClasses)}
        >
          <span className={buttonLabelClasses}>{safeTotalPages}</span>
        </Button>
      )}

      <Button
        onClick={() => handleNavigation(currentPage + 1)}
        disabled={currentPage >= safeTotalPages}
        variant="outline"
        className={cn(
          baseButtonClasses,
          inactiveButtonClasses,
          "min-w-[74px] xs:min-w-[92px]",
          currentPage >= safeTotalPages && "pointer-events-none opacity-50"
        )}
      >
        <p className={buttonLabelClasses}>{t("pagination.next")}</p>
      </Button>
    </div>
  );
};

export default Pagination;
