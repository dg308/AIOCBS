const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'upZAiK3hjRdpbA7j2dcB',
  database: 'cab_prices',
});

const promisePool = pool.promise();

module.exports = promisePool;
