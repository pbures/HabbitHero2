export function getDateStr(dateObj) {
  const ret = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
  return ret;
}
