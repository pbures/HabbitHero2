
function findPreviousDays(today,targetDays) {
  let result = [];

  const dayInWeek = today.getDay();
  const targetDaysReversed = targetDays.sort().reverse();

  let i=0;

  for(let j=0; j< targetDaysReversed.length; j++){
    if(targetDays[j] === dayInWeek) {
      i = j;
      break;
    }
  }

  const top = i + 10;
  for(; i < top; i++){
    let td = targetDaysReversed[i % targetDaysReversed.length];
    let prevDay = findPreviousOneDay(today, td);
    result.push(prevDay);
    console.log('PD: ' + prevDay);
    // today = prevDay;
    today = new Date(prevDay.valueOf() - 1000*60*60*24);
  }
  return result;
}

function findPreviousOneDay(today, dayOfWeek) {
    let daysAgo = (today.getDay() - dayOfWeek + 7) % 7;
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - daysAgo);
    return pastDate;
}

// findPreviousDays([0, 1, 2, 3, 4, 5, 6]);
// console.log(findPreviousDays([2]))


export { findPreviousDays, findPreviousOneDay };
