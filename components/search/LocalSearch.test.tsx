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

import LocalSearch from "./LocalSearch";

describe("components/search/LocalSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useUrlQueryMock.mockReturnValue({
      pathname: "/questions",
      getParam: vi.fn().mockReturnValue(""),
      pushQueryParam: pushQueryParamMock,
      removeQueryParams: removeQueryParamsMock,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pushes the query param after debounce", () => {
    render(
      <LocalSearch
        route="/questions"
        imgSrc="/icons/search.svg"
        placeholder="Search questions..."
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Search questions..."), {
      target: { value: "react" },
    });

    vi.advanceTimersByTime(300);

    expect(pushQueryParamMock).toHaveBeenCalledWith("query", "react");
  });

  it("removes the query param when the input becomes empty", () => {
    useUrlQueryMock.mockReturnValue({
      pathname: "/questions",
      getParam: vi.fn().mockReturnValue("react"),
      pushQueryParam: pushQueryParamMock,
      removeQueryParams: removeQueryParamsMock,
    });

    render(
      <LocalSearch
        route="/questions"
        imgSrc="/icons/search.svg"
        placeholder="Search questions..."
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Search questions..."), {
      target: { value: "" },
    });

    vi.advanceTimersByTime(300);

    expect(removeQueryParamsMock).toHaveBeenCalledWith(["query"]);
  });
});
