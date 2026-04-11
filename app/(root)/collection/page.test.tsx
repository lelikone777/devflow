import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSavedQuestionsMock, getServerTranslatorMock } = vi.hoisted(() => ({
  getSavedQuestionsMock: vi.fn(),
  getServerTranslatorMock: vi.fn(),
}));

vi.mock("@/lib/actions/collection.action", () => ({
  getSavedQuestions: getSavedQuestionsMock,
}));

vi.mock("@/lib/i18n-server", () => ({
  getServerTranslator: getServerTranslatorMock,
}));

vi.mock("@/components/search/LocalSearch", () => ({
  default: () => <div>collection-local-search</div>,
}));

vi.mock("@/components/filters/CommonFilter", () => ({
  default: () => <div>collection-common-filter</div>,
}));

vi.mock("@/components/Pagination", () => ({
  default: ({
    page,
    totalPages,
  }: {
    page: number | string;
    totalPages: number;
  }) => <div>{`collection-pagination:${String(page)}:${String(totalPages)}`}</div>,
}));

vi.mock("@/components/cards/QuestionCard", () => ({
  default: ({ question }: { question: { title: string } }) => (
    <div>{question.title}</div>
  ),
}));

vi.mock("@/components/DataRenderer", () => ({
  default: ({
    data,
    empty,
    render,
  }: {
    data?: unknown[];
    empty: { title: string };
    render: (items: unknown[]) => React.ReactNode;
  }) => <div>{data?.length ? render(data) : empty.title}</div>,
}));

import CollectionPage from "./page";

describe("app/(root)/collection/page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads saved questions and renders the collection page", async () => {
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
    });
    getSavedQuestionsMock.mockResolvedValue({
      success: true,
      data: {
        collection: [
          {
            _id: "saved-1",
            question: { _id: "question-1", title: "Как настроить ISR?" },
          },
        ],
        isNext: true,
        totalPages: 3,
      },
    });

    const ui = await CollectionPage({
      searchParams: Promise.resolve({
        page: "4",
        pageSize: "6",
        query: "isr",
        filter: "most_recent",
      }),
    });

    render(ui);

    expect(getSavedQuestionsMock).toHaveBeenCalledWith({
      page: 4,
      pageSize: 6,
      query: "isr",
      filter: "most_recent",
    });
    expect(screen.getByText("collection.title")).toBeTruthy();
    expect(screen.getByText("collection-local-search")).toBeTruthy();
    expect(screen.getByText("collection-common-filter")).toBeTruthy();
    expect(screen.getByText("Как настроить ISR?")).toBeTruthy();
    expect(screen.getByText("collection-pagination:4:3")).toBeTruthy();
  });

  it("renders the empty state when no saved questions exist", async () => {
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
    });
    getSavedQuestionsMock.mockResolvedValue({
      success: true,
      data: {
        collection: [],
        isNext: false,
        totalPages: 0,
      },
    });

    const ui = await CollectionPage({
      searchParams: Promise.resolve({}),
    });

    render(ui);

    expect(screen.getByText("states.noQuestionsTitle")).toBeTruthy();
    expect(screen.getByText("collection-pagination:undefined:0")).toBeTruthy();
  });
});
