import JobCard from "@/components/cards/JobCard";
import JobsFilter from "@/components/filters/JobFilter";
import Pagination from "@/components/Pagination";
import {
  fetchCountries,
  fetchJobs,
  fetchLocation,
} from "@/lib/actions/job.action";
import { getServerTranslator } from "@/lib/i18n";

const Page = async ({ searchParams }: RouteParams) => {
  const { t, locale } = await getServerTranslator();
  const {
    query,
    location,
    country,
    datePosted,
    remote,
    employmentType,
    requirement,
    radius,
    page,
  } = await searchParams;
  const userLocation = await fetchLocation();
  const searchQuery = query?.trim();
  const searchLocation = location?.trim();
  const searchCountry = country?.trim() || userLocation.countryCode || "us";
  const jobsQuery = searchQuery
    ? searchLocation
      ? `${searchQuery} jobs in ${searchLocation}`
      : `${searchQuery} jobs`
    : searchLocation
      ? `Software Engineer jobs in ${searchLocation}`
      : "Software Engineer jobs";

  const jobs = await fetchJobs({
    query: jobsQuery,
    page: page ?? 1,
    country: searchCountry.toLowerCase(),
    location: searchLocation,
    datePosted:
      datePosted === "today" ||
      datePosted === "3days" ||
      datePosted === "week" ||
      datePosted === "month"
        ? datePosted
        : "all",
    workFromHome: remote === "remote" ? true : undefined,
    employmentTypes:
      employmentType === "FULLTIME" ||
      employmentType === "CONTRACTOR" ||
      employmentType === "PARTTIME" ||
      employmentType === "INTERN"
        ? employmentType
        : undefined,
    jobRequirements:
      requirement === "under_3_years_experience" ||
      requirement === "more_than_3_years_experience" ||
      requirement === "no_experience" ||
      requirement === "no_degree"
        ? requirement
        : undefined,
    radius: radius?.trim(),
    language: locale,
  });

  const countries = await fetchCountries();
  const parsedPage = parseInt(page ?? 1);

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">{t("jobs.title")}</h1>

      <div className="flex">
        <JobsFilter countriesList={countries} />
      </div>

      <section className="light-border mb-9 mt-11 flex flex-col gap-9 border-b pb-9">
        {jobs?.length > 0 ? (
          jobs
            ?.filter((job: Job) => job.job_title)
            .map((job: Job) => (
              <JobCard
                key={job.job_id ?? job.id ?? job.job_apply_link ?? job.job_title}
                job={job}
              />
            ))
        ) : (
          <div className="paragraph-regular text-dark200_light800 w-full text-center">
            {t("jobs.empty")}
          </div>
        )}
      </section>

      {jobs?.length > 0 && (
        <Pagination page={parsedPage} isNext={jobs?.length === 10} />
      )}
    </>
  );
};

export default Page;
