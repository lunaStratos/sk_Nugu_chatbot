//Array => Text만들기
exports.listTextMake = function(arr) {
  let text = '';
  for (var j = 0; j < 5; j++) {
    if (j == 4) { //마지막은 , 제외
      text += arr[j] + '';
    } else {
      text += arr[j] + ', ';
    }

  }
  return text;
} //ListTextMake

exports.virusSay = function(num) {
  let text = '';
  console.log(num)
  switch (num) {
    case 1:
      text = '위험도가 1단계라 위생을 평소에 챙기기를 추천할께요. '
      break;
    case 2:
      text = '위험도가 2단계라 평소 손싯기와 환기를 추천할께요. '
      break;
    case 3:
      text = '위험도가 3단계라 마스크를 생활화 하기를 추천할께요. '
      break;
    case 4:
      text = '위험도가 4단계라 밖에 나가지 않기를 추천할께요. '
      break;
  }
  return text;
} //virusSay

exports.uvSay = function(num) {
  let uvTemp = '';
  switch (parseInt(num)) {
    case 1:
      uvTemp = '마지막으로 자외선 지수는 낮음 입니다. '
      break;
    case 2:
      uvTemp = '마지막으로 자외선 지수는 보통 입니다. '
      break;
    case 3:
      uvTemp = '마지막으로 자외선 지수는 높음 입니다. '
      break;
    case 4:
      uvTemp = '마지막으로 자외선 지수는 매우높음 입니다. '
      break;
    case 5:
      uvTemp = '마지막으로 자외선 지수는 위험 입니다. '
      break;
  }
  return uvTemp;
} //virusSay

exports.bpmText = function(bpm, num) { //심박동 평가모델
  const bpmList = bpm.list;
  let bpmAllValue = 0;
  let bpmText = 0;
  let tempBpmUp = 0
  let tempBpmDown = 999
  for (let i = 0; i < bpmList.length; i++) {
    bpmAllValue += bpmList[i].bpm
    if (tempBpmUp < bpmList[i].bpm) { // 최고값
      tempBpmUp = bpmList[i].bpm
    }
    if (bpmList[i].bpm < tempBpmDown) { //최저값
      tempBpmDown = bpmList[i].bpm
    }
  }

  if (bpmAllValue == 0) {
    bpmText = ''
  } else {
    bpmText = '아, 심박동도 있네요. 심장박동은 평균 ' + (bpmAllValue / num) + '이었으며 최고 ' + tempBpmUp + ', 최저 ' + tempBpmDown + ' 입니다.'
  }
  return bpmText
} //Array => shuffle

//Array => shuffle
exports.shuffleRandom = function(a) {
  var j, x, i;
  for (i = a.length; i; i -= 1) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
} //Array => shuffle

exports.ShuffleUmSay = function() {
  const randomPersent = Math.floor(Math.random() * 90)
  let text = '';
  if (randomPersent > 69) {
    text = '음...'
  }

  return text;
}

//PTY	강수형태	0:없음, 1: 비, 2: 비/눈, 3: 눈/비, 4: 눈
exports.codeToTextForPTY = function(str) {
  let text = ''
  switch (str) {
    case 0:
      text = '없음'
      break;
    case 1:
      text = '비'
      break;
    case 2:
      text = '비나 눈'
      break;
    case 3:
      text = '눈이나 비'
      break;
    case 4:
      text = '눈'
      break;

  }
  return text

}

//SKY	하늘상태	1맑음 2 구름조금 3 구름많음 4 흐림
exports.codeToTextForSKY = function(str) {
  let text = ''
  switch (str) {
    case 1:
      text = '맑음'
      break;
    case 2:
      text = '구름 조금'
      break;
    case 3:
      text = '구름 많음'
      break;
    case 4:
      text = '흐림'
      break;

  }
  return text

}



// 숫자 => 콤마 찍기
exports.comma = function(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//참고 : http://health.chosun.com/site/data/html_dir/2010/03/16/2010031601411.html?Dep0=twitter
//30보에 1칼로리를 소모한다.
exports.walktocal = function(number) {
  return number / 30
}

// 넘어온 값이 빈값인지 체크합니다.
//parameters.hasOwnProperty('number')
// !value 하면 생기는 논리적 오류를 제거하기 위해
// 명시적으로 value == 사용
// [], {} 도 빈값으로 처리
exports.isEmpty = function(value) {
  if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
    return true //비었음
  } else {
    return false //비어있지 않음
  }
};

