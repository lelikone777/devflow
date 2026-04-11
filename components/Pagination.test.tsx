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
    expect(screen.getByText("Назад")).toBeTruthy();
    expect(screen.getByText("Вперёд")).toBeTruthy();
  });

  it("navigates to the next page while preserving other params", () => {
    render(<Pagination page={2} totalPages={5} isNext />);

    fireEvent.click(screen.getByRole("button", { name: /вперёд/i }));

    expect(routerPushMock).toHaveBeenCalledWith(
      "/?page=3&filter=popular"
    );
  });
});
