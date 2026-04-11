import { BADGE_CRITERIA } from "@/constants";
import type { Badges } from "@/types";

export function assignBadges(params: {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}) {
  const badgeCounts: Badges = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  for (const item of params.criteria) {
    const badgeLevels = BADGE_CRITERIA[item.type];

    for (const level of Object.keys(badgeLevels)) {
      if (item.count >= badgeLevels[level as keyof typeof badgeLevels]) {
        badgeCounts[level as keyof Badges] += 1;
      }
    }
  }

  return badgeCounts;
}
