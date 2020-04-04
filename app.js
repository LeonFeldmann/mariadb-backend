var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mariadb = require('mariadb');

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

// var db = mysql.createPool(url);
// db.getConnection(function(err) {
//   assert.equal(null, err);
//   console.log("Connected correctly to mariadb");
//   // db.query('SHOW TABLES;');
//   // checkDBForInitialization()

//   // db.end();
// });

const pool = mariadb.createPool("mariadb://root@mariadb/myapp");
async () => {
  db = await pool.getConnection();
}


async function asyncFunction() {
  let conn;
  try {
 
    conn = await pool.getConnection();
    console.log("Connected successfully");
    // const rows = await conn.query("SELECT 1 as val");
    // rows: [ {val: 1}, meta: ... ]
 
    // const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
    // res: { affectedRows: 1, insertId: 1, warningStatus: 0 }
 
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
}


// function checkDBForInitialization() {
//   var table = 'CREATE TABLE test(title VARCHAR(255), text VARCHAR(255), id int AUTO_INCREMENT, PRIMARY KEY (id))';
//   db.query(table, (err, result) => {
//     if (err) {
//       console.log("The db is already initialized");
//     } else {
//       // initializeDatabaseSchema()
//       console.log("The db has been initialized successfully");
//     }
//   });

// }

async function initializeDatabaseSchema(conn) {


  // define database schema
  var wineTable = `CREATE TABLE wine(wineID int AUTO_INCREMENT, quantity int, description VARCHAR(255), vintage int, location VARCHAR(255), originCountry VARCHAR(255), region VARCHAR(255), buyingPrice DOUBLE, sellingPrice DOUBLE, storageID VARCHAR(255), image VARCHAR(255), PRIMARY KEY (wineID));`;

  var customerTable = `CREATE TABLE customer(customerID int AUTO_INCREMENT, firstName VARCHAR(255), lastName VARCHAR(255), telefone VARCHAR(255), email VARCHAR(255), addressID int, PRIMARY KEY (customerID), FOREIGN KEY (addressID) REFERENCES address(addressID));`;

  var customerAddressTable = `CREATE TABLE address(addressID int AUTO_INCREMENT, country VARCHAR(255), zipCode VARCHAR(255), city VARCHAR(255), street VARCHAR(255), houseNumber VARCHAR(255), PRIMARY KEY (addressID));`;

  var winemakerTable = `CREATE TABLE winemaker(winemakerID int AUTO_INCREMENT, firstName VARCHAR(255), lastName VARCHAR(255), addressID int, email VARCHAR(255), telefone VARCHAR(255), pricelist VARCHAR(255), PRIMARY KEY (winemakerID), FOREIGN KEY (addressID) REFERENCES address(addressID));`;

  var customer_buys_wineTable = `CREATE TABLE customer_buys_wine(transactionID int AUTO_INCREMENT, FOREIGN KEY (wineID) REFERENCES wine(wineID), FOREIGN KEY (customerID) REFERENCES customer(customerID), quantity int, date string, PRIMARY KEY (transactionID));`;

  var winemaker_offers_wineTable = `CREATE TABLE winemaker_offers_wine(offerID int AUTO_INCREMENT, FOREIGN KEY (wineID) REFERENCES wine(wineID), FOREIGN KEY (winemakerID) REFERENCES winemaker(winemakerID), PRIMARY KEY (offerID));`;

try {

  // initialize database schema
  await conn.query(wineTable);
  await conn.query(customerAddressTable);
  await conn.query(customerTable);
  await conn.query(winemakerTable);
 
  
} catch (err) {
  console.error(err);
  throw err;
} finally {
  return
}


    // db.query(winemakerTable, (err) => {
    //   if (err) 
    //     console.log("This error occured: " + err)
    // });

  // db.query(customer_buys_wineTable, (err) => {
  //   if (err) 
  //     console.log("This error occured: " + err)
  // });

  // db.query(winemaker_offers_wineTable, (err) => {
  //   if (err) 
  //     console.log("This error occured: " + err)
  // });

// create test entries

// var query = ` INSERT INTO wine SET ?`;
// var wineTemplate = 
// { 
//   quantity: 0, 
//   description: '', 
//   vintage: '2000', 
//   location: '', 
//   originCountry: '', 
//   region: '', 
//   buyingPrice: 0.0, 
//   sellingPrice: 0.0, 
//   storageID: '1A', 
//   image: 'N/A' 
// };

// var wine1 = 
// { 
//   quantity: 10, 
//   description: 'This wine is very tasty', 
//   vintage: '2000', 
//   location: 'mountain', 
//   originCountry: 'France', 
//   region: 'upper Hills', 
//   buyingPrice: 5.0, 
//   sellingPrice: 9.99, 
//   storageID: '1AB', 
//   image: 'N/A' 
// };

// db.query(query, wine1, (err) => {
//   if (err) 
//     console.log(err)
// });

}


app.get("/makeTestEntries", (req, res) => {
  var query = ` INSERT INTO wine SET ?`;
  var wine1 = 
  { 
    quantity: 10, 
    description: 'This wine is very tasty', 
    vintage: '2000', 
    location: 'mountain', 
    originCountry: 'France', 
    region: 'upper Hills', 
    buyingPrice: 5.0, 
    sellingPrice: 9.99, 
    storageID: '1AB', 
    image: 'N/A' 
  };

  db.query(query, wine1, (err) => {
    if (err) 
      console.log(err)
  });
  
  res.send();
});

app.get("/queryTestEntries", (req, res) => {
  var query = `SELECT * FROM wine`;
  
  db.query(query, (err, result) => {
    if (err) 
      console.log(err)
    console.log(result);
    res.send(result);
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
  
app.get("/createTable", (req, res) => {
    var wineTable = `CREATE TABLE wine(wineID int AUTO_INCREMENT, quantity int, description VARCHAR(255), vintage int, location VARCHAR(255), originCountry VARCHAR(255), region VARCHAR(255), buyingPrice DOUBLE, sellingPrice DOUBLE, storageID VARCHAR(255), image VARCHAR(255), PRIMARY KEY (wineID));`;
  
     db.query(wineTable, (err, result) => {
       if (err)
         console.log(err)
       console.log(result);
       res.send();
     });

});
 




app.get("/initializeDB", async (req, res) => {
  conn = await pool.getConnection()
  await initializeDatabaseSchema(conn);
  var tables = await getAllTables(conn);
  if (conn) conn.release(); //release to pool
  res.send(tables);
});

app.get("/cleanDB", async (req, res) => {

  let conn;
  try {

    conn = await pool.getConnection();
    var tablesArray = await getAllTables(conn);
    // console.log(tablesArray);
    if (tablesArray.length > 0) {
      var tables = '';
      for (var i = 0; i < tablesArray.length; i++) {
        tables = tables + tablesArray[i].table_name;
        // console.log(tablesArray[i].table_name);
        if (i < tablesArray.length - 1)
          tables += ',';
      }
      var deleteQuery = `DROP TABLE IF EXISTS ` + tables;
      // console.log(deleteQuery);
      await conn.query('SET FOREIGN_KEY_CHECKS=0;');
      await conn.query(deleteQuery);
      await conn.query('SET FOREIGN_KEY_CHECKS=1;');
    }
    var remainingTables = await getAllTables(conn);

  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
    res.send(remainingTables);
  }
});

app.get("/getAllTables", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    var tables = await getAllTables(conn);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
    res.send(tables);
  }
});

async function getAllTables(connection) {
  try {
    var query = `select table_name from information_schema.tables where table_schema = 'myapp'`;
    var tables = await connection.query(query);
    console.log(tables);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    return tables
  }
}



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
