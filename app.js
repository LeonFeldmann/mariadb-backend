var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var assert = require('assert');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);



var url = process.env.DATABASE_URL;

var db = mysql.createConnection(url);
db.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected correctly to mariadb");
  db.query('SHOW TABLES;');

  // db.end();
});


app.get("/createTable", (req, res) => {
  // create table
  var table = 'CREATE TABLE test(title VARCHAR(255), text VARCHAR(255), id int AUTO_INCREMENT, PRIMARY KEY (id))';
  db.query(table, (err, result) => {
    if (err) 
      console.log(err)
    console.log(result);
    res.send("test table created");
  });
});

app.get("/fillTable", (req, res) => {
 // fill table
  var query = 'INSERT INTO test SET ?';
  var tableContent = {title:'test-title', text:'test-text'};
  db.query(query, tableContent, (err, result) => {
    if (err) 
      console.log(err)
    console.log(result);
    res.send("one entry in test has been made");
  });

});

app.get("/queryTable", (req, res) => {
  // query table
   var query = 'SELECT * FROM test';
   db.query(query, (err, result) => {
     if (err)
       console.log(err)
     console.log(result);
     res.send("These results have been fetched: \n" + JSON.stringify(result));
   });
  
   
 });
 



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
