import Metric from "@/components/Metric";
import { getServerTranslator } from "@/lib/i18n-server";
import { formatNumber, getTimeStamp } from "@/lib/utils";

interface QuestionMetricsProps {
  createdAt: Date;
  answers: number;
  views: number;
}

const QuestionMetrics = async ({
  createdAt,
  answers,
  views,
}: QuestionMetricsProps) => {
  const { t } = await getServerTranslator();

  return (
    <div className="mb-8 mt-5 flex flex-wrap gap-4">
      <Metric
        imgUrl="/icons/clock.svg"
        alt="clock icon"
        value={`${t("questionCard.asked")} ${getTimeStamp(new Date(createdAt))}`}
        title=""
        textStyles="small-regular text-dark400_light700"
      />
      <Metric
        imgUrl="/icons/message.svg"
        alt="message icon"
        value={`${answers} ${t("questionCard.answers")}`}
        title=""
        textStyles="small-regular text-dark400_light700"
      />
      <Metric
        imgUrl="/icons/eye.svg"
        alt="eye icon"
        value={`${formatNumber(views)} ${t("questionCard.views")}`}
        title=""
        textStyles="small-regular text-dark400_light700"
      />
    </div>
  );
};

export default QuestionMetrics;
