import { describe , it, expect } from "vitest";
import { findPreviousOneDay, findPreviousDays } from "@/utils/findDates.js";

function formatDate (date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

describe('findPreviousDays', () => {

  it('should return one day', () => {
    let result = findPreviousOneDay(new Date("2025-1-29") , 1);
    expect(formatDate(result)).toEqual("2025-1-27");
  });

  it('should return 10 of the same previous days', () => {
    let result = findPreviousDays(new Date('2025-1-29'),[1,3]);
    const arr = result.map((r) => formatDate(r))
    expect(arr).toContain("2025-1-27","2025-1-20","2025-1-13","2025-1-29","2025-1-22","2025-1-15");
    expect(result.length).toBe(10);
  });

  it('should return 10 previous consecutive days', () => {
    let result = findPreviousDays(new Date('2025-1-5'), [1,2,3,4,5,6,7]);
    const arr = result.map( (r) => formatDate(r));

    expect(result.length).toBe(10);

    expect(arr).toContain(
      "2025-1-5",
      "2025-1-4",
      "2025-1-3",
      "2025-1-2",
      "2025-1-1",
      "2024-12-31",
      "2024-12-30",
      "2024-12-29",
      "2024-12-28",
      "2024-12-27",
    )
  })

});
