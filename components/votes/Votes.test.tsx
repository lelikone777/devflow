import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createVoteMock, toastMock, useTranslationsMock } = vi.hoisted(() => ({
  createVoteMock: vi.fn(),
  toastMock: vi.fn(),
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

vi.mock("@/lib/actions/vote.action", () => ({
  createVote: createVoteMock,
}));

import Votes from "./Votes";

describe("components/votes/Votes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTranslationsMock.mockReturnValue((key: string) => key);
  });

  it("prompts guests to log in instead of voting", async () => {
    const user = userEvent.setup();

    render(
      <Votes
        targetType="question"
        targetId="question-1"
        upvotes={12}
        downvotes={3}
        hasVotedPromise={
          {
            success: true,
            data: { hasUpvoted: false, hasDownvoted: false },
          } as never
        }
      />,
    );

    await user.click(screen.getByLabelText("Upvote"));

    expect(createVoteMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith({
      title: "votes.loginRequiredTitle",
      description: "votes.loginRequiredDescription",
    });
  });

  it("submits an upvote for authenticated users", async () => {
    const user = userEvent.setup();
    createVoteMock.mockResolvedValue({ success: true });

    render(
      <Votes
        targetType="question"
        targetId="question-7"
        upvotes={101}
        downvotes={7}
        userId="user-2"
        hasVotedPromise={
          {
            success: true,
            data: { hasUpvoted: false, hasDownvoted: false },
          } as never
        }
      />,
    );

    await user.click(screen.getByLabelText("Upvote"));

    await waitFor(() => {
      expect(createVoteMock).toHaveBeenCalledWith({
        targetId: "question-7",
        targetType: "question",
        voteType: "upvote",
      });
    });
    expect(toastMock).toHaveBeenCalledWith({
      title: "votes.upvoteAdded",
      description: "votes.recorded",
    });
  });
});
