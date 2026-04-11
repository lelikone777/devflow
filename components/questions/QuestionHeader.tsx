import Link from "next/link";
import { Suspense } from "react";

import SaveQuestion from "@/components/questions/SaveQuestion";
import UserAvatar from "@/components/UserAvatar";
import Votes from "@/components/votes/Votes";
import ROUTES from "@/constants/routes";
import type { ActionResponse, HasVotedResponse, Question } from "@/types";

interface QuestionHeaderProps {
  question: Question;
  userId?: string;
  hasVotedPromise: Promise<ActionResponse<HasVotedResponse>>;
  hasSavedQuestionPromise: Promise<ActionResponse<{ saved: boolean }>>;
}

const QuestionHeader = ({
  question,
  userId,
  hasVotedPromise,
  hasSavedQuestionPromise,
}: QuestionHeaderProps) => {
  const { author, title } = question;

  return (
    <div className="flex-start w-full flex-col">
      <div className="flex w-full flex-col-reverse justify-between">
        <div className="flex items-center justify-start gap-1">
          <UserAvatar
            id={author._id}
            name={author.name}
            imageUrl={author.image}
            className="size-[22px]"
            fallbackClassName="text-[10px]"
          />
          <Link href={ROUTES.PROFILE(author._id)}>
            <p className="paragraph-semibold text-dark300_light700">
              {author.name}
            </p>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Suspense fallback={<div>Loading...</div>}>
            <Votes
              targetType="question"
              upvotes={question.upvotes}
              downvotes={question.downvotes}
              targetId={question._id}
              userId={userId}
              hasVotedPromise={hasVotedPromise}
            />
          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <SaveQuestion
              questionId={question._id}
              userId={userId}
              hasSavedQuestionPromise={hasSavedQuestionPromise}
            />
          </Suspense>
        </div>
      </div>

      <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
        {title}
      </h2>
    </div>
  );
};

export default QuestionHeader;
