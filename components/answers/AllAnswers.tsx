import { AnswerFilters } from "@/constants/filters";
import { EMPTY_ANSWERS } from "@/constants/states";
import { getServerTranslator } from "@/lib/i18n-server";

import AnswerCard from "../cards/AnswerCard";
import DataRenderer from "../DataRenderer";
import CommonFilter from "../filters/CommonFilter";
import Pagination from "../Pagination";

interface Props extends ActionResponse<Answer[]> {
  page: number;
  isNext: boolean;
  totalAnswers: number;
  totalPages: number;
  userId?: string;
}

const AllAnswers = async ({
  page,
  isNext,
  data,
  success,
  error,
  totalAnswers,
  totalPages,
  userId,
}: Props) => {
  const { t } = await getServerTranslator();

  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers}{" "}
          {totalAnswers === 1 ? t("answers.answer") : t("answers.answers")}
        </h3>
        <CommonFilter
          filters={AnswerFilters.map((item) => ({
            ...item,
            name: t(`filters.${item.value}`),
          }))}
          otherClasses="sm:min-w-32"
          containerClasses="max-xs:w-full"
        />
      </div>

      <DataRenderer
        data={data}
        error={error}
        success={success}
        empty={EMPTY_ANSWERS}
        render={(answers) =>
          answers.map((answer) => (
            <AnswerCard key={answer._id} {...answer} userId={userId} />
          ))
        }
      />

      <Pagination page={page} isNext={isNext} totalPages={totalPages} />
    </div>
  );
};

export default AllAnswers;
