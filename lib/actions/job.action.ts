export const fetchLocation = async () => {
  try {
    const response = await fetch(
      "http://ip-api.com/json/?fields=country,countryCode"
    );

    if (!response.ok) {
      return { country: "", countryCode: "" };
    }

    const location = await response.json();

    return {
      country: location.country ?? "",
      countryCode: location.countryCode ?? "",
    };
  } catch {
    return { country: "", countryCode: "" };
  }
};

export const fetchCountries = async () => {
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2"
    );
    const result = await response.json();

    return result.sort((a: Country, b: Country) =>
      a.name.common.localeCompare(b.name.common)
    );
  } catch {
    return [];
  }
};

export const fetchJobs = async (filters: JobFilterParams) => {
  const {
    query,
    page,
    country,
    location,
    datePosted = "all",
    workFromHome,
    employmentTypes,
    jobRequirements,
    radius,
    language,
    fields = [
      "employer_name",
      "employer_logo",
      "employer_website",
      "job_employment_type",
      "job_title",
      "job_description",
      "job_apply_link",
      "job_city",
      "job_state",
      "job_country",
    ].join(","),
  } = filters;
  const rapidApiKey = process.env.RAPID_API_KEY ?? "";

  if (!rapidApiKey) return [];

  const headers = {
    "X-RapidAPI-Key": rapidApiKey,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
  };

  const searchParams = new URLSearchParams({
    query,
    page: String(page),
    num_pages: "1",
    country: country || "us",
    date_posted: datePosted,
    fields,
  });

  if (location) searchParams.set("location", location);
  if (typeof workFromHome === "boolean") {
    searchParams.set("work_from_home", String(workFromHome));
  }
  if (employmentTypes) {
    searchParams.set("employment_types", employmentTypes);
  }
  if (jobRequirements) {
    searchParams.set("job_requirements", jobRequirements);
  }
  if (radius) searchParams.set("radius", radius);
  if (language) searchParams.set("language", language);

  const response = await fetch(
    `https://jsearch.p.rapidapi.com/search?${searchParams.toString()}`,
    {
      headers,
    }
  );

  if (!response.ok) {
    return [];
  }

  const result = await response.json();

  return result.data ?? [];
};
