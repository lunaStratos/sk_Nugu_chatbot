const nuguApp = require('nugujs'); // nugujs 모듈 사용.
const randomField = require('randomize');
const request = require('request');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const Promise = require('promise');
var convert = require('convert-units')
var kanjidate = require("kanjidate");


exports.nugu_etc = (req, res) => {
  const nugu = nuguApp(req, res); //request와 response를 넣어줌
  let output = {}; //parameter를 위한 output

  //앱 타이틀 (전역으로 사용)
  const appTitle = '기타'
  //마지막 마이크 오픈 방지
  const lastConv = randomField(
    '이제 하실말을 해 주세요.',
    '또 어떤것을 찾을까요.',
    '다음 명령을 말해주세요.'
  )

  //시간 설정
  const timeUTC = 9 * 3600000 // GCP 앱 엔진에 따른 KST에 맞추기(+9)
  let d = new Date(new Date().getTime() + timeUTC) // GCP 앱 엔진에 따른 KST 시각 조정

  //각종 원샷 계열 모음
  const teaInformation = [{
    name: '케모마일차',
    code: '1',
    info: '불면증을 앓고 있다면 좋은 케모마일 차는 정신적 긴장을 완화시켜 주는 효능이 있습니다. 또한  피부개선을 돕습니다. ',
    etc: ''
  }, {
    name: '캐모마일차',
    code: '1',
    info: '불면증을 앓고 있다면 좋은 캐모마일 차는 정신적 긴장을 완화시켜 주는 효능이 있습니다. 또한  피부개선을 돕습니다. ',
    etc: ''
  }, {
    name: '페퍼민트차',
    code: '1',
    info: '페퍼민트 차는 열감기에 특히 좋다고 알려져 있습니다. 미열이 잘 안떨어진다면 추천합니다. ',
    etc: ''
  }, {
    name: '레몬차',
    code: '1',
    info: '목감기에 좋으며, 두통과 빈혈에 좋은 레몬차는 체내에 쌓인 노폐물을 빠져나가게 하는 효능을 가지고 있습니다. ',
    etc: ''
  }, {
    name: '루이보스차',
    code: '1',
    info: '루이보스차는 카페인이 없어서 어린이도 마실수 있습니다. 알레르기의 완화와 노화방지, 피부미용에 좋습니다. ',
    etc: ''
  }, {
    name: '자스민차',
    code: '1',
    info: '자스민차는 편두통을 완화시켜주며 비장과 위장의 기능을 돕습니다. 그래서 설사와 복통 생리통에 좋습니다. ',
    etc: ''
  }, {
    name: '메밀차',
    code: '1',
    info: '수용성 식이섬유가 있어 변비에 도움을 주며, 체중감량에 도움을 주는 항산화 물질이 있습니다. ',
    etc: ''
  }, {
    name: '대추차',
    code: '1',
    info: '대추차는 신장의 기능을 도와 이뇨작용을 촉진합니다. 그래서 나트륨을 원할하게 배출하며 부기에 효과가 있습니다. 다만 당분이 있어서 당뇨병이 있으신 분들은 조심하세요. ',
    etc: ''
  }, {
    name: '라벤더차',
    code: '1',
    info: '라벤더 차는 수면에 도움을 주며 스트레스의 완화와 심신안정의 효과가 있습니다. ',
    etc: ''
  }, {
    name: '녹차',
    code: '1',
    info: '가장 대중적인 녹차는 항산화와 항암성분이 있으며 카테킨과 타닌성분이 있어 피부노화의 방지의 효능과 소염효능이 있습니다. ',
    etc: ''
  }, {
    name: '우롱차',
    code: '1',
    info: '우롱차는 소화를 돕는 효능이 있습니다. 또한 충치와 입냄새의 예방에 좋으며 노화방지에 효능이 있답니다. ',
    etc: ''
  }, {
    name: '홍차',
    code: '1',
    info: '홍차에는 폴리페놀이 풍부하여 항산화효과가 있습니다. 또한 장내 유해균 억제에 효과가 있어 장 트러블이 자주 있다면 마시는 것을 추천합니다. ',
    etc: ''
  }, {
    name: '보이차',
    code: '1',
    info: '보이차는 발효도가 높은 차로, 지방분해 효과가 있습니다. 또한 숙취해소와 혈압조절, 염증완화와 살균작용이 있다고 하네요. ',
    etc: ''
  }, {
    name: '감잎차',
    code: '1',
    info: '감잎차에는 레몬의 20배의 비타민C가 있어 피부노화를 방지하며 여드름 개선, 그리고 이뇨작용을 도와 붓기제거에 탁월합니다. ',
    etc: ''
  }, {
    name: '도라지차',
    code: '1',
    info: '감기에 좋은 도라지차는 기침, 가래, 염증을 완화하는 효능이 있습니다. 도라지의 사포닌은 점막을 촉촉하게 하여 호흡기 건강에 도움을 줍니다. ',
    etc: ''
  }, {
    name: '모과차',
    code: '1',
    info: '모과차는 근육 이완 효과가 있을 뿐 아니라 신경통, 근육통, 빈혈 치료에도 도움이 됩니다. 사포닌, 구연산, 비타민 C, 플라보노이드 등이 풍부해 환절기 감기 예방과 피로 회복에도 효과적이며 설사를 멎게 하는 효능도 있습니다. ',
    etc: ''
  }, {
    name: '보리차',
    code: '1',
    info: ' 구수한 맛의 보리차에는 식욕을 떨어뜨리는 효과가 있는데요. 영양소가 풍부하고 포만감을 줘 다이어트 식품으로도 제격입니다. 이 외에도 섬유소가 풍부해 변비 예방에도 효과적입니다. ',
    etc: ''
  }, {
    name: '생강차',
    code: '1',
    info: '생강차에는 감기 예방 효과가 있습니다. 생강의 매운맛을 내는 진저롤과 쇼가올이 티푸스균이나 콜레라균에 강한 살균작용을 하기 때문인데요. 따라서 감기 기운이 돌 때 생강차를 마셔주면 좋습니다. ',
    etc: ''
  }, {
    name: '오미자차',
    code: '1',
    info: '오미자차는 만성 천식, 기침, 가래 등에 특효이며 갈증 해소, 스트레스 해소, 집중령 향상, 불면증에 도움이 됩니다. 오미자는 여성에게도 매우 좋은데요. 자궁을 튼튼하게 해줘 임신을 준비 중이신 분들에게 좋습니다. ',
    etc: ''
  }, {
    name: '우엉차',
    code: '1',
    info: '우엉 속 풍부한 섬유질소는 배변을 촉진합니다. 체내에 쌓인 나쁜 성분을 배출하고 콜레스테롤 수치를 낮추어 변비를 예방하기 때문에 다이어트에 효과적입니다. ',
    etc: ''
  }, {
    name: '유자차',
    code: '1',
    info: '유자차는 레몬보다 비타민 C 함유량이 3배가량 높습니다. 이는 몸의 면역력을 높이고, 피로 해소에도 도움을 주며, 환절기 감기 예방에도 효과적입니다.  이외에 혈액순환, 통증완화, 노폐물 배출, 피부미용에도 큰 도움을 준다고 합니다. ',
    etc: ''
  }, {
    name: '천일홍차',
    code: '1',
    info: '천일홍차는 꽃잎과 차색이 아름다운 꽃차인데요. 꽃이 피어 있는 기간이 길고, 말라도 색이 오랜 기간 변하지 않아 눈으로 즐기기에도 좋습니다. 천일홍차는 대뇌 흥분작용을 통해 우울할 때 정신안정에 도움을 줍니다. ',
    etc: ''
  }, ]

  //Array를 랜덤하게 바꿔주는 shuffle fucntion
  function shuffle(array) {
    var i = 0,
      j = 0,
      temp = null

    for (i = array.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1))
      temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array;
  } // shuffle



  //액션 선언 모음, 여기서 액션을 선언해 줍니다.

  const teainfo = () => {

    const teaName = (nugu.get('teaname')).replace(' ', '')
    console.log('teaName: ', teaName)
    let getJson = teaInformation.find(item => {
      return item.name == teaName;
    });

    //undefined 일때 includes로 검색: 있으면 true, 없으면 false
    if (getJson == undefined) {
      getJson = teaInformation.find(item => {
        if ((item.name).includes(teaName)) {
          return item.name
        }
      });
    }
    console.log('ok! Json => ', getJson)
    let speechText = getJson.info
    output.teaspeech = speechText
    nugu.say(output)
  } // end function

  //=============================moon==================================

  function getTerminalGateXmlConnect(dateStr, callback) {
    console.log("dateStr: " + dateStr);
    const moonDateStr = dateStr.split('-')
    let url = "http://apis.data.go.kr/B090041/openapi/service/LunPhInfoService/getLunPhInfo?serviceKey=aAfuvIitnAf6ckcIREyJXGfFEDWy7dah3nWnhgcGoL0%2BqCpEgu4MWRBmY89qcQvJreZBb%2F7Npm0MGsBjv6Es3Q%3D%3D&solYear=" + moonDateStr[0] + "&solMonth=" + moonDateStr[1] + "&solDay=" + moonDateStr[2] + "";
    console.log("url: " + url);
    // Get xml data
    request({
      url: url,
      encoding: null,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
      }
    }, function(err, resp, body) {
      if (err) {
        callback(err, {
          code: 400,
          name: '',
          status: 'fail'
        });
        return;
      }
      // xml parsing section
      let xml = body.toString();
      console.log("body: " + body.toString());
      parser.parseString(xml, function(err, result) {
        console.log(JSON.stringify(result));
        const lunAge = result.response.body[0].items[0].item[0].lunAge[0]
        callback(null, {
          code: 200,
          moonage: lunAge
        });

      });
    });

  } //getStationXmlConnect

  const asyncTask = (dateStr) => new Promise(function(resolved, rejected) {
    getTerminalGateXmlConnect(dateStr, function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });


  //promiseXmlConnect
  function promiseXmlConnect(dateStr) {
    return new Promise(function(resolved, rejected) {
      getTerminalGateXmlConnect(dateStr, function(err, result) {
        if (err) {
          rejected(err);
        } else {
          resolved(result);
        }
      });
    });
  } //promiseXmlConnect


  const mooninfo = () => {
    let moonmonth = ('0' + (nugu.get('month'))).slice(-2)
    let moonday = ('0' + (nugu.get('day'))).slice(-2)
    console.log('moonmonth: ', moonmonth)
    console.log('moonday: ', moonday)

    if (isNaN(moonmonth)) {
      moonmonth = ('0' + (d.getMonth() + 1)).slice(-2)
      moonday = ('0' + d.getDate()).slice(-2)
    }

    const moonDate = d.getFullYear() + '-' + moonmonth + '-' + moonday

    console.log('moonDate : ', moonDate)
    let speechText = moonDate

    return asyncTask(moonDate)
      .then(function(result) {

        console.log("result : " + JSON.stringify(result));
        let resultMoonStr = ''
        if (result.code != 200) {
          speechText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + lastConv;
        } else { // no problem

          switch (parseInt(result.moonage)) {
            case 1:
              resultMoonStr = '  그믐달이네요. '
              break;
            case 4:
              resultMoonStr = '  초승달이네요. '
              break;
            case 7:
              resultMoonStr = '  반달이네요. '
              break;
            case 15:
              resultMoonStr = '  보름달이네요. '
              break;
            case 22:
              resultMoonStr = '  반달이네요. '
              break;
            case 26:
              resultMoonStr = '  초승달이네요. '
              break;
            case 29:
              resultMoonStr = '  그믐달이네요. '
              break;
          }
          speechText = moonmonth + '월' + moonday + '일 의 월령 정보는, ' + result.moonage + ', 입니다. ' + resultMoonStr + lastConv;
        } //if

        console.log(speechText)
        output.moonresult = speechText
        nugu.say(output)
      });


  } // end function

  const todaymoon = () => {

    //시간 설정``
    const moonDate = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2)

    console.log('moonDate : ', moonDate)
    let speechText = moonDate

    return asyncTask(moonDate)
      .then(function(result) {

        console.log("result : " + JSON.stringify(result));
        let resultMoonStr = ''
        if (result.code != 200) {
          speechText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + lastConv;
        } else { // no problem

          switch (parseInt(result.moonage)) {
            case 1:
              resultMoonStr = ' 오늘은 그믐달이네요. '
              break;
            case 4:
              resultMoonStr = ' 오늘은 초승달이네요. '
              break;
            case 7:
              resultMoonStr = ' 오늘은 반달이네요. '
              break;
            case 15:
              resultMoonStr = ' 오늘은 보름달이네요. '
              break;
            case 22:
              resultMoonStr = ' 오늘은 반달이네요. '
              break;
            case 26:
              resultMoonStr = ' 오늘은 초승달이네요. '
              break;
            case 29:
              resultMoonStr = ' 오늘은 그믐달이네요. '
              break;
          }
          speechText = '오늘의 월령 정보는, ' + result.moonage + ', 입니다.' + resultMoonStr + lastConv;
        } //if

        output.todaymoonresult = speechText
        nugu.say(output)
      });


  } // end function

  const convDb = [{
    name: '섭씨',
    value: 'C'
  }, {
    name: '화씨',
    value: 'F'
  }, {
    name: '미터',
    value: 'm'
  }, {
    name: '미리미터',
    value: 'mm'
  }, {
    name: '인치',
    value: 'in'
  }, {
    name: '피트',
    value: 'ft'
  }, {
    name: '마일',
    value: 'mi'
  }, {
    name: '평',
    value: 'pyung'
  }, {
    name: '제곱미터',
    value: 'm2'
  }, {
    name: '리터',
    value: 'l'
  }, {
    name: '갤런',
    value: 'gal'
  }, {
    name: '파인트',
    value: 'pnt'
  }, {
    name: '킬로그램',
    value: 'kg'
  }, {
    name: '그램',
    value: 'g'
  }, {
    name: '온즈',
    value: 'oz'
  }, {
    name: '파운드',
    value: 'lb'
  }]

  function function_translate() {
    const translateOriginal = parseInt(nugu.get('numorigin')) //기존 숫자
    const original = (nugu.get('original')).replace(' ', '') // 기존단위
    const purpose = (nugu.get('purpose')).replace(' ', '') //새로운 단위


    let originalGetjson = convDb.find(item => {
      return item.name == original;
    });
    let purposeGetjson = convDb.find(item => {
      return item.name == purpose;
    });

    let speechText = '말씀하신 ' + translateOriginal + ' ' + original + '은, '

    if (original == '평' || purpose == '평') { //무조건 제곱미터로 계산
      if (original == '평') {
        speechText += (translateOriginal * 3.30579).toFixed(3) + '제곱미터'
      }
      if (purpose == '평') {
        speechText += (translateOriginal / 3.30579).toFixed(3) + '평'
      }

    } else {
      speechText += (convert(translateOriginal).from(originalGetjson.value).to(purposeGetjson.value)).toFixed(3) + purpose
    }

    speechText += ' 입니다. ' + lastConv

    output.translateResult = speechText
    nugu.say(output)
  }

  //일본연호 변환기
  function function_japantrans() {
    const year = nugu.get('year') //기존 숫자
    const month = ('0' + (nugu.get('month')).slice(-2))
    const day = ('0' + (nugu.get('day')).slice(-2))

    let stringDate = ''
    if (nugu.get('year') == undefined && nugu.get('month') == undefined && nugu.get('day') == undefined) {
      //오늘의 날짜
      stringDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
    } else if (nugu.get('year') != undefined && nugu.get('month') != undefined && nugu.get('day') == undefined) {
      //일이 없음
      stringDate = year + '-' + month + '-' + '01';
    } else if (nugu.get('year') != undefined && nugu.get('month') == undefined && nugu.get('day') == undefined) {
      //년도만 말함.
      stringDate = year + '-' + '01' + '-' + '01';
    }

    //변환 모듈

    let speechText = year + '년' + month + '월' + day + '일의 일본연호 날짜는 ';

    speechText += kanjidate.format(stringDate); // -> "平成28年6月12日（日）"
    speechText += '입니다. ' + lastConv;

    output.japantrans = speechText;
    nugu.say(output);

  }

  // Intent가 오는 부분, actionName으로 구분합니다.
  // case안에서 작동할 function을 적습니다.
  console.log('Action name: ', nugu.name())

  const ACTION_TEA = 'action.teainfo';
  const ACTION_MOON = 'action.mooninfo';
  const ACTION_TODAYMOON = 'action.todaymoon';

  const ACTION_TRANSLATE = 'action.translate';
  const ACTION_JAPANTRANS = 'action.japantrans';

  switch (nugu.name()) {
    //오늘의 차
    case ACTION_TEA:
      return teainfo()
      break;
      //루나마스터
    case ACTION_MOON:
      return mooninfo()
      break;
      //루나마스터
    case ACTION_TODAYMOON:
      return todaymoon()
      break;
      //단위변환
    case ACTION_TRANSLATE:
      return function_translate()
      break;
      //일본연호
    case ACTION_JAPANTRANS:
      return function_japantrans()
      break;
  }


};
