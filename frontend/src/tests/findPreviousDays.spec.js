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
});