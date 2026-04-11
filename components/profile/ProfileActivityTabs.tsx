import AnswerCard from "@/components/cards/AnswerCard";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EMPTY_ANSWERS, EMPTY_QUESTION } from "@/constants/states";
import { getServerTranslator } from "@/lib/i18n-server";
import type { ActionResponse, Answer, Question } from "@/types";

interface ProfileActivityTabsProps {
  page?: string;
  loggedInUserId?: string;
  questionState: {
    success: boolean;
    error?: ActionResponse["error"];
    questions: Question[];
    hasMore: boolean;
    totalPages: number;
  };
  answerState: {
    success: boolean;
    error?: ActionResponse["error"];
    answers: Answer[];
    hasMore: boolean;
    totalPages: number;
  };
}

const ProfileActivityTabs = async ({
  page,
  loggedInUserId,
  questionState,
  answerState,
}: ProfileActivityTabsProps) => {
  const { t } = await getServerTranslator();

  return (
    <Tabs defaultValue="top-posts" className="flex-[2]">
      <TabsList className="light-border background-light900_dark300 min-h-[42px] rounded-md border p-1 shadow-light-300 dark:shadow-dark-200">
        <TabsTrigger
          value="top-posts"
          className="tab background-light900_dark300"
        >
          {t("profile.topPosts")}
        </TabsTrigger>
        <TabsTrigger
          value="answers"
          className="tab background-light900_dark300"
        >
          {t("profile.answers")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="top-posts" className="mt-5 flex w-full flex-col gap-6">
        <DataRenderer
          success={questionState.success}
          error={questionState.error}
          data={questionState.questions}
          empty={EMPTY_QUESTION}
          render={(questions) => (
            <div className="flex w-full flex-col gap-6">
              {questions.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  showActionBtns={loggedInUserId === question.author._id}
                />
              ))}
            </div>
          )}
        />

        <Pagination
          page={page}
          isNext={questionState.hasMore}
          totalPages={questionState.totalPages}
        />
      </TabsContent>

      <TabsContent value="answers" className="flex w-full flex-col gap-6">
        <DataRenderer
          success={answerState.success}
          error={answerState.error}
          data={answerState.answers}
          empty={EMPTY_ANSWERS}
          render={(answers) => (
            <div className="flex w-full flex-col gap-10">
              {answers.map((answer) => (
                <AnswerCard
                  key={answer._id}
                  {...answer}
                  userId={loggedInUserId}
                  content={answer.content.slice(0, 270)}
                  containerClasses="card-wrapper rounded-[10px] px-7 py-9 sm:px-11"
                  showReadMore
                  showActionBtns={loggedInUserId === answer.author._id}
                />
              ))}
            </div>
          )}
        />

        <Pagination
          page={page}
          isNext={answerState.hasMore}
          totalPages={answerState.totalPages}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileActivityTabs;
