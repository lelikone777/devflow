import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  actionMock,
  handleErrorMock,
  dbConnectMock,
  revalidatePathMock,
  afterMock,
  createInteractionMock,
  startTransactionMock,
  commitTransactionMock,
  abortTransactionMock,
  endSessionMock,
  startSessionMock,
  questionCountDocumentsMock,
  questionFindMock,
  questionCreateMock,
  questionFindByIdMock,
  questionFindByIdAndUpdateMock,
  questionFindByIdAndDeleteMock,
  tagFindOneAndUpdateMock,
  tagUpdateManyMock,
  tagQuestionInsertManyMock,
  tagQuestionDeleteManyMock,
  collectionDeleteManyMock,
  answerFindMock,
  answerDeleteManyMock,
  voteDeleteManyMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  actionMock: vi.fn(),
  handleErrorMock: vi.fn((error: Error) => ({
    success: false,
    error: { message: error.message },
    status: 500,
  })),
  dbConnectMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  afterMock: vi.fn(async (callback: () => Promise<void>) => {
    await callback();
  }),
  createInteractionMock: vi.fn(),
  startTransactionMock: vi.fn(),
  commitTransactionMock: vi.fn(),
  abortTransactionMock: vi.fn(),
  endSessionMock: vi.fn(),
  startSessionMock: vi.fn(),
  questionCountDocumentsMock: vi.fn(),
  questionFindMock: vi.fn(),
  questionCreateMock: vi.fn(),
  questionFindByIdMock: vi.fn(),
  questionFindByIdAndUpdateMock: vi.fn(),
  questionFindByIdAndDeleteMock: vi.fn(),
  tagFindOneAndUpdateMock: vi.fn(),
  tagUpdateManyMock: vi.fn(),
  tagQuestionInsertManyMock: vi.fn(),
  tagQuestionDeleteManyMock: vi.fn(),
  collectionDeleteManyMock: vi.fn(),
  answerFindMock: vi.fn(),
  answerDeleteManyMock: vi.fn(),
  voteDeleteManyMock: vi.fn(),
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

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/handlers/action", () => ({
  default: actionMock,
}));

vi.mock("@/lib/handlers/error", () => ({
  default: handleErrorMock,
}));

vi.mock("../mongoose", () => ({
  default: dbConnectMock,
}));

vi.mock("./interaction.action", () => ({
  createInteraction: createInteractionMock,
}));

vi.mock("@/database", () => ({
  Answer: {
    find: answerFindMock,
    deleteMany: answerDeleteManyMock,
  },
  Collection: {
    deleteMany: collectionDeleteManyMock,
  },
  Interaction: {},
  Vote: {
    deleteMany: voteDeleteManyMock,
  },
}));

vi.mock("@/database/question.model", () => ({
  default: {
    countDocuments: questionCountDocumentsMock,
    find: questionFindMock,
    create: questionCreateMock,
    findById: questionFindByIdMock,
    findByIdAndUpdate: questionFindByIdAndUpdateMock,
    findByIdAndDelete: questionFindByIdAndDeleteMock,
  },
}));

vi.mock("@/database/tag.model", () => ({
  default: {
    findOneAndUpdate: tagFindOneAndUpdateMock,
    updateMany: tagUpdateManyMock,
  },
}));

vi.mock("@/database/tag-question.model", () => ({
  default: {
    insertMany: tagQuestionInsertManyMock,
    deleteMany: tagQuestionDeleteManyMock,
  },
}));

import {
  createQuestion,
  deleteQuestion,
  getHotQuestions,
  getQuestions,
} from "./question.action";

