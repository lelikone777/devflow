import UserCard from "@/components/cards/UserCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import { UserFilters } from "@/constants/filters";
import ROUTES from "@/constants/routes";
import { EMPTY_USERS } from "@/constants/states";
import { getServerTranslator } from "@/lib/i18n";
import { getUsers } from "@/lib/actions/user.action";

const Community = async ({ searchParams }: RouteParams) => {
  const { t } = await getServerTranslator();
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getUsers({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });

  const { users, isNext } = data || {};

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">{t("community.title")}</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={ROUTES.COMMUNITY}
          iconPosition="left"
          imgSrc="/icons/search.svg"
          placeholder={t("community.searchPlaceholder")}
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={UserFilters.map((item) => ({
            ...item,
            name: t(`filters.${item.value}`),
          }))}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={users}
        empty={EMPTY_USERS}
        render={(users) => (
          <div className="mt-12 flex flex-wrap gap-5">
            {users.map((user) => (
              <UserCard key={user._id} {...user} />
            ))}
          </div>
        )}
      />

      <Pagination page={page} isNext={isNext || false} />
    </div>
  );
};

export default Community;
