import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_TAGS } from "@/constants/states";
import { getServerTranslator } from "@/lib/i18n-server";
import type { ActionResponse } from "@/types";

interface ProfileTopTagsProps {
  success: boolean;
  error?: ActionResponse["error"];
  tags: { _id: string; name: string; count: number }[];
}

const ProfileTopTags = async ({
  success,
  error,
  tags,
}: ProfileTopTagsProps) => {
  const { t } = await getServerTranslator();

  return (
    <div className="flex w-full min-w-[250px] flex-1 flex-col max-lg:hidden">
      <h3 className="h3-bold text-dark200_light900">{t("profile.topTags")}</h3>

      <div className="mt-7 flex flex-col gap-4">
        <DataRenderer
          success={success}
          error={error}
          data={tags}
          empty={EMPTY_TAGS}
          render={(items) => (
            <div className="mt-3 flex w-full flex-col gap-4">
              {items.map((tag) => (
                <TagCard
                  key={tag._id}
                  _id={tag._id}
                  name={tag.name}
                  questions={tag.count}
                  showCount
                  compact
                />
              ))}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default ProfileTopTags;
