import dayjs from "dayjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import ProfileLink from "@/components/user/ProfileLink";
import UserAvatar from "@/components/UserAvatar";
import { getServerTranslator } from "@/lib/i18n-server";
import type { User } from "@/types";

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
}

const ProfileHeader = async ({ user, isCurrentUser }: ProfileHeaderProps) => {
  const { t } = await getServerTranslator();

  return (
    <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
      <div className="flex flex-col items-start gap-4 lg:flex-row">
        <UserAvatar
          id={user._id}
          name={user.name}
          imageUrl={user.image}
          className="size-[140px] rounded-full object-cover"
          fallbackClassName="text-6xl font-bolder"
        />

        <div className="mt-3">
          <h2 className="h2-bold text-dark100_light900">{user.name}</h2>
          <p className="paragraph-regular text-dark200_light800">
            @{user.username}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
            {user.portfolio && (
              <ProfileLink
                imgUrl="/icons/link.svg"
                href={user.portfolio}
                title={t("profile.portfolio")}
              />
            )}

            {user.location && (
              <ProfileLink
                imgUrl="/icons/location.svg"
                title={user.location}
              />
            )}

            <ProfileLink
              imgUrl="/icons/calendar.svg"
              title={dayjs(user.createdAt).format("MMMM YYYY")}
            />
          </div>

          {user.bio && (
            <p className="paragraph-regular text-dark400_light800 mt-8">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
        {isCurrentUser && (
          <Link href="/profile/edit">
            <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3">
              {t("profile.editProfile")}
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default ProfileHeader;
