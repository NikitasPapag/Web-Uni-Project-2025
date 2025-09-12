const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;
const API_BASE = '/api';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads (store under public/uploads)
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const safe = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g,'');
    cb(null, `${unique}-${safe}`);
  }
});
const upload = multer({ storage });

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',         // set your password
  database: 'diplomatikes_db',
  multipleStatements: false
});

connection.connect(err => {
  if (err) {
    console.error('❌ DB connection error:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

/* ---------------------------
   LOGIN (username + password)
   --------------------------- */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Όνομα χρήστη και κωδικός απαιτούνται.' });

  const query = 'SELECT id, username, rolos FROM xristes WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα βάσης δεδομένων.' });
    }
    if (results.length === 0) return res.status(401).json({ error: 'Λανθασμένο όνομα χρήστη ή κωδικός.' });
    const user = results[0];
    res.json({ id: user.id, username: user.username, rolos: user.rolos });
  });
});

/* ---------------------------
   ΓΡΑΜΜΑΤΕΙΑ Endpoints
   --------------------------- */

/* 1) List diplomas (for γραμματεία page) */
app.get(`${API_BASE}/grammateia/diplwmatikes`, (req, res) => {
  const query = `
    SELECT d.id, t.titlos, d.katastasi,
           x.onoma AS foititis_onoma, x.epitheto AS foititis_epitheto, f.AM AS am,
           d.logos_akyrwshs
    FROM diplomatikes d
    JOIN themata t ON d.id_thematos = t.id
    JOIN xristes x ON d.id_foititi = x.id
    LEFT JOIN foititis f ON f.id = x.id
    ORDER BY d.id DESC
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error' });
    }
    res.json(results);
  });
});

/* 2) Create user (γραμματεία) */
app.post(`${API_BASE}/grammateia/users`, (req, res) => {
  const { onoma, epitheto, email, password, rolos, am } = req.body;

  if (!onoma || !epitheto || !email || !password || !rolos) {
    return res.status(400).json({ error: 'Όλα τα πεδία είναι υποχρεωτικά.' });
  }
  if (rolos === 'foititis' && (!am || String(am).trim() === '')) {
    return res.status(400).json({ error: 'Το ΑΜ είναι υποχρεωτικό για φοιτητές.' });
  }

  const username = email.split('@')[0];

  const insertUser = 'INSERT INTO xristes (onoma, epitheto, email, password, rolos, username) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(insertUser, [onoma, epitheto, email, password, rolos, username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα καταχώρησης χρήστη.' });
    }
    const userId = result.insertId;
    if (rolos === 'foititis') {
      const insertF = 'INSERT INTO foititis (id, AM) VALUES (?, ?)';
      connection.query(insertF, [userId, am || null], (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ error: 'Σφάλμα καταχώρησης φοιτητή.' });
        }
        return res.json({ success: true, id: userId });
      });
    } else if (rolos === 'didaskon') {
      const insertD = 'INSERT INTO didaskon (id) VALUES (?)';
      connection.query(insertD, [userId], (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ error: 'Σφάλμα καταχώρησης διδάσκοντα.' });
        }
        return res.json({ success: true, id: userId });
      });
    } else {
      return res.json({ success: true, id: userId });
    }
  });
});

/* 3) Set exam (γραμματεία) - insert or update anakoinoseis */
app.post('/api/grammateia/orismos_exetasis', (req, res) => {
  const { id_diplomatikis, hmerominia, wra, tropos, topothesia } = req.body;

  if (!id_diplomatikis || !hmerominia || !wra || !tropos || !topothesia) {
    return res.status(400).json({ error: 'Όλα τα πεδία είναι υποχρεωτικά.' });
  }

  const troposDB = (tropos === 'Δια ζώσης') ? 'di_zosis' : 'online';

  const insertExam = `
    INSERT INTO anakoinoseis (id_diplomatikis, titlos, imerominia_parousiasis, ora_parousiasis, tropo_parousiasis, topothesia)
    VALUES (?, 'Εξέταση Διπλωματικής', ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      imerominia_parousiasis = VALUES(imerominia_parousiasis),
      ora_parousiasis = VALUES(ora_parousiasis),
      tropo_parousiasis = VALUES(tropo_parousiasis),
      topothesia = VALUES(topothesia)
  `;
  connection.query(insertExam, [id_diplomatikis, hmerominia, wra, troposDB, topothesia], err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα αποθήκευσης ημερομηνίας εξέτασης.' });
    }
    res.json({ success: true });
  });
});

/* 4) Cancel diploma - update status and logos_akyrwshs */
app.post(`${API_BASE}/grammateia/akyrosi_diplwmatikis`, (req, res) => {
  const { id_diplomatikis, logos } = req.body;
  if (!id_diplomatikis || !logos) return res.status(400).json({ error: 'ID και λόγος ακύρωσης απαιτούνται.' });

  const q = 'UPDATE diplomatikes SET katastasi = "akyromeni", logos_akyrwshs = ? WHERE id = ?';
  connection.query(q, [logos, id_diplomatikis], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα ενημέρωσης διπλωματικής.' });
    }
    return res.json({ success: true });
  });
});

/* 5) Praktiko link */
app.get(`${API_BASE}/grammateia/praktiko/:id`, (req, res) => {
  const { id } = req.params;
  const q = 'SELECT praktiko_link FROM diplomatikes WHERE id = ?';
  connection.query(q, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!results.length || !results[0].praktiko_link) return res.status(404).json({ error: 'Δεν υπάρχει πρακτικό για αυτή τη διπλωματική.' });
    return res.json({ link: results[0].praktiko_link });
  });
});

/* ---------------------------
   ΦΟΙΤΗΤΗΣ Endpoints
   --------------------------- */

/* THEMATA: list & single */
app.get(`${API_BASE}/themata`, (req, res) => {
  const q = 'SELECT id, titlos, perigrafi, arxeio FROM themata ORDER BY id DESC';
  connection.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
});

app.get(`${API_BASE}/themata/:id`, (req, res) => {
  const { id } = req.params;
  const q = 'SELECT id, titlos, perigrafi, arxeio FROM themata WHERE id = ?';
  connection.query(q, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (results.length === 0) return res.status(404).json({ error: 'Το θέμα δεν βρέθηκε.' });
    res.json(results[0]);
  });
});

/* Assign a theme to a student (create diplomatiki row) */
app.post(`${API_BASE}/diplomatikes/anathesi`, (req, res) => {
  const { id_thematos, id_foititi } = req.body;
  if (!id_thematos || !id_foititi) return res.status(400).json({ error: 'Απαιτούνται id_thematos και id_foititi.' });

  // If student already has a diplomatiki, return error
  const check = 'SELECT * FROM diplomatikes WHERE id_foititi = ?';
  connection.query(check, [id_foititi], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (rows.length > 0) return res.status(400).json({ error: 'Ο/Η φοιτητής/ρια έχει ήδη διπλωματική.' });

    const insert = 'INSERT INTO diplomatikes (id_thematos, id_foititi, katastasi, hmerominia_anathesis) VALUES (?, ?, "ypo_anathesi", NOW())';
    connection.query(insert, [id_thematos, id_foititi], (err2, result) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Σφάλμα καταχώρησης διπλωματικής.' });
      }
      return res.json({ success: true, id: result.insertId });
    });
  });
});

/* Get student's current diplomatiki (by student id) */
app.get(`${API_BASE}/diplomatiki/byFoititis/:id`, (req, res) => {
  const { id } = req.params;
  const q = `
    SELECT d.*, t.titlos, t.perigrafi, t.arxeio AS perigrafi_arxeio,
           x.onoma, x.epitheto,
           (SELECT GROUP_CONCAT(CONCAT(x2.onoma,' ',x2.epitheto) SEPARATOR ', ') 
            FROM trimeloys tr JOIN xristes x2 ON tr.id_melous = x2.id 
            WHERE tr.id_diplomatikis = d.id) AS melh_trimelous,
           (SELECT GROUP_CONCAT(p.katastasi SEPARATOR ', ') FROM proskliseis p WHERE p.id_diplomatikis = d.id) AS proskliseis_status,
           d.katastasi, d.hmerominia_anathesis, d.praktiko_link, d.nimertis_link, d.link_extra,
           (SELECT GROUP_CONCAT(CONCAT(prev.katastasi,'->',k.katastasi,' @ ', s.hmerominia) SEPARATOR ' || ')
            FROM (
              SELECT NULL as katastasi -- placeholder to satisfy structure if no logs
            ) prev LIMIT 1
           ) as logs_stub
    FROM diplomatikes d
    LEFT JOIN themata t ON d.id_thematos = t.id
    LEFT JOIN xristes x ON d.id_foititi = x.id
    WHERE d.id_foititi = ?
    LIMIT 1
  `;
  connection.query(q, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error' });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Δεν βρέθηκε διπλωματική για τον φοιτητή.' });
    // Normalize result fields expected by frontend
    const d = results[0];
    res.json({
      id: d.id,
      titlos: d.titlos,
      perigrafi: d.perigrafi,
      perigrafi_arxeio: d.perigrafi_arxeio,
      katastasi: d.katastasi,
      hmerominia_anathesis: d.hmerominia_anathesis,
      melh_trimelous: d.melh_trimelous,
      praktiko_link: d.praktiko_link,
      link_extra: d.link_extra,
      link_nimertis: d.nimertis_link,
      imerominia_parousiasis: d.imerominia_parousiasis,
      ora_parousiasis: d.ora_parousiasis,
      tropo_parousiasis: d.tropo_parousiasis,
      topothesia: d.topothesia
    });
  });
});

/* Profile view & update */
app.get(`${API_BASE}/profil/:id`, (req, res) => {
  const { id } = req.params;
  const q = `
    SELECT x.*, f.AM, f.tilefono_kinhto, f.tilefono_stathero
    FROM xristes x
    LEFT JOIN foititis f ON f.id = x.id
    WHERE x.id = ?
  `;
  connection.query(q, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!results.length) return res.status(404).json({ error: 'Ο χρήστης δεν βρέθηκε.' });
    res.json(results[0]);
  });
});

app.put(`${API_BASE}/profil/:id`, (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  // Update xristes table
  const updateXristes = `
    UPDATE xristes SET onoma = ?, epitheto = ?, email = ? WHERE id = ?
  `;
  connection.query(updateXristes, [payload.onoma || null, payload.epitheto || null, payload.email || null, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error updating xristes' });
    }
    // If student - update foititis table
    const updateF = `
      INSERT INTO foititis (id, AM, tilefono_kinhto, tilefono_stathero, dieythinsi_odo, dieythinsi_arithmos, dieythinsi_polh, dieythinsi_tk)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE AM = VALUES(AM), tilefono_kinhto = VALUES(tilefono_kinhto), tilefono_stathero = VALUES(tilefono_stathero),
        dieythinsi_odo = VALUES(dieythinsi_odo), dieythinsi_arithmos = VALUES(dieythinsi_arithmos),
        dieythinsi_polh = VALUES(dieythinsi_polh), dieythinsi_tk = VALUES(dieythinsi_tk)
    `;
    connection.query(updateF, [
      id,
      payload.AM || null,
      payload.tilefono_kinhto || null,
      payload.tilefono_stathero || null,
      payload.dieythinsi_odo || null,
      payload.dieythinsi_arithnos || null,
      payload.dieythinsi_polh || null,
      payload.dieythinsi_tk || null
    ], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'DB error updating foititis' });
      }
      return res.json({ success: true });
    });
  });
});

/* Trimelis: create invitation & list invitations for a diploma */
app.post(`${API_BASE}/trimelis/prosklisi`, (req, res) => {
  const { id_diplomatikis, id_didaskonta } = req.body;
  if (!id_diplomatikis || !id_didaskonta) return res.status(400).json({ error: 'Απαιτούνται id_diplomatikis και id_didaskonta.' });

  const insert = 'INSERT INTO proskliseis (id_diplomatikis, id_didaskonta, katastasi) VALUES (?, ?, "ekremis")';
  connection.query(insert, [id_diplomatikis, id_didaskonta], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error creating invitation.' });
    }
    return res.json({ success: true, id: result.insertId });
  });
});

app.get(`${API_BASE}/trimelis/proskliseis/:id`, (req, res) => {
  const { id } = req.params; // id of diplomatiki
  const q = `
    SELECT p.*, x.onoma, x.epitheto, p.katastasi AS katastasi_prosklisis
    FROM proskliseis p
    JOIN xristes x ON p.id_didaskonta = x.id
    WHERE p.id_diplomatikis = ?
    ORDER BY p.id DESC
  `;
  connection.query(q, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    return res.json(results);
  });
});

/* Upload draft (file) - form contains id_diplomatikis and optional link field */
app.post(`${API_BASE}/diplomatiki/upload_draft`, upload.single('arxeio'), (req, res) => {
  // multer will parse file and text fields
  const id_diplomatikis = req.body.id_diplomatikis || req.body.id_diplomatikis;
  const link = req.body.link || null;
  if (!id_diplomatikis) return res.status(400).json({ error: 'id_diplomatikis required' });

  const fileColumn = req.file ? `/uploads/${req.file.filename}` : null;

  const q = 'UPDATE diplomatikes SET pratic_draft_file = ?, link_extra = ? WHERE id = ?';
  connection.query(q, [fileColumn, link, id_diplomatikis], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error saving draft.' });
    }
    return res.json({ success: true });
  });
});

/* Create presentation announcement (anakoinwsi) from student screen */
app.post(`${API_BASE}/diplomatiki/anakoinwsi`, (req, res) => {
  const { id_diplomatikis, imerominia_parousiasis, ora_parousiasis, tropo_parousiasis, topothesia } = req.body;
  if (!id_diplomatikis || !imerominia_parousiasis || !ora_parousiasis || !tropo_parousiasis || !topothesia) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const q = `
    INSERT INTO anakoinoseis (id_diplomatikis, titlos, imerominia_parousiasis, ora_parousiasis, tropo_parousiasis, topothesia)
    VALUES (?, 'Παρουσίαση διπλωματικής', ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE imerominia_parousiasis = VALUES(imerominia_parousiasis),
      ora_parousiasis = VALUES(ora_parousiasis),
      tropo_parousiasis = VALUES(tropo_parousiasis),
      topothesia = VALUES(topothesia)
  `;
  connection.query(q, [id_diplomatikis, imerominia_parousiasis, ora_parousiasis, tropo_parousiasis, topothesia], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error saving announcement' });
    }
    return res.json({ success: true });
  });
});

/* Get praktiko HTML (student view) */
app.get(`${API_BASE}/diplomatiki/:id/praktiko`, (req, res) => {
  const { id } = req.params;
  // Assume praktiko_html column exists or we read from stored file
  const q = 'SELECT praktiko_link, praktiko_html FROM diplomatikes WHERE id = ?';
  connection.query(q, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!results.length) return res.status(404).json({ error: 'Diplomatiki not found' });
    const r = results[0];
    if (r.praktiko_html) return res.json({ html: r.praktiko_html });
    if (r.praktiko_link) return res.json({ link: r.praktiko_link });
    return res.status(404).json({ error: 'No praktiko available' });
  });
});

/* Save nimertis link */
app.post(`${API_BASE}/diplomatiki/nimertis`, (req, res) => {
  const { id_diplomatikis, link_nimertis } = req.body;
  if (!id_diplomatikis || !link_nimertis) return res.status(400).json({ error: 'Missing fields' });
  const q = 'UPDATE diplomatikes SET nimertis_link = ? WHERE id = ?';
  connection.query(q, [link_nimertis, id_diplomatikis], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    return res.json({ success: true });
  });
});

/* Get logs / history for diplomatiki (simplified) */
app.get(`${API_BASE}/diplomatiki/:id/logs`, (req, res) => {
  const { id } = req.params;
  // If you have a table for logs, return real logs. For now return proskliseis/status changes from proskliseis or simioseis
  const q = `
    SELECT 'prosklisi' AS typ, p.id, p.katastasi, p.hmerominia_prosklisis AS hmerominia
    FROM proskliseis p
    WHERE p.id_diplomatikis = ?
    ORDER BY p.hmerominia_prosklisis DESC
  `;
  connection.query(q, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    return res.json(results || []);
  });
});

app.get(`${API_BASE}/status`, (req, res) => res.json({ ok: true }));

/* ---------------------------
   Start server
   --------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
 