import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAnswerMock,
  requestAIAnswerMock,
  toastMock,
  useTranslationsMock,
} = vi.hoisted(() => ({
  createAnswerMock: vi.fn(),
  requestAIAnswerMock: vi.fn(),
  toastMock: vi.fn(),
  useTranslationsMock: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span>{alt}</span>,
}));

vi.mock("next/dynamic", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react");

  return {
    default: () => {
      const MockEditor = ({
        value,
        fieldChange,
        editorRef,
      }: {
        value: string;
        fieldChange: (value: string) => void;
        editorRef: React.RefObject<{
          getMarkdown: () => string;
          setMarkdown: (value: string) => void;
        } | null>;
      }) => {
        const [markdown, setMarkdown] = ReactModule.useState(value ?? "");

        ReactModule.useEffect(() => {
          setMarkdown(value ?? "");
        }, [value]);

        ReactModule.useImperativeHandle(
          editorRef,
          () => ({
            getMarkdown: () => markdown,
            setMarkdown: (nextValue: string) => {
              setMarkdown(nextValue);
              fieldChange(nextValue);
            },
          }),
          [fieldChange, markdown],
        );

        return (
          <textarea
            aria-label="editor"
            value={markdown}
            onChange={(event) => {
              setMarkdown(event.target.value);
              fieldChange(event.target.value);
            }}
          />
        );
      };

      return MockEditor;
    },
  };
});

vi.mock("@/context/Language", () => ({
  useTranslations: useTranslationsMock,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: toastMock,
}));

vi.mock("@/lib/actions/answer.action", () => ({
  createAnswer: createAnswerMock,
}));

vi.mock("@/lib/ai/client", () => ({
  generateAIAnswer: requestAIAnswerMock,
}));

import AnswerForm from "./AnswerForm";

describe("components/forms/AnswerForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTranslationsMock.mockReturnValue((key: string) => key);
  });

  it("submits a valid answer", async () => {
    const user = userEvent.setup();
    createAnswerMock.mockResolvedValue({ success: true });

    render(
      <AnswerForm
        questionId="question-1"
        questionTitle="How to test this form?"
        questionContent={"A".repeat(140)}
        userId="user-1"
      />,
    );

    fireEvent.change(screen.getByLabelText("editor"), {
      target: { value: "B".repeat(120) },
    });
    await user.click(screen.getByRole("button", { name: "answerForm.post" }));

    await waitFor(() => {
      expect(createAnswerMock).toHaveBeenCalledWith({
        questionId: "question-1",
        content: "B".repeat(120),
      });
    });
    expect(toastMock).toHaveBeenCalledWith({
      title: "common.success",
      description: "answerForm.posted",
    });
  });

  it("requires authentication before generating an AI answer", async () => {
    const user = userEvent.setup();

    render(
      <AnswerForm
        questionId="question-1"
        questionTitle="How to test this form?"
        questionContent={"A".repeat(140)}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /answerForm\.aiGenerate/ }),
    );

    expect(requestAIAnswerMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith({
      title: "answerForm.loginRequired",
      description: "answerForm.loginRequiredDescription",
    });
  });

  it("fills the editor with an AI-generated answer", async () => {
    const user = userEvent.setup();
    requestAIAnswerMock.mockResolvedValue({
      success: true,
      data: `AI suggestion ${"C".repeat(120)}`,
    });

    render(
      <AnswerForm
        questionId="question-1"
        questionTitle="How to test this form?"
        questionContent={"A".repeat(140)}
        userId="user-9"
      />,
    );

    fireEvent.change(screen.getByLabelText("editor"), {
      target: { value: "Draft answer" },
    });
    await user.click(
      screen.getByRole("button", { name: /answerForm\.aiGenerate/ }),
    );

    await waitFor(() => {
      expect(requestAIAnswerMock).toHaveBeenCalledWith({
        question: "How to test this form?",
        content: "A".repeat(140),
        userAnswer: "Draft answer",
      });
    });
    await waitFor(() => {
      expect(
        (screen.getByLabelText("editor") as HTMLTextAreaElement).value,
      ).toBe(`AI suggestion ${"C".repeat(120)}`);
    });
    expect(toastMock).toHaveBeenCalledWith({
      title: "common.success",
      description: "answerForm.aiGenerated",
    });
  });
});
