'use strict';

//누구용으로 만들어진 템플레이트
//*******************주의사항*******************
//폴더명 수정 후 exports.nugu_template 이름 수정할것
const randomField = require('randomize');

exports.nugu_todaywise = (req, res) => {
  const appTitle = '투데이명언' // 앱 타이틀
  let output = {}; //parameter를 위한 output
  const requestBody = req.body; //request의 body부분
  const parameters = requestBody.action.parameters; // 파라메터 부분
  const context = requestBody.action.context; //컨텍스트, OAuth연결시 토큰이 들어옵니다
  const actionName = requestBody.action.actionName; // action의 이름
  console.log('requestBody ', requestBody);

  /**
   * 명언 말하는 부분
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
   return res.send(jsonReturn);
 } //makeJson

  function wise_intent() {
    const randomHouse = randomField(
      "가능의 한계를 알기 위한 유일한 방법은 불가능의 영역에 살짝 발을 들여 놓아 보는 것. \n- 아서 클라크",
      "가장 큰 약점은 약점을 보일 것에 대한 두려움이다. \n- 보쉬에, 1709",
      "갓 태어난 아기가 무슨 쓸모가 있겠습니까? \n- 마이클 패러데이, 새로 발견한 전기가 대체 무슨 쓸모가 있느냐는 빅토리아 시대 사람들의 말에",
      "개가 아무리 유창하게 짖어도 제 부모가 가난했지만 정직했었노라고 말할 수 없다.  \n- 버트런드 러셀",
      "개가 짖어도 기차는 달릴 수밖에 없다. \n- 김영삼, 하나회를 숙청하면서 ",
      "개에게 물린 상처는 개를 죽인다고 아물지 않는다. \n- 에이브러햄 링컨",
      "개 한 마리를 훔치면 불인이라고 한다. 그런데도 한 나라를 훔치고 이를 의라고 한다. \n- 묵자 ",
      "개가 날 보고 짖는다고 그 개를 죽이진 않겠소. \n- 베스파시아누스 황제, 자신을 공격하는 그리스 철학자들을 바라보며.",
      "거만한 사과란 모욕이나 다름없다. \n- 길버트 체스터턴",
      "거짓과 더불어 제정신으로 사느니, 진실과 더불어 미치는 쪽을 택하고 싶다. \n- 버트런드 러셀",
      "고르바초프 서기장, 이 문을 여시오! 고르바초프 서기장, 이 장벽을 무너뜨리시오! \n- 로널드 레이건, 1987년 6월 12일, 독일 방문시 서베를린에서 행한 연설 중에서.",
      "과거는 서막에 불과하다. \n- 윌리엄 셰익스피어, <템페스트>, 그러나 이 말은 작중에서 결코 좋은 뜻으로 등장한 말이 아니다",
      "과거를 기억 못하는 이들은 과거를 반복하기 마련이다. \n- 조지 산타야나, <이성의 삶>, 1905년",
      "과학에는 국경이 없다. 하지만 과학자에게는 조국이 있다. \n- 루이 파스퇴르, 보불전쟁이 발발하자 프로이센 국왕으로부터 받았던 훈장을 돌려보내면서",
      "관찰하는데 있어서는 준비된 자에게만 기회가 온다. \n-루이 파스퇴르",
      "괴물과 싸우는 사람은 그 싸움 속에서 스스로도 괴물이 되지 않도록 조심해야 한다. 우리가 괴물의 심연을 오래동안 들여다 본다면, 그 심연 또한 우리를 들여다 보게될 것이다. \n- 프리드리히 니체, 《선악의 저편》 중에서",
      "괴짜들에게 잘해주어라. 나중에 그들 밑에서 일할 날이 올지도 모른다. \n- 빌 게이츠",
      "국민의, 국민에 의한, 국민을 위한 정부는 지구상에서 사라지지 않을 것이다. \n- 에이브러햄 링컨의 게티즈버그 연설중 일부",
      "국민은 언제나 승리하는 것은 아닙니다. 그러나 마지막 승리자는 국민입니다. \n- 김대중",
      "국민을 비굴하게 만드는 정치가 가장 나쁜 정치다. \n- 마하트마 간디",
      "국제 사회에서는 영원한 우방도, 영원한 적도 없다. \n- 한스 모겐소, 미국 시카고 대학교 교수",
      "군대는 배가 불러야 움직인다.  \n- 나폴레옹 보나파르트.",
      "굶주린 개를 주워 잘 돌보면 그 개는 절대 당신을 물지 않을 것이다. 이 점이 바로 인간과 개의 근본적인 차이점이다. \n- 마크 트웨인",
      "그간 우리에게 가장 큰 피해를 끼친 말은 바로 ‘지금껏 항상 그렇게 해왔어’라는 말이다. \n- 그레이스 호퍼",
      "그게 내 일이었다. 마침 적절한 시간에 내가 할 일을 한 것, 그뿐이다. \n- 스타니슬라프 페트로프, 우발적 핵전쟁 경보를 막은 분.",
      "그대가 읽을 수만 있다면 영원히 자유가 되리라. \n- 프레더릭 더글러스, 미국의 노예 출신의 흑인 정치가이자 문인.",
      "근로기준법을 준수하라! 우리는 기계가 아니다! 일요일은 쉬게 하라! 노동자들을 혹사하지 말라! 내 죽음을 헛되이 하지 말라! \n- 전태일 열사, 1970년 11월 분신자결하며",
      "끝날 때까지는 끝난 게 아니다. \n- 요기 베라",
      "기억은 생명체와 같다. \n- 아리 폴만",
      "기업의 생명은 신용이다. \n- 유일한",
      "나(지식인)는 개와 같아서, 사람들이 깨든 안 깨든 도둑을 보고 밤새 짖었다. \n- 마상백",
      "나는 군사적 명성이라는 것에 대해 이해하고 있는것 같아. 그건 네가 전투에서 네 이름이 신문에 잘못 적히는 거지. \n- 윌리엄 테쿰세 셔먼",
      "나는 길을 찾든지 만들든지 하겠다. \n- 한니발",
      "나는 내 생명을 내걸고 그대들과 함께 피를 흘릴 준비가 되어 있다. \n- 구스타브 2세 아돌프",
      "나는 네가 흑인인지 백인인지, 이성애자인지 양성애자인지 게이인지 레즈비언인지, 키가 작은지 큰지, 뚱뚱한지 마른지, 부자인지 가난한지에 대해 신경쓰지 않아. 네가 나에게 친절하면 나 역시 너에게 친절할 뿐이지. 간단하잖아 \n- 에미넴",
      "나는 생각한다 고로 나는 존재한다. \n- 르네 데카르트, 방법서설에서",
      "나는 아직도 배가 고프다 \n- 거스 히딩크, 2002 한일 월드컵에서 대한민국 대표팀을 16강에 진출시킨 뒤 한 인터뷰에서",
      "나는 자신의 창조물을 포상하고 징벌한다든지, 우리와 이해할 수 있는 의지를 지닌다는 신을 상상할 수조차 없다. \n- 알베르트 아인슈타인",
      "나는 적에 맞서 백성을 편안케 한다는 말은 들었어도, 백성을 움직여 적을 피한다는 말은 듣지 못했다. \n- 유장",
      "나는 평화로운 노예로 사느니, 차라리 위험천만한 자유를 택하겠다. \n- 토머스 제퍼슨",
      "나는 천체의 운동을 계산할 수 있지만 사람들의 광기를 계산하지는 못한다. \n- 아이작 뉴턴, 남해거품사건때 엄청난 손해를 보고서 한말",
      "나로 말하자면, 나는 내가 아무것도 모른다는 것만을 알 뿐이네. \n- 소크라테스, 플라톤의 국가론에서",
      "나를 따라오라, 내가 너희로 사람을 '낚는' 어부가 되게 하리라. \n- 예수 그리스도, 마태복음 4장 19절",
      "나를 죽일 수는 있어도 정의를 죽일 수는 없다. \n- 오스카 로메로, 엘살바도르의 대주교. 이 말은 정부에 비판적이었던 그가 죽기전에 남긴 마지막 설교에서 나온 말이다.",
      "나에게 영웅을 보여라, 비극을 써줄테니. \n- F. 스콧 피츠제럴드",
      "나에게는 꿈이 있습니다. 언젠가는 조지아의 붉은 언덕 위에 옛 노예의 후손들과 옛주인의 후손들이 형제애의 식탁에 함께 둘러앉는 날이 오리라는 꿈입니다. \n- 마틴 루터 킹",
      "여기에 들어오는 그대, 모든 희망을 버려라. \n-  단테 알리기에리, 신곡의 지옥편",
      "내가 멀리 볼수 있었던 것은 오직 거인의 어깨위에 있었기 때문이다. \n- 아이작 뉴턴",
      "내가 정치와 전쟁에 관해 배우는건 나의 아이들에게 수학이나 철학을 배울 자유를 남기기 위함이다. \n- 존 애덤스",
      "내가 천하를 등질지언정 천하가 나를 등지게는 하지 않겠소. \n- 조조",
      "내가 우주의 비밀을 쫓고 있는데 백만달러를 쫓겠는가? \n- 그리고리 페렐만,  푸앵카레 추측을 푼 페렐만이 백만달러의 상금을 거부한 이유를 묻자 대답한 말.",
      "내게 죽어야 할 의리는 없지만, 다만 국가에서 500년이나 선비를 길러왔는데, 나라가 망할 때에 국난을 당하여 죽는 사람이 하나도 없다는 것이 어찌 원통치 않겠는가? \n- 매천야록의 저자 황현의 절명시 중",
      "내 키를 땅에서부터 재면 누구보다 작아도, 하늘로 부터 재면 누구보다 크다. \n- 나폴레옹",
      "너는 어찌하여 닭을 잡는데 소 잡는 칼을 썼느냐? \n- 공자",
      "네가 좋아하지 않는 사람들을 생각하는데는 단 1분도 허비하지 마라. \n- 드와이트 D. 아이젠하워",
      "너희들은 이방인들이 하는 것처럼 빈말을 반복하지 말아라. 그들은 말을 많이 해야만 들어주시는지 안다. 하나님께서는 너희가 구하기도 전에 무얼 구하시는지 알고 계신다. \n- 예수 그리스도",
      "널리 배우고, 의문이 있으면 곧 묻고, 삼가 깊이 생각하며, 밝게 분변하고, 곧 이를 독실히 행하라. \n- 중용에서",
      "네가 싫어하는 것을 남에게 베풀지 마라. \n- 공자",
      "네가 헛되이 보낸 오늘은 어제 죽은 이가 그토록 갈망하던 내일이다. \n- 소포클레스",
      "네 가지 종류의 인간들이 있다. 멍청한데 부지런한 사람, 똑똑한데 게으른 사람, 멍청하면서 부지런하지도 않은 사람, 똑똑하면서 부지런한 사람. \n- 파스칼, 《팡세》",
      "노병은 죽지 않는다. 다만 사라질 뿐이다. \n- 어느 군가의 후렴구",
      "누군가 망상에 시달리면 정신 이상이라고 한다. 다수가 망상에 시달리면 종교라고 한다. \n- 로버트 퍼시그",
      "누구나 빵을 먹을 수 있을 때까지, 아무도 케이크를 먹어서는 안 된다. \n- 해럴드 래스키",
      "누구든 진실과 지식의 분야에서 자신을 판사라 생각하는 자는 신들의 웃음소리에 의해 박살날 것이다. \n- 에드먼드 버크",
      "눈물을 흘리며 씨를 뿌리는 자는 기쁨으로 거두리로다. \n- 성경, 시편 126:5",
      "다른 증명이 없다면, 전방의 소대장이 올바르고, 후방의 사령관이 틀렸다. \n- 콜린 파월",
      "달리는 기차 위에 중립은 없다. \n- 하워드 진",
      "당신들은 노동자들에게 가시 돋힌 왕관을 씌울 수 없습니다. 당신들은 인류를 황금의 십자가에 못 박을 수 없습니다. \n- 윌리엄 제닝스 브라이언, 1896년 미국 민주당 대선 전당대회에서, 금본위제를 옹호하는 사람들에 대해 반론하면서.",
      "당신은 당신이 생각하는 대로 살아야 한다. 그러지 않으면 머지않아 당신은 사는 대로 생각하게 될 것이다. \n- 폴 부르제, 한낮의 악마",
      "당신이 가진 생각이 딱 하나밖에 없다면, 그것만큼 위험한 것은 없다. \n- 에밀 사르티에, 종교론,",
      "대의명분이 있다면 테러리스트라 불릴 수 없다. \n- 야세르 아라파트 팔레스타인 해방기구 의장, 1994년 노벨평화상 수상자",
      "더 이상 내 다리는 달릴 수 없지만 나에게는 아직 두 팔이 남아 있다. \n- 최초로 마라톤 올림픽 금메달 2연패를 달성한 아베베 비킬라. 사고로 두 다리를 잃은 후, 장애인 올림픽 마라톤에 출전하여 메달을 따낸다.",
      "더 이상 추가할 것이 없을 때가 아니라 더 이상 뺄 것이 없을 때, 완벽함이 성취된다. \n- 앙투안 드 생텍쥐페리",
      "두렵지 않기 때문에 나서는 것이 아닙니다. 두렵지만, 나서야 하기 때문에 나서는 것입니다. 그게 참된 용기 입니다. \n- 김대중, 1987년 9월 8일 광주 그랜드 호텔 간담회에서",
      "로켓을 발사할때, 당신이 진정으로 그 로켓을 조정하고 있지는 않아. 당신은 그냥 그 로켓에 매달린 수준이야 \n- 마이클 P. 앤더슨",
      "라벨을 붙이고 포장해서 대량 생산할 수 있다면, 그것은 진실도 아니요, 예술도 아니다. \n- 마티 루빈",
      "마지막 순간은 우리의 것입니다. 이 고통은 우리의 승리입니다. \n- 바르톨로메오 반제티, 누명을 쓰고 사형당하기 전의 인터뷰에서",
      "만약 당신이 누군가의 인격을 시험해 보고 싶다면, 그에게 권력을 줘 보라. \- 에이브러햄 링컨",
      "만약 자신의 인생사가 적힌 책을 받는다면, 그 책을 끝까지 읽겠는가? \n- 호세 페르난데스",
      "몇 달을 두고 준비된 것은 몇 분 사이에 보상을 받고, 몇 초 사이에 잘못된 일은 몇 년 동안 부정적인 영향을 미친다. 그러므로 장기적이고도 단기적으로 대응하는 것이 중요하다. 그리고 그것은 신속한 반응 속도와 세심한 진행을 연계시키는 시간 관리에 의해서만 가능하다. \n- 슈텐 나돌니, 독일의 작가",
      "모두가 세상을 변화시키려고 생각하지만, 정작 스스로 변하겠다고 생각하는 사람은 없다. \n- 레프 톨스토이",
      "모든 위대한 문명은 외세에 정복당하기 전에 내부로부터 붕괴되었다. \n- 윌 듀랜트, 미국의 저술가",
      "모든 국가는 그에 걸맞은 정부를 가진다. \n- 조제프 드 메스트르",
      "모든 세대는 스스로를 이전 세대보다 똑똑하고, 다음 세대보다 현명하다고 생각한다. \n- 조지 오웰",
      "모든 전제군주는 자유를 믿고 살았다. 그 자신만의 자유를. \n- 엘버트 허버드",
      "모든 진실이 모든 이의 귀에 들리는 것은 아니다. \n-움베르토 에코",
      "무기는 설사 백년 동안 쓸 일이 없다 해도, 단 하루도 갖추지 않을 수 없다 \n- 정약용, <목민심서> 병전 3조",
      "무릇 잘된 정치를 하려면 반드시 전대의 잘 다스려진 세상과 어지러운 세상이 역사에 남긴 자취를 보아야 할 것이다. \n- 세종대왕",
      "무릇 정치란 전쟁을 하지 않고 이기는 것이 제일이요, 전쟁을 하기 직전까지 가서 이기는 것이 그 다음이요, 전쟁을 통해서 이기는 것은 가장 낮음이니라 \n- 손자",
      "물리학에서 에너지가 그렇듯이, 사회과학에서의 가장 근본적인 개념은 권력이다. \n- 버트런드 러셀, 1938년",
      "물으면 제가 그르지요. 제가 생각하는 이상적인 사회는 더불어 사는 사람 모두가 먹는 것. 입는 것. 이런 걱정 좀 안 하고 더럽고 아니꼬운 꼬라지 좀 안 보고 그래서 하루하루가 좀 신명나게 이어지는 그런 세상이라고 생각합니다.  \n- 노무현, 1988년 7월 8일 국회 본회의장에서",
      "미국에 사회주의가 뿌리내리지 못했던 이유는, 가난한 사람들이 자신을 착취당하는 무산계급으로 생각하지 않고, 잠시 형편이 좋지 않은 백만장자일 뿐이라고 여기기 때문이다. \n- 존 스타인베크",
      "미숙한 사람은 '당신이 필요하기 때문에 당신을 사랑합니다.'라고 말한다. 성숙한 사람은 '당신을 사랑하기 때문에 당신이 필요합니다.'라고 말한다. \n- 에리히 프롬",
      "민주주의는 절대 공짜로 얻어지는 것이 아니며, 어느 역사를 보나 민주화를 위해서는 희생과 땀이 필요하다. \n- 김대중",
      "민주주의 최후의 보루는 깨어있는 시민의 조직된 힘입니다. \n- 노무현",
      "반성되지 않는 삶은 인간으로서 살 가치가 없다. \n- 소크라테스",
      "방황하는 이들 모두가 길을 잃은 것은 아니다. \n- 존 로널드 루엘 톨킨",
      "배는 항구에 있을때 가장 안전하지만 그것이 존재의 이유는 아니다 \n-괴테",
      "백성은 일정한 마음이 없다. 그러므로 생각나면 오고 싫어지면 가버리는 것은 진실로 그렇기 때문이다. \n- 내물 마립간. 백제 근초고왕이 신라로 도망한 백성들의 반환을 요구하자",
      "법관이 국민들로부터 의심을 받게 된다면 최대의 명예손상이 될 것이다. \n- 가인 김병로",
      "분명히 말하건대, 너희가 여기 있는 형제들 중에서 가장 낮은 자에게 해준 것이 나에게 해준 것이다. \n- 예수 그리스도, 마태복음 25:40",
      "분열되어 서로 다투는 집안은 살아남을 수 없습니다. \n- 에이브러햄 링컨, 1858년 연설",
      "불의를 이해해야만 정의를 이해할 수 있다. \n- 에드먼드 칸, 미국의 법철학자",
      "불굴의 의지 앞에서는 높은 산도 몸을 낮춘다!  \n- 한니발 바르카",
      "빚쟁이는 무덤까지 찾아오는 고통이다. \n- 레츠 추기경",
      " 빛의 속도보다 빠르게 여행하는 것은 없지만, 나쁜 소식만은 예외다. 그 녀석만은 특별한 물리법칙을 따른다. \n- 더글러스 애덤스",
      " 빠르기는 바람과 같고, 느리기는 숲과 같으며, 공격할 때는 불과 같고, 움직이지 않기는 산과 같으며, 알기 어렵기는 그늘과 같고 움직임은 천둥과 같아야 한다. \n- 손자",
      "사람들은 할 말이 없으면 욕을 한다. \n- 볼테르, 볼테르 전집에서.",
      "사람들이죠. 이 백신에 특허는 없습니다. 태양에 특허를 낼 수 있나요? \n- 조너스 소크, 자신이 새로 개발한 소아마비 백신의 특허권을 누구 앞으로 등록할건지 질문한 기자에게",
      "사람은 책을 만들고 책은 사람을 만든다. \n- 신용호, 교보문고의 창립자",
      "사람이 있는 한 전쟁은 있을 것이다. \n- 알베르트 아인슈타인",
      "사람 하나라도 부당하게 잡아 가두는 정부 밑에서, 정의로운 사람이 진정 있어야 할 곳은 감옥이다. \n- 헨리 데이비드 소로",
      "사랑이 커지면 사랑을 요구하지 않는다. 사랑이 커지면 더욱 사랑하고 싶을 뿐. \n- 프리드리히 니체, 차라투스트라는 이렇게 말했다에서",
      "사제는 어리석은 행동을 하는 것보다 어리석은 말을 하는 것으로 더 큰 피해를 본다. \n- 레츠 추기경",
      "살아야 한다면 민중과 함께, 죽어야 한다면 민중을 위해. \n- 후세 다쓰지",
      "삶에 익숙하기에 삶을 사랑하는 것이 아니라, 사랑에 익숙하기에 삶을 사랑하는 것이다. \n- 프리드리히 니체, 차라투스트라는 이렇게 말했다",
      "삶도 모르는데 어찌 죽음을 알겠는가? \n-공자",
      "상대를 알고 나를 알면 백번 싸워도 위태롭지 않으리라. \n- 손자",
      "상상력은 지식보다 중요하다. 지식은 제한되어 있지만 상상력은 온 세상을 아우르고, 진보를 촉진하며, 진화의 시발점이 되기 때문이다. \n- 알베르트 아인슈타인",
      "새 한 마리만 그려 넣으면 남은 여백 모두가 하늘이어라 \n- 이외수, 화선지",
      "석 자 길이의 칼을 들고 하늘에 맹세하니 산과 강의 빛이 변하고, 한번 휘둘러 쓸어 버리니 산과 강이 피로 물들여질 것이다. \n- 이순신",
      "거 승패가 결정되는 주요한 이유는 많은 사람들이 누가 좋아서 투표하기보다는 누가 싫어서 투표한다는 사실에 있다. \n- 프랭클린 P. 애덤스",
      "성숙이란 어릴 때 놀이에 열중하던 진지함을 다시 발견하는 데 있다 \n- 프리드리히 니체",
      "세상이 널 버렸다고 생각하지마라. 세상은 널 가진 적이 없다. \n- 에르빈 롬멜",
      "세상에는 세 가지의 감춰질 수 없는 것이 있다. 해와 달, 그리고 진실이다 \n- 석가모니",
      "수녀들이 나와서 앞에 설 것이고, 그 앞에는 또 신부들이 있을 것이고, 그리고 그 맨 앞에서 나를 보게 될 것이다. 그러니까 나를 밟고 신부들을 밟고 수녀들까지 밟아야 학생들과 만난다. \n- 김수환 추기경, 1987년 6월 민주항쟁 당시 명동 성당에 피신해 있던 시위 학생들을 체포하기 위해 다음 날 공권력이 투입될 것임을 통보하러 온 정부 고위 관계자에게",
      "술을 마시되 취하지 말고, 사랑을 하되 감정에 매몰되지 말고, 훔치되 부자의 것만 건드려라. \n- 판초 비야. 멕시코 혁명의 의적 출신 지도자.",
      "슬픔도 노여움도 없이 살아가는 자는 조국을 사랑하고 있지 않다. \n- 니콜라이 네크라소프",
      "승리하는 군대는 이길 수 있는 상황을 만들고 이후에 전쟁을 한다. 패배하는 군대는 먼저 전쟁을 일으키고 이후에 승리를 구한다. \n- 손자",
      "시는 슬픔의 결정체, 정치는 불만의 결정체. \n- 로버트 프로스트",
      "시민의 불복종은 시민의 타고난 권리다. \n- 마하트마 간디",
      "신앙이란, 진실이 아닌 줄 알면서도 그걸 믿는 일이다. \n- 마크 트웨인",
      "신문 없는 정부와 정부 없는 신문 둘 중에 고르라면, 나는 한치의 망설임도 없이 정부 없는 신문을 택하겠다. \n- 토머스 제퍼슨",
      "신은 모든 곳에 있을 수 없기에 어머니를 만들었다. \n- 유대인 속담",
      "신은 우리를 가지고 주사위 놀음을 하지 않는다. \n- 알베르트 아인슈타인",
      "신이 주사위 놀음을 하던 말던 그것은 당신이 상관할 것이 아니다. \n- 닐스 보어",
      "신이 주사위를 던지긴 하는데, 가끔 보이지 않는 곳에서 던져서 우리를 헷갈리게 만든다. \n- 스티븐 호킹",
      "신은 TV 안에 있다 \n- 마릴린 맨슨, 록은 죽었어에서",
      "서로 사랑하면 살고 서로 싸우면 죽는다 \n- 안창호",
      "아주 유명하지만 늙은 과학자가 어떤 것이 가능하다고 한다면, 그것은 거의 틀림없이 맞을 것이다. 하지만 그가 어떤 것이 불가능하다고 말한다면 그가 틀린 것일 확률이 매우 높다. \n- 아서 클라크. 클라크의 3법칙 중 제 1법칙",
      "악마는 언제나 평범한 사람의 모습을 하고 있다. 우리와 함께 잠을 자며, 우리와 함께 밥을 먹는다. \n- 위스튼 휴 오든 ",
      "악의 승리를 위해 필요한 것은 오직 선량한 사람들이 아무것도 하지 않는 것뿐이다. \n- 에드먼드 버크",
      "…악인은 그렇지 않음이여 오직 바람에 나는 겨와 같도다 \n- 다윗, 시편 1:4",
      "악한 사람에게 맞서지 말아라. 누가 네 오른쪽 뺨을 치거든 왼쪽 뺨마저 돌려 대어라. 너를 걸어 고소하여 네 속옷을 가지려는 사람에게는 겉옷까지도 내주어라. 누가 억지로 오 리를 가자고 하거든 십 리를 같이 가주어라. 달라는 사람에게 주고 꾸려는 사람의 청을 물리치지 마라... 너희 원수를 사랑하고, 너희를 박해하는 사람을 위하여 기도하여라.... 너희를 사랑하는 사람만 너희가 사랑하면 무슨 상을 받겠느냐? 세리도 그만큼은 하지 않느냐? 또 너희가 너희 형제자매들에게만 인사를 하면서 지내면 남보다 나을 것이 무엇이냐? 이방 사람들도 그만큼은 하지 않느냐? \n- 예수 그리스도, 마태복음 5:39-47",
      "안식일이 사람을 위하여 있는 것이지, 사람이 안식일을 위하여 있는 것은 아니다. \n- 예수 그리스도, 마가복음 2:27",
      "안전을 위해 자유를 포기하는 사회는 결국 양쪽 다 포기하게 된다. \n- 벤저민 프랭클린",
      "애국심은 사악한 자의 미덕이다. \n- 오스카 와일드",
      "애국자들은 항상 조국을 위해 죽는 것을 떠벌리지만, 조국을 위해 죽이는 것은 말하지 않는다. \n- 버트런드 러셀",
      "애국자: 자신이 무슨 소릴 하는지 알지도 못하면서 가장 큰 소리로 떠드는 사람들 \n- 마크 트웨인",
      "어떤 중요한 일을 할 때에는 그것이 현실이냐 비현실이냐를 따지기보다는 먼저 그 일이 바른 길이냐 어긋난 길이냐를 따져서 결정하라. \n- 김구",
      "어이해 이리들 우는고? 짐이 불멸인 줄 알았는고? \n- 루이 14세, 임종 전.",
      "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병 초기증세이다. \n- 알베르트 아인슈타인",
      "언어의 한계가 곧 자기 세계의 한계다. \n- 루트비히 비트겐슈타인",
      "여가는 철학의 어머니다. \n- 토마스 홉스",
      "여러분이 한 시대의 철학을 비판할 땐 여러분의 주된 주의를, 해당 철학을 해석하는 사람들이 명백하게 옹호하고자 하는 일련의 지적 견해에 겨누지 마십시오. 그 시대의 모든 상이한 체계를 지지하는 이들이 무의식 중에 다함께 전제로 삼는 어떤 기본적인 가정들이 있을 겁니다. \n- 앨프리드 노스 화이트헤드",
      "여자와 아이를 죽이는 것이 어찌 '성전'인가? \n- 아흐마드 샤 마수드",
      "연습은 하지 않는다. 나는 연주만 한다. \n- 잉베이 말름스틴",
      "영웅적인 인물만이 병사들을 싸움터로 이끌 수 있는 것은 아니다. 영웅적인 인물만이 싸움터로 나서는 그 병사가 될 수 있을 뿐이다. \n- 노먼 슈워츠코프",
      "예수님이라면 이곳(수단)에 학교를 먼저 지으셨을까, 성당을 먼저 지으셨을까. 아무리 생각해봐도 학교를 먼저 지으셨을 것 같다. 사랑을 가르치는 거룩한 학교, 내 집처럼 정이 넘지는 그런 학교 말이다. \n- 이태석 신부, 본인의 저서 '친구가 되어 주실래요?'에서.",
      "올 한 해 동안 물가는 오르고 실업자는 늘어날 것입니다. 소득은 떨어지고 기업의 도산은 속출할 것입니다. 우리 모두는 지금 땀과 눈물과 ... 고통을 요구받고 있습니다. \n- 김대중, 외환 위기 초인 1998년 15대 대통령 취임식 연설에서",
      "왼손으로 악수합시다. 그 쪽이 심장과 더 가까우니까. \n- 지미 헨드릭스",
      "용감한 사람은 적뿐 아니라 쾌락까지 극복하는 사람이다. \n- 데모크리토스",
      "용기란 공포를 1분 더 참는 것이다. \n- 조지 S. 패튼",
      "우리가 밤에 편히 잘 수 있는 건, 힘센 사람들이 우리를 대신해 폭력을 행사할 준비가 되어 있기 때문이다. \n- 조지 오웰",
      "우리가 어느 날 마주친 불행은 우리가 소홀히 보낸 지난 시간에 대한 보복이다. \n- 나폴레옹 보나파르트",
      "우리가 전쟁을 끝내지 않으면, 전쟁이 우리를 끝내리라. \n- 존 F. 케네디",
      "우리는 다른 사람에게 나 자신을 위장하는 것에 너무 익숙해져서 결국 자기 자신에게까지 위장하게 된다. \n- 프랑수아 드 라 로슈푸코",
      "우리는 달에 가기로 결정하였습니다. 그것이 쉽기 때문이 아니라 어렵기 때문에 이렇게 결정한 것입니다. 이것은 우리의 모든 역량과 기술을 한데 모아 가늠해보는 일이 될 것입니다. 이 도전이야 말로 우리가 하고자 하는 것이며, 더 이상 미룰 수 없는 것이고, 우리의 승리가 될 것이기 때문입니다. \n- 존 F. 케네디, 1962년 9월 12일 휴스턴 연설",
      "우리는 영웅이 필요 없다고 했지! 승리했을때 영웅이 나타나! \n- 강을준 ",
      "우리는 전투에서 졌을 뿐 입니다. 전쟁은 아직 끝나지 않았습니다. \n- 샤를 드 골",
      "우리 모두 현실주의자가 되자. 그러나 가슴 속에는 불가능한 꿈을 품자. \n- 체 게바라",
      "우리는 알아야 한다, 우리는 알게될 것이다. \n- 다비드 힐베르트",
      "우주를 지배하는 것은 세상을 지배한다는 뜻이다. \n- 린든 B. 존슨",
      "우리는 효율적이라고 해서 단 한명의 국민을 포기해서는 안됩니다. \n- 홍익표, 2016년 테러방지법 반대 필리버스터 발언.",
      "월드컵은 경험을 쌓는 곳이 아니라 증명을 하는 곳입니다. \n- 이영표",
      "유한한 목숨으로 어찌 무한한 욕구를 얻으려 하는가? \n- 장자",
      "은행 자본은 무장한 군대보다 위험하다. \n- 토머스 제퍼슨",
      "의리를 지키려면 불리할 때에 지키는 것이다. \n- 여운형",
      "이것은 한 인간에게는 작은 발걸음이지만 인류에게는 커다란 도약입니다. \n- 닐 암스트롱, 1969년 7월 21일 2시 56분, 달에 첫 인류의 발자국을 찍으면서",
      "이 드넓은 우주에 우리 밖에 없다면, 그것은 엄청난 공간 낭비다. \n- 칼 세이건",
      "이성이 버린 환상은 믿을 수 없는 괴물들을 만들어 낸다 \n- 프란시스코 고야",
      "이 세상에 결정적 순간이 아닌 순간은 없다. \n- 레츠 추기경",
      "이 시대가 '가장 온순한 인간들 중에서 가장 열렬한 투사를 만들어 내는' 부정한 시대이기 때문입니다. \n- 유시민, 항소이유서 중",
      "인간은 권력이든 돈이든 둘 중 하나만 가져야 한다. 하나만 갖는 것도 대단한데 둘을 다 가진다? 그건 과욕이다. 재산이 많으면 아무리 좋은 사람도 춥고 배고픈 사람의 사정을 모른다. \n- 김영삼 전 대통령",
      "인간은 인간에게 늑대다. \n- 플라우투스",
      "인간은 천사도 아니고 악마도 아니다. 그러나 인간이 천사처럼 살고자 하면 그는 짐승처럼 살게 된다. \n- 블레즈 파스칼",
      "인간은 태초에는 자유로웠지만, 지금은 어디에서나 노예가 되어 있다. \n- 장 자크 루소, 사회계약론의 서론에서",
      "인간의 멍청함이 가진 힘을 과소평가하지 마라. \n- 로버트 A. 하인라인",
      "인간에게 막역한 사이란 없다. 막연한 사이만 있을 뿐이다. \n- 이오시프 스탈린",
      "인도가 있건 없건 우리는 셰익스피어 없이는 안됩니다! \n- 토머스 칼라일, 영웅숭배론",
      "인민은 낙엽과 같다. 발로 밟으면 바스락 거리면서 소리가 크지만, 불에 넣으면 매우 잘 탄다. \n- 이오시프 스탈린",
      "인생은 공평하지 않다. 이에 익숙해져라. \n- 빌 게이츠",
      "인생은 멀리서 보면 희극이고 가까이서 보면 비극이다. \n- 찰리 채플린",
      "인생은 실험이 아니라 실행이다. \n- 이상, 12월 12일",
      "인생은 하수구와 같다. 그곳에서 당신이 무엇을 찾을지는 당신이 무엇을 집어 넣는가에 달려 있다. \n- 톤 레너",
      "인생은 탄생과와 죽음의 사이의 쵸이스이다. \n- 장폴 사르트르 ",
      "인을 짓밟는 자를 '적' 이라 하고 의를 버리는 자를 '잔' 이라 합니다. 잔적한 자는 일개 필부에 불과할 뿐입니다. 주무왕이 필부인 주를 죽였다는 말은 들었으나, 임금을 시해하였다는 말은 듣지 못하였습니다. \n- 맹자, 신하가 임금을 시해할 수 있느냐는 제나라 선왕의 질문에 대한 대답. 역성혁명을 인정하는 내용이었기에 훗날 쿠데타의 근거가 된 글귀이기도 하다",
      "일을 꾸미는 것은 사람이되 일을 이루게 하는 것은 하늘이다. \n- 제갈량",
      "일곱 명의 죄수가 갇혀 있는 바스티유 감옥을 무너뜨리는 것과 1400만의 죄수가 있는 감옥을 파괴하는 것은 전혀 다른 일이다. \n- 조지 버나드 쇼",
      "일찍 일어나는 새가 벌레를 잡는다. \n- 윌리엄 캠던",
      "입은 재앙을 여는 문이고, 혀는 자신을 베는 칼이니 입을 닫고 혀를 깊숙히 간직한다면, 어디서나 거뜬히 몸을 편히 하리라. \n- 풍도",
      "자기 자리를 지키려 사는 사람은 위로 올라가려는 사람에게 밟히게 되어 있다. 꿈의 크기가 다르기 때문이다. \n- 스타테일 감독 김광복",
      "자본주의에선 인간이 인간을 착취한다. 공산주의에선 그저 그 반대일 뿐이다. \n- 존 케네스 갈브레이드",
      "자신이 내놓은 통계가 아니라면 그 어떤 통계도 믿지마라. \n- 윈스턴 처칠",
      "자신의 고향을 달콤하게 여기는 사람은 아직 주둥이가 노란 미숙아이다. 좀 더 성숙한 사람은 모든 곳을 고향처럼 느끼는 코스모폴리텐이며, 궁극의 성숙한 모습은 모든 곳을 타향이라고 생각하는 이방인이다. \n- 12세기 철학자 생 빅토르 후고",
      "자신의 소망, 꿈, 이상이 진정한 챔피언을 만든다. \n- 무함마드 알리",
      "자신을 아는 일이 곧 신을 아는 일이다. \n- 예언자 무함마드",
      "자신의 신념을 위해 싸우다 죽는 것이 신념을 지키며 사는 것보다 쉽다. \n- 앨프리드 애들러",
      "자유가 아니면 죽음을 달라! \n- 패트릭 헨리",
      "자유는 욕망하는 것을 행하는 데에 있다. \n- 존 스튜어트 밀",
      "자유는 공짜가 아니다. \n- 미국 속담, 공짜란 없다",
      "자유라는 나무는 애국자와 독재자의 피를 먹고 자라난다. 이는 자유의 근본 속성이자 거름이기도 하다. \n- 토머스 제퍼슨",
      "자유의 상실은 인간이 가장 소중히 여기는 가치관이 몰락했음을 뜻한다. 이후로는 고용자와 피고용자의 엄격한 관계에 얽매여 사소한 즐거움만을 누릴 뿐이다. \n- 알프레드 노스 화이트헤드",
      "작은 거짓말쟁이는 한 사람을 속인다. 중간 거짓말쟁이는 많은 사람을 속인다. 큰 거짓말쟁이는 나라를 속인다. 그러나 세월을 속일 수는 없다. \n- 에이브러햄 링컨",
      "잘 모르고 무식한 사람이 신념을 가지면 무섭습니다 \n- 이경규",
      "저 달은 비록 작으나 온 천하를 비추는구나 \n- 김옥균",
      "적과 싸우는 것은 내가 군인이기에 한 일입니다. 이런 강도와 싸우는 것도 내가 인간이기에 한 일일 뿐입니다. \n- 비슈누 쉬레스타,유명한 용병집단인 네팔의 구르카에서 현역으로 근무하다가 은퇴한 퇴역군인. 기차여행 중 40명 격퇴 뒤 소녀의 부모가 6천 5백 루피를 주려고 했을 때 거절했다",
      "전쟁에서 2등을 위한 자리는 없다. \n- 오마르 브래들리",
      "전쟁은 겪어 보지 않은 사람에겐 유쾌한 것이다. \n- 핀다르, 에라스뮈스가 원조가 아니다.",
      "전쟁은 위대한 서사시와 위대한 영웅을 남기는게 아니라 전쟁은 욕심과 자만에서 탄생되며 남는건 눈물과 고통, 피만 남게 되는 비참한것임을 우리는 깨달아야한다. \n- 클라우제비츠",
      "전쟁은 누가 옳느냐를 가리지 않는다. 단지 누가 남느냐를 가릴 뿐이다 \n- 버트런드 러셀",
      "전쟁은 죽음의 그림자가 돌아오고서야 종식된다. \n- 스탠리 볼드윈",
      "전쟁이 끔찍해서 다행이다. 그렇지 않았으면 사람들이 전쟁을 너무 좋아하게 됐을 테니. \n- 로버트 E. 리",
      "전쟁은 어떤 식으로든 미화돼서는 안된다. \n- 데즈카 오사무",
      "전쟁을 일으키는 것은 늙은이들이지만, 싸우다 죽어가는 것은 젊은이들이다. \n- 허버트 후버",
      "전쟁의 영광이란 건 완전히 헛소리다. 피, 복수, 초토화를 부르짖는 사람들은 총을 쏴 본 적도, 부상병의 비명과 신음을 들어본 적도 없는 사람들 뿐이다. 전쟁은 지옥이다. \n- 윌리엄 테쿰세 셔먼",
      "전쟁의 최초 피해자는 진실이다. \n- 아이스킬로스",
      "전쟁이란 신이 미국인에게 지리를 가르치기 위해 택한 방법이다. \n- 앰브로스 비어스",
      "전제군주는 백성에게 불이익을 가져올 때, 최고의 이익을 얻어오는 것처럼 이야기한다. \n- 라만 케넌",
      "절대적인 권력은 절대적으로 타락한다. \n- 액턴 경 (Lord Acton)",
      "절망을 느낄 때 난 기억한다. 역사를 돌아보면, 진리와 사랑이 늘 승리했다는 것을. 독재자도 살인자도 있었고, 그들에게 당장 대항할 수 없어 보여도 결국엔 무너진다는 것을. 이것을 생각하라. 언제나. \n- 마하트마 간디",
      "정의를 위해 굶어죽는 것이 부정을 범하는 것보다 수만 배 명예롭다. 법관은 최후까지 오직 정의의 변호사가 되어야 한다. \n- 가인 김병로,1957년 12월 퇴임하면서",
      "정치란 짐승의 비천함을 감수하고 야수의 탐욕과 싸워 성인의 고귀함을 이뤄 내는 위대한 사업 \n- 유시민, 저서 청춘의 독서에서",
      "정치인의 일이라는 것은 그의 이상과 국가가 놓인 현실 사이에 다리를 놓는 것이다. \n- 헨리 키신저",
      "제 아버지는 사람들이 걱정에서 벗어나 즐겁게 웃게 하는 것을 좋아하셨고, 훌륭한 코미디언이 될 수도 있으셨지만 본인은 그것이 가능하다고 믿지 않으셨습니다. 그래서 회계사라는 안정적인 직장을 선택하셨죠. 하지만 아버지께서는 제가 12살 되던 해에 예상치 못했던 일로 인해 그 안정적인 직장을 잃으셨고, 우리 가족은 엄청난 고생을 했습니다. 제가 얻은 교훈은 이것입니다. '하고 싶지 않은 일을 하면서도 실패할 수 있다. 그러므로 이왕이면 좋아하는 일에 도전하는 것이 낫다.' 여러분에게는 열정과 두려움이라는 두 가지 선택지가 있습니다. 그러나 두려움이 아닌 열정을 선택하십시오. 절대 두려움이 열정으로 가득한 마음을 외면하게 만들지 마십시오! - 짐 캐리, 2014년 마하리시 대학교 연설 中\n- 짐 캐리",
      "제3차 세계대전에서 이길 수 있는 유일한 방법은 전쟁을 막는 것 뿐이다. \n- 드와이트 D. 아이젠하워",
      "좁은 문으로 들어가거라. 멸망으로 이끄는 문은 넓고, 그 길이 널찍하여서, 그리로 들어가는 사람이 많다. 생명으로 이끄는 문은 너무나도 좁고, 그 길이 비좁아서, 그것을 찾는 사람이 적다. \n- 마태복음 7:13-14",
      "종일 배불리 먹으면서 마음 쓸 데 하나 없으면 딱한 일이다. 장기와 바둑이 있지 않은가? 그걸 하는 게 오히려 그냥 있느니보단 나으리라. \n- 공자, 성인이 공인한 막장제조 게임 바둑!",
      "주사위는 던져졌다. \n- 율리우스 카이사르",
      "평화는 힘에 의해 유지될 수 없다. 오직 이해로써 성취될수 있다. \n-알베르트 아인슈타인",
      "죽고자 하면 살 것이고 살고자 하면 죽을 것이다. \n- 이순신",
      "죽은 자들만이 전쟁의 끝을 본다. \n- 플라톤",
      "죽을 때까지는 아무도 행복하지 않았다. \n- 오비디우스",
      "죽음에 이르지 않는 시련은 나를 더욱 강하게 만든다. \n- 프리드리히 니체",
      "죽음은 아무것도 아니다. 그러나 승리하지 못한 삶을 살 바엔 차라리 죽는게 낫다 \n- 나폴레옹 보나파르트",
      "지금까지 철학자들은 단지 세계를 여러 가지 방식으로 해석해 왔다. 그러나 중요한 것은 그것을 변화시키는 것이다. \n- 카를 마르크스, 《포이에르바하에 관한 테제》 중 11번째 테제",
      "지금 신에게는 아직 12척의 전선이 있사오니 죽을 힘을 다해 막아 싸우면 능히 대적할 방책이 있습니다. 전선이 비록 적지만 미천한 신이 죽지 아니했으니 적이 감히 우리를 가벼이 업신여기지 못할 것이옵니다. \n- 이순신, 명량해전 직전에 선조에게 보낸 장계에서",
      "지난해엔 네가 아들을 잃더니 올해엔 내가 너를 잃었다. 부자간의 정리를 네가 먼저 알았구나. 상향. \n- 조선 중기의 문신 김전이 아들의 상을 당하여 지은 제문. 어숙권 저 《패관잡기》 ",
      "지식에 대한 투자가 언제나 최고의 이윤을 낸다. \n- 벤자민 프랭클린",
      "진리가 상대방의 귀에 들리도록 하려면 그것을 선의를 가지고 이야기할 필요가 있다. 아무리 이치에 맞는 옳은 말이라도 화를 내면서 말하면 상대방에게 전달되지 않는다. 그러므로 만약 네가 누군가에게 어떤 말을 했는데 그것이 받아들여지지 않을 때는, 그것은 둘 중 하나, 네가 진리라고 생각한 것이 진리가 아니거나, 네가 그것을 선의로 전달한 것이 아니며, 그것도 아니면 진리도 아니고 선의도 결여되어 있었던 거라고 생각하라. \n- 레프 톨스토이",
      "진리를 전달하는 유일한 방법은 사랑으로 얘기하는 것이다. 사랑하는 사람의 말만이 사람들의 귀에 들리게 마련이다. \n- 헨리 데이비드 소로",
      "진실의 가장 큰 적은 거짓이 아니라 신화다. \n- 존 F. 케네디",
      "진정한 위기는 자원의 부족이 아니라 상상력의 부족이다. \n- 파올로 루가리",
      "집중된 권력은 항상 자유의 적이었다. \n- 로널드 레이건",
      "참으로 곧은 길은 굽어보이는 법이다. \n- 사마천, 숙손통의 생애를 표현한 말",
      "창밖으로 내던지지 못하는 컴퓨터는 믿지 말라. \n- 스티브 워즈니악",
      "책 없이는 살 수 없다. \n- 토머스 제퍼슨",
      "천국에 가는 가장 좋은 방법은 지옥에 가는 길을 잘 아는 것이다. \n- 니콜로 마키아벨리",
      "천국의 가장 위대한 속성은 자비이고 그것은 또한 정의와 영광의 절정이다. \n- 살라흐 앗 딘",
      "천하의 다스림이란 군자가 여럿 모여도 이루기에는 부족하나, 한 사람의 소인일지라도 망치기에는 족하다. \n- 송사, 유일지전에서",
      "천하만물에 지킬 것은 하나도 없지만, 오직 나만은 지켜야 한다. \n- 다산 정약용, 《수오재기》에서",
      "총은 사람을 죽이지 않는다. 사람이 죽인다.  \n- 미상",
      "총칼로 왕좌를 세울 순 있지만, 거기에 앉기는 힘들다. \n- 보리스 옐친",
      "충분히 발달한 과학은 마술과 구분할 수 없다. \n- 아서 클라크. 아서 클라크의 3 법칙 중 제3법칙.",
      "우물쭈물하다 내 이럴줄 알았다. \n- 조지 버나드 쇼",
      "칼을 쓰는 사람은 칼로 망하는 법이다. \n- 예수 그리스도, 마태오복음 26장 52절",
      "테크놀로지는 윤리적으로 중립이다. 우리가 그것을 사용할 때, 선악이 부여된다. \n- 윌리엄 깁슨",
      "투표는 총알보다 강하다. \n- 에이브러햄 링컨",
      "투표권이 아니면 총알을! \n- 맬컴 엑스",
      "트위터는 인생의 낭비 \n- 알렉스 퍼거슨",
      "평화를 바란다면 전쟁에 대비하라 \n- 베게티우스",
      "평화적 수단으로밖에 평화를 실현할 수 없다고 생각하는 국가는, 머지않아 다른 국가에게 흡수될 것이다. \n- 리처드 닉슨",
      "폼은 일시적이지만 클래스는 영원하다. \n- 빌 섕클리, 리버풀 FC의 전설적인 감독.",
      "폭군은 누구나 미덕의 파편을 약간이나마 지니고 있다. 그들은 법을 파괴하기 전까지 법을 지지한다. \n- 볼테르",
      "폭군이 죽으면 그의 지배는 끝나지만, 순교자가 죽으면 그의 지배가 시작된다. \n- 쇠렌 키르케고르",
      "프랑스어 사전에 불가능이란 단어는 없다. \n- 나폴레옹 보나파르트",
      "폐하, 제게는 그 가설이 필요 없었습니다. \n- 피에르시몽 라플라스 ",
      "핀을 뽑은 순간 수류탄은 우리의 친구가 아니게 된다. \n- 미 육군 훈련경고",
      "하늘을 올려다보세요. 내려다보고만 있다면 절대 무지개를 찾지 못할 겁니다. \n- 찰리 채플린 1928년 영화 '서커스' 에서",
      "하늘이 어떤 사람에게 큰 일을 맡기고자 할 때에는 반드시 먼저 마음을 괴롭게 하고 육체를 지치게 하며 그 배를 굶주리게 하고 생활을 빈궁에 빠뜨려 하는 일마다 어지럽고 힘들게 만든다. 이는 분발하고 참을성을 길러주어 이제까지 해내지 못하던 일을 할 수 있게 해주려는 것이다. \n- 맹자",
      "하루라도 글을 읽지않으면 입안에 가시가돋는다. \n- 안중근 의사의 유묵",
      "학살자들의 손에 묻은 피를 닦아 주러 가지 않겠다. \n- 요한 크루이프, 아르헨티나 군사정권의 민간인 학살에 항의해 78년 아르헨티나 월드컵을 보이콧하며",
      "한 마리의 제비로서는 능히 당장에 봄을 이룩할 수 없지만 그가 전한 봄 젊은 봄은 오고야 마는 법. 소수의견을 감히 지키려는 이유가 바로 여기에 있는 것이다. \n- 민문기 대법원 판사, 대법원 1977. 9. 28. 선고 77다1137 전원합의체 판결의 소수의견에서",
      "한 번은 내 친구 12명에게 다음과 같은 전보를 보낸 적이 있었다: '다 들통났다 - 당장 도망쳐라'. 모두 곧바로 마을을 떴다. \n- 마크 트웨인",
      "1시간의 놀이가 1년간의 대화보다 그 사람을 더 잘 알게 해준다. \n- 플라톤",
      "한 사람이 혼자서 꿈을 꾸면 그것은 그저 꿈이다. 그러나 우리 모두가 함께 꿈을 꾸면 그것은 현실이 된다. \n- 돔 헬더 카마라",
      "한 포기의 풀이 싱싱하게 자라려면 따스한 햇볕이 필요하듯이 한 인간이 건전하게 성장하려면 칭찬이라는 햇살이 필요하다. \n- 장 자크 루소",
      "힘은 공평에서 나온다. \n- 티무르",
      "행복은 최고의 선이자 미덕의 구현이며 완벽한 실행으로, 이를 성취하는 이들도 있지만 거의 또는 조금도 갖지 못한 이들도 있다. \n- 아리스토텔레스",
      "헛되고 헛되며 헛되고 헛되니 모든 것이 헛되도다. \n- 성경 전도서 1장 2절",
      "헤겔은 어디에선가, 모든 거대한 세계사적 사건들과 인물들은 말하자면 두 번 나타난다고 지적하고 있다. 그는 다음과 같이 덧붙이는 것을 잊었다. 한 번은 비극으로, 다른 한번은 소극으로 \n- 카를 마르크스, <루이 보나파르트의 브뤼메르 18일> 중",
      "혁명을 하고도 민중이 여전히 가난하고 불행하다면 그것은 혁명이 아니다. \n- 호찌민",
      "현실에 맞지 않은 이상은 공상이 되고, 이상이 없는 현실은 사물에 불과한 것이다. 정치를 논하는 자는 반드시 실제적 세밀을 필요로 하는 것이요, 공상적 개괄을 허하지 않는다. \n- 여운형",
      "현재가 과거와 다르길 바란다면 과거를 공부하라 \n- 바뤼흐 스피노자",
      "확실한 것은, 나 자신은 마르크스주의자가 아니라는 것이다. \n- 카를 마르크스",
      "훌륭한 지도자는 역사를 바꾸고, 저열한 권력자는 역사책을 바꾼다. \n- 역사학자 전우용",
      "흰 고양이든 검은 고양이든 간에 쥐를 잘 잡는 게 좋은 고양이다. \n- 덩샤오핑, 유명한 그의 실용주의 정책을 설명하는 말.",
    );

    output.wisesay = randomHouse + ", 다음 질문을 해 주세요."
    makeJson(output);
  }

  /**
   * 종료부분
   */
  function exit_intent() {
    output.wisesay = '이용해 주셔서 감사합니다. ' + appTitle + '을 종료합니다.'
    makeJson(output);
  }



  //type name
  const TODAYWISE = 'action.todayWise'; // 일반 인텐트
  const EXIT = 'action.exit'; //종료
  const TEST = 'action.number';//테스트

  switch (requestBody.action.actionName) {
    // 최초 실행시 오는 intent. LaunchRequest만 쓴다.
    case TODAYWISE:
      wise_intent();
      break;
    case EXIT:
      exit_intent();
      break;
    case TEST:
      test_intent();
      break;

  } //switch requests.type


}