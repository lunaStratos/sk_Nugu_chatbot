const Knex = require('knex');
let async = require("async");
function connect() {
  console.log(process.env.SQL_USER)
  const config = {
    user: process.env.SQL_USER || '아이디',
    password: process.env.SQL_PASSWORD || '암호',
    database: process.env.SQL_DATABASE || '데이터베이스이름',
    socketPath:  `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
    // port: 3306,
    // host: '35.239.227.14'

  };

  // Connect to the database
  const knex = Knex({
    client: 'mysql',
    connection: config
  });
  console.log("SQL connect!")
  return knex;
}

const knex = connect();


module.exports = knex
