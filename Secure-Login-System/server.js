// Task 4: Secure Login System.

  // const → Declares a constant variable (cannot be reassigned).
  // express → Variable name holding the Express library.
  // require('express') → Imports the Express package (installed via npm).
  // This gives you access to Express functions for building a web server.
const express = require('express');

  // session → Variable name for the express-session library.
  // require('express-session') → Imports the express-session package for handling user sessions.
const session = require('express-session');

  // bodyParser → Variable name for the body-parser library.
  // require('body-parser') → Imports the body-parser package to parse incoming request bodies.
const bodyParser = require('body-parser');

  // bcrypt → Variable name for the bcrypt library.
  // require('bcrypt') → Imports the bcrypt package for hashing passwords securely.
const bcrypt = require('bcrypt');
  // db → Variable name for the database connection.
  // require('./db') → Imports the db connection object from the db.js file in the same directory.
const db = require('./db');

  // Create Express application instance
  // app → Variable name for the Express application instance.
  // express() → Initializes a new Express application.
const app = express();

  // Middleware setup:
  // app.use() → Method to add middleware to the Express app.
  // bodyParser.urlencoded({ extended: true }) → Middleware to parse URL-encoded bodies (from forms).
app.use(bodyParser.urlencoded({ extended: true }));

  // app.use(express.static('views')) → Middleware to serve static files from the 'views' directory.
  // This allows you to access HTML, CSS, and JS files in the 'views' folder directly via the browser.
  // For example, if you have views/login.html, you can access it at http://localhost:3000/login.html.
app.use(express.static('views'));

  // app.use(session({ ... })) → Middleware to set up session management.
app.use(session({

    //secret: 'secureSecretKey' → A secret key used to sign the session ID cookie. This should be a random string in a real application for security.
  secret: 'secureSecretKey',

    //resave: false → Prevents the session from being saved back to the session store if it wasn’t modified during the request.
  resave: false,

    //saveUninitialized: true → Forces a session that is “uninitialized” to be saved to the store. A session is uninitialized when it is new but not modified. Setting this to true can be useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie.
  saveUninitialized: true
}));

// Register:
  // app.post('/register', async (req, res) => { ... }) → Route handler for POST requests to /register. This is where the registration logic happens.
app.post('/register', async (req, res) => {

    //username, password → Extracts the username and password from the request body (sent from the registration form).
  const { username, password } = req.body;

    //hashedPassword → Variable to hold the securely hashed version of the password.
    //await bcrypt.hash(password, 10) → Hashes the password using bcrypt with a salt rounds of 10. This makes the password secure before storing it in the database.
  const hashedPassword = await bcrypt.hash(password, 10);

    //db.query() → Executes a SQL query to insert the new user into the database.
    //'INSERT INTO users (username, password) VALUES (?, ?)' → SQL query to insert a new user. The ? are placeholders for the values to prevent SQL injection.
    //[username, hashedPassword] → Array of values that will replace the ? in the SQL query. This is a safe way to insert user input into the database.
    //(err) => { ... } → Callback function that runs after the query is executed. It checks for errors and sends an appropriate response back to the client.  
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', 
    
      //[username, hashedPassword] → Array of values that will replace the ? in the SQL query. This is a safe way to insert user input into the database.
    [username, hashedPassword], 

      //(err) => { ... } → Callback function that runs after the query is executed. It checks for errors and sends an appropriate response back to the client.
    (err) => {

        // err → Holds error info if the query fails. If there’s an error, it sends a response with the error message.
        // If there’s no error, it sends a success message with a link to the login page.
        // This response is sent back to the client (browser) after trying to register the user. It informs the user whether the registration was successful or if there was an error.
      if (err) return res.send('❌ Error: ' + err.message);

        // If registration is successful, send a success message with a link to the login page.
        // The message includes a green checkmark emoji and a link to the login page for the user to proceed with logging in after successful registration.
      res.send('✅ Registration successful! <a href="/login.html">Login</a>');
    });
});

// Login:

  // app.post('/login', (req, res) => { ... }) → Route handler for POST requests to /login. This is where the login logic happens.
