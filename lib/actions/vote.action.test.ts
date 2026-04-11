import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  startTransactionMock,
  commitTransactionMock,
  abortTransactionMock,
  endSessionMock,
  startSessionMock,
  revalidatePathMock,
  afterMock,
  actionMock,
  handleErrorMock,
  createInteractionMock,
  questionFindByIdMock,
  questionFindByIdAndUpdateMock,
  answerFindByIdMock,
  answerFindByIdAndUpdateMock,
  voteFindOneMock,
  voteCreateMock,
  voteDeleteOneMock,
  voteFindByIdAndUpdateMock,
} = vi.hoisted(() => ({
  startTransactionMock: vi.fn(),
  commitTransactionMock: vi.fn(),
  abortTransactionMock: vi.fn(),
  endSessionMock: vi.fn(),
  startSessionMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  afterMock: vi.fn(async (callback: () => Promise<void>) => {
    await callback();
  }),
  actionMock: vi.fn(),
  handleErrorMock: vi.fn((error: Error) => ({
    success: false,
    error: { message: error.message },
    status: 500,
  })),
  createInteractionMock: vi.fn(),
  questionFindByIdMock: vi.fn(),
  questionFindByIdAndUpdateMock: vi.fn(),
  answerFindByIdMock: vi.fn(),
  answerFindByIdAndUpdateMock: vi.fn(),
  voteFindOneMock: vi.fn(),
  voteCreateMock: vi.fn(),
  voteDeleteOneMock: vi.fn(),
  voteFindByIdAndUpdateMock: vi.fn(),
}));

vi.mock("mongoose", () => ({
  default: {
    startSession: startSessionMock,
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/server", () => ({
  after: afterMock,
}));

vi.mock("@/lib/handlers/action", () => ({
  default: actionMock,
}));

vi.mock("@/lib/handlers/error", () => ({
  default: handleErrorMock,
}));

vi.mock("./interaction.action", () => ({
  createInteraction: createInteractionMock,
}));

vi.mock("@/database", () => ({
  Question: {
    findById: questionFindByIdMock,
    findByIdAndUpdate: questionFindByIdAndUpdateMock,
  },
  Answer: {
    findById: answerFindByIdMock,
    findByIdAndUpdate: answerFindByIdAndUpdateMock,
  },
}));

vi.mock("@/database/vote.model", () => ({
  default: {
    findOne: voteFindOneMock,
    create: voteCreateMock,
    deleteOne: voteDeleteOneMock,
    findByIdAndUpdate: voteFindByIdAndUpdateMock,
  },
}));

import { createVote, hasVoted } from "./vote.action";

describe("lib/actions/vote.action", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    startSessionMock.mockResolvedValue({
      startTransaction: startTransactionMock,
      commitTransaction: commitTransactionMock,
      abortTransaction: abortTransactionMock,
      endSession: endSessionMock,
    });

    actionMock.mockImplementation(async ({ params }: { params: unknown }) => ({
      params,
      session: {
        user: {
          id: "user-1",
        },
      },
    }));
  });

  it("creates a first-time vote and updates the vote count", async () => {
    questionFindByIdMock.mockReturnValue({
      session: vi.fn().mockResolvedValue({
        author: {
          toString: () => "author-1",
        },
      }),
    });
    voteFindOneMock.mockReturnValue({
      session: vi.fn().mockResolvedValue(null),
    });
    voteCreateMock.mockResolvedValue(undefined);
    questionFindByIdAndUpdateMock.mockResolvedValue({ _id: "question-1" });
    createInteractionMock.mockResolvedValue(undefined);

    const result = await createVote({
      targetId: "question-1",
      targetType: "question",
      voteType: "upvote",
    });

    expect(voteCreateMock).toHaveBeenCalledWith(
      [
        {
          author: "user-1",
          actionId: "question-1",
          actionType: "question",
          voteType: "upvote",
        },
      ],
      expect.objectContaining({
        session: expect.any(Object),
      })
    );
    expect(questionFindByIdAndUpdateMock).toHaveBeenCalledWith(
      "question-1",
      { $inc: { upvotes: 1 } },
      expect.objectContaining({
        new: true,
        session: expect.any(Object),
      })
    );
    expect(createInteractionMock).toHaveBeenCalledWith({
      action: "upvote",
      actionId: "question-1",
      actionTarget: "question",
      authorId: "author-1",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/questions/question-1");
    expect(commitTransactionMock).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("returns default false flags when the user has not voted", async () => {
    voteFindOneMock.mockResolvedValue(null);

    const result = await hasVoted({
      targetId: "answer-1",
      targetType: "answer",
    });

    expect(result).toEqual({
      success: false,
      data: {
        hasUpvoted: false,
        hasDownvoted: false,
      },
    });
  });

  it("returns the current vote state for an existing vote", async () => {
    voteFindOneMock.mockResolvedValue({
      voteType: "downvote",
    });

    const result = await hasVoted({
      targetId: "answer-2",
      targetType: "answer",
    });

    expect(result).toEqual({
      success: true,
      data: {
        hasUpvoted: false,
        hasDownvoted: true,
      },
    });
  });

  it("aborts the transaction when vote count update fails", async () => {
    questionFindByIdMock.mockReturnValue({
      session: vi.fn().mockResolvedValue({
        author: {
          toString: () => "author-1",
        },
      }),
    });
    voteFindOneMock.mockReturnValue({
      session: vi.fn().mockResolvedValue(null),
    });
    voteCreateMock.mockResolvedValue(undefined);
    questionFindByIdAndUpdateMock.mockResolvedValue(null);

    const result = await createVote({
      targetId: "question-2",
      targetType: "question",
      voteType: "upvote",
    });

    expect(abortTransactionMock).toHaveBeenCalled();
    expect(commitTransactionMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: { message: "Failed to update vote count" },
      status: 500,
    });
  });
});
