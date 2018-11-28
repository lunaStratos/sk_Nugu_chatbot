
module.exports = function (min, max) {
  var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
  return ranNum;
}
