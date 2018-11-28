/**
 * auth.js
 */

'use strict';

var jwt = require('jsonwebtoken');
var compose = require('composable-middleware');
let secretObj = require("../config/jwt");

var SECRET = secretObj.client_secret
var EXPIRES = '365d'; // 1 hour

// JWT 토큰 생성 함수
function signToken(email) {
  return jwt.sign({
    email: email,
    auth: 'camelia'
  }, SECRET, {
    algorithm: 'HS256',
    expiresIn: EXPIRES
  });
}

// 토큰을 해석하여 유저 정보를 얻는 함수
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      var decoded = jwt.verify(req.headers.authorization, SECRET);
      console.log(decoded) // '{id: 'user_id'}'
      req.user = decode;
    })
    // Attach user to request
    .use(function(req, res, next) {
      req.user = {
        id: req.user.id,
        name: 'name of ' + req.user.id
      };
      next();
    });
}


exports.signToken = signToken;
exports.isAuthenticated = isAuthenticated;
