import type { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { getServerTranslator } from "@/lib/i18n-server";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Задать вопрос",
  description:
    "Создайте новый вопрос по программированию и поделитесь своей задачей с сообществом разработчиков DevFlow.",
  path: "/ask-question",
  noIndex: true,
});

const AskQuestion = async () => {
  const session = await auth();
  const { t } = await getServerTranslator();

  if (!session) return redirect("/sign-in");

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">
        {t("askQuestion.title")}
      </h1>

      <div className="mt-9">
        <QuestionForm />
      </div>
    </>
  );
};

export default AskQuestion;
