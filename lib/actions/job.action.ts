export const fetchLocation = async () => {
  const response = await fetch("http://ip-api.com/json/?fields=country");
  const location = await response.json();
  return location.country;
};

export const fetchCountries = async () => {
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name"
    );
    const result = await response.json();
    return result;
  } catch {
    return [];
  }
};

export const fetchJobs = async (filters: JobFilterParams) => {
  const { query, page } = filters;
  const rapidApiKey =
    process.env.RAPID_API_KEY ?? process.env.NEXT_PUBLIC_RAPID_API_KEY ?? "";

  if (!rapidApiKey) return [];

  const headers = {
    "X-RapidAPI-Key": rapidApiKey,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
  };

  const searchParams = new URLSearchParams({
    query,
    page: String(page),
    num_pages: "1",
    country: "us",
    date_posted: "all",
  });

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
