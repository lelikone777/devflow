import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const { getQuestionsMock, getServerTranslatorMock } = vi.hoisted(() => ({
  getQuestionsMock: vi.fn(),
  getServerTranslatorMock: vi.fn(),
}));

vi.mock("@/lib/actions/question.action", () => ({
  getQuestions: getQuestionsMock,
}));

vi.mock("@/lib/i18n-server", () => ({
  getServerTranslator: getServerTranslatorMock,
}));

vi.mock("@/components/search/LocalSearch", () => ({
  default: () => <div>local-search</div>,
}));

vi.mock("@/components/filters/CommonFilter", () => ({
  default: () => <div>common-filter</div>,
}));

vi.mock("@/components/filters/HomeFilter", () => ({
  default: () => <div>home-filter</div>,
}));

vi.mock("@/components/Pagination", () => ({
  default: ({
    page,
    totalPages,
  }: {
    page: number | string;
    totalPages: number;
  }) => (
    <div>{`pagination:${String(page)}:${String(totalPages)}`}</div>
  ),
}));

vi.mock("@/components/cards/QuestionCard", () => ({
  default: ({ question }: { question: { title: string } }) => (
    <div>{question.title}</div>
  ),
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

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import Home from "./page";

describe("app/(root)/page", () => {
  it("loads questions from search params and renders the composed home page", async () => {
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
    });
    getQuestionsMock.mockResolvedValue({
      success: true,
      data: {
        questions: [{ _id: "question-1", title: "How to test home page?" }],
        isNext: true,
        totalPages: 3,
      },
      error: undefined,
    });

    const ui = await Home({
      searchParams: Promise.resolve({
        page: "2",
        pageSize: "10",
        query: "react",
        filter: "newest",
      }),
    } as never);

    render(ui);

    expect(getQuestionsMock).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      query: "react",
      filter: "newest",
    });
    expect(screen.getByText("local-search")).toBeTruthy();
    expect(screen.getByText("common-filter")).toBeTruthy();
    expect(screen.getByText("home-filter")).toBeTruthy();
    expect(screen.getByText("How to test home page?")).toBeTruthy();
    expect(screen.getByText("pagination:2:3")).toBeTruthy();
  });
});
