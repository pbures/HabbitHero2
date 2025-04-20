
class DaysInWeekDateUtil {

  constructor(targetDaysInWeek) {
    this.targetDays = targetDaysInWeek;
  }

  findPreviousDays(today) {
    let result = [];

    const dayInWeek = today.getDay();
    const targetDaysReversed = this.targetDays.sort().reverse();

    let i=0;

    for(let j=0; j< targetDaysReversed.length; j++){
      if(this.targetDays[j] === dayInWeek) {
        i = j;
        break;
      }
    }

    const top = i + 10;
    for(; i < top; i++){
      let td = targetDaysReversed[i % targetDaysReversed.length];
      let prevDay = this.findPreviousOneDay(today, td);
      result.push(prevDay);
      today = new Date(prevDay.valueOf() - 1000*60*60*24);
    }
    return result;
  }

  findPreviousOneDay(today, dayOfWeek) {
      let daysAgo = (today.getDay() - dayOfWeek + 7) % 7;
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - daysAgo);
      return pastDate;
  }

  static getDateStr(dateObj) {
    const ret = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    return ret;
  }

  static getDayMonthStr(dateObj) {
    return `${dateObj.toLocaleString('default', { month: 'short'})}-${dateObj.getDate()}`
  }

}

// export { findPreviousDays, findPreviousOneDay, getDateStr, getDayMonthStr };
export default DaysInWeekDateUtil;
