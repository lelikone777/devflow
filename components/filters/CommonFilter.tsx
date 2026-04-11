"use client";

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "@/components/ui/select";
import { useTranslations } from "@/context/Language";
import { useUrlQuery } from "@/hooks/use-url-query";
import { cn } from "@/lib/utils";

interface Filter {
  name: string;
  value: string;
}

interface Props {
  filters: Filter[];
  otherClasses?: string;
  containerClasses?: string;
}

const CommonFilter = ({
  filters,
  otherClasses = "",
  containerClasses = "",
}: Props) => {
  const { getParam, pushQueryParam } = useUrlQuery();
  const t = useTranslations();
  const paramsFilter = getParam("filter");
  const getFilterLabel = (value: string, fallback: string) =>
    t(`filters.${value}`) === `filters.${value}` ? fallback : t(`filters.${value}`);

  const handleUpdateParams = (value: string) => {
    pushQueryParam("filter", value);
  };

  return (
    <div className={cn("relative", containerClasses)}>
      <Select
        onValueChange={handleUpdateParams}
        defaultValue={paramsFilter || undefined}
      >
        <SelectTrigger
          className={cn(
            "body-regular no-focus light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5",
            otherClasses
          )}
          aria-label={t("filters.select")}
        >
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder={t("filters.select")} />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {getFilterLabel(item.value, item.name)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommonFilter;