app.post('/login', (req, res) => {

    // username, password → Extracts the username and password from the request body (sent from the login form).
    // This allows you to access the username and password that the user entered in the login form, which will be used to authenticate the user against the database.
  const { username, password } = req.body;

    // db.query() → Executes a SQL query to find the user in the database by their username.
    // 'SELECT * FROM users WHERE username = ?' → SQL query to select the user with the given username. The ? is a placeholder for the username value to prevent SQL injection.
    // [username] → Array of values that will replace the ? in the SQL query. This is a safe way to insert user input into the database.
    // (err, results) => { ... } → Callback function that runs after the query is executed. It checks for errors and processes the results to authenticate the user.
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    
      // err → Holds error info if the query fails. If there’s an error or if no user is found (results.length === 0), it sends a response indicating that the user was not found.
      // This is a security measure to prevent revealing whether the username exists in the database, which can help protect against user enumeration attacks.
      // If there’s an error or if no user is found, send a response indicating that the user was not found.
      // This is a security measure to prevent revealing whether the username exists in the database, which can help protect against user enumeration attacks.
    if (err || results.length === 0) return res.send('❌ User not found');

      // user → Variable that holds the user record retrieved from the database (the first result in the results array).
    const user = results[0];

      // match → Variable that holds the result of comparing the entered password with the hashed password stored in the database.
      // await bcrypt.compare(password, user.password) → Compares the plaintext password entered by the user with the hashed password stored in the database using bcrypt. It returns true if they match and false otherwise.
      // This is how you verify that the user’s entered password is correct without ever storing or comparing plaintext passwords, which enhances security.
    const match = await bcrypt.compare(password, user.password);

      // If the passwords match, it creates a session for the user and redirects them to the dashboard. If they don’t match, it sends a response indicating that the credentials are invalid.
    if (match) {

        // req.session.user = user.username → Stores the username in the session to keep the user logged in across different pages. This allows you to identify the user in subsequent requests and provide personalized content or access control based on their session.
      req.session.user = user.username;

        // res.redirect('/dashboard.html') → Redirects the user to the dashboard page after successful login. This is where you would typically show user-specific content or a welcome message.
      res.redirect('/dashboard.html');
    } else {

        // If the passwords do not match, send a response indicating that the credentials are invalid. This informs the user that either the username or password they entered is incorrect without specifying which one, which is a common security practice to prevent attackers from gaining information about valid usernames.
      res.send('❌ Invalid credentials');
    }
  });
});

// Logout:
  // app.get('/logout', (req, res) => { ... }) → Route handler for GET requests to /logout. This is where the logout logic happens.
app.get('/logout', (req, res) => {

    // req.session.destroy() → Destroys the user’s session, effectively logging them out. This removes all session data associated with the user, ensuring that they will need to log in again to access protected routes.
  req.session.destroy();

    // After destroying the session, it sends a response indicating that the user has been logged out successfully. This informs the user that they have been logged out and can provide a link to log in again if needed.
res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Success</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f9f9f9;
      font-family: Arial, sans-serif;
    }
    .success-message {
      text-align: center;
      font-size: 48px;   /* BIG text */
      color: limegreen;  /* Success color */
      font-weight: bold;
      flex-direction: column;
    }
    .success-message a {
      display: block;
      margin-top: 20px;
      font-size: 20px;
      color: #2575fc;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="success-message">
    ✅ Registration successful!
    <a href="/login.html">Login</a>
  </div>
</body>
</html>
`);


});

  // app.listen(3000, () => { ... }) → Starts the Express server on port 3000. The callback function runs once the server is up and logs a message to the console indicating that the server is running and where it can be accessed (http://localhost:3000).
  // This allows you to access your web application by navigating to http://localhost:3000 in your web browser.
  // The server will handle incoming requests to the defined routes (like /register, /login, /logout) and serve the appropriate responses based on the logic you’ve implemented in those route handlers.
app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));

// Serve static files from views folder:
  // app.use(express.static(__dirname + '/views')) → Middleware to serve static files from the 'views' directory. This allows you to access HTML, CSS, and JS files in the 'views' folder directly via the browser.
  // __dirname → A Node.js variable that gives the absolute path of the directory containing the currently executing file (server.js in this case). This ensures that the path to the views folder is correct regardless of where the server is run from.
  // By using __dirname + '/views', you ensure that the server can find the views folder and serve the static files correctly, allowing you to access your HTML pages and other assets in the browser.
app.use(express.static(__dirname + '/views'));

// Show Register Page at /register:
  // app.get('/register', (req, res) => { ... }) → Route handler for GET requests to /register. This serves the registration page to the user when they navigate to http://localhost:3000/register.
app.get('/register', (req, res) => {

    // res.sendFile(__dirname + '/views/register.html') → Sends the register.html file located in the views directory as a response to the client. This allows the user to see the registration form when they access the /register route.
  res.sendFile(__dirname + '/views/register.html');
});
