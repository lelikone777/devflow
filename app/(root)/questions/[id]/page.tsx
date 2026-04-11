import { Metadata } from "next";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { auth } from "@/auth";
import AllAnswers from "@/components/answers/AllAnswers";
import { Preview } from "@/components/editor/Preview";
import AnswerForm from "@/components/forms/AnswerForm";
import QuestionHeader from "@/components/questions/QuestionHeader";
import QuestionMetrics from "@/components/questions/QuestionMetrics";
import QuestionTags from "@/components/questions/QuestionTags";
import { getAnswers } from "@/lib/actions/answer.action";
import { hasSavedQuestion } from "@/lib/actions/collection.action";
import { getQuestion, incrementViews } from "@/lib/actions/question.action";
import { hasVoted } from "@/lib/actions/vote.action";
import type { RouteParams } from "@/types";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;

  const { success, data: question } = await getQuestion({ questionId: id });

  if (!success || !question) {
    return {
      title: "Question not found",
      description: "This question does not exist.",
    };
  }

  return {
    title: question.title,
    description: question.content.slice(0, 100),
    twitter: {
      card: "summary_large_image",
      title: question.title,
      description: question.content.slice(0, 100),
    },
  };
}

const QuestionDetails = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, filter } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  const { success, data: question } = await getQuestion({ questionId: id });

  after(async () => {
    await incrementViews({ questionId: id });
  });

  if (!success || !question) return redirect("/404");

  const {
    success: areAnswersLoaded,
    data: answersResult,
    error: answersError,
  } = await getAnswers({
    questionId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter,
  });

  const hasVotedPromise = hasVoted({
    targetId: question._id,
    targetType: "question",
  });

  const hasSavedQuestionPromise = hasSavedQuestion({
    questionId: question._id,
  });

  const { createdAt, answers, views, tags, content } = question;

  return (
    <>
      <QuestionHeader
        question={question}
        userId={userId}
        hasVotedPromise={hasVotedPromise}
        hasSavedQuestionPromise={hasSavedQuestionPromise}
      />

      <QuestionMetrics createdAt={createdAt} answers={answers} views={views} />

      <Preview content={content} />

      <QuestionTags tags={tags} />

      <section className="my-5">
        <AllAnswers
          page={Number(page) || 1}
          isNext={answersResult?.isNext || false}
          data={answersResult?.answers}
          success={areAnswersLoaded}
          error={answersError}
          totalAnswers={answersResult?.totalAnswers || 0}
          totalPages={answersResult?.totalPages || 0}
          userId={userId}
        />
      </section>

      <section className="my-5">
        <AnswerForm
          questionId={question._id}
          questionTitle={question.title}
          questionContent={question.content}
          userId={userId}
        />
      </section>
    </>
  );
};

export default QuestionDetails;
