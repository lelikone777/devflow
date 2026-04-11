import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  getUserMock,
  getUserAnswersMock,
  getUserQuestionsMock,
  getUserStatsMock,
  getUserTopTagsMock,
  getServerTranslatorMock,
  notFoundMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  getUserMock: vi.fn(),
  getUserAnswersMock: vi.fn(),
  getUserQuestionsMock: vi.fn(),
  getUserStatsMock: vi.fn(),
  getUserTopTagsMock: vi.fn(),
  getServerTranslatorMock: vi.fn(),
  notFoundMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/actions/user.action", () => ({
  getUser: getUserMock,
  getUserAnswers: getUserAnswersMock,
  getUserQuestions: getUserQuestionsMock,
  getUserStats: getUserStatsMock,
  getUserTopTags: getUserTopTagsMock,
}));

vi.mock("@/lib/i18n-server", () => ({
  getServerTranslator: getServerTranslatorMock,
}));

vi.mock("@/components/profile/ProfileHeader", () => ({
  default: ({
    user,
    isCurrentUser,
  }: {
    user: { name: string };
    isCurrentUser: boolean;
  }) => <div>{`profile-header:${user.name}:${String(isCurrentUser)}`}</div>,
}));

vi.mock("@/components/user/Stats", () => ({
  default: ({
    totalQuestions,
    totalAnswers,
    reputationPoints,
  }: {
    totalQuestions: number;
    totalAnswers: number;
    reputationPoints: number;
  }) => (
    <div>{`profile-stats:${totalQuestions}:${totalAnswers}:${reputationPoints}`}</div>
  ),
}));

vi.mock("@/components/profile/ProfileActivityTabs", () => ({
  default: ({
    page,
    questionState,
    answerState,
  }: {
    page?: string;
    questionState: { totalPages: number; questions: Array<{ title: string }> };
    answerState: { totalPages: number; answers: Array<{ content: string }> };
  }) => (
    <div>
      {`profile-tabs:${String(page)}:${questionState.totalPages}:${answerState.totalPages}`}
      <span>{questionState.questions[0]?.title}</span>
      <span>{answerState.answers[0]?.content}</span>
    </div>
  ),
}));

vi.mock("@/components/profile/ProfileTopTags", () => ({
  default: ({ tags }: { tags: Array<{ name: string }> }) => (
    <div>{`profile-top-tags:${tags.map((tag) => tag.name).join(",")}`}</div>
  ),
}));

import ProfilePage from "./page";

describe("app/(root)/profile/[id]/page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads profile sections and renders the composed profile page", async () => {
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
    });
    authMock.mockResolvedValue({
      user: { id: "user-1" },
    });
    getUserMock.mockResolvedValue({
      success: true,
      data: {
        user: {
          _id: "user-1",
          name: "Marina Sokolova",
          reputation: 420,
        },
      },
    });
    getUserStatsMock.mockResolvedValue({
      data: {
        totalQuestions: 11,
        totalAnswers: 24,
        badges: { GOLD: 1, SILVER: 2, BRONZE: 3 },
      },
    });
    getUserQuestionsMock.mockResolvedValue({
      success: true,
      data: {
        questions: [{ _id: "question-1", title: "Как ускорить SSR в Next.js?" }],
        isNext: true,
        totalPages: 5,
      },
    });
    getUserAnswersMock.mockResolvedValue({
      success: true,
      data: {
        answers: [{ _id: "answer-1", content: "Попробуйте кеширование." }],
        isNext: false,
        totalPages: 2,
      },
    });
    getUserTopTagsMock.mockResolvedValue({
      success: true,
      data: {
        tags: [{ _id: "tag-1", name: "nextjs" }],
      },
    });

    const ui = await ProfilePage({
      params: Promise.resolve({ id: "user-1" }),
      searchParams: Promise.resolve({
        page: "2",
        pageSize: "7",
      }),
    } as never);

    render(ui);

    expect(getUserMock).toHaveBeenCalledWith({ userId: "user-1" });
    expect(getUserStatsMock).toHaveBeenCalledWith({ userId: "user-1" });
    expect(getUserQuestionsMock).toHaveBeenCalledWith({
      userId: "user-1",
      page: 2,
      pageSize: 7,
    });
    expect(getUserAnswersMock).toHaveBeenCalledWith({
      userId: "user-1",
      page: 2,
      pageSize: 7,
    });
    expect(getUserTopTagsMock).toHaveBeenCalledWith({ userId: "user-1" });
    expect(screen.getByText("profile-header:Marina Sokolova:true")).toBeTruthy();
    expect(screen.getByText("profile-stats:11:24:420")).toBeTruthy();
    expect(
      screen.getByText("profile-tabs:2:5:2", { exact: false }),
    ).toBeTruthy();
    expect(screen.getByText("Как ускорить SSR в Next.js?")).toBeTruthy();
    expect(screen.getByText("Попробуйте кеширование.")).toBeTruthy();
    expect(screen.getByText("profile-top-tags:nextjs")).toBeTruthy();
  });

  it("renders the not found state when the user cannot be loaded", async () => {
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
    });
    authMock.mockResolvedValue(null);
    getUserMock.mockResolvedValue({
      success: false,
      error: { message: "User record is missing." },
    });

    const ui = await ProfilePage({
      params: Promise.resolve({ id: "missing-user" }),
      searchParams: Promise.resolve({}),
    } as never);

    render(ui);

    expect(screen.getByText("profile.userNotFound")).toBeTruthy();
    expect(screen.getByText("User record is missing.")).toBeTruthy();
    expect(getUserQuestionsMock).not.toHaveBeenCalled();
    expect(getUserAnswersMock).not.toHaveBeenCalled();
    expect(getUserTopTagsMock).not.toHaveBeenCalled();
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
