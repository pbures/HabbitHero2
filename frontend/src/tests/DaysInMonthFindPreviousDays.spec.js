import DaysInMonthDateUtil from '@/utils/DaysInMonthDateUtil';
import { describe, expect, it } from "vitest";

function formatDate (date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

describe('DaysInWeekDateUtil.findPreviousDays', () => {


  it('should return one day', () => {
    let dateUtil =  new DaysInMonthDateUtil([]);
    let result = dateUtil.findPreviousOneDay([2025, 1, 29] , 3);
    expect(result).toEqual([2025,1,3]);
  });

  it('should return date from previous year', () => {
    let dateUtil =  new DaysInMonthDateUtil([30]);
    let result = dateUtil.findPreviousOneDay([2025, 1, 29] , 30);
    expect(result).toEqual([2024, 12, 30]);
  });

  it('should return 10 of the same previous days on 20th', () => {
    let dateUtil =  new DaysInMonthDateUtil([20]);
    let result = dateUtil.findPreviousDays(new Date('2025-4-20'));
    const arr = result.map((r) => formatDate(r))
    expect(arr).toContain(
      "2025-3-20",
      "2025-2-20",
      "2025-1-20",
      "2024-12-20",
      "2024-11-20",
      "2024-10-20",
      "2024-9-20",
      "2024-8-20",
      "2024-7-20",
      "2024-6-20",
    );
    expect(result.length).toBe(10);
  });

  it('should return 10 of the same previous days', () => {
    let dateUtil =  new DaysInMonthDateUtil([3]);
    let result = dateUtil.findPreviousDays(new Date('2025-1-29'));
    const arr = result.map((r) => formatDate(r))
    expect(arr).toContain(
      "2025-1-3",
      "2024-12-3",
      "2025-11-3",
      "2025-10-3",
      "2025-9-3",
      "2025-8-3",
      "2025-7-3",
      "2025-6-3",
      "2025-5-3",
      "2025-4-3",
    );
    expect(result.length).toBe(10);
  });

  it('should return days of first, 10th and 20th each month', () => {
    let dateUtil =  new DaysInMonthDateUtil([1,10,20]);
    let result = dateUtil.findPreviousDays(new Date('2025-1-5'));
    const arr = result.map( (r) => formatDate(r));

    expect(result.length).toBe(10);

    expect(arr).toContain(
      "2025-1-1",
      "2025-12-20",
      "2025-12-10",
      "2025-12-1",
      "2025-11-20",
      "2025-11-10",
      "2025-11-1",
      "2025-10-20",
      "2025-10-10",
      "2025-10-1",
    )
  })

  it('should jump over Feb 30th and keep the 30th', () => {
    let dateUtil =  new DaysInMonthDateUtil([30]);
    let result = dateUtil.findPreviousDays(new Date('2025-3-31'));
    const arr = result.map( (r) => formatDate(r));

    expect(result.length).toBe(10);
    console.log("arr", arr);

    expect(arr).toContain("2025-3-30")
    expect(arr).toContain("2025-3-1")
    expect(arr).toContain("2025-1-30")
    expect(arr).toContain("2024-12-30")
    expect(arr).toContain("2024-11-30")
  })

});
