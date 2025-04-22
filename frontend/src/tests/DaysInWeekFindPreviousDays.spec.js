import DaysInWeekDateUtil from "@/utils/DaysInWeekDateUtil.js";
import { describe, expect, it } from "vitest";

function formatDate (date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

describe('DaysInWeekDateUtil.findPreviousDays', () => {


  it('should return one day', () => {
    let dateUtil =  new DaysInWeekDateUtil([]);
    let result = dateUtil.findPreviousOneDay(new Date("2025-1-29") , 1);
    expect(formatDate(result)).toEqual("2025-1-27");
  });

  it('should return 10 of the same previous days', () => {
    let dateUtil =  new DaysInWeekDateUtil([1,3]);
    let result = dateUtil.findPreviousDays(new Date('2025-1-29'));
    const arr = result.map((r) => formatDate(r))
    expect(arr).toContain("2025-1-27","2025-1-20","2025-1-13","2025-1-29","2025-1-22","2025-1-15");
    expect(result.length).toBe(10);
  });

  it('should return 10 previous consecutive days', () => {
    let dateUtil =  new DaysInWeekDateUtil([1,2,3,4,5,6,7]);
    let result = dateUtil.findPreviousDays(new Date('2025-1-5'));
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
