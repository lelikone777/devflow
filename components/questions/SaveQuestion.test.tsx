import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { toastMock, toggleSaveQuestionMock, useTranslationsMock } =
  vi.hoisted(() => ({
    toastMock: vi.fn(),
    toggleSaveQuestionMock: vi.fn(),
    useTranslationsMock: vi.fn(),
  }));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    use: (value: unknown) => value,
  };
});

vi.mock("next/image", () => ({
  default: ({
    onClick,
    "aria-label": ariaLabel,
  }: {
    onClick?: () => void;
    "aria-label"?: string;
  }) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}>
      {ariaLabel}
    </button>
  ),
}));

vi.mock("@/context/Language", () => ({
  useTranslations: useTranslationsMock,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: toastMock,
}));

vi.mock("@/lib/actions/collection.action", () => ({
  toggleSaveQuestion: toggleSaveQuestionMock,
}));

import SaveQuestion from "./SaveQuestion";

describe("components/questions/SaveQuestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTranslationsMock.mockReturnValue((key: string) => key);
  });

  it("requires authentication before saving a question", async () => {
    const user = userEvent.setup();

    render(
      <SaveQuestion
        questionId="question-1"
        hasSavedQuestionPromise={
          {
            success: true,
            data: { saved: false },
          } as never
        }
      />,
    );

    await user.click(screen.getByLabelText("collection.saveAria"));

    expect(toggleSaveQuestionMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith({
      title: "collection.loginRequired",
      variant: "destructive",
    });
  });

  it("toggles save state for authenticated users", async () => {
    const user = userEvent.setup();
    toggleSaveQuestionMock.mockResolvedValue({
      success: true,
      data: { saved: true },
    });

    render(
      <SaveQuestion
        questionId="question-7"
        userId="user-2"
        hasSavedQuestionPromise={
          {
            success: true,
            data: { saved: false },
          } as never
        }
      />,
    );

    await user.click(screen.getByLabelText("collection.saveAria"));

    await waitFor(() => {
      expect(toggleSaveQuestionMock).toHaveBeenCalledWith({
        questionId: "question-7",
      });
    });
    expect(toastMock).toHaveBeenCalledWith({
      title: "collection.saved",
    });
  });
});
