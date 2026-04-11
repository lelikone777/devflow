import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useUrlQueryMock, pushQueryParamMock, removeQueryParamsMock } =
  vi.hoisted(() => ({
    useUrlQueryMock: vi.fn(),
    pushQueryParamMock: vi.fn(),
    removeQueryParamsMock: vi.fn(),
  }));

vi.mock("@/hooks/use-url-query", () => ({
  useUrlQuery: useUrlQueryMock,
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt ?? ""} {...props} />
  ),
}));

vi.mock("../GlobalResult", () => ({
  default: () => <div>global-result</div>,
}));

import GlobalSearch from "./GlobalSearch";

describe("components/search/GlobalSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    useUrlQueryMock.mockReturnValue({
      getParam: vi.fn().mockReturnValue(""),
      pushQueryParam: pushQueryParamMock,
      removeQueryParams: removeQueryParamsMock,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens results and pushes the global query after debounce", () => {
    render(<GlobalSearch />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "react" },
    });

    expect(screen.getByText("global-result")).toBeTruthy();

    vi.advanceTimersByTime(300);

    expect(pushQueryParamMock).toHaveBeenCalledWith("global", "react");
  });

  it("removes global and type params when the query is cleared", () => {
    useUrlQueryMock.mockReturnValue({
      getParam: vi.fn().mockReturnValue("react"),
      pushQueryParam: pushQueryParamMock,
      removeQueryParams: removeQueryParamsMock,
    });

    render(<GlobalSearch />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "" },
    });

    vi.advanceTimersByTime(300);

    expect(removeQueryParamsMock).toHaveBeenCalledWith(["global", "type"]);
  });

  it("closes the results dropdown on outside click", () => {
    useUrlQueryMock.mockReturnValue({
      getParam: vi.fn().mockReturnValue("react"),
      pushQueryParam: pushQueryParamMock,
      removeQueryParams: removeQueryParamsMock,
    });

    render(<GlobalSearch />);

    expect(screen.getByText("global-result")).toBeTruthy();

    fireEvent.click(document.body);

    expect(screen.queryByText("global-result")).toBeNull();
  });
});
