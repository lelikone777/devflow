interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
  pathname?: string;
}

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
  pathname?: string;
}

function getBasePath(pathname?: string) {
  return pathname ?? window.location.pathname;
}

function stringifyUrl(pathname: string, queryParams: URLSearchParams) {
  const queryString = queryParams.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export const formUrlQuery = ({
  params,
  key,
  value,
  pathname,
}: UrlQueryParams) => {
  const queryParams = new URLSearchParams(params);

  queryParams.set(key, value);

  return stringifyUrl(getBasePath(pathname), queryParams);
};

export const removeKeysFromUrlQuery = ({
  params,
  keysToRemove,
  pathname,
}: RemoveUrlQueryParams) => {
  const queryParams = new URLSearchParams(params);

  keysToRemove.forEach((key) => {
    queryParams.delete(key);
  });

  return stringifyUrl(getBasePath(pathname), queryParams);
};