describe("lib/actions/question.action", () => {
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

  it("creates a question with tags and logs the interaction", async () => {
    questionCreateMock.mockResolvedValue([
      {
        _id: "question-1",
        title: "How to test transactions?",
        content: "Need help with vitest",
        author: "user-1",
      },
    ]);
    tagFindOneAndUpdateMock
      .mockResolvedValueOnce({ _id: "tag-1" })
      .mockResolvedValueOnce({ _id: "tag-2" });
    questionFindByIdAndUpdateMock.mockResolvedValue({ _id: "question-1" });

    const result = await createQuestion({
      title: "How to test transactions?",
      content: "Need help with vitest",
      tags: ["testing", "vitest"],
    });

    expect(questionCreateMock).toHaveBeenCalledWith(
      [
        {
          title: "How to test transactions?",
          content: "Need help with vitest",
          author: "user-1",
        },
      ],
      { session: expect.any(Object) }
    );
    expect(tagQuestionInsertManyMock).toHaveBeenCalledWith(
      [
        { tag: "tag-1", question: "question-1" },
        { tag: "tag-2", question: "question-1" },
      ],
      { session: expect.any(Object) }
    );
    expect(questionFindByIdAndUpdateMock).toHaveBeenCalledWith(
      "question-1",
      { $push: { tags: { $each: ["tag-1", "tag-2"] } } },
      { session: expect.any(Object) }
    );
    expect(createInteractionMock).toHaveBeenCalledWith({
      action: "post",
      actionId: "question-1",
      actionTarget: "question",
      authorId: "user-1",
    });
    expect(commitTransactionMock).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: {
        _id: "question-1",
        title: "How to test transactions?",
        content: "Need help with vitest",
        author: "user-1",
      },
    });
  });

  it("aborts question creation when tag linking fails", async () => {
    questionCreateMock.mockResolvedValue([
      {
        _id: "question-2",
        title: "Broken question",
        content: "Rollback me",
        author: "user-1",
      },
    ]);
    tagFindOneAndUpdateMock.mockRejectedValue(new Error("Tag write failed"));

    const result = await createQuestion({
      title: "Broken question",
      content: "Rollback me",
      tags: ["broken"],
    });

    expect(abortTransactionMock).toHaveBeenCalled();
    expect(commitTransactionMock).not.toHaveBeenCalled();
    expect(tagQuestionInsertManyMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: { message: "Tag write failed" },
      status: 500,
    });
  });

  it("returns an empty recommendation payload when there is no authenticated user", async () => {
    authMock.mockResolvedValue(null);

    const result = await getQuestions({
      filter: "recommended",
      page: 1,
      pageSize: 10,
    });

    expect(result).toEqual({
      success: true,
      data: {
        questions: [],
        isNext: false,
        totalPages: 0,
      },
    });
    expect(questionCountDocumentsMock).not.toHaveBeenCalled();
    expect(questionFindMock).not.toHaveBeenCalled();
  });

  it("loads and serializes hot questions", async () => {
    const limitMock = vi
      .fn()
      .mockResolvedValue([{ _id: "question-3", title: "Hot" }]);
    const sortMock = vi.fn().mockReturnValue({
      limit: limitMock,
    });
    questionFindMock.mockReturnValue({
      sort: sortMock,
    });

    const result = await getHotQuestions();

    expect(dbConnectMock).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ views: -1, upvotes: -1 });
    expect(limitMock).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      success: true,
      data: [{ _id: "question-3", title: "Hot" }],
    });
  });

  it("returns paginated questions for the default listing flow", async () => {
    questionCountDocumentsMock.mockResolvedValue(12);

    const limitMock = vi
      .fn()
      .mockResolvedValue([{ _id: "question-4", title: "Newest Question" }]);
    const skipMock = vi.fn().mockReturnValue({ limit: limitMock });
    const sortMock = vi.fn().mockReturnValue({ skip: skipMock });
    const leanMock = vi.fn().mockReturnValue({ sort: sortMock });
    const populateAuthorMock = vi.fn().mockReturnValue({ lean: leanMock });
    const populateTagsMock = vi.fn().mockReturnValue({
      populate: populateAuthorMock,
    });

    questionFindMock.mockReturnValue({
      populate: populateTagsMock,
    });

    const result = await getQuestions({
      filter: "newest",
      page: 1,
      pageSize: 10,
    });

    expect(questionCountDocumentsMock).toHaveBeenCalledWith({});
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      success: true,
      data: {
        questions: [{ _id: "question-4", title: "Newest Question" }],
        isNext: true,
        totalPages: 2,
      },
    });
  });

  it("deletes a question and its related records inside a transaction", async () => {
    const collectionDeleteSessionMock = vi.fn().mockResolvedValue(undefined);
    const tagQuestionDeleteSessionMock = vi.fn().mockResolvedValue(undefined);
    const voteDeleteSessionMock = vi.fn().mockResolvedValue(undefined);
    const answerFindSessionMock = vi.fn().mockResolvedValue([{ id: "answer-1" }]);
    const answerDeleteSessionMock = vi.fn().mockResolvedValue(undefined);
    const questionDeleteSessionMock = vi.fn().mockResolvedValue(undefined);

    const questionDoc = {
      author: {
        toString: () => "user-1",
      },
      tags: ["tag-1", "tag-2"],
    };

    questionFindByIdMock.mockReturnValue({
      session: vi.fn().mockResolvedValue(questionDoc),
    });
    collectionDeleteManyMock.mockReturnValue({
      session: collectionDeleteSessionMock,
    });
    tagQuestionDeleteManyMock.mockReturnValue({
      session: tagQuestionDeleteSessionMock,
    });
    voteDeleteManyMock
      .mockReturnValueOnce({
        session: voteDeleteSessionMock,
      })
      .mockReturnValueOnce({
        session: voteDeleteSessionMock,
      });
    answerFindMock.mockReturnValue({
      session: answerFindSessionMock,
    });
    answerDeleteManyMock.mockReturnValue({
      session: answerDeleteSessionMock,
    });
    questionFindByIdAndDeleteMock.mockReturnValue({
      session: questionDeleteSessionMock,
    });
    tagUpdateManyMock.mockResolvedValue(undefined);

    const result = await deleteQuestion({ questionId: "question-5" });

    expect(collectionDeleteManyMock).toHaveBeenCalledWith({
      question: "question-5",
    });
    expect(tagQuestionDeleteManyMock).toHaveBeenCalledWith({
      question: "question-5",
    });
    expect(tagUpdateManyMock).toHaveBeenCalledWith(
      { _id: { $in: ["tag-1", "tag-2"] } },
      { $inc: { questions: -1 } },
      { session: expect.any(Object) }
    );
    expect(voteDeleteManyMock).toHaveBeenNthCalledWith(1, {
      actionId: "question-5",
      actionType: "question",
    });
    expect(answerDeleteManyMock).toHaveBeenCalledWith({
      question: "question-5",
    });
    expect(voteDeleteManyMock).toHaveBeenNthCalledWith(2, {
      actionId: { $in: ["answer-1"] },
      actionType: "answer",
    });
    expect(questionFindByIdAndDeleteMock).toHaveBeenCalledWith("question-5");
    expect(createInteractionMock).toHaveBeenCalledWith({
      action: "delete",
      actionId: "question-5",
      actionTarget: "question",
      authorId: "user-1",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/profile/user-1");
    expect(commitTransactionMock).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("rejects question deletion when the current user is not the author", async () => {
    questionFindByIdMock.mockReturnValue({
      session: vi.fn().mockResolvedValue({
        author: {
          toString: () => "user-2",
        },
        tags: [],
      }),
    });

    const result = await deleteQuestion({ questionId: "question-6" });

    expect(abortTransactionMock).toHaveBeenCalled();
    expect(collectionDeleteManyMock).not.toHaveBeenCalled();
    expect(questionFindByIdAndDeleteMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: { message: "You are not authorized to delete this question" },
      status: 500,
    });
  });
});