//도시코드를 받으면 number로 변환후 이름반환
exports.codeToCity = function(str) {
  let cityName = '서울';
  switch (Number(str)) {
    case 11:
      cityName = '서울'
      break;
    case 26:
      cityName = '부산'
      break;
    case 27:
      cityName = '대구'
      break;
    case 28:
      cityName = '인천'
      break;
    case 29:
      cityName = '광주'
      break;
    case 30:
      cityName = '대전'
      break;
    case 31:
      cityName = '울산'
      break;
    case 41:
      cityName = '경기'
      break;
    case 42:
      cityName = '강원'
      break;
    case 43:
      cityName = '충북'
      break;
    case 44:
      cityName = '충남'
      break;
    case 45:
      cityName = '전북'
      break;
    case 46:
      cityName = '전남'
      break;
    case 47:
      cityName = '경북'
      break;
    case 48:
      cityName = '경남'
      break;
    case 49:
      cityName = '제주'
      break;
    case 99:
      cityName = '전국'
      break;
  }

  return cityName
};

exports.chegamTemp = function(h33) {
  let h33Text = ''
  if (h33 > -3) { //13
    h33Text = '' + h33 + '이라 무리가 없네요. 평소 입던 옷으로 산책하기시를 추천할께요. '
  } else if (-10 <= h33 && h33 <= -3) { //13~17
    h33Text = '' + h33 + '이라 추울 거 같네요. 옷 충분히 입고 산책하기시를 추천할께요. '
  } else if (-15 <= h33 && h33 < -10) {
    h33Text = '' + h33 + '매우 춥습니다. 왠만하면 나가지 않기를 추천할께요. '
  } else if (h33 < -15) {
    h33Text = '' + h33 + '이라 집안에 있으시길 추천할께요. '
  }
  return h33Text

}



exports.TempText = function(h33) {
  let h33Text = ''
  if (h33 < 13) { //13
    h33Text = '' + h33 + '도라 추울 거 같네요. 옷 충분히 입고 산책하기시를 추천할께요. '
  } else if (13 <= h33 && h33 <= 16) { //13~17
    h33Text = '' + h33 + '도라 약간 춥지만 무리가 없네요. 활동복에 약간 옷을 덧입어서 산책하기시를 추천할께요. '
  } else if (17 <= h33 && h33 <= 20) {
    h33Text = '' + h33 + '도라 적당한 온도 같네요. 활동복으로 입어도 시원하게 산책이 가능할 거 같아요. '
  } else if (21 <= h33 && h33 <= 25) {
    h33Text = '' + h33 + '도라 일반적인 운동을 추천할께요. '
  } else if (26 <= h33) {
    h33Text = '' + h33 + '도라 무더울 거 같아요. 일사병 걸리지 않게 조심하세요. '
  }
  return h33Text

}
exports.locationToCode = function(str) {
  let json = {}
  switch (str) {
    case '서울':
      json = {
        nx: 60,
        ny: 127
      }
      break;
    case '부산':
      json = {
        nx: 98,
        ny: 76
      }
      break;
    case '대구':
      json = {
        nx: 89,
        ny: 90
      }
      break;
    case '인천':
      json = {
        nx: 55,
        ny: 124
      }
      break;
    case '광주':
      json = {
        nx: 58,
        ny: 74
      }
      break;
    case '대전':
      json = {
        nx: 67,
        ny: 100
      }
      break;
    case '울산':
      json = {
        nx: 102,
        ny: 84
      }
      break;
    case '세종':
      json = {
        nx: 66,
        ny: 103
      }
      break;
    case '경기':
      json = {
        nx: 60,
        ny: 120
      }
      break;
    case '강원':
      json = {
        nx: 73,
        ny: 134
      }
      break;
    case '충북':
      json = {
        nx: 69,
        ny: 107
      }
      break;
    case '충남':
      json = {
        nx: 68,
        ny: 100
      }
      break;
    case '전북':
      json = {
        nx: 63,
        ny: 89
      }
      break;
    case '전남':
      json = {
        nx: 51,
        ny: 67
      }
      break;
    case '경북':
      json = {
        nx: 89,
        ny: 91
      }
      break;
    case '경남':
      json = {
        nx: 91,
        ny: 77
      }
      break;
    case '제주':
      json = {
        nx: 52,
        ny: 38
      }
      break;
  }

  return json
}

