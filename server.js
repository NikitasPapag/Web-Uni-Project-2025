var express = require('express');
var path = require('path');
var mysql = require('mysql2');
var cors = require('cors');

var app = express();
var PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // or your password
  database: 'diplomatikes_db'
});

connection.connect(err => {
  if (err) {
    console.error('❌ DB connection error:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// API: login endpoint (username + password)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Όνομα χρήστη και κωδικός απαιτούνται.' });
  }

  const query = 'SELECT * FROM xristes WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Σφάλμα βάσης δεδομένων.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Λανθασμένο όνομα χρήστη ή κωδικός.' });
    }

    const user = results[0];
    res.json({
      username: user.username,
      rolos: user.rolos
    });
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
