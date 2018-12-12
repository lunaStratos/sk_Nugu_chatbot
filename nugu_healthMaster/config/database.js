const Knex = require('knex');
let async = require("async");
function connect() {
  console.log(process.env.SQL_USER)
  const config = {
    user: process.env.SQL_USER || 'root',
    password: process.env.SQL_PASSWORD || 'tornado135!',
    database: process.env.SQL_DATABASE || 'camelia',
    socketPath:  `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
    // port: 3306,
    // host: '35.239.227.14'

  };

  // Connect to the database
  const knex = Knex({
    client: 'mysql',
    connection: config
  });
  console.log("SQL connect! => Original: 35.239.227.14")
  return knex;
}

const knex = connect();


module.exports = knex
