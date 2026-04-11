import { afterEach, describe, expect, it, vi } from "vitest";

import { getTimeStamp } from "./date";
import { processJobTitle } from "./jobs";
import { formatNumber } from "./numbers";

describe("lib/utils/formatters", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats compact numeric values", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1200)).toBe("1.2K");
    expect(formatNumber(2500000)).toBe("2.5M");
  });

  it("removes nullish placeholder words from job titles", () => {
    expect(processJobTitle("Senior undefined Frontend null Engineer")).toBe(
      "Senior Frontend Engineer"
    );
    expect(processJobTitle("undefined null")).toBe("No Job Title");
    expect(processJobTitle(null)).toBe("No Job Title");
  });

  it("builds relative timestamps from the current time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));

    expect(getTimeStamp(new Date("2025-01-10T11:59:45.000Z"))).toBe(
      "15 seconds ago"
    );
    expect(getTimeStamp(new Date("2025-01-10T11:45:00.000Z"))).toBe(
      "15 mins ago"
    );
    expect(getTimeStamp(new Date("2025-01-10T09:00:00.000Z"))).toBe(
      "3 hours ago"
    );
    expect(getTimeStamp(new Date("2025-01-07T12:00:00.000Z"))).toBe(
      "3 days ago"
    );
  });
});
