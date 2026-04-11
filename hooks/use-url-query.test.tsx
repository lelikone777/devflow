import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { usePathnameMock, useRouterMock, useSearchParamsMock, routerPushMock } =
  vi.hoisted(() => ({
    usePathnameMock: vi.fn(),
    useRouterMock: vi.fn(),
    useSearchParamsMock: vi.fn(),
    routerPushMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: useRouterMock,
  useSearchParams: useSearchParamsMock,
}));

import { useUrlQuery } from "./use-url-query";

const HookHarness = () => {
  const { getParam, pushQueryParam, removeQueryParams, toggleQueryParam } =
    useUrlQuery();

  return (
    <div>
      <span data-testid="query">{getParam("query", "empty")}</span>
      <button onClick={() => pushQueryParam("query", "react hooks")}>
        push-query
      </button>
      <button
        onClick={() =>
          pushQueryParam("query", "", {
            removeIfEmpty: true,
          })
        }
      >
        clear-query
      </button>
      <button onClick={() => removeQueryParams(["query", "page"])}>
        remove-query
      </button>
      <button onClick={() => toggleQueryParam("filter", "popular")}>
        toggle-filter
      </button>
    </div>
  );
};

describe("hooks/use-url-query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePathnameMock.mockReturnValue("/questions");
    useRouterMock.mockReturnValue({
      push: routerPushMock,
    });
  });

  it("pushes a query param with the current pathname", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("page=2"));

    render(<HookHarness />);

    fireEvent.click(screen.getByRole("button", { name: "push-query" }));

    expect(routerPushMock).toHaveBeenCalledWith(
      "/questions?page=2&query=react+hooks",
      { scroll: false }
    );
  });

  it("removes a query param when removeIfEmpty is enabled", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("query=react&page=1"));

    render(<HookHarness />);

    fireEvent.click(screen.getByRole("button", { name: "clear-query" }));

    expect(routerPushMock).toHaveBeenCalledWith("/questions?page=1", {
      scroll: false,
    });
  });

  it("toggles a param off when it already matches the current value", () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("filter=popular&page=3")
    );

    render(<HookHarness />);

    expect(screen.getByTestId("query").textContent).toBe("empty");

    fireEvent.click(screen.getByRole("button", { name: "toggle-filter" }));

    expect(routerPushMock).toHaveBeenCalledWith("/questions?page=3", {
      scroll: false,
    });
  });
});
