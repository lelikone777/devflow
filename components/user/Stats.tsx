import Image from "next/image";

import { getServerTranslator } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

interface StatsCardProps {
  imgUrl: string;
  value: number;
  title: string;
}

const StatsCard = ({ imgUrl, value, title }: StatsCardProps) => {
  return (
    <div className="light-border background-light900_dark300 flex flex-wrap items-center justify-start gap-4 rounded-md border p-6 shadow-light-300 dark:shadow-dark-200">
      <Image src={imgUrl} alt="gold medal icon" width={40} height={50} />
      <div>
        <p className="paragraph-semibold text-dark200_light900">{value}</p>
        <p className="body-medium text-dark400_light700">{title}</p>
      </div>
    </div>
  );
};

interface Props {
  totalQuestions: number;
  totalAnswers: number;
  badges: Badges;
  reputationPoints: number;
}

const Stats = async ({
  totalQuestions,
  totalAnswers,
  badges,
  reputationPoints,
}: Props) => {
  const { t } = await getServerTranslator();

  return (
    <div className="mt-10">
      <h4 className="h3-semibold text-dark200_light900">
        {t("stats.title")}{" "}
        <span className="small-semibold primary-text-gradient">
          {formatNumber(reputationPoints)}
        </span>
      </h4>

      <div className="mt-5 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4">
        <div className="light-border background-light900_dark300 flex flex-wrap items-center justify-evenly gap-4 rounded-md border p-6 shadow-light-300 dark:shadow-dark-200">
          <div>
            <p className="paragraph-semibold text-dark200_light900">
              {formatNumber(totalQuestions)}
            </p>
            <p className="body-medium text-dark400_light700">
              {t("stats.questions")}
            </p>
          </div>

          <div>
            <p className="paragraph-semibold text-dark200_light900">
              {formatNumber(totalAnswers)}
            </p>
            <p className="body-medium text-dark400_light700">
              {t("stats.answers")}
            </p>
          </div>
        </div>

        <StatsCard
          imgUrl="/icons/gold-medal.svg"
          value={badges.GOLD}
          title={t("stats.goldBadges")}
        />

        <StatsCard
          imgUrl="/icons/silver-medal.svg"
          value={badges.SILVER}
          title={t("stats.silverBadges")}
        />

        <StatsCard
          imgUrl="/icons/bronze-medal.svg"
          value={badges.BRONZE}
          title={t("stats.bronzeBadges")}
        />
      </div>
    </div>
  );
};

export default Stats;
