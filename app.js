var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mariadb = require('mariadb');
var wineRouter = require('./routes/wine');
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

// app.use('/wine', wineRouter);
// app.use('/users', usersRouter);



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

async function asyncFunction() {
  let conn;
  try {
 
    conn = await pool.getConnection();
    console.log("Connected successfully");
    // require('./routes/wine')(app, pool);

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
  var wineTable = `CREATE TABLE wine(wineID int AUTO_INCREMENT, name VARCHAR(255), quantity int, description VARCHAR(255), vintage int, location VARCHAR(255), originCountry VARCHAR(255), region VARCHAR(255), buyingPrice DOUBLE, sellingPrice DOUBLE, storageID VARCHAR(255), image VARCHAR(255), PRIMARY KEY (wineID));`;

  var addressTable = `CREATE TABLE address(addressID int AUTO_INCREMENT, country VARCHAR(255), zipCode VARCHAR(255), city VARCHAR(255), street VARCHAR(255), houseNumber VARCHAR(255), PRIMARY KEY (addressID));`;

  var customerTable = `CREATE TABLE customer(customerID int AUTO_INCREMENT, firstName VARCHAR(255), lastName VARCHAR(255), address_ID int, email VARCHAR(255), telefone VARCHAR(255), PRIMARY KEY (customerID), FOREIGN KEY (address_ID) REFERENCES address(addressID) ON DELETE CASCADE);`;

  var winemakerTable = `CREATE TABLE winemaker(winemakerID int AUTO_INCREMENT, firstName VARCHAR(255), lastName VARCHAR(255), addressID int, email VARCHAR(255), telefone VARCHAR(255), pricelist VARCHAR(255), PRIMARY KEY (winemakerID), FOREIGN KEY (addressID) REFERENCES address(addressID) ON DELETE CASCADE);`;

  var customer_buys_wineTable = `CREATE TABLE customer_buys_wine(transactionID int AUTO_INCREMENT, wineID int, customerID int, FOREIGN KEY (wineID) REFERENCES wine (wineID) ON DELETE SET NULL, FOREIGN KEY (customerID) REFERENCES customer (customerID) ON DELETE SET NULL, quantity int, date VARCHAR(255), PRIMARY KEY (transactionID));`;

  var winemaker_offers_wineTable = `CREATE TABLE winemaker_offers_wine(offerID int AUTO_INCREMENT, wineID int, winemakerID int, FOREIGN KEY (wineID) REFERENCES wine (wineID) ON DELETE CASCADE, FOREIGN KEY (winemakerID) REFERENCES winemaker (winemakerID) ON DELETE CASCADE, PRIMARY KEY (offerID));`;

try {

  // initialize database schema
  await conn.query(wineTable);
  await conn.query(addressTable);
  await conn.query(customerTable);
  await conn.query(winemakerTable);
  await conn.query(customer_buys_wineTable)
  await conn.query(winemaker_offers_wineTable)

  // fill table with test values
  var wineInsertionQuery = `INSERT INTO wine (name, quantity, description, vintage, location, originCountry, region, buyingPrice, sellingPrice, storageID, image) VALUES `;
  var wine1Values = `('reserva especial de la mancha', 10, 'This wine is very tasty', '2000', 'upper Hills', 'Spain', 'la mancha', 5.0, 9.99, '1AA', 'N/A')`;
  var wine2Values = `('renault peugeot baguette', 20, 'Also a very tasty wine', '2007', 'field', 'France', 'bordeaux', 3.0, 7.99, '1AB', 'N/A')`;
  await conn.query(wineInsertionQuery + wine1Values + ',' + wine2Values + ';');


  var addressInsertionQuery = `INSERT INTO address (country, zipCode, city, street, houseNumber) VALUES `;
  var dummyAddress1 = `('Deutschland', 40807, 'Berlin', 'Am Bunker', '8')`;
  var dummyAddress2 = `('Deutschland', 70170, 'Stuttgart', 'Opernplatz', '7d')`;
  var dummyAddress3 = `('Deutschland', 32897, 'München', 'Leibnizweg', '1A')`;
  var dummyAddress4 = `('Deutschland', 90143, 'Ostpreußen', 'Fliederweg', '4')`;
  await conn.query(addressInsertionQuery + dummyAddress1 + ',' + dummyAddress2 + ',' + dummyAddress3 + ',' + dummyAddress4 + ';');

  var customerInsertionQuery = `INSERT INTO customer (firstName, lastName, address_ID, email, telefone) VALUES `;
  var dummyCustomer1= `('Hans', 'Gerster', 1, 'N/A', 'N/A')`;
  var dummyCustomer2 = `('Jürger', 'Dietrich', 2, 'N/A', '01984382453')`;
  await conn.query(customerInsertionQuery + dummyCustomer1 + ',' + dummyCustomer2 + ';');

  var winemakerInsertionQuery = `INSERT INTO winemaker (firstName, lastName, addressID, email, telefone, pricelist) VALUES `;
  var dummyWinemaker1= `('Jankick', 'Büchner', 3, 'KickMe@gmail.com', '0132486324', 'N/A')`;
  var dummyWinemaker2 = `('Jobst', 'Stadtfeld', 4, 'N/A', 'N/A', 'N/A')`;
  await conn.query(winemakerInsertionQuery + dummyWinemaker1 + ',' + dummyWinemaker2 + ';');

  var transactionInsertionQuery = `INSERT INTO customer_buys_wine (wineID, customerID, quantity, date) VALUES `;
  var dummyTransaction1= `(1, 1, 5, '01.04.2020')`;
  var dummyTransaction2 = `(2, 1, 3, '19.05.2020')`;
  var dummyTransaction3 = `(1, 2, 7, '28.02.2019')`;
  await conn.query(transactionInsertionQuery + dummyTransaction1 + ',' + dummyTransaction2 + ',' + dummyTransaction3 + ';');

  var offerInsertionQuery = `INSERT INTO winemaker_offers_wine (wineID, winemakerID) VALUES `;
  var dummyOffer1 = `(1, 1)`;
  var dummyOffer2 = `(2, 2)`;
  await conn.query(offerInsertionQuery + dummyOffer1 + ',' + dummyOffer2 + ';');

  
} catch (err) {
  console.error(err);
  throw err;
} finally {
  return
}

}



app.get("/queryTestEntries", async (req, res) => {
  conn = await pool.getConnection()
  var query = `SELECT * FROM winemaker_offers_wine`;
  var result = await conn.query(query);
  if (conn) conn.release(); //release to pool
  res.send(result)
});

app.get("/makeTestEntries", async (req, res) => {
  conn = await pool.getConnection()

  var offerInsertionQuery = `INSERT INTO winemaker_offers_wine (wineID, winemakerID) VALUES `;
  var winemaker_offers_wineTable = `CREATE TABLE winemaker_offers_wine(offerID int AUTO_INCREMENT, wineID int, winemakerID int, FOREIGN KEY (wineID) REFERENCES wine (wineID), FOREIGN KEY (winemakerID) REFERENCES winemaker (winemakerID), PRIMARY KEY (offerID));`;

  var dummyOffer1 = `(1, 1)`;
  var dummyOffer2 = `(2, 2)`;

  await conn.query(offerInsertionQuery + dummyOffer1 + ',' + dummyOffer2 + ';');

  if (conn) conn.release(); //release to pool
  res.send()
});

app.get("/createTable", async (req, res) => {
  var customer_buys_wineTable = `CREATE TABLE customer_buys_wine(transactionID int AUTO_INCREMENT, wineID int, customerID int, FOREIGN KEY (wineID) REFERENCES wine (wineID), FOREIGN KEY (customerID) REFERENCES customer (customerID), quantity int, date VARCHAR(255), PRIMARY KEY (transactionID));`;
  conn = await pool.getConnection()
  await conn.query(customer_buys_wineTable)
  if (conn) conn.release(); //release to pool
  res.send()
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

// wine routes
app.get('/wine', async function(req, res) {
  let conn;
  var query = `SELECT * FROM wine`;
  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
  // result.forEach(wine => {
  //   delete wine['wineID']
  // });
});

app.post('/wine', async function (req, res) {
  let conn;
  var data = req.body;
//   var data = {
//     name: 'testWine',
//     quantity: 15,
//     description: 'tasty McSchmasty',
//     vintage: 2006,
//     location: 'field',
//     originCountry: 'France',
//     region: 'bordeaux',
//     buyingPrice: 4,
//     sellingPrice: 8.99,
//     storageID: '1AB',
//     image: 'N/A'
// };


var query = `INSERT INTO wine (name, quantity, description, vintage, location, originCountry, region, buyingPrice, sellingPrice, storageID, image) VALUES `
var entry = "('" + data.name + "'," + data.quantity + ", '" + data.description + "', '" + data.vintage + "', '" + data.location + "', '" + data.originCountry + "', '" + data.region + "'," + data.buyingPrice + "," + data.sellingPrice + ",'" + data.storageID + "', '" + data.image + "');";

  try {
    conn = await pool.getConnection();
    var result = await conn.query(query + entry);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.get('/wine/:id', async function(req, res) {
  var wineID = req.params.id;
  console.log(wineID);
  let conn;
  var query = "SELECT * FROM wine WHERE wineID = " + wineID + ";";
  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
  // result.forEach(wine => {
  //   delete wine['wineID']
  // });
});

app.put('/wine/:id', async function(req, res) {
  var wineID = req.params.id;
  var data = req.body;
  let conn;
  //   var data = {
//     name: 'testWine',
//     quantity: 15,
//     description: 'tasty McSchmasty',
//     vintage: 2006,
//     location: 'field',
//     originCountry: 'France',
//     region: 'bordeaux',
//     buyingPrice: 4,
//     sellingPrice: 8.99,
//     storageID: '1AB',
//     image: 'N/A'
// };
  var query = "UPDATE wine SET name = '" + data.name + "', quantity = " + data.quantity + ", description = '" + data.description + "', vintage = '" + data.vintage + "', location = '" + data.location + "', originCountry = '" + data.originCountry + "', region = '" + data.region + "', buyingPrice = " + data.buyingPrice + ", sellingPrice = " + data.sellingPrice + ", storageID = '" + data.storageID + "', image = '" + data.image + "' WHERE wineID = " + wineID + ";";
  try {
    conn = await pool.getConnection();
    result = await conn.query(query);
    res.send();
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.delete('/wine/:id', async function(req, res) {
  var wineID = req.params.id;
  let conn;
  var query = "DELETE FROM wine WHERE wineID = " + wineID + ";";
  try {
    conn = await pool.getConnection();
    result = await conn.query(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});


// customer routes
app.get('/customer', async function(req, res) {
  let conn;
  var query = `SELECT * FROM customer`;
  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.post('/customer', async function (req, res) {
  let conn;
  var data = req.body;
//   var data = {
//     name: 'testWine',
//     quantity: 15,
//     description: 'tasty McSchmasty',
//     vintage: 2006,
//     location: 'field',
//     originCountry: 'France',
//     region: 'bordeaux',
//     buyingPrice: 4,
//     sellingPrice: 8.99,
//     storageID: '1AB',
//     image: 'N/A'
// };
var addressID = 1;
var addressQuery = `INSERT INTO address (country, zipCode, city, street, houseNumber) VALUES `;
var customerQuery = `INSERT INTO customer (firstName, lastName, addressID, email, telefone) VALUES `
var entry = `(' ${data.firstName} ',' ${data.lastName} + ', ' ${addressID} ', ' ${data.email} ', ' ${data.telefone} ');`;
var addressEntry = `(' ${data.originCountry} ',' ${data.zipC} + ', ' ${addressID} ', ' ${data.email} ', ' ${data.telefone} ');`;

  try {
    conn = await pool.getConnection();
    var result = await conn.query(query + entry);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.get('/customer/:id', async function(req, res) {
  var customerID = req.params.id;
  let conn;
  var query = "SELECT customerID, firstName, lastName, email, telefone, country, zipCode, city, street, houseNumber FROM customer JOIN address ON customer.address_ID = address.addressID WHERE customerID = " + customerID + ";"
  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);
    delete result['addressID']
    delete result['address_ID']

    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.delete('/customer/:id', async function(req, res) {
  var customerID = req.params.id;
  let conn;
  var query = "DELETE FROM customer WHERE customerID = " + customerID + ";";
  try {
    conn = await pool.getConnection();
    result = await conn.query(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});


// winemaker routes
app.get('/winemaker', async function(req, res) {
  let conn;
  var query = `SELECT * FROM winemaker`;
  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.get('/winemaker/:id', async function(req, res) {
  var winemakerID = req.params.id;
  let conn;
  var query = "SELECT * FROM winemaker WHERE winemakerID = " + winemakerID + ";";
  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.delete('/winemaker/:id', async function(req, res) {
  var winemakerID = req.params.id;
  let conn;
  var query = "DELETE FROM winemaker WHERE winemakerID = " + winemakerID + ";";
  try {
    conn = await pool.getConnection();
    result = await conn.query(query);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});






app.post('/', async function(req, res) {
  let conn;
  var query = "";
  try {
    conn = await pool.getConnection();
    
    res.send();
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.get('/test', async function (req, res) {
  let conn;
  var table = 'CREATE TABLE test(title VARCHAR(255), text VARCHAR(255), id int AUTO_INCREMENT, PRIMARY KEY (id))';
  var query = `INSERT INTO test SET ?`;
  var tableContent = {title:'test-title', text:'test-text'};

  try {
    conn = await pool.getConnection();
    await conn.query(table);
    var result = await conn.query(query, tableContent);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
    res.send(result);
  }
});

app.get("/fillTable", async (req, res) => {
  db = await pool.getConnection();
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
// module.exports.pool = pool;