//성별과 나이 입력하면 나이대별 평균걸음 계산
exports.averageWalk = function(age, sex) {
  let returnWalk = 0

  if (age < 21) {
    returnWalk = 7300
    if (sex == 'M') {
      returnWalk += 500
    }
  } else if (20 < age && age < 31) {
    returnWalk = 7300
    if (sex == 'M') {
      returnWalk += 500
    }
  } else if (30 < age && age < 41) {
    returnWalk = 7400
    if (sex == 'M') {
      returnWalk += 500
    }
  } else if (40 < age && age < 51) {
    returnWalk = 6900
    if (sex == 'M') {
      returnWalk += 500
    }
  } else if (50 < age && age < 61) {
    returnWalk = 7500
    if (sex == 'M') {
      returnWalk += 500
    }
  } else if (60 < age && age < 71) {
    returnWalk = 5000
    if (sex == 'M') {
      returnWalk += 1500
    }
  } else if (70 < age && age < 81) {
    returnWalk = 4000
    if (sex == 'M') {
      returnWalk += 1500
    }
  } else if (80 < age) {
    returnWalk = 2500
    if (sex == 'M') {
      returnWalk += 1500
    }
  }
  return returnWalk
};


//음식이름 => 음식 정보
exports.foodInfo = function(str) {
  let result = '';
  const foodArr = [{
    name: '갈비탕',
    info: '580 칼로리',
    cal: 580
  }, {
    name: '갈비구이',
    info: '550 칼로리',
    cal: 550
  }, {
    name: '김치찌개',
    info: '450 칼로리',
    cal: 450
  }, {
    name: '물냉면',
    info: '450 칼로리',
    cal: 450
  }, {
    name: '비빔냉면',
    info: '500 칼로리',
    cal: 500
  }, {
    name: '된장찌개',
    info: '390 칼로리',
    cal: 390
  }, {
    name: '불고기',
    info: '300 칼로리',
    cal: 300
  }, {
    name: '비빔밥',
    info: '580 칼로리',
    cal: 580
  }, {
    name: '설렁탕',
    info: '460 칼로리',
    cal: 460
  }, {
    name: '순두부찌개',
    info: '580 칼로리',
    cal: 580
  }, {
    name: '육개장',
    info: '490 칼로리',
    cal: 490
  }, {
    name: '전복죽',
    info: '290 칼로리',
    cal: 290
  }, {
    name: '대구매운탕',
    info: '510 칼로리',
    cal: 510
  }, {
    name: '메밀국수',
    info: '450 칼로리',
    cal: 450
  }, {
    name: '생선초밥',
    info: '340 칼로리',
    cal: 340
  }, {
    name: '유부초밥',
    info: '500 칼로리',
    cal: 500
  }, {
    name: '돈까스',
    info: '980 칼로리',
    cal: 980
  }, {
    name: '안심스테이크',
    info: '860 칼로리',
    cal: 860
  }, {
    name: '김치볶음밥',
    info: '610 칼로리',
    cal: 610
  }, {
    name: '카레라이스',
    info: '600 칼로리',
    cal: 600
  }, {
    name: '생선까스',
    info: '880 칼로리',
    cal: 880
  }, {
    name: '짜장면',
    info: '660 칼로리',
    cal: 660
  }, {
    name: '짬뽕',
    info: '540 칼로리',
    cal: 540
  }, {
    name: '볶음밥',
    info: '720 칼로리',
    cal: 720
  }, {
    name: '탕수육',
    info: '1780 칼로리',
    cal: 900
  }, {
    name: '라면',
    info: '500 칼로리',
    cal: 500
  }, {
    name: '컵라면',
    info: '350 칼로리',
    cal: 350
  }, {
    name: '피자',
    info: '1120 칼로리',
    cal: 1120
  }, {
    name: '햄버거',
    info: '580 칼로리',
    cal: 580
  }, {
    name: '후라이드치킨',
    info: '1200 칼로리',
    cal: 1200
  }, {
    name: '콜라',
    info: '100 칼로리',
    cal: 100
  }, {
    name: '라이트콜라',
    info: '10 칼로리',
    cal: 10
  }, {
    name: '사이다',
    info: '100 칼로리',
    cal: 100
  }, {
    name: '우유',
    info: '125 칼로리',
    cal: 125
  }, {
    name: '요구르트',
    info: '120 칼로리',
    cal: 120
  }, {
    name: '소보루빵',
    info: '200 칼로리',
    cal: 200
  }, {
    name: '아이스크림',
    info: '100 칼로리',
    cal: 100
  }, {
    name: '수제비',
    info: '410 칼로리',
    cal: 410
  }, {
    name: '칼국수',
    info: '410 칼로리',
    cal: 410
  }, {
    name: '만두국',
    info: '570 칼로리',
    cal: 570
  }, {
    name: '부대찌개',
    info: '580 칼로리',
    cal: 580
  }, {
    name: '삼계탕',
    info: '630 칼로리',
    cal: 630
  }, {
    name: '떡볶이',
    info: '482 칼로리',
    cal: 482
  }, ]
  for (let i = 0; i < foodArr.length; i++) {
    if (foodArr[i].name == str) {
      result = foodArr[i]
    }
  }
  return result
}



