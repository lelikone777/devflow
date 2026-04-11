import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import ROUTES from "@/constants/routes";
import { getQuestion } from "@/lib/actions/question.action";
import { createPageMetadata } from "@/lib/seo";
import type { RouteParams } from "@/types";

export const metadata: Metadata = createPageMetadata({
  title: "Редактирование вопроса",
  description:
    "Отредактируйте существующий вопрос на DevFlow и обновите содержание, детали или теги.",
  noIndex: true,
});

const EditQuestion = async ({ params }: RouteParams) => {
  const { id } = await params;
  if (!id) return notFound();

  const session = await auth();
  if (!session) return redirect("/sign-in");

  const { data: question, success } = await getQuestion({ questionId: id });
  if (!success) return notFound();

  if (question?.author._id.toString() !== session?.user?.id)
    redirect(ROUTES.QUESTION(id));

  return (
    <main>
      <QuestionForm question={question} isEdit />
    </main>
  );
};

export default EditQuestion;
