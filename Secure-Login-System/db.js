// Task 4: Secure Login System.

  //const → Declares a constant variable (cannot be reassigned).
  //mysql → Variable name holding the MySQL library.
  //require('mysql2') → Imports the mysql2 package (installed via npm).
  //This gives you access to MySQL functions in Node.js.
const mysql = require('mysql2');

  //db → Variable name for your database connection.
  //mysql.createConnection() → Method to create a connection object.
const db = mysql.createConnection({

    //host: 'localhost' → Database server address. Here it’s your own computer.
  host: 'localhost',
  
    //user: 'root' → MySQL username (default is root).
  user: 'root', 
  
    //password: '3345' → MySQL password (you set this when installing MySQL).// change to your MySQL username
  password: '3345',  
  
    //database: 'loginDB' → Name of the database you want to connect to.
  database: 'loginDB'
});

  //db.connect() → Actually opens the connection to MySQL.
  //(err => { ... }) → Callback function that runs after trying to connect.
db.connect(err => {
    //err → Holds error info if connection fails.
    // If there’s an error, stop program and show error.
  if (err) throw err;
  
    // If successful, print message in terminal.
  console.log('✅ MySQL Connected...');
});

  //module.exports → Makes db available to other files.
  //When another file does require('./db'), it gets this db connection object.
  //This is how you share the database connection across your project.
module.exports = db;
