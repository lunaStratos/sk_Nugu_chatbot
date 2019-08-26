
/**
세계의 시각 서비스용
For SK NUGU
Written By LunaStratos
https://github.com/lunaStratos
**/

const moment = require('moment-timezone')


exports.nugu_worldtime = (req, res) => {

  const appTitle = '세계의 시간'; // 앱 타이틀

  const requestBody = req.body; //request의 body부분
  //GET 형태 Health 접속시 rerurn;
  if(req.method =='GET') return res.send('Sic enim Deus dilexit mundum, ut Filium suum unigenitum daret: ut omnis qui credit in eum, non pereat, sed habeat vitam æternam.');

  console.log('requestBody ', JSON.stringify(requestBody)) //param log

  const parameters = requestBody.action.parameters; // 파라메터 부분
  const context = requestBody.action.context; //컨텍스트, OAuth연결시 토큰이 들어옵니다
  const actionName = requestBody.action.actionName; // action의 이름

  //현재 시각 메소드
  const nowTime = moment(new Date());
  //마이크 오픈이라고 생각하는 것을 방지하기 위한 사용자 경험용 마지막 물음
  let lastTextArr = ['다음 명령을 말해주세요', '다음 질문이 있으신가요', '이제 어떤 것을 해드릴까요.', '이제 명령을 해 주세요.', '다른 질문이 있으신가요?', '이제 질문해주세요!', '또 궁금하신게 있으신가요?']

  //https://time.is/ko/Vladivostok
  //https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  const weatherCity = [{
    name: '서울',
    code: '226081',
    nation: '한국',
    timezone : 'Asia/Seoul'
  },{
    name: '뉴욕',
    code: '349727',
    nation: '미국',
    timezone : 'America/New_York'
  },{
    name: '도쿄',
    code: '226396',
    nation: '일본',
    timezone : 'Asia/Tokyo'
  },{
    name: '오사카',
    code: '225007',
    nation: '일본',
    timezone : 'Asia/Tokyo'
  },{
    name: '프놈펜',
    code: '49785',
    nation: '캄보디아',
    timezone : 'Asia/Phnom_Penh'
  },{
    name: '모스크바',
    code: '294021',
    nation: '러시아',
    timezone : 'Europe/Moscow'
  },{
    name: '런던',
    code: '328328',
    nation: '영국',
    timezone : 'Europe/London'
  },{
    name: '카이로',
    code: '127164',
    nation: '이집트',
    timezone : 'Africa/Cairo'
  },{
    name: '베이징',
    code: '101924',
    nation: '중국',
    timezone : 'Asia/Shanghai'
  },{
    name: '상하이',
    code: '106577',
    nation: '중국',
    timezone : 'Asia/Shanghai'
  },{
    name: '홍콩',
    code: '1123655',
    nation: '',
    timezone : 'Asia/Hong_Kong'
  },{
    name: '마닐라',
    code: '264885',
    nation: '필리핀',
    timezone : 'Asia/Manila'
  },{
    name: '리우데자네이루',
    code: '45449',
    nation: '브라질',
    timezone : 'America/Sao_Paulo'
  },{
    name: '부에노스아이레스',
    code: '7894',
    nation: '아르헨티나',
    timezone : 'America/Argentina/Buenos_Aires'
  },{
    name: '토론토',
    code: '55488',
    nation: '캐나다',
    timezone : 'America/Montreal'
  },{
    name: '시드니',
    code: '22889',
    nation: '오스트레일리아',
    timezone : 'Australia/Canberra'
  },{
    name: '로스엔젤레스',
    code: '90012',
    nation: '미국',
    timezone : 'America/Los_Angeles'
  },{
    name: '샌프란시스코',
    code: '94103',
    nation: '미국',
    timezone : 'America/Los_Angeles'
  },{
    name: '워싱턴',
    code: '20006',
    nation: '미국',
    timezone : 'America/New_York'
  },{
    name: '로마',
    code: '213490',
    nation: '이탈리아',
    timezone : 'Europe/Rome'
  },{
    name: '파리',
    code: '623',
    nation: '프랑스',
    timezone : 'Europe/Paris'
  },{
    name: '베를린',
    code: '10178',
    nation: '독일',
    timezone : 'Europe/Berlin'
  },{
    name: '리스본',
    code: '274087',
    nation: '포르투갈',
    timezone : 'Europe/Lisbon'
  },{
    name: '뉴델리',
    code: '187745',
    nation: '인도',
    timezone : 'Asia/Calcutta'
  },{
    name: '델리',
    code: '202396',
    nation: '인도',
    timezone : 'Asia/Calcutta'
  },{
    name: '호치민',
    code: '353981',
    nation: '베트남',
    timezone : 'Asia/Ho_Chi_Minh'
  },{
    name: '하노이',
    code: '353412',
    nation: '베트남',
    timezone : 'Asia/Ho_Chi_Minh'
  },{
    name: '멕시코시티',
    code: '242560',
    nation: '멕시코',
    timezone : 'Mexico/General'
  },{
    name: '멜버른',
    code: '26216',
    nation: '오스트레일리아',
    timezone : 'Australia/Canberra'
  },{ // 12.21 추가
    name: '더블린',
    code: '207931',
    nation: '아일랜드',
    timezone : 'Europe/Dublin'
  },{
    name: '애틀란타',
    code: '30303',
    nation: '미국',
    timezone : 'America/New_York'
  },{
    name: '시카고',
    code: '60608',
    nation: '미국',
    timezone : 'America/Chicago'
  },{
    name: '시애틀',
    code: '98104',
    nation: '미국',
    timezone : 'America/Los_Angeles'
  },{
    name: '켄자스시티',
    code: '64106',
    nation: '미국',
    timezone : 'America/Chicago'
  },{
    name: '자카르타',
    code: '',
    nation: '인도네시아',
    timezone : 'Asia/Jakarta'
  },{
    name: '쿠알라룸프루',
    code: '',
    nation: '말레이시아',
    timezone : 'Asia/Kuala_Lumpur'
  },{
    name: '싱가포르',
    code: '300597',
    nation: '',
    timezone : 'Asia/Singapore'
  },{
    name: '카라치',
    code: '',
    nation: '방글라데시',
    timezone : 'Asia/Karachi'
  },{
    name: '라고스',
    code: '',
    nation: '나이지리아',
    timezone : 'Africa/Lagos'
  },{
    name: '이스탄불',
    code: '',
    nation: '터키',
    timezone : 'Asia/Istanbul'
  },{
    name: '뭄바이',
    code: '204842',
    nation: '인도',
    timezone : 'Asia/Calcutta'
  },{
    name: '상파울루',
    code: '',
    nation: '브라질',
    timezone : 'America/Maceio'
  },{
    name: '톈진',
    code: '',
    nation: '중국',
    timezone : 'Asia/Shanghai'
  },{
    name: '타이페이',
    code: '',
    nation: '타이완',
    timezone : 'Asia/Taipei'
  },{
    name: '가오슝',
    code: '',
    nation: '타이완',
    timezone : 'Asia/Taipei'
  },{
    name: '광저우',
    code: '',
    nation: '중국',
    timezone : 'Asia/Shanghai'
  },{
    name: '라호르',
    code: '22143',
    nation: '파키스탄',
    timezone : 'Asia/Karachi'
  },{
    name: '카라치',
    code: '',
    nation: '파키스탄',
    timezone : 'Asia/Karachi'
  },{
    name: '테헤란',
    code: '210841',
    nation: '이란',
    timezone : 'Asia/Tehran'
  },{
    name: '방콕',
    code: '318849',
    nation: '타이',
    timezone : 'Asia/Bangkok'
  },{
    name: '다카',
    code: '297442',
    nation: '방글라데시',
    timezone : 'Africa/Dakar'
  },{
    name: '보고타',
    code: '107487',
    nation: '콜롬비아',
    timezone : 'America/Bogota'
  },{
    name: '리야드',
    code: '297030',
    nation: '사우디아라비아',
    timezone : 'Asia/Riyadh'
  },{
    name: '상트페테르부르크',
    code: '295212',
    nation: '러시아',
    timezone : 'Europe/Moscow'
  },{
    name: '앙카라',
    code: '316938',
    nation: '터키',
    timezone : 'Asia/Istanbul'
  },{
    name: '양곤',
    code: '246562',
    nation: '미얀마',
    timezone : 'Asia/Rangoon'
  },{
    name: '알렉산드리아',
    code: '126995',
    nation: '이집트',
    timezone : 'Africa/Cairo'
  },{
    name: '케이프타운',
    code: '306633',
    nation: '남아프리카 공화국',
    timezone : 'Africa/Johannesburg'
  },{
    name: '마드리드',
    code: '308526',
    nation: '스페인',
    timezone : 'Europe/Madrid'
  },{
    name: '아디스아바바',
    code: '126831',
    nation: '에티오피아',
    timezone : 'Africa/Addis_Ababa'
  },{
    name: '나이로비',
    code: '224758',
    nation: '케냐',
    timezone : 'Africa/Nairobi'
  },{
    name: '바르샤바',
    code: '274663',
    nation: '폴란드',
    timezone : 'Europe/Warsaw'
  },{
    name: '뮌헨',
    code: '80331',
    nation: '독일',
    timezone : 'Europe/Berlin'
  },{
    name: '프라하',
    code: '125594',
    nation: '체코',
    timezone : 'Europe/Prague'
  },{
    name: '나폴리',
    code: '212466',
    nation: '이탈리아',
    timezone : 'Europe/Rome'
  },{
    name: '밀라노',
    code: '214046',
    nation: '이탈리아',
    timezone : 'Europe/Rome'
  },{
    name: '룩셈부르크',
    code: '228714',
    nation: '',
    timezone : 'Europe/Luxembourg'
  },{
    name: '부다페스트',
    code: '187423',
    nation: '헝가리',
    timezone : 'Europe/Budapest'
  },{
    name: '쾰른',
    code: '50667',
    nation: '독일',
    timezone : 'Europe/Berlin'
  },{
    name: '바르셀로나',
    code: '307297',
    nation: '스페인',
    timezone : 'Europe/Madrid'
  },{
    name: '암스테르담',
    code: '249758',
    nation: '네덜란드',
    timezone : 'Europe/Amsterdam'
  },{
    name: '브뤼셀',
    code: '27581',
    nation: '벨기에',
    timezone : 'Europe/Brussels'
  },{
    name: '오미야콘',
    code: '571464',
    nation: '러시아',
    timezone : 'Asia/Vladivostok'
  },{
    name: '블라디보스토크',
    code: '',
    nation: '러시아',
    timezone : 'Asia/Vladivostok'
  },{
    name: '그리니치',
    code: '',
    nation: '영국',
    timezone : 'Europe/London'
  },{
    name: '하와이',
    code: '',
    nation: '미국',
    timezone : 'Pacific/Honolulu'
  }]

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


  let output = {}; //parameter를 저장할 output변수, 자주 사용하는 관계로 상단에 선언합니다.

  /**
   * [makeJson description]
   * response에 보낼 json을 만드는 부분입니다.
   * parameter에 데이터를 저장을 합니다.
   */
  function makeJson(jsons) {
    /**
     * [makeJson 설명]
     * @json {jsons}
     * 안에는 누구로 보낼 json들이 있습니다
     * json안에는 파라메터들이 있으며, 각 파라메터는 sk nugu의 play에서 지정한
     * 이름과 동일해야 합니다.
     */
    let jsonReturn = {
      "version": "2.0",
      "resultCode": "OK",
      "directives": {
        "AudioPlayer": {
          "type": "AudioPlayer.Play",
          "audioitems": {
            "stream": {
              "url": "",
              "offsetInMilliseconds": "",
              "progressReport": {
                "progressReportDelayInMilliseconds": "",
                "progressReportIntervalInMilliseconds": ""
              },
              "token": "",
              "expectedPreviousToken": ""
            },
            "metadata": {}
          }
        }
      }

    }
    jsonReturn.output = jsons
    console.log('output => ' , jsons)
    return res.send(jsonReturn);
  } //makeJson

  //시간 리스폰스
  function worldtime_function() {
    const cityName = (parameters.cityName.value).replace(/(\s*)/g, "");
    let speechText = '';

    let cityJson = weatherCity.find(item => {
      return item.name == cityName;
    });

    //undefined 일때 includes로 검색: 있으면 true, 없으면 false
    if (cityJson == undefined) {
       cityJson = weatherCity.find(item => {
          if ((item.name).includes(cityName)) {
            return item.name
          }
      });
    }
    console.log('ok! cityJson => ' , cityJson)

    const timeStrWeek = nowTime.tz(cityJson.timezone).format('d')
    const timeAmPm = nowTime.tz(cityJson.timezone).format('a')
    let dayOfTheWeek = ''
    var week = new Array('일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일');

    let ampm = ''

    switch (timeAmPm) {
      case 'am':
        ampm  = ' 오전'
        break;
      case 'pm':
        ampm  = ' 오후'
          break;
      default:

    }

    const timeStr = nowTime.tz(cityJson.timezone).format('M월 D일')  +',  '+ ampm +', ' + nowTime.tz(cityJson.timezone).format('h시 m분')+ ', ' +week[parseInt(timeStrWeek)]


    //Response
    speechText = [
        ('현재 ' + cityJson.nation + ', ' + cityJson.name + '의 시각은, ' + timeStr + ' 입니다. '),
        ('지금 ' + cityJson.nation + ', ' + cityJson.name + '의 시각은, ' + timeStr + ' 입니다. '),
        ('현재의 ' + cityJson.nation + ', ' + cityJson.name + ' 시각은, ' + timeStr + ' 입니다. '),
        ('지금 ' + cityJson.nation + ', ' + cityJson.name + ' 시각은, ' + timeStr + ' 입니다. ')
    ]

    output.worldclock = shuffle(speechText)[0] + shuffle(lastTextArr)[0];

    makeJson(output)

  } //


  //액션 선언 모음, 여기서 액션을 선언해 줍니다.
  const ACTION_NOWWEATHER = 'action.worldtime';

  // Intent가 오는 부분, actionName으로 구분합니다.
  // case안에서 작동할 function을 적습니다.
  switch (actionName) {
    case ACTION_NOWWEATHER:
      return worldtime_function()
      break;

  }



};
