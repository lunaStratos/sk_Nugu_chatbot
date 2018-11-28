function chkPwd(str){

 var reg_pwd = /^.*(?=.{6,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;

 if(!reg_pwd.test(str)){

  return false;

 }

 return true;

}
console.log(chkPwd('tornado1'))
