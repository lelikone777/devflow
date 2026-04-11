import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  afterMock,
  getAnswersMock,
  getQuestionMock,
  hasSavedQuestionMock,
  hasVotedMock,
  incrementViewsMock,
  redirectMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  afterMock: vi.fn((callback: () => Promise<void> | void) => callback()),
  getAnswersMock: vi.fn(),
  getQuestionMock: vi.fn(),
  hasSavedQuestionMock: vi.fn(),
  hasVotedMock: vi.fn(),
  incrementViewsMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/server", () => ({
  after: afterMock,
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/actions/answer.action", () => ({
  getAnswers: getAnswersMock,
}));

vi.mock("@/lib/actions/collection.action", () => ({
  hasSavedQuestion: hasSavedQuestionMock,
}));

vi.mock("@/lib/actions/question.action", () => ({
  getQuestion: getQuestionMock,
  incrementViews: incrementViewsMock,
}));

vi.mock("@/lib/actions/vote.action", () => ({
  hasVoted: hasVotedMock,
}));

vi.mock("@/components/questions/QuestionHeader", () => ({
  default: ({
    question,
    userId,
  }: {
    question: { title: string };
    userId?: string;
  }) => <div>{`question-header:${question.title}:${userId ?? "guest"}`}</div>,
}));

vi.mock("@/components/questions/QuestionMetrics", () => ({
  default: ({
    answers,
    views,
  }: {
    answers: unknown[];
    views: number;
  }) => <div>{`question-metrics:${answers.length}:${views}`}</div>,
}));

vi.mock("@/components/editor/Preview", () => ({
  Preview: ({ content }: { content: string }) => <div>{`preview:${content}`}</div>,
}));

vi.mock("@/components/questions/QuestionTags", () => ({
  default: ({ tags }: { tags: Array<{ name: string }> }) => (
    <div>{`question-tags:${tags.map((tag) => tag.name).join(",")}`}</div>
  ),
}));

vi.mock("@/components/answers/AllAnswers", () => ({
  default: ({
    page,
    totalAnswers,
    totalPages,
  }: {
    page: number;
    totalAnswers: number;
    totalPages: number;
  }) => <div>{`all-answers:${page}:${totalAnswers}:${totalPages}`}</div>,
}));

vi.mock("@/components/forms/AnswerForm", () => ({
  default: ({
    questionId,
    userId,
  }: {
    questionId: string;
    userId?: string;
  }) => <div>{`answer-form:${questionId}:${userId ?? "guest"}`}</div>,
}));

import QuestionDetails from "./page";

describe("app/(root)/questions/[id]/page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the question page and composes all dependent sections", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-7" },
    });
    getQuestionMock.mockResolvedValue({
      success: true,
      data: {
        _id: "question-42",
        title: "Почему hydration ломается?",
        content: "Проверьте несовпадающий SSR markup.",
        createdAt: "2024-01-01T00:00:00.000Z",
        answers: [{ _id: "answer-a" }, { _id: "answer-b" }],
        views: 98,
        tags: [{ _id: "tag-1", name: "react" }],
      },
    });
    getAnswersMock.mockResolvedValue({
      success: true,
      data: {
        answers: [{ _id: "answer-a" }],
        isNext: true,
        totalAnswers: 12,
        totalPages: 3,
      },
    });
    hasVotedMock.mockResolvedValue(true);
    hasSavedQuestionMock.mockResolvedValue(false);

    const ui = await QuestionDetails({
      params: Promise.resolve({ id: "question-42" }),
      searchParams: Promise.resolve({
        page: "2",
        pageSize: "5",
        filter: "newest",
      }),
    } as never);

    render(ui);

    expect(getQuestionMock).toHaveBeenCalledWith({ questionId: "question-42" });
    expect(incrementViewsMock).toHaveBeenCalledWith({ questionId: "question-42" });
    expect(getAnswersMock).toHaveBeenCalledWith({
      questionId: "question-42",
      page: 2,
      pageSize: 5,
      filter: "newest",
    });
    expect(hasVotedMock).toHaveBeenCalledWith({
      targetId: "question-42",
      targetType: "question",
    });
    expect(hasSavedQuestionMock).toHaveBeenCalledWith({
      questionId: "question-42",
    });
    expect(
      screen.getByText("question-header:Почему hydration ломается?:user-7"),
    ).toBeTruthy();
    expect(screen.getByText("question-metrics:2:98")).toBeTruthy();
    expect(
      screen.getByText("preview:Проверьте несовпадающий SSR markup."),
    ).toBeTruthy();
    expect(screen.getByText("question-tags:react")).toBeTruthy();
    expect(screen.getByText("all-answers:2:12:3")).toBeTruthy();
    expect(screen.getByText("answer-form:question-42:user-7")).toBeTruthy();
  });

  it("redirects to 404 when the question cannot be loaded", async () => {
    const redirectError = new Error("redirected");
    redirectMock.mockImplementation(() => {
      throw redirectError;
    });
    authMock.mockResolvedValue(null);
    getQuestionMock.mockResolvedValue({
      success: false,
      data: null,
    });

    await expect(
      QuestionDetails({
        params: Promise.resolve({ id: "missing-question" }),
        searchParams: Promise.resolve({}),
      } as never),
    ).rejects.toThrow(redirectError);

    expect(redirectMock).toHaveBeenCalledWith("/404");
    expect(getAnswersMock).not.toHaveBeenCalled();
    expect(hasVotedMock).not.toHaveBeenCalled();
    expect(hasSavedQuestionMock).not.toHaveBeenCalled();
  });
});
