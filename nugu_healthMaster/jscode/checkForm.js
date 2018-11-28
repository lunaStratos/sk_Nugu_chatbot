exports.checkPassword = function(str) {
  var reg_pwd = /^.*(?=.{6,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
  if (!reg_pwd.test(str)) {
    //틀리면
    return true;
  }
  //암호가 맞으면
  return false;
}

exports.checkEmail = function(email) {
  // 이메일 검증 스크립트 작성
  var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
  // 검증에 사용할 정규식 변수 regExp에 저장
  if (email.match(regExp) != null) {
    //맞으면
    return false;
  } else {
    //이메일이 틀리면
    return true
  }
}

//성별체크
exports.checkSex = function(text) {
  if (text != 'F' && text != 'M') {
    return true;
  }else{
      return false;
  }
}
//년도체크
exports.checkYear = function(year) {
  if (1900 > Number(year) || Number(year) > (new Date().getFullYear())) {
    return true;
  }else{
      return false;
  }
}

//실행 부분
exports.checkName = function(text) {
  var pattern = /^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/;
  if (!pattern.test(text)) {
    return true;
  } else {
    return false;
  }

}

exports.checkLocation = function(text) {
  let flag = true;
  const arr = ['서울', '대전', '대구', '부산', '광주', '울산', '경기', '경남', '경북', '전남', '전북', '제주', '강원', '충북', '충남']
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i])
    if (arr[i] == text) {
      console.log(arr[i])
      flag = false;
    }
  }

  return flag;
}
