import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useRouterMock, useSearchParamsMock, routerPushMock } = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
  routerPushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: useRouterMock,
  useSearchParams: useSearchParamsMock,
}));

import Pagination from "./Pagination";

describe("components/Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouterMock.mockReturnValue({
      push: routerPushMock,
    });
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("page=2&filter=popular")
    );
  });

  it("renders numbered pagination controls when multiple pages exist", () => {
    render(<Pagination page={2} totalPages={5} isNext />);

    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Назад" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Вперёд" })).toBeTruthy();
  });

  it("navigates to the next page while preserving other params", () => {
    render(<Pagination page={2} totalPages={5} isNext />);

    fireEvent.click(screen.getByRole("button", { name: "Вперёд" }));

    expect(routerPushMock).toHaveBeenCalledWith(
      "/?page=3&filter=popular"
    );
  });

  it("marks the active page and keeps readable dark-theme classes", () => {
    render(<Pagination page={2} totalPages={5} isNext />);

    const activePageButton = screen.getByRole("button", { name: "2" });
    const nextButton = screen.getByRole("button", { name: "Вперёд" });

    expect(activePageButton.getAttribute("aria-current")).toBe("page");
    expect(activePageButton.className).toContain("!text-dark-100");
    expect(nextButton.className).toContain("dark:!text-light-700");
  });
});
