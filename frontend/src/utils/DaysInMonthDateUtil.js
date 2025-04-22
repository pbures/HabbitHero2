class DaysInMonthDateUtil {

  constructor(targetDaysInWeek) {
    this.targetDays = targetDaysInWeek
  }

  findPreviousDays(today) {
    let result = [];
    let dayInMonth = today.getDate();

    const targetDaysReversed = this.targetDays.sort().reverse();

    let i=0;
    for(let j=0; j< targetDaysReversed.length; j++){
      if(this.targetDays[j] <= dayInMonth) {
        i = j;
        break;
      }
    }

    let todayDateTriplet = this._dateTriplet(today)
    const top = i + 10;
    for(; i < top; i++){
      let td = targetDaysReversed[i % targetDaysReversed.length];

      todayDateTriplet = this.findPreviousOneDay(todayDateTriplet, td);

      let toStore = new Date(todayDateTriplet);
      if (toStore.getMonth() !== todayDateTriplet[1] - 1) {
        toStore = new Date(todayDateTriplet[0], todayDateTriplet[1], 1)
      }
      result.push(toStore);
    }
    return result;
  }

  findPreviousOneDay(todayDateTriplet, dayOfMonth) {

    let [year, month] = todayDateTriplet
    let resultDate = [year, month, dayOfMonth]

    let c = this._compare(resultDate, todayDateTriplet);
    if (c === 1 || c === 0) {
      if (month === 1) {
        year = year - 1;
        month = 13;
      }
      resultDate = [year, month-1, dayOfMonth]
    }

    return resultDate;
  }

  _compare(d1, d2) {
    for (let i = 0; i < 3; i++) {
      if (d1[i] > d2[i]) return 1;
      if (d1[i] < d2[i]) return -1;
    }
    return 0;
  }

  static getDayMonthStr(dateObj) {
    return `${dateObj.toLocaleString('default', { month: 'short'})}-${dateObj.getDate()}`
  }

  _dateTriplet(dateObj) {
    return [dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()];
  }

}

export default DaysInMonthDateUtil;
