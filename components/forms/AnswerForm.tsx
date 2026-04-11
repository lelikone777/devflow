"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ReloadIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "@/context/Language";
import { toast } from "@/hooks/use-toast";
import { createAnswer } from "@/lib/actions/answer.action";
import { generateAIAnswer as requestAIAnswer } from "@/lib/ai/client";
import { AnswerSchema } from "@/lib/validations";

import SubmitButton from "./SubmitButton";
import { Button } from "../ui/button";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface Props {
  questionId: string;
  questionTitle: string;
  questionContent: string;
  userId?: string;
}

const AnswerForm = ({
  questionId,
  questionTitle,
  questionContent,
  userId,
}: Props) => {
  const [isAnswering, startAnsweringTransition] = useTransition();
  const [isAISubmitting, setIsAISubmitting] = useState(false);
  const t = useTranslations();
  const editorRef = useRef<MDXEditorMethods>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startAnsweringTransition(async () => {
      const result = await createAnswer({
        questionId,
        content: values.content,
      });

      if (result.success) {
        form.reset();

        toast({
          title: t("common.success"),
          description: t("answerForm.posted"),
        });

        if (editorRef.current) {
          editorRef.current.setMarkdown("");
        }
      } else {
        toast({
          title: t("common.error"),
          description: result.error?.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleGenerateAIAnswer = async (): Promise<void> => {
    if (!userId) {
      toast({
        title: t("answerForm.loginRequired"),
        description: t("answerForm.loginRequiredDescription"),
      });
      return;
    }

    setIsAISubmitting(true);

    const userAnswer = editorRef.current?.getMarkdown();

    try {
      const { success, data, error } = await requestAIAnswer({
        question: questionTitle,
        content: questionContent,
        userAnswer,
      });

      if (!success) {
        toast({
          title: t("common.error"),
          description: error?.message,
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        toast({
          title: t("common.error"),
          description: t("answerForm.emptyAIResponse"),
          variant: "destructive",
        });
        return;
      }

      const formattedAnswer = data.replace(/<br>/g, " ").toString().trim();

      if (editorRef.current) {
        editorRef.current.setMarkdown(formattedAnswer);

        form.setValue("content", formattedAnswer);
        form.trigger("content");
      }

      toast({
        title: t("common.success"),
        description: t("answerForm.aiGenerated"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("answerForm.requestFailed"),
        variant: "destructive",
      });
    } finally {
      setIsAISubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          {t("answerForm.title")}
        </h4>
        <Button
          type="button"
          className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
          disabled={isAISubmitting}
          onClick={handleGenerateAIAnswer}
        >
          {isAISubmitting ? (
            <>
              <ReloadIcon className="mr-2 size-4 animate-spin" />
              {t("answerForm.aiGenerating")}
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                alt={t("answerForm.aiGenerate")}
                width={12}
                height={12}
                className="object-contain"
              />
              {t("answerForm.aiGenerate")}
            </>
          )}
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-6 flex w-full flex-col gap-10"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl className="mt-3.5">
                  <Editor
                    value={field.value}
                    editorRef={editorRef}
                    fieldChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <SubmitButton
              isPending={isAnswering}
              idleLabel={t("answerForm.post")}
              pendingLabel={t("answerForm.posting")}
              className="primary-gradient w-fit"
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AnswerForm;
