const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mariadb = require('mariadb');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mariadb.createPool('mariadb://root@mariadb/myapp');

async function setupDB() {
  const conn = await pool.getConnection();
  // define database schema
  const wineTable = 'CREATE TABLE IF NOT EXISTS wine(wineID int AUTO_INCREMENT, name VARCHAR(255), quantity int, vintage VARCHAR(255), location VARCHAR(255), originCountry VARCHAR(255), region VARCHAR(255), buyingPrice DOUBLE, sellingPrice DOUBLE, storageID VARCHAR(255), image VARCHAR(255), PRIMARY KEY (wineID));';

  const addressTable = 'CREATE TABLE IF NOT EXISTS address(addressID int AUTO_INCREMENT, country VARCHAR(255), zipCode VARCHAR(255), city VARCHAR(255), street VARCHAR(255), houseNumber VARCHAR(255), PRIMARY KEY (addressID));';

  const customerTable = 'CREATE TABLE IF NOT EXISTS customer(customerID int AUTO_INCREMENT, firstName VARCHAR(255), lastName VARCHAR(255), address_ID int, email VARCHAR(255), telefone VARCHAR(255), newsletter int, PRIMARY KEY (customerID), FOREIGN KEY (address_ID) REFERENCES address(addressID) ON DELETE CASCADE);';

  const winemakerTable = 'CREATE TABLE IF NOT EXISTS winemaker(winemakerID int AUTO_INCREMENT, firstName VARCHAR(255), lastName VARCHAR(255), address_ID int, email VARCHAR(255), telefone VARCHAR(255), pricelist VARCHAR(255), PRIMARY KEY (winemakerID), FOREIGN KEY (address_ID) REFERENCES address(addressID) ON DELETE CASCADE);';

  const transactionTable = 'CREATE TABLE IF NOT EXISTS transaction(transactionID int AUTO_INCREMENT, wineID int, customerID int, FOREIGN KEY (wineID) REFERENCES wine (wineID) ON DELETE SET NULL, FOREIGN KEY (customerID) REFERENCES customer (customerID) ON DELETE SET NULL, quantity int, price double, date VARCHAR(255), PRIMARY KEY (transactionID));';

  try {
  // initialize database schema
    const queryResult = await conn.query(wineTable);
    await conn.query(addressTable);
    await conn.query(customerTable);
    await conn.query(winemakerTable);
    await conn.query(transactionTable);

    // fill table with test values if not initialized before
    if (queryResult.warningStatus === 0) {
      const wineInsertionQuery = 'INSERT INTO wine (name, quantity, vintage, location, originCountry, region, buyingPrice, sellingPrice, storageID, image) VALUES ';
      const wineValue1 = '(\'reserva especial de la mancha\', 10, \'2000\', \'upper Hills\', \'Spain\', \'la mancha\', 5.0, 9.99, \'1AA\', \'N/A\')';
      const wineValue2 = '(\'lluvia roja\', 20, \'2007\', \'field\', \'France\', \'bordeaux\', 3.0, 7.99, \'1AB\', \'N/A\')';
      await conn.query(`${wineInsertionQuery + wineValue1}, ${wineValue2};`);

      const addressInsertionQuery = 'INSERT INTO address (country, zipCode, city, street, houseNumber) VALUES ';
      const dummyAddress1 = '(\'Deutschland\', 40807, \'Berlin\', \'Am Bunker\', \'8\')';
      const dummyAddress2 = '(\'Deutschland\', 70170, \'Stuttgart\', \'Opernplatz\', \'7d\')';
      const dummyAddress3 = '(\'Deutschland\', 32897, \'München\', \'Leibnizweg\', \'1A\')';
      const dummyAddress4 = '(\'Deutschland\', 90143, \'Ostpreußen\', \'Fliederweg\', \'4\')';
      await conn.query(`${addressInsertionQuery + dummyAddress1}, ${dummyAddress2}, ${dummyAddress3}, ${dummyAddress4};`);

      const customerInsertionQuery = 'INSERT INTO customer (firstName, lastName, address_ID, email, telefone, newsletter) VALUES ';
      const dummyCustomer1 = '(\'Hans\', \'Gerster\', 1, \'N/A\', \'N/A\', 0)';
      const dummyCustomer2 = '(\'Jürger\', \'Dietrich\', 2, \'N/A\', \'01984382453\', 0)';
      await conn.query(`${customerInsertionQuery + dummyCustomer1}, ${dummyCustomer2};`);

      const winemakerInsertionQuery = 'INSERT INTO winemaker (firstName, lastName, address_ID, email, telefone, pricelist) VALUES ';
      const dummyWinemaker1 = '(\'Jankick\', \'Büchner\', 3, \'KickMe@gmail.com\', \'0132486324\', \'N/A\')';
      const dummyWinemaker2 = '(\'Jobst\', \'Stadtfeld\', 4, \'N/A\', \'N/A\', \'N/A\')';
      await conn.query(`${winemakerInsertionQuery + dummyWinemaker1},${dummyWinemaker2};`);

      const transactionInsertionQuery = 'INSERT INTO transaction (wineID, customerID, quantity, price, date) VALUES ';
      const dummyTransaction1 = '(1, 1, 5, 9.99, \'01.04.2020\')';
      const dummyTransaction2 = '(2, 1, 3, 7.99, \'19.05.2020\')';
      const dummyTransaction3 = '(1, 2, 7, 9.99, \'28.02.2019\')';
      await conn.query(`${transactionInsertionQuery + dummyTransaction1}, ${dummyTransaction2}, ${dummyTransaction3};`);

    }

  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) conn.release(); // release to pool
  }
}

