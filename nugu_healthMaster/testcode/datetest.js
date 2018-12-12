var d = new Date('2018-11-27T00:01:01.593Z') //오늘
console.log(d)
var yesterday = new Date(d.getTime() - 86400000)
console.log(yesterday)
d.setHours(0, 1, 1);
console.log(yesterday)

var startTime = new Date().getTime() - 2592000000 + 32400000
startTime.setHours(0, 1, 1);//0시 1분 1분
console.log(startTime)
