import type { Metadata } from "next";

import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import { getTagQuestions } from "@/lib/actions/tag.action";
import { createPageMetadata } from "@/lib/seo";
import type { RouteParams } from "@/types";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const { success, data } = await getTagQuestions({
    tagId: id,
    page: 1,
    pageSize: 1,
  });

  if (!success || !data?.tag) {
    return createPageMetadata({
      title: "Тег",
      description: "Просматривайте вопросы разработчиков, объединённые по тегам на DevFlow.",
      path: `/tags/${id}`,
    });
  }

  return createPageMetadata({
    title: `Тег: ${data.tag.name}`,
    description: `Просматривайте вопросы разработчиков с тегом ${data.tag.name} на DevFlow.`,
    path: `/tags/${id}`,
    keywords: [data.tag.name, `${data.tag.name} вопросы`, `${data.tag.name} обсуждения`],
  });
}

const Page = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, query } = await searchParams;

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
  });

  const { tag, questions, isNext, totalPages } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">{tag?.name}</h1>
      </section>

      <section className="mt-11">
        <LocalSearch
          route={ROUTES.TAG(id)}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>

      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />

      <Pagination
        page={page}
        isNext={isNext || false}
        totalPages={totalPages || 0}
      />
    </>
  );
};

export default Page;