setupDB();

async function initializeDatabaseSchema(conn) {
  // define database schema
  const wineTable = 'CREATE TABLE wine(wineID int AUTO_INCREMENT, name VARCHAR(255), quantity int, vintage VARCHAR(255), location VARCHAR(255), originCountry VARCHAR(255), region VARCHAR(255), buyingPrice DOUBLE, sellingPrice DOUBLE, storageID VARCHAR(255), image VARCHAR(255), PRIMARY KEY (wineID));';

  const addressTable = 'CREATE TABLE address(addressID int AUTO_INCREMENT, country VARCHAR(255), zipCode VARCHAR(255), city VARCHAR(255), street VARCHAR(255), houseNumber VARCHAR(255), PRIMARY KEY (addressID));';

  const customerTable = 'CREATE TABLE customer(customerID int AUTO_INCREMENT, firstName VARCHAR(255), lastName VARCHAR(255), address_ID int, email VARCHAR(255), telefone VARCHAR(255), newsletter int, PRIMARY KEY (customerID), FOREIGN KEY (address_ID) REFERENCES address(addressID) ON DELETE CASCADE);';

  const winemakerTable = 'CREATE TABLE winemaker(winemakerID int AUTO_INCREMENT, firstName VARCHAR(255), lastName VARCHAR(255), address_ID int, email VARCHAR(255), telefone VARCHAR(255), pricelist VARCHAR(255), PRIMARY KEY (winemakerID), FOREIGN KEY (address_ID) REFERENCES address(addressID) ON DELETE CASCADE);';

  const transactionTable = 'CREATE TABLE transaction(transactionID int AUTO_INCREMENT, wineID int, customerID int, FOREIGN KEY (wineID) REFERENCES wine (wineID) ON DELETE SET NULL, FOREIGN KEY (customerID) REFERENCES customer (customerID) ON DELETE SET NULL, quantity int, price double, date VARCHAR(255), PRIMARY KEY (transactionID));';

  try {
  // initialize database schema
    await conn.query(wineTable);
    await conn.query(addressTable);
    await conn.query(customerTable);
    await conn.query(winemakerTable);
    await conn.query(transactionTable);

    // fill table with test values
    const wineInsertionQuery = 'INSERT INTO wine (name, quantity, vintage, location, originCountry, region, buyingPrice, sellingPrice, storageID, image) VALUES ';
    const wineValue1 = '(\'reserva especial de la mancha\', 10, \'2000\', \'upper Hills\', \'Spain\', \'la mancha\', 5.0, 9.99, \'1AA\', \'N/A\')';
    const wineValue2 = '(\'lluvia roja\', 20, \'2007\', \'field\', \'France\', \'bordeaux\', 3.0, 7.99, \'1AB\', \'N/A\')';
    await conn.query(`${wineInsertionQuery + wineValue1}, ${wineValue2};`);


    const addressInsertionQuery = 'INSERT INTO address (country, zipCode, city, street, houseNumber) VALUES ';
    const dummyAddress1 = '(\'Deutschland\', 40807, \'Berlin\', \'Am Bunker\', \'8\')';
    const dummyAddress2 = '(\'Deutschland\', 70170, \'Stuttgart\', \'Opernplatz\', \'7d\')';
    const dummyAddress3 = '(\'Deutschland\', 32897, \'München\', \'Leibnizweg\', \'1A\')';
    const dummyAddress4 = '(\'Deutschland\', 90143, \'Ostpreußen\', \'Fliederweg\', \'4\')';
    await conn.query(`${addressInsertionQuery + dummyAddress1}, ${dummyAddress2}, ${dummyAddress3}, ${dummyAddress4};`);

    const customerInsertionQuery = 'INSERT INTO customer (firstName, lastName, address_ID, email, telefone, newsletter) VALUES ';
    const dummyCustomer1 = '(\'Hans\', \'Gerster\', 1, \'N/A\', \'N/A\', 0)';
    const dummyCustomer2 = '(\'Jürger\', \'Dietrich\', 2, \'N/A\', \'01984382453\', 0)';
    await conn.query(`${customerInsertionQuery + dummyCustomer1}, ${dummyCustomer2};`);

    const winemakerInsertionQuery = 'INSERT INTO winemaker (firstName, lastName, address_ID, email, telefone, pricelist) VALUES ';
    const dummyWinemaker1 = '(\'Jankick\', \'Büchner\', 3, \'KickMe@gmail.com\', \'0132486324\', \'N/A\')';
    const dummyWinemaker2 = '(\'Jobst\', \'Stadtfeld\', 4, \'N/A\', \'N/A\', \'N/A\')';
    await conn.query(`${winemakerInsertionQuery + dummyWinemaker1},${dummyWinemaker2};`);

    const transactionInsertionQuery = 'INSERT INTO transaction (wineID, customerID, quantity, price, date) VALUES ';
    const dummyTransaction1 = '(1, 1, 5, 9.99, \'01.04.2020\')';
    const dummyTransaction2 = '(2, 1, 3, 7.99, \'19.05.2020\')';
    const dummyTransaction3 = '(1, 2, 7, 9.99, \'28.02.2019\')';
    await conn.query(`${transactionInsertionQuery + dummyTransaction1}, ${dummyTransaction2}, ${dummyTransaction3};`);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// development routes

app.get("/queryTestEntries", async (req, res) => {
  conn = await pool.getConnection()
  var query = `SELECT * FROM winemaker_offers_wine`;
  var result = await conn.query(query);
  if (conn) conn.release(); // release to pool
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
  res.send("This route is deprecated and only used for test purposes. The Database will initialize automatically.");
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
    res.send("This route is deprecated and only used for test purposes. Warning you just deleted all tables & entries. To execute queries call initializeDB or restart db-server");
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
    return tables;
  }
}

// utility functions

// function used to check if a provided id is a number
function isInt(value) {
  return !isNaN(value)
    && parseInt(Number(value), 10) == value
    && !isNaN(parseInt(value, 10));
}

// determine if the request has attributes necessary for the operation specified in attributes
function checkBodyForValidAttributes(req, res, next, attributes) {
  let requestWellComposed = true;
  for (let i = 0; i < attributes.length; i++) {
    if (!req.body.hasOwnProperty(attributes[i]) || req.body[attributes[i]] == null || req.body[attributes[i]] == '') {
      requestWellComposed = false;
      break;
    }
  }
  if (requestWellComposed) {
    next();
  } else {
    res.status(400).send('Invalid input (Required parameters in request body either not existing or undefined/empty)');
    res.send();
  }
}

// wine routes
// define attributes needed to add or modify a wine
const wineAttributes = ['name', 'quantity', 'vintage', 'location', 'originCountry', 'region', 'buyingPrice', 'sellingPrice', 'storageID', 'image'];

// route for receiving all wines currently in the database in an array
app.get('/wine', async (req, res) => {
  let conn;
  const query = 'SELECT * FROM wine';

  try {
    // get database connection from pool, execute query and send result in response
    conn = await pool.getConnection();
    const result = await conn.query(query);
    res.send(result);
  } catch (err) {
    // report error in console for debugging and send error in response
    console.error(err);
    res.status(500).send(err);
    throw err;
  } finally {
    if (conn) conn.release(); // release connection to pool
  }
});

// add a wine to the database, middleware function to check if all attributes are present in request
app.post('/wine', (req, res, next) => checkBodyForValidAttributes(req, res, next, wineAttributes), async (req, res) => {
  let conn;
  const data = req.body;
  // define sql query and value string
  const query = 'INSERT INTO wine (name, quantity, vintage, location, originCountry, region, buyingPrice, sellingPrice, storageID, image) VALUES ';
  const entry = `('${data.name}', '${data.quantity}', '${data.vintage}', '${data.location}', '${data.originCountry}', '${data.region}',${data.buyingPrice},${data.sellingPrice},'${data.storageID}', '${data.image}');`;

  try {
    // get database connection from pool, execute query and send success message in response
    conn = await pool.getConnection();
    await conn.query(query + entry);
    res.status(201).send('Entry was created');
  } catch (err) {
    // report error in console for debugging and send error in response
    console.error(err);
    res.status(500).send(err);
    throw err;
  } finally {
    if (conn) conn.release(); // release connection to pool
  }
});

// route to receive the data of a specific wine specified by id
app.get('/wine/:id', async (req, res) => {
  // check for valid wineID -> if not valid send error in response
  if (!isInt(req.params.id) || req.params.id < 0) {
    res.status(400).send('Invalid ID supplied');
    return;
  }

  let conn;
  const wineID = req.params.id;
  const query = `SELECT * FROM wine WHERE wineID = ${wineID};`;

  try {
    // get connection from pool and execute query
    conn = await pool.getConnection();
    const result = await conn.query(query);

    // check if no result was returned -> send error wine was not found
    if (result.length === 0) {
      res.status(404).send('Wine not found');
      return;
    }
    res.send(result[0]);
  } catch (err) {
    // report error in console for debugging and send error in response
    console.error(err);
    res.status(500).send(err);
    throw err;
  } finally {
    if (conn) conn.release(); // release connection to pool
  }
});

// modify a wine in the database specified by id,
// middleware function to check if all attributes are present in the request
app.put('/wine/:id', (req, res, next) => checkBodyForValidAttributes(req, res, next, wineAttributes), async (req, res) => {
  // check for valid wineID -> if not valid send error in response
  if (!isInt(req.params.id) || req.params.id < 0) {
    res.status(400).send('Invalid ID supplied');
    return;
  }
  let conn;
  const wineID = req.params.id;
  const data = req.body;
  // define sql update query
  const query = `UPDATE wine SET name = '${data.name}', quantity = '${data.quantity}', vintage = '${data.vintage}', location = '${data.location}', originCountry = '${data.originCountry}', region = '${data.region}', buyingPrice = ${data.buyingPrice}, sellingPrice = ${data.sellingPrice}, storageID = '${data.storageID}', image = '${data.image}' WHERE wineID = ${wineID};`;

  try {
    // get connection from pool and execute query
    conn = await pool.getConnection();
    const result = await conn.query(query);

    // check if an update was executed, if not send error in response
    if (result.affectedRows === 0) {
      res.status(404).send('Wine not found');
      return;
    }
    res.send('Successful update');
  } catch (err) {
    // report error in console for debugging and send error in response
    console.error(err);
    res.status(500).send(err);
    throw err;
  } finally {
    if (conn) conn.release(); // release connection to pool
  }
});

// route to delete a wine from the database
app.delete('/wine/:id', async (req, res) => {
  // check for valid wineID -> if not valid send error in response
  if (!isInt(req.params.id) || req.params.id < 0) {
    res.status(400).send('Invalid ID supplied');
    return;
  }

  let conn;
  const wineID = req.params.id;
  const query = `DELETE FROM wine WHERE wineID = ${wineID};`;

  try {
    // get connection from pool and execute query
    conn = await pool.getConnection();
    const result = await conn.query(query);
    // check if a delete was executed, if not send error in response
    if (result.affectedRows === 0) {
      res.status(404).send('Wine not found');
      return;
    }
    res.send('Successful delete');
  } catch (err) {
    // report error in console for debugging and send error in response
    console.error(err);
    res.status(500).send(err);
    throw err;
  } finally {
    if (conn) conn.release(); // release connection to pool
  }
});


// customer routes
// define attributes neede to add or modify a customer
var customerAttributes = ['firstName', 'lastName', 'email', 'telefone', 'country', 'zipCode', 'city', 'street', 'houseNumber'];

// route for receiving all customers currently in the database in an array
app.get('/customer', async function(req, res) {
  let conn;
  var query = "SELECT customerID, firstName, lastName, email, telefone, newsletter, country, zipCode, city, street, houseNumber FROM customer JOIN address ON customer.address_ID = address.addressID ;"
  
  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);
    res.send(result);

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});

// route to add a customer to the database, middleware function to check if all attributes are present in the request
app.post('/customer', (req, res, next) => checkBodyForValidAttributes(req, res, next, customerAttributes), async function (req, res) {
  let conn;
  var data = req.body;

  var addressID = 0;
  var addressQuery = `INSERT INTO address (country, zipCode, city, street, houseNumber) VALUES `;
  var customerQuery = `INSERT INTO customer (firstName, lastName, address_ID, email, telefone, newsletter) VALUES `
  var addressEntry = `(' ${data.country} ',' ${data.zipCode} ', ' ${data.city} ', ' ${data.street} ', ' ${data.houseNumber} ');`;

  try { 
    conn = await pool.getConnection();
    var result = await conn.query(addressQuery + addressEntry);
    addressIDResult = await conn.query('SELECT LAST_INSERT_ID();');
    addressID = addressIDResult[0]["LAST_INSERT_ID()"];
    var customerEntry = `(' ${data.firstName} ',' ${data.lastName} ', ' ${addressID} ', ' ${data.email} ', ' ${data.telefone} ', ' ${data.newsletter} ');`;
    result = await conn.query(customerQuery + customerEntry);
    res.status(201).send('Entry was created');
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});

// route to receive the data of a specific customer specified by id
app.get('/customer/:id', async function(req, res) {
  let conn;
  var customerID = req.params.id;
  var query = "SELECT customerID, firstName, lastName, email, telefone, newsletter, country, zipCode, city, street, houseNumber FROM customer JOIN address ON customer.address_ID = address.addressID WHERE customerID = " + customerID + ";"
  
  // check for valid customerID
  if (!isInt(customerID) || 0 > customerID) {
    res.status(400).send('Invalid ID supplied');
    return
  }

  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);

    // check if no result was returned -> customer was not found
    if (result.length == 0) {
      res.status(404).send('Customer not found');
      return
    }

    res.send(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});

// route to modify a customer in the database specified by id, middleware function to check if all attributes are present in the request
app.put('/customer/:id', (req, res, next) => checkBodyForValidAttributes(req, res, next, customerAttributes), async function (req, res) {
  // check for valid customer
  if (!isInt(req.params.id) || 0 > req.params.id) {
    res.status(400).send('Invalid ID supplied');
    return
  }
  
  let conn;
  var customerID = req.params.id;
  var data = req.body;
  var addressID = 0;
  var getAddressIDQuery = `SELECT Address_ID FROM customer WHERE customerID = ${customerID}`;
  var updateCustomerQuery = `UPDATE customer SET firstname = ' ${data.firstName} ', lastName = ' ${data.lastName} ', email = ' ${data.email} ', telefone = ' ${data.telefone} ', newsletter = ' ${data.newsletter} ' WHERE customerID = ${customerID}`;

  try {
    conn = await pool.getConnection();
    var addressIDResult = await conn.query(getAddressIDQuery);
    addressID = addressIDResult[0]["Address_ID"];
    var updateAddressQuery = `UPDATE address SET country = ' ${data.country} ', zipCode = ' ${data.zipCode} ', city = ' ${data.city} ', street = ' ${data.street} ', houseNumber = ' ${data.houseNumber} ' WHERE addressID = ${addressID}`;
    var addressResult = await conn.query(updateAddressQuery);
    var customerResult = await conn.query(updateCustomerQuery);

     // check if an update was executed, if not the customerID was not found
     if (addressResult.affectedRows == 0 || customerResult.affectedRows == 0) {
      res.status(404).send('Customer not found');
      return
    }
    res.send('Successful update');

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});

// route to delete a customer from the database
app.delete('/customer/:id', async function(req, res) {
  // check for valid customerID
  if (!isInt(req.params.id) || 0 > req.params.id) {
    res.status(400).send('Invalid ID supplied');
    return
  }

  let conn;
  var customerID = req.params.id;
  var query = "DELETE FROM customer WHERE customerID = " + customerID + ";";

  try {
    conn = await pool.getConnection();
    result = await conn.query(query);
    // check if a delete was executed, if not the customerID was not found
    if (result.affectedRows == 0) {
      res.status(404).send('Customer not found');
      return
    } else {
      res.send(result);
    }

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});


// winemaker routes
// define attributes needed to add or modify a winemaker
var winemakerAttributes = ['firstName', 'lastName', 'email', 'telefone', 'pricelist', 'country', 'zipCode', 'city', 'street', 'houseNumber'];

// route for receiving all winemaker currently in the database in an array
app.get('/winemaker', async function(req, res) {
  let conn;
  var query = "SELECT winemakerID, firstName, lastName, email, telefone, pricelist, country, zipCode, city, street, houseNumber FROM winemaker JOIN address ON winemaker.address_ID = address.addressID ;"
  
  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);
    res.send(result);

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});

// route to add a winemaker to the database, middleware function to check if all attributes are present in the request
app.post('/winemaker', (req, res, next) => checkBodyForValidAttributes(req, res, next, winemakerAttributes), async function (req, res) {
  let conn;
  var data = req.body;

  var addressID = 0;
  var addressQuery = `INSERT INTO address (country, zipCode, city, street, houseNumber) VALUES `;
  var winemakerQuery = `INSERT INTO winemaker (firstName, lastName, address_ID, email, telefone, pricelist) VALUES `
  var addressEntry = `(' ${data.country} ',' ${data.zipCode} ', ' ${data.city} ', ' ${data.street} ', ' ${data.houseNumber} ');`;

  try {
    conn = await pool.getConnection();
    var result = await conn.query(addressQuery + addressEntry);
    addressIDResult = await conn.query('SELECT LAST_INSERT_ID();');
    addressID = addressIDResult[0]["LAST_INSERT_ID()"];
    var winemakerEntry = `(' ${data.firstName} ',' ${data.lastName} ', ${addressID} , ' ${data.email} ', ' ${data.telefone} ', ' ${data.pricelist} ');`;
    result = await conn.query(winemakerQuery + winemakerEntry);
    res.status(201).send('Entry was created');


  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

// route to receive the data of a specific winemaker specified by id
app.get('/winemaker/:id', async function(req, res) {
  let conn;
  var winemakerID = req.params.id;
  var query = "SELECT winemakerID, firstname, lastname, email, telefone, pricelist, country, zipCode, city, street, houseNumber FROM winemaker JOIN address on winemaker.address_ID = address.addressID WHERE winemakerID = " + winemakerID + ";";

  // check for valid winemakerID
  if (!isInt(winemakerID) || 0 > winemakerID) {
    res.status(400).send('Invalid ID supplied');
    return
  }

  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);

      // check if no result was returned -> winemaker was not found
      if (result.length == 0) {
        res.status(404).send('Winemaker not found');
        return
      }
  
    res.send(result[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});

// route to modify a winemaker in the database specified by id, middleware function to check if all attributes are present in the request
app.put('/winemaker/:id', (req, res, next) => checkBodyForValidAttributes(req, res, next, winemakerAttributes), async function (req, res) {
  // check for valid winemakerID
  if (!isInt(req.params.id) || 0 > req.params.id) {
    res.status(400).send('Invalid ID supplied');
    return
  }

  let conn;
  var winemakerID = req.params.id;
  var data = req.body;
  var addressID = 0;
  var getAddressIDQuery = `SELECT Address_ID FROM winemaker WHERE winemakerID = ${winemakerID}`;
  var updateWinemakerQuery = `UPDATE winemaker SET firstname = ' ${data.firstName} ', lastName = ' ${data.lastName} ', email = ' ${data.email} ', telefone = ' ${data.telefone} ', pricelist = ' ${data.pricelist} ' WHERE winemakerID = ${winemakerID}`;

  try {
    conn = await pool.getConnection();
    var addressIDResult = await conn.query(getAddressIDQuery);
    addressID = addressIDResult[0]["Address_ID"];
    var updateAddressQuery = `UPDATE address SET country = ' ${data.country} ', zipCode = ' ${data.zipCode} ', city = ' ${data.city} ', street = ' ${data.street} ', houseNumber = ' ${data.houseNumber} ' WHERE addressID = ${addressID}`;
    var addressResult = await conn.query(updateAddressQuery);
    var winemakerResult = await conn.query(updateWinemakerQuery);

    // check if an update was executed, if not the winemakerID was not found
    if (addressResult.affectedRows == 0 || winemakerResult.affectedRows == 0) {
      res.status(404).send('Winemaker not found');
      return
    }
    res.send('Successful update');

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});

// route to delete a winemaker from the database
app.delete('/winemaker/:id', async function(req, res) {
    // check for valid winemakerID
    if (!isInt(req.params.id) || 0 > req.params.id) {
      res.status(400).send('Invalid ID supplied');
      return
    }
  
  let conn;
  var winemakerID = req.params.id;
  var query = "DELETE FROM winemaker WHERE winemakerID = " + winemakerID + ";";

  try {
    conn = await pool.getConnection();
    result = await conn.query(query);
     // check if a delete was executed, if not the winemakerID was not found
     if (result.affectedRows == 0) {
      res.status(404).send('Winemaker not found');
      return
    } else {
      res.send(result);
    }

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});


// other routes
// define attributes needed to add a transaction
var transactionAttributes= ['wineID', 'customerID', 'quantity', 'price', 'date'];

// route to add a purchase from a customer of one or more wines to the database
app.post('/completePurchase', async function(req, res) {
  let conn;
  var data = req.body;
  var wineQuantityResult;
  var wineQuantity;
  var remainingQuantity;
  var updateQuantityQuery;
  var transactionQuery = `INSERT INTO transaction (wineID, customerID, quantity, price, date) VALUES `;
  var transactionEntry;

  try {
    conn = await pool.getConnection();
    // calculate and update remaining quantity of wine for each wine transaction
    data.forEach(async function (transaction) {
      var query = `SELECT quantity FROM wine WHERE wineID = '${transaction.wineID}'`;
      wineQuantityResult = await conn.query(query);
      wineQuantity = wineQuantityResult[0].quantity;
      if (wineQuantity < transaction.quantity) {
        throw "requested wine quantity higher than the quantity that is in store"
      } else {
        remainingQuantity = wineQuantity - transaction.quantity;
        updateQuantityQuery = `UPDATE wine SET quantity = ${remainingQuantity} WHERE wineID = ${transaction.wineID}`;
        await conn.query(updateQuantityQuery);
        transactionEntry = `(' ${transaction.wineID} ', ' ${transaction.customerID} ', ' ${transaction.quantity} ', ' ${transaction.price} ', ' ${transaction.date} ')`;
        await conn.query(transactionQuery + transactionEntry)
      }
    });
    res.status(201).send('Entry was created');

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});

// route to receive all saved transactions
app.get('/transactions', async function(req, res) {
  let conn;
  var query = "SELECT * FROM transaction";

  try {
    conn = await pool.getConnection();
    var result = await conn.query(query);
    res.send(result);

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    throw err;

  } finally {
    if (conn) conn.release(); //release to pool
  }
});


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
