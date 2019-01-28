/**
 * 도시이름을 한거번에 나열하기 위한 console.log용.
 * 출력후 지원가능한 Description에 넣기
 */
const weatherCity = [{
    name: '서울',
    code: '226081',
    nation: '한국'
  },{
    name: '뉴욕',
    code: '349727',
    nation: '미국'
  },{
    name: '도쿄',
    code: '226396',
    nation: '일본'
  },{
    name: '오사카',
    code: '225007',
    nation: '일본'
  },{
    name: '프놈펜',
    code: '49785',
    nation: '캄보디아'
  },{
    name: '모스크바',
    code: '294021',
    nation: '러시아'
  },{
    name: '런던',
    code: '328328',
    nation: '영국'
  },{
    name: '카이로',
    code: '127164',
    nation: '이집트'
  },{
    name: '베이징',
    code: '101924',
    nation: '중국'
  },{
    name: '상하이',
    code: '106577',
    nation: '중국'
  },{
    name: '홍콩',
    code: '1123655',
    nation: ''
  },{
    name: '마닐라',
    code: '264885',
    nation: '필리핀'
  },{
    name: '리우 데 자네이루',
    code: '45449',
    nation: '브라질'
  },{
    name: '부에노스 아이레스',
    code: '7894',
    nation: '아르헨티나'
  },{
    name: '토론토',
    code: '55488',
    nation: '캐나다'
  },{
    name: '시드니',
    code: '22889',
    nation: '오스트레일리아'
  },{
    name: '로스 엔젤레스',
    code: '90012',
    nation: '미국'
  },{
    name: '샌프란시스코',
    code: '94103',
    nation: '미국'
  },{
    name: '워싱턴',
    code: '20006',
    nation: '미국'
  },{
    name: '로마',
    code: '213490',
    nation: '이탈리아'
  },{
    name: '파리',
    code: '623',
    nation: '프랑스'
  },{
    name: '베를린',
    code: '10178',
    nation: '독일'
  },{
    name: '리스본',
    code: '274087',
    nation: '포르투갈'
  },{
    name: '뉴델리',
    code: '187745',
    nation: '인도'
  },{
    name: '델리',
    code: '202396',
    nation: '인도'
  },{
    name: '호치민',
    code: '353981',
    nation: '베트남'
  },{
    name: '하노이',
    code: '353412',
    nation: '베트남'
  },{
    name: '멕시코시티',
    code: '242560',
    nation: '멕시코'
  },{
    name: '멜버른',
    code: '26216',
    nation: '오스트레일리아'
  },{ // 12.21 추가
    name: '더블린',
    code: '207931',
    nation: '아일랜드'
  },{
    name: '애틀란타',
    code: '30303',
    nation: '미국'
  },{
    name: '시카고',
    code: '60608',
    nation: '미국'
  },{
    name: '시애틀',
    code: '98104',
    nation: '미국'
  },{
    name: '켄자스 시티',
    code: '64106',
    nation: '미국'
  },{
    name: '자카르타',
    code: '208971',
    nation: '인도네시아'
  },{
    name: '쿠알라룸프루',
    code: '233776',
    nation: '말레이시아'
  },{
    name: '싱가포르',
    code: '300597',
    nation: ''
  },{
    name: '카라치',
    code: '261158',
    nation: '방글라데시'
  },{
    name: '라고스',
    code: '4607',
    nation: '나이지리아'
  },{
    name: '이스탄불',
    code: '318251',
    nation: '터키'
  },{
    name: '뭄바이',
    code: '204842',
    nation: '인도'
  },{
    name: '상파울루',
    code: '45881',
    nation: '브라질'
  },{
    name: '톈진',
    code: '60592',
    nation: '중국'
  },{
    name: '타이페이',
    code: '315078',
    nation: '타이완'
  },{
    name: '가오슝',
    code: '313812',
    nation: '타이완'
  },{
    name: '광저우',
    code: '102255',
    nation: '중국'
  },{
    name: '라호르',
    code: '22143',
    nation: '파키스탄'
  },{
    name: '테헤란',
    code: '210841',
    nation: '이란'
  },{
    name: '방콕',
    code: '318849',
    nation: '타이'
  },{
    name: '다카',
    code: '297442',
    nation: '방글라데시'
  },{
    name: '보고타',
    code: '107487',
    nation: '콜롬비아'
  },{
    name: '리야드',
    code: '297030',
    nation: '사우디아라비아'
  },{
    name: '상트페테르부르크',
    code: '295212',
    nation: '러시아'
  },{
    name: '앙카라',
    code: '316938',
    nation: '터키'
  },{
    name: '양곤',
    code: '246562',
    nation: '미얀마'
  },{
    name: '알렉산드리아',
    code: '126995',
    nation: '이집트'
  },{
    name: '케이프타운',
    code: '306633',
    nation: '남아프리카 공화국'
  },{
    name: '마드리드',
    code: '308526',
    nation: '스페인'
  },{
    name: '아디스아바바',
    code: '126831',
    nation: '에티오피아'
  },{
    name: '나이로비',
    code: '224758',
    nation: '케냐'
  },{
    name: '바르샤바',
    code: '274663',
    nation: '폴란드'
  },{
    name: '뮌헨',
    code: '80331',
    nation: '독일'
  },{
    name: '프라하',
    code: '125594',
    nation: '체코'
  },{
    name: '나폴리',
    code: '212466',
    nation: '이탈리아'
  },{
    name: '밀라노',
    code: '214046',
    nation: '이탈리아'
  },{
    name: '룩셈부르크',
    code: '228714',
    nation: ''
  },{
    name: '부다페스트',
    code: '187423',
    nation: '헝가리'
  },{
    name: '쾰른',
    code: '50667',
    nation: '독일'
  },{
    name: '바르셀로나',
    code: '307297',
    nation: '스페인'
  },{
    name: '암스테르담',
    code: '249758',
    nation: '네덜란드'
  },{
    name: '브뤼셀',
    code: '27581',
    nation: '벨기에'
  },{
    name: '오미야콘',
    code: '571464',
    nation: '러시아'
  },]
    let su = 0;
for(var i = 0; i< weatherCity.length ; i++){

  let text = weatherCity[i].name + ', '
    console.log(text)
    su++
}
console.log(su)
