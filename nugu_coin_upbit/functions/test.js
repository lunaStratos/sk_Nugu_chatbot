let checkStus = {
  'numbers': 0,
  'value': 0
};

if (checkStus.hasOwnProperty('number')) {
  //있다면
  console.log(true)

} else {
  //없다면
  console.log(false)
}

var str = "38개";
str = str.replace(/[^0-9]/g,'');
console.log(str);
