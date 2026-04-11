import { notFound } from "next/navigation";

import { auth } from "@/auth";
import ProfileActivityTabs from "@/components/profile/ProfileActivityTabs";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTopTags from "@/components/profile/ProfileTopTags";
import Stats from "@/components/user/Stats";
import {
  getUser,
  getUserAnswers,
  getUserQuestions,
  getUserStats,
  getUserTopTags,
} from "@/lib/actions/user.action";
import { getServerTranslator } from "@/lib/i18n-server";
import type { RouteParams } from "@/types";

const ProfilePage = async ({ params, searchParams }: RouteParams) => {
  const { t } = await getServerTranslator();
  const { id } = await params;
  const { page, pageSize } = await searchParams;

  if (!id) notFound();

  const loggedInUser = await auth();
  const { success, data, error } = await getUser({ userId: id });

  if (!success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="h1-bold text-dark100_light900">
          {t("profile.userNotFound")}
        </h1>
        <p className="paragraph-regular text-dark200_light800 max-w-md">
          {error?.message}
        </p>
      </div>
    );
  }

  const { user } = data!;

  const { data: userStats } = await getUserStats({ userId: id });

  const [
    {
      success: userQuestionsSuccess,
      data: userQuestions,
      error: userQuestionsError,
    },
    {
      success: userAnswersSuccess,
      data: userAnswers,
      error: userAnswersError,
    },
    {
      success: userTopTagsSuccess,
      data: userTopTags,
      error: userTopTagsError,
    },
  ] = await Promise.all([
    getUserQuestions({
      userId: id,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
    }),
    getUserAnswers({
      userId: id,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
    }),
    getUserTopTags({ userId: id }),
  ]);

  const {
    questions,
    isNext: hasMoreQuestions,
    totalPages: questionPages,
  } = userQuestions!;
  const {
    answers,
    isNext: hasMoreAnswers,
    totalPages: answerPages,
  } = userAnswers!;
  const { tags } = userTopTags!;

  return (
    <>
      <ProfileHeader user={user} isCurrentUser={loggedInUser?.user?.id === id} />

      <Stats
        totalQuestions={userStats?.totalQuestions || 0}
        totalAnswers={userStats?.totalAnswers || 0}
        badges={userStats?.badges || { GOLD: 0, SILVER: 0, BRONZE: 0 }}
        reputationPoints={user.reputation || 0}
      />

      <section className="mt-10 flex gap-10">
        <ProfileActivityTabs
          page={page}
          loggedInUserId={loggedInUser?.user?.id}
          questionState={{
            success: userQuestionsSuccess,
            error: userQuestionsError,
            questions,
            hasMore: hasMoreQuestions || false,
            totalPages: questionPages || 0,
          }}
          answerState={{
            success: userAnswersSuccess,
            error: userAnswersError,
            answers,
            hasMore: hasMoreAnswers || false,
            totalPages: answerPages || 0,
          }}
        />

        <ProfileTopTags
          success={userTopTagsSuccess}
          error={userTopTagsError}
          tags={tags}
        />
      </section>
    </>
  );
};

export default ProfilePage;
