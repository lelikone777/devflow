import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, getServerTranslatorMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  getServerTranslatorMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/i18n-server", () => ({
  getServerTranslator: getServerTranslatorMock,
}));

vi.mock("@/components/forms/QuestionForm", () => ({
  default: () => <div>question-form</div>,
}));

import AskQuestionPage from "./page";

describe("app/(root)/ask-question/page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the ask-question page for authenticated users", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
    });

    const ui = await AskQuestionPage();

    render(ui);

    expect(screen.getByText("askQuestion.title")).toBeTruthy();
    expect(screen.getByText("question-form")).toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects guests to sign-in", async () => {
    const redirectError = new Error("redirected");
    redirectMock.mockImplementation(() => {
      throw redirectError;
    });
    authMock.mockResolvedValue(null);
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
    });

    await expect(AskQuestionPage()).rejects.toThrow(redirectError);
    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
  });
});
