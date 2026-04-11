import { describe, expect, it } from "vitest";

import { formUrlQuery, removeKeysFromUrlQuery } from "./url";

describe("lib/url", () => {
  it("adds or updates query params against an explicit pathname", () => {
    expect(
      formUrlQuery({
        pathname: "/questions",
        params: "page=2&filter=popular",
        key: "query",
        value: "react hooks",
      })
    ).toBe("/questions?page=2&filter=popular&query=react+hooks");
  });

  it("overwrites an existing query param", () => {
    expect(
      formUrlQuery({
        pathname: "/community",
        params: "filter=oldest",
        key: "filter",
        value: "newest",
      })
    ).toBe("/community?filter=newest");
  });

  it("removes query params and preserves the rest", () => {
    expect(
      removeKeysFromUrlQuery({
        pathname: "/jobs",
        params: "query=frontend&location=moscow&remote=remote",
        keysToRemove: ["location", "remote"],
      })
    ).toBe("/jobs?query=frontend");
  });

  it("returns a clean pathname when all query params are removed", () => {
    expect(
      removeKeysFromUrlQuery({
        pathname: "/tags",
        params: "query=react",
        keysToRemove: ["query"],
      })
    ).toBe("/tags");
  });
});
