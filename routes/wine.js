// module.exports = function (app, pool) {
// var express = require('express');
// var router = express.Router();

// // var main = require('../app.js');
// // var router = main;
// // var pool = main.pool;


// /* GET wine routes. */
// router.get('/', async function(req, res) {
//   var conn = await pool.getConnection()
//   var query = `SELECT * FROM wine`;
//   var result = await conn.query(query);
//   if (conn) conn.release(); //release to pool
//   res.send(result)
// });

// router.post('/', function(req, res) {
//   res.send("Created wine");
// });


// };
