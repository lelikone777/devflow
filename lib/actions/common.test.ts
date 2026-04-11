import { describe, expect, it } from "vitest";

import {
  getPagination,
  getPaginationMetadata,
  toPlainData,
} from "./common";

describe("lib/actions/common", () => {
  it("calculates pagination values with defaults", () => {
    expect(getPagination({})).toEqual({
      currentPage: 1,
      limit: 10,
      skip: 0,
    });
  });

  it("calculates pagination values from explicit page and size", () => {
    expect(getPagination({ page: 3, pageSize: 20 })).toEqual({
      currentPage: 3,
      limit: 20,
      skip: 40,
    });
  });

  it("builds pagination metadata consistently", () => {
    expect(getPaginationMetadata(95, 20, 40, 20)).toEqual({
      isNext: true,
      totalPages: 5,
    });

    expect(getPaginationMetadata(60, 20, 40, 20)).toEqual({
      isNext: false,
      totalPages: 3,
    });
  });

  it("serializes values into plain JSON-compatible data", () => {
    const serialized = toPlainData({
      nested: { value: 1 },
      date: new Date("2025-01-01T00:00:00.000Z"),
    });

    expect(serialized).toEqual({
      nested: { value: 1 },
      date: "2025-01-01T00:00:00.000Z",
    });
  });
});
