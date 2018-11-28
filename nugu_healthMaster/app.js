'use strict';

var express = require('express');
var bodyParser = require('body-parser');
const prompt = require('prompt');
//database
let knex = require("./config/database");
var chatbotNugu = require('./chatbot/nugu.js')

//경로 모듈
var oauthRouter = require('./routes/oauth');
var commonRouter = require('./routes/common');
var apiRouter = require('./routes/api');

//router
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
// 경로 설정
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile)
app.set('views', './camelia_web');
app.use(express.static(__dirname + '/camelia_web'));
app.use('/oauth', oauthRouter);
app.use('/', commonRouter);
app.use('/api', apiRouter);

//누구 챗봇용
app.post('/', function(req, res) {
  console.log('nugu')
  return chatbotNugu.nugu_chatbot(knex, req, res)
});

app.get('/nugu', function(req, res) {
  console.log('nugu')
  res.send('ok')
});
//누구 Health 체크용
app.get('/nugu/health', function(req, res) {
  res.send('<p><img src="https://storage.googleapis.com/finalrussianroulette.appspot.com/yahan.png"></p><p>뭘 보러 오셨나요?</p>')
});

//포트설정 (앱엔진에서는 8080만 허용)
const port = 8080
app.listen(port, function() {
  console.log("Server Online. Port is " + port);
});
