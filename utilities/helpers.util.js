const { DateTime } = require('luxon');

function getUserTimeZone() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dt = DateTime.local().setZone(timeZone);
  console.log(dt.offsetNameLong);
  // return "Pacific Standard Time";
  return 'W. Central Africa Standard Time';
  return dt.offsetNameLong;
}

module.exports = {
  getUserTimeZone,
};
