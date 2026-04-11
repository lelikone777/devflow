import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  revalidatePathMock,
  actionMock,
  handleErrorMock,
  collectionFindOneMock,
  collectionFindByIdAndDeleteMock,
  collectionCreateMock,
  questionFindByIdMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  actionMock: vi.fn(),
  handleErrorMock: vi.fn((error: Error) => ({
    success: false,
    error: { message: error.message },
    status: 500,
  })),
  collectionFindOneMock: vi.fn(),
  collectionFindByIdAndDeleteMock: vi.fn(),
  collectionCreateMock: vi.fn(),
  questionFindByIdMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/handlers/action", () => ({
  default: actionMock,
}));

vi.mock("@/lib/handlers/error", () => ({
  default: handleErrorMock,
}));

vi.mock("@/database", () => ({
  Collection: {
    findOne: collectionFindOneMock,
    findByIdAndDelete: collectionFindByIdAndDeleteMock,
    create: collectionCreateMock,
  },
  Question: {
    findById: questionFindByIdMock,
  },
}));

import { hasSavedQuestion, toggleSaveQuestion } from "./collection.action";

describe("lib/actions/collection.action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actionMock.mockImplementation(async ({ params }: { params: unknown }) => ({
      params,
      session: {
        user: {
          id: "user-1",
        },
      },
    }));
  });

  it("removes an existing saved question entry", async () => {
    questionFindByIdMock.mockResolvedValue({ _id: "question-1" });
    collectionFindOneMock.mockResolvedValue({ _id: "collection-1" });

    const result = await toggleSaveQuestion({ questionId: "question-1" });

    expect(collectionFindByIdAndDeleteMock).toHaveBeenCalledWith("collection-1");
    expect(collectionCreateMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/questions/question-1");
    expect(result).toEqual({
      success: true,
      data: {
        saved: false,
      },
    });
  });

  it("creates a saved question entry when one does not exist", async () => {
    questionFindByIdMock.mockResolvedValue({ _id: "question-2" });
    collectionFindOneMock.mockResolvedValue(null);

    const result = await toggleSaveQuestion({ questionId: "question-2" });

    expect(collectionCreateMock).toHaveBeenCalledWith({
      question: "question-2",
      author: "user-1",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/questions/question-2");
    expect(result).toEqual({
      success: true,
      data: {
        saved: true,
      },
    });
  });

  it("returns whether a question is already saved", async () => {
    collectionFindOneMock.mockResolvedValue({ _id: "collection-3" });

    const result = await hasSavedQuestion({ questionId: "question-3" });

    expect(collectionFindOneMock).toHaveBeenCalledWith({
      question: "question-3",
      author: "user-1",
    });
    expect(result).toEqual({
      success: true,
      data: {
        saved: true,
      },
    });
  });
});
