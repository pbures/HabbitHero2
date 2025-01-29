
function findPreviousDays(today,targetDays) {
  let result = [];
  
  for(let i=0; i < 10; i++){
    let td = targetDays[i % targetDays.length];
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
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - daysAgo);
    return pastDate;
}

// findPreviousDays([0, 1, 2, 3, 4, 5, 6]);
// console.log(findPreviousDays([2]))


export { findPreviousDays, findPreviousOneDay };