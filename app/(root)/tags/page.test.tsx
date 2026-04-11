import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const { getTagsMock, getServerTranslatorMock } = vi.hoisted(() => ({
  getTagsMock: vi.fn(),
  getServerTranslatorMock: vi.fn(),
}));

vi.mock("@/lib/actions/tag.action", () => ({
  getTags: getTagsMock,
}));

vi.mock("@/lib/i18n-server", () => ({
  getServerTranslator: getServerTranslatorMock,
}));

vi.mock("@/components/search/LocalSearch", () => ({
  default: () => <div>tags-local-search</div>,
}));

vi.mock("@/components/filters/CommonFilter", () => ({
  default: () => <div>tags-common-filter</div>,
}));

vi.mock("@/components/Pagination", () => ({
  default: ({
    page,
    totalPages,
  }: {
    page: number | string;
    totalPages: number;
  }) => <div>{`tags-pagination:${String(page)}:${String(totalPages)}`}</div>,
}));

vi.mock("@/components/cards/TagCard", () => ({
  default: ({ name }: { name: string }) => <div>{name}</div>,
}));

vi.mock("@/components/DataRenderer", () => ({
  default: ({
    data,
    render,
  }: {
    data: unknown[];
    render: (items: unknown[]) => React.ReactNode;
  }) => <div>{render(data)}</div>,
}));

import TagsPage from "./page";

describe("app/(root)/tags/page", () => {
  it("loads tags from search params and renders the tags page", async () => {
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
    });
    getTagsMock.mockResolvedValue({
      success: true,
      data: {
        tags: [{ _id: "tag-1", name: "react" }],
        isNext: false,
        totalPages: 2,
      },
      error: undefined,
    });

    const ui = await TagsPage({
      searchParams: Promise.resolve({
        page: "2",
        pageSize: "20",
        query: "react",
        filter: "popular",
      }),
    } as never);

    render(ui);

    expect(getTagsMock).toHaveBeenCalledWith({
      page: 2,
      pageSize: 20,
      query: "react",
      filter: "popular",
    });
    expect(screen.getByText("tags-local-search")).toBeTruthy();
    expect(screen.getByText("tags-common-filter")).toBeTruthy();
    expect(screen.getByText("react")).toBeTruthy();
    expect(screen.getByText("tags-pagination:2:2")).toBeTruthy();
  });
});
