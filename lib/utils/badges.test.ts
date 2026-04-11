import { describe, expect, it } from "vitest";

import { assignBadges } from "./badges";

describe("lib/utils/badges", () => {
  it("assigns badge levels when criteria thresholds are met", () => {
    expect(
      assignBadges({
        criteria: [
          { type: "QUESTION_COUNT", count: 120 },
          { type: "ANSWER_UPVOTES", count: 55 },
          { type: "TOTAL_VIEWS", count: 1500 },
        ],
      })
    ).toEqual({
      GOLD: 1,
      SILVER: 2,
      BRONZE: 3,
    });
  });

  it("returns zero counts when no criteria reach a threshold", () => {
    expect(
      assignBadges({
        criteria: [
          { type: "QUESTION_COUNT", count: 1 },
          { type: "ANSWER_COUNT", count: 2 },
        ],
      })
    ).toEqual({
      GOLD: 0,
      SILVER: 0,
      BRONZE: 0,
    });
  });
});
