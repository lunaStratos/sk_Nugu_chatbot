var express = require('express');
var router = express.Router();
let knex = require("../config/database");

var gisu = require('../api/gisu.js')
var firstTimeWeather = require('../api/firstTimeWeather.js')

let insertData = [{
  name: '서울',
  nx: 60,
  ny: 127
}, {
  name: '부산',
  nx: 98,
  ny: 76
}, {
  name: '대구',
  nx: 89,
  ny: 90
}, {
  name: '인천',
  nx: 55,
  ny: 124
}, {
  name: '광주',
  nx: 58,
  ny: 74
}, {
  name: '대전',
  nx: 67,
  ny: 100
}, {
  name: '울산',
  nx: 102,
  ny: 84
}, {
  name: '세종',
  nx: 66,
  ny: 103
}, {
  name: '경기',
  nx: 60,
  ny: 120
}, {
  name: '강원',
  nx: 73,
  ny: 134
}, {
  name: '충북',
  nx: 69,
  ny: 107
}, {
  name: '충남',
  nx: 68,
  ny: 100
}, {
  name: '전북',
  nx: 63,
  ny: 89
}, {
  name: '전남',
  nx: 51,
  ny: 67
}, {
  name: '경북',
  nx: 89,
  ny: 91
}, {
  name: '경남',
  nx: 91,
  ny: 77
}, {
  name: '제주',
  nx: 52,
  ny: 38
}]

router.get('/getFirstApi', function(req, res) {
  gisu.updateApi(knex, 'foodDecay')
  res.send("getFirstApi");
});

router.get('/getFirstApiWeather', function(req, res) {
  for (let i = 0; i < insertData.length; i++) {
    firstTimeWeather.insertFirstApi(knex, 'forecastWeather', insertData[i])
  }
  res.send("getFirstApiWeather");
});

//https://cloud.google.com/appengine/docs/flexible/nodejs/scheduling-jobs-with-cron-yaml
//corn 으로 매 1시간 마다 실행. api의 데이터를 sql에 저장 : gcloud app deploy cron.yaml
router.get('/updateApi', function(req, res) {
  //지역별로 데이터 저정하기
  for (let i = 0; i < insertData.length; i++) {
    firstTimeWeather.updateApi(knex, 'nowWeather', insertData[i])
  }
  res.send("firstTimeWeather updateApi");
});

//각종 지수 업그레이드
router.get('/updateGisu', function(req, res) {
  var d = new Date().getMonth() + 1; //0부터 시작: 실제 달 숫자
  //6~9월만 가능
  if (5 < d && d < 10) {
    gisu.updateApi('bul', knex)
  }
  //11~3월 만 가능
  if (d < 4 || 10 < d ) {
    gisu.updateApi('chegam', knex)
  }
  //연중가능
  gisu.updateApi('foodDecay', knex)
  //3월에서 11
  if ( 2 < d && d < 12 ) {
    gisu.updateApi('uv', knex)
  }

  gisu.updateApi('virus1', knex)
  gisu.updateApi('virus2', knex)
  gisu.updateApi('mise', knex)

  res.send("gisu updateApi");

});


module.exports = router;
