import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSearchParamsMock, globalSearchMock } = vi.hoisted(() => ({
  useSearchParamsMock: vi.fn(),
  globalSearchMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: useSearchParamsMock,
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt ?? ""} {...props} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/actions/general.action", () => ({
  globalSearch: globalSearchMock,
}));

vi.mock("./filters/GlobalFilter", () => ({
  default: () => <div>global-filter</div>,
}));

import GlobalResult from "./GlobalResult";

describe("components/GlobalResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("global=react&type=question")
    );
  });

  it("loads and renders global search results", async () => {
    globalSearchMock.mockResolvedValue({
      success: true,
      data: [
        {
          id: "question-1",
          type: "question",
          title: "React query params",
        },
      ],
    });

    render(<GlobalResult />);

    await waitFor(() => {
      expect(globalSearchMock).toHaveBeenCalledWith({
        query: "react",
        type: "question",
      });
    });

    expect(await screen.findByText("React query params")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /react query params/i }).getAttribute("href")
    ).toBe("/questions/question-1");
  });

  it("shows the empty state when no results are returned", async () => {
    globalSearchMock.mockResolvedValue({
      success: true,
      data: [],
    });

    render(<GlobalResult />);

    expect(await screen.findByText("Ничего не найдено")).toBeTruthy();
  });
});
