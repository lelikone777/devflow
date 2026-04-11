import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const { getUsersMock, getServerTranslatorMock } = vi.hoisted(() => ({
  getUsersMock: vi.fn(),
  getServerTranslatorMock: vi.fn(),
}));

vi.mock("@/lib/actions/user.action", () => ({
  getUsers: getUsersMock,
}));

vi.mock("@/lib/i18n-server", () => ({
  getServerTranslator: getServerTranslatorMock,
}));

vi.mock("@/components/search/LocalSearch", () => ({
  default: () => <div>community-local-search</div>,
}));

vi.mock("@/components/filters/CommonFilter", () => ({
  default: () => <div>community-common-filter</div>,
}));

vi.mock("@/components/Pagination", () => ({
  default: ({
    page,
    totalPages,
  }: {
    page: number | string;
    totalPages: number;
  }) => <div>{`community-pagination:${String(page)}:${String(totalPages)}`}</div>,
}));

vi.mock("@/components/cards/UserCard", () => ({
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

import CommunityPage from "./page";

describe("app/(root)/community/page", () => {
  it("loads users from search params and renders the community page", async () => {
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
    });
    getUsersMock.mockResolvedValue({
      success: true,
      data: {
        users: [{ _id: "user-1", name: "Aleksei Petrov" }],
        isNext: true,
        totalPages: 4,
      },
      error: undefined,
    });

    const ui = await CommunityPage({
      searchParams: Promise.resolve({
        page: "3",
        pageSize: "12",
        query: "aleksei",
        filter: "popular",
      }),
    } as never);

    render(ui);

    expect(getUsersMock).toHaveBeenCalledWith({
      page: 3,
      pageSize: 12,
      query: "aleksei",
      filter: "popular",
    });
    expect(screen.getByText("community-local-search")).toBeTruthy();
    expect(screen.getByText("community-common-filter")).toBeTruthy();
    expect(screen.getByText("Aleksei Petrov")).toBeTruthy();
    expect(screen.getByText("community-pagination:3:4")).toBeTruthy();
  });
});
