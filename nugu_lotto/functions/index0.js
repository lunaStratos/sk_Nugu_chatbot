let speechText = '';

switch (7) {
  case 1:
    speechText = '혹시 1등이신가요? 1등은 신분증을 가지고 농협은행 본점에서만 수령이 가능합니다.';
    break;
  case 2:
    speechText = '2등은 신분증을 가지고 지역농협을 제외한 농협은행 영업점에서 당첨금을 수령하시면 됩니다.';
    break;
  case 3:
    speechText = '3등은 신분증을 가지고 지역농협을 제외한 농협은행 영업점에서 당첨금을 수령하시면 됩니다.';
    break;
  case 4:
    speechText = '4등은 5만원입니다. 복권 판매점에서 교환하면 됩니다. ';
    break;
  case 5:
    speechText = '5등은 5천원! 복권 판매점에서 교환하면 됩니다. ';
    break;
  default:
    speechText = '그런 상은 존재하지 않습니다. 로또는 1등부터 5등까지만 있답니다. ';
}

console.log(speechText)