//콜레스테롤 수치
//http://www.samsunghospital.com/dept/medical/dietarySub04View.do?content_id=1050&DP_CODE=DD2&MENU_ID=002&ds_code=D0004677
exports.foodColesterol = function(str) {
  let result = '';
  const foodArr = [{
      name: "고등어",
      colesterol: 48,
      fat: 16.5
    },
    {
      name: "소시지",
      colesterol: 50,
      fat: 24.8
    },
    {
      name: "명태",
      colesterol: 58,
      fat: 0.7
    },
    {
      name: "돼지고기 등심",
      colesterol: 55,
      fat: 25.7
    },
    {
      name: "참치",
      colesterol: 60,
      fat: 2.0
    },
    {
      name: "베이컨",
      colesterol: 60,
      fat: 39.1
    },
    {
      name: "복어",
      colesterol: 63,
      fat: 0.1
    },
    {
      name: "삼겹살",
      colesterol: 64,
      fat: 38.3
    },
    {
      name: "연어",
      colesterol: 65,
      fat: 8.4
    },
    {
      name: "돼지고기 안심",
      colesterol: 66,
      fat: 13.2
    },
    {
      name: "대구",
      colesterol: 67,
      fat: 0.4
    },
    {
      name: "돼지갈비",
      colesterol: 69,
      fat: 13.9
    },
    {
      name: "도미",
      colesterol: 69,
      fat: 1.6
    },
    {
      name: "돼지간",
      colesterol: 250,
      fat: 3.4
    },
    {
      name: "꽁치",
      colesterol: 69,
      fat: 16.2
    },
    {
      name: "소고기사태",
      colesterol: 53,
      fat: 4.7
    },
    {
      name: "갈치",
      colesterol: 72,
      fat: 5.9
    },
    {
      name: "소고기양지",
      colesterol: 53,
      fat: 6.6
    },
    {
      name: "삼치",
      colesterol: 72,
      fat: 9.7
    },
    {
      name: "소갈비",
      colesterol: 55,
      fat: 18.0
    },
    {
      name: "잉어",
      colesterol: 75,
      fat: 6.0
    },
    {
      name: "소고기안심",
      colesterol: 67,
      fat: 16.2
    },
    {
      name: "조기",
      colesterol: 87,
      fat: 6.2
    },
    {
      name: "소꼬리",
      colesterol: 75,
      fat: 47.1
    },
    {
      name: "광어",
      colesterol: 94,
      fat: 1.8
    },
    {
      name: "소고기 양",
      colesterol: 164,
      fat: 2.0
    },
    {
      name: "우럭",
      colesterol: 94,
      fat: 1.1
    },
    {
      name: "소고기곱창",
      colesterol: 190,
      fat: 11.7
    },
    {
      name: "가자미",
      colesterol: 99,
      fat: 2.2
    },
    {
      name: "소고기간",
      colesterol: 246,
      fat: 4.6
    },
    {
      name: "어묵",
      colesterol: 21,
      fat: 0.7
    },
    {
      name: "개고기",
      colesterol: 44,
      fat: 20.2
    },
    {
      name: "바지락",
      colesterol: 25,
      fat: 1.1
    },
    {
      name: "닭가슴살",
      colesterol: 75,
      fat: 2.4
    },
    {
      name: "굴",
      colesterol: 36,
      fat: 1.8
    },
    {
      name: "양고기",
      colesterol: 75,
      fat: 17.0
    },
    {
      name: "홍합",
      colesterol: 49,
      fat: 1.7
    },
    {
      name: "오리고기",
      colesterol: 80,
      fat: 28.6
    },
    {
      name: "바다가재",
      colesterol: 76,
      fat: 1.2
    },
    {
      name: "닭다리살",
      colesterol: 94,
      fat: 14.6
    },
    {
      name: "꽃게",
      colesterol: 80,
      fat: 0.9
    },
    {
      name: "닭날개",
      colesterol: 116,
      fat: 15.8
    },
    {
      name: "문어",
      colesterol: 90,
      fat: 0.7
    },
    {
      name: "낙지",
      colesterol: 104,
      fat: 0.5
    },
    {
      name: "새우",
      colesterol: 130,
      fat: 0.5
    },
    {
      name: "계란흰자",
      colesterol: 0,
      fat: 0
    },
    {
      name: "전복",
      colesterol: 135,
      fat: 0.7
    },
    {
      name: "계란",
      colesterol: 470,
      fat: 11.2
    },
    {
      name: "대하",
      colesterol: 159,
      fat: 0.6
    },
    {
      name: "메추리알",
      colesterol: 470,
      fat: 12.5
    },
    {
      name: "미꾸라지",
      colesterol: 164,
      fat: 4.2
    },
    {
      name: "오리알",
      colesterol: 631,
      fat: 14.0
    },
    {
      name: "창란젓",
      colesterol: 165,
      fat: 2.2
    },
    {
      name: "계란노른자",
      colesterol: 1300,
      fat: 31.2
    },
    {
      name: "뱀장어",
      colesterol: 196,
      fat: 21.3
    },
    {
      name: "꼴뚜기",
      colesterol: 241,
      fat: 1.6
    },
    {
      name: "물오징어",
      colesterol: 294,
      fat: 1.0
    },
    {
      name: "저지방우유",
      colesterol: 2,
      fat: 1.5
    },
    {
      name: "명란젓",
      colesterol: 350,
      fat: 2.6
    },
    {
      name: "요구르트",
      colesterol: 8,
      fat: 2.7
    },
    {
      name: "말린오징어",
      colesterol: 847,
      fat: 6.2
    },
    {
      name: "보통우유",
      colesterol: 11,
      fat: 3.2
    },
    {
      name: "무가당연유",
      colesterol: 27,
      fat: 7.9
    },
    {
      name: "아이스크림",
      colesterol: 32,
      fat: 13.9
    },
    {
      name: "초코렛",
      colesterol: 14,
      fat: 36.9
    },
    {
      name: "전지분유",
      colesterol: 78,
      fat: 26.2
    },
    {
      name: "비스킷",
      colesterol: 22,
      fat: 12.9
    },
    {
      name: "치즈",
      colesterol: 80,
      fat: 24.2
    },
    {
      name: "햄버거",
      colesterol: 27,
      fat: 13.1
    },
    {
      name: "파이",
      colesterol: 28,
      fat: 17.2
    },
    {
      name: "페스츄리",
      colesterol: 46,
      fat: 21.9
    },
    {
      name: "옥수수기름",
      colesterol: 0,
      fat: 100
    },
    {
      name: "쿠키",
      colesterol: 71,
      fat: 27.5
    },
    {
      name: "올리브유",
      colesterol: 0,
      fat: 100.0
    },
    {
      name: "파운드케이크",
      colesterol: 89,
      fat: 22.8
    },
    {
      name: "버터",
      colesterol: 200,
      fat: 84.5
    },
    {
      name: "도우넛",
      colesterol: 110,
      fat: 22.7
    },
    {
      name: "마요네즈",
      colesterol: 212,
      fat: 72.5
    },
    {
      name: "카스텔라",
      colesterol: 258,
      fat: 8.5
    }
  ]
  for (let i = 0; i < foodArr.length; i++) {
    if (foodArr[i].name == str) {
      result = foodArr[i]
    }
  }
  return result
}
