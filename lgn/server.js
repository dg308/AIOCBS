const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 4000;

app.use(express.json());

// Create a new SQLite database and table
let db = new sqlite3.Database('./users.db', (err) => {

  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the in-memory SQlite database.');
    db.run('CREATE TABLE users (email TEXT, password TEXT);', (tableErr) => {
      if (tableErr) {
        console.error(tableErr.message);
      } else {
        console.log('Created users table');
      }
    });
  }
});

// Register route
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { email: req.body.email, password: hashedPassword };

    db.get('SELECT * FROM users WHERE email = ?;', [user.email], async (selectErr, row) => {
      if (selectErr) {
        res.status(500).send();
      } else if (row) {
        res.status(400).send('User already exists');
      } else {
        db.run('INSERT INTO users (email, password) VALUES (?, ?);', [user.email, user.password], (insertErr) => {
          if (insertErr) {
            res.status(500).send();
          } else {
            res.status(201).send('Registration successful');
          }
        });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
});



// Login route
app.post('/login', async (req, res) => {
  db.get('SELECT * FROM users WHERE email = ?;', [req.body.email], async (selectErr, row) => {
    if (selectErr) {
      res.status(500).send();
    } else if (!row) {
      res.status(400).send('User not registered');
    } else {
      try {
        if (await bcrypt.compare(req.body.password, row.password)) {
          res.status(200).send('Login successful');
        } else {
          res.status(401).send('Incorrect password');
        }
      } catch (err) {
        res.status(500).send();
      }
    }
  });
});

const publicPath = path.join(__dirname, '..', 'dist');
console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));




app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'Login.html'));
});


app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});








app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
