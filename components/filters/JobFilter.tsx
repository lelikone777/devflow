"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/context/Language";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import { Input } from "@/components/ui/input";

import LocalSearch from "../search/LocalSearch";

interface JobsFilterProps {
  countriesList: Country[];
}

const DATE_OPTIONS = [
  { value: "all", labelKey: "jobs.dateAll", fallback: "All time" },
  { value: "today", labelKey: "jobs.dateToday", fallback: "Today" },
  { value: "3days", labelKey: "jobs.date3days", fallback: "Last 3 days" },
  { value: "week", labelKey: "jobs.dateWeek", fallback: "Last week" },
  { value: "month", labelKey: "jobs.dateMonth", fallback: "Last month" },
] as const;

const REMOTE_OPTIONS = [
  { value: "any", labelKey: "jobs.workAny", fallback: "Any workplace" },
  { value: "remote", labelKey: "jobs.remoteOnly", fallback: "Remote only" },
] as const;

const EMPLOYMENT_OPTIONS = [
  {
    value: "any",
    labelKey: "jobs.employmentAny",
    fallback: "Any employment",
  },
  { value: "FULLTIME", labelKey: "jobs.fulltime", fallback: "Full-time" },
  { value: "CONTRACTOR", labelKey: "jobs.contractor", fallback: "Contract" },
  { value: "PARTTIME", labelKey: "jobs.parttime", fallback: "Part-time" },
  { value: "INTERN", labelKey: "jobs.intern", fallback: "Internship" },
] as const;

const REQUIREMENT_OPTIONS = [
  {
    value: "any",
    labelKey: "jobs.requirementAny",
    fallback: "Any experience",
  },
  {
    value: "under_3_years_experience",
    labelKey: "jobs.requirementUnder3",
    fallback: "Under 3 years",
  },
  {
    value: "more_than_3_years_experience",
    labelKey: "jobs.requirementMoreThan3",
    fallback: "3+ years",
  },
  {
    value: "no_experience",
    labelKey: "jobs.requirementNoExperience",
    fallback: "No experience",
  },
  {
    value: "no_degree",
    labelKey: "jobs.requirementNoDegree",
    fallback: "No degree",
  },
] as const;

const RADIUS_OPTIONS = [
  { value: "any", labelKey: "jobs.radiusAny", fallback: "Any radius" },
  { value: "10", labelKey: "", fallback: "10 km" },
  { value: "25", labelKey: "", fallback: "25 km" },
  { value: "50", labelKey: "", fallback: "50 km" },
  { value: "100", labelKey: "", fallback: "100 km" },
] as const;

const JobsFilter = ({ countriesList }: JobsFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [locationValue, setLocationValue] = useState(
    searchParams.get("location") || ""
  );

  useEffect(() => {
    setLocationValue(searchParams.get("location") || "");
  }, [searchParams]);

  const getLabel = (labelKey: string, fallback: string) =>
    labelKey && t(labelKey) !== labelKey ? t(labelKey) : fallback;

  const handleUpdateParams = (key: string, value: string) => {
    const isEmpty = !value || value === "any";
    const newUrl = isEmpty
      ? removeKeysFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: [key],
        })
      : formUrlQuery({
          params: searchParams.toString(),
          key,
          value,
        });

    router.push(newUrl, { scroll: false });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentLocation = searchParams.get("location") || "";

      if (locationValue === currentLocation) return;

      handleUpdateParams("location", locationValue.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [locationValue, searchParams]);

  return (
    <div className="relative mt-11 flex w-full flex-col gap-5">
      <LocalSearch
        route={pathname}
        iconPosition="left"
        imgSrc="/icons/job-search.svg"
        placeholder={t("jobs.searchPlaceholder")}
        otherClasses="flex-1 max-sm:w-full"
      />

      <div className="flex flex-wrap gap-5">
        <div className="background-light800_darkgradient flex min-h-[56px] min-w-[240px] grow items-center gap-4 rounded-[10px] px-4 sm:max-w-[320px]">
          <Image
            src="/icons/carbon-location.svg"
            alt="location"
            width={18}
            height={18}
          />

          <Input
            type="text"
            placeholder={t("jobs.locationPlaceholder")}
            value={locationValue}
            onChange={(event) => setLocationValue(event.target.value)}
            className="paragraph-regular no-focus text-dark400_light700 border-none shadow-none outline-none"
          />
        </div>

        <Select
          value={searchParams.get("country") || undefined}
          onValueChange={(value) => handleUpdateParams("country", value)}
        >
          <SelectTrigger className="body-regular light-border background-light800_dark300 text-dark500_light700 line-clamp-1 flex min-h-[56px] items-center gap-3 border p-4 sm:max-w-[210px]">
            <Image
              src="/icons/carbon-location.svg"
              alt="country"
              width={18}
              height={18}
            />
            <div className="line-clamp-1 flex-1 text-left">
              <SelectValue placeholder={t("jobs.selectCountry")} />
            </div>
          </SelectTrigger>

          <SelectContent className="body-semibold max-h-[350px] max-w-[250px]">
            <SelectGroup>
              {countriesList.length > 0 ? (
                countriesList.map((country: Country) => (
                  <SelectItem
                    key={country.cca2}
                    value={country.cca2.toLowerCase()}
                    className="px-4 py-3"
                  >
                    {country.name.common}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-results">{t("jobs.noResults")}</SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("datePosted") || "all"}
          onValueChange={(value) => handleUpdateParams("datePosted", value)}
        >
          <SelectTrigger className="body-regular light-border background-light800_dark300 text-dark500_light700 min-h-[56px] border px-4 sm:max-w-[180px]">
            <div className="line-clamp-1 flex-1 text-left">
              <SelectValue placeholder={t("jobs.datePosted")} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {DATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {getLabel(option.labelKey, option.fallback)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("remote") || "any"}
          onValueChange={(value) => handleUpdateParams("remote", value)}
        >
          <SelectTrigger className="body-regular light-border background-light800_dark300 text-dark500_light700 min-h-[56px] border px-4 sm:max-w-[180px]">
            <div className="line-clamp-1 flex-1 text-left">
              <SelectValue placeholder={t("jobs.workMode")} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {REMOTE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {getLabel(option.labelKey, option.fallback)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("employmentType") || "any"}
          onValueChange={(value) => handleUpdateParams("employmentType", value)}
        >
          <SelectTrigger className="body-regular light-border background-light800_dark300 text-dark500_light700 min-h-[56px] border px-4 sm:max-w-[190px]">
            <div className="line-clamp-1 flex-1 text-left">
              <SelectValue placeholder={t("jobs.employmentType")} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {EMPLOYMENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {getLabel(option.labelKey, option.fallback)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("requirement") || "any"}
          onValueChange={(value) => handleUpdateParams("requirement", value)}
        >
          <SelectTrigger className="body-regular light-border background-light800_dark300 text-dark500_light700 min-h-[56px] border px-4 sm:max-w-[190px]">
            <div className="line-clamp-1 flex-1 text-left">
              <SelectValue placeholder={t("jobs.requirement")} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {REQUIREMENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {getLabel(option.labelKey, option.fallback)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("radius") || "any"}
          onValueChange={(value) => handleUpdateParams("radius", value)}
        >
          <SelectTrigger className="body-regular light-border background-light800_dark300 text-dark500_light700 min-h-[56px] border px-4 sm:max-w-[170px]">
            <div className="line-clamp-1 flex-1 text-left">
              <SelectValue placeholder={t("jobs.radius")} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {RADIUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {getLabel(option.labelKey, option.fallback)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default JobsFilter;
