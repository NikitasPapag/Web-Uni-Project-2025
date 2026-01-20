const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt'); 

const app = express();
const PORT = 3000;
const API_BASE = '/api';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup gia anevasma arxeiwn
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

  const query = 'SELECT id, username, rolos, password FROM xristes WHERE username = ?';
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα βάσης δεδομένων.' });
    }
    if (results.length === 0) return res.status(401).json({ error: 'Λανθασμένο όνομα χρήστη ή κωδικός.' });
    
    const user = results[0];
    
    // xrisi bcrypt gia epalitheusi kwdikou me db
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Σφάλμα κατά την επαλήθευση του κωδικού.' });
      }
      if (!result) return res.status(401).json({ error: 'Λανθασμένο όνομα χρήστη ή κωδικός.' });
      
      // If true, o kodikos einai swstos
      res.json({ id: user.id, username: user.username, rolos: user.rolos });
    });
  });
});


/* ---------------------------
   ENDPOINTS Πίνακα Διδάσκοντα
   --------------------------- */

// 1. Get themata didaskonta
app.get(`${API_BASE}/didaskon/:id/themata`, (req, res) => {
const { id } = req.params;
const q = 'SELECT * FROM themata WHERE id_didaskonta = ? ORDER BY id DESC';
connection.query(q, [id], (err, results) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json(results);
});
});

// Create thema
app.post(`${API_BASE}/themata`, (req, res) => {
const { titlos, perigrafi, id_didaskonta } = req.body;
if (!titlos || !id_didaskonta) return res.status(400).json({ error: 'Λείπουν πεδία' });
const q = 'INSERT INTO themata (titlos, perigrafi, id_didaskonta) VALUES (?, ?, ?)';
connection.query(q, [titlos, perigrafi || null, id_didaskonta], (err, result) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json({ success: true, id: result.insertId });
});
});


// Update thema
app.put(`${API_BASE}/themata/:id`, (req, res) => {
const { id } = req.params;
const { titlos, perigrafi } = req.body;
const q = 'UPDATE themata SET titlos = ?, perigrafi = ? WHERE id = ?';
connection.query(q, [titlos, perigrafi, id], (err) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json({ success: true });
});
});


// Delete thema
app.delete(`${API_BASE}/themata/:id`, (req, res) => {
const { id } = req.params;
const q = 'DELETE FROM themata WHERE id = ?';
connection.query(q, [id], (err) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json({ success: true });
});
});


// 2. Aitiseis diplomatikwn
app.get(`${API_BASE}/didaskon/:id/aitiseis`, (req, res) => {
const { id } = req.params;
const q = `
SELECT d.id AS id_diplomatikis, d.id_thematos, t.titlos,
x.onoma, x.epitheto, x.email
FROM diplomatikes d
JOIN themata t ON d.id_thematos = t.id
JOIN xristes x ON d.id_foititi = x.id
WHERE t.id_didaskonta = ? AND d.katastasi = 'ypo_anathesi'
`;
connection.query(q, [id], (err, results) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json(results);
});
});

  //apofasi gia aitisi
app.post(`${API_BASE}/diplomatikes/:id/apofasi`, (req, res) => {
const { id } = req.params;
const { apofasi } = req.body;
if (apofasi === 'apodoxi') {
const q = 'UPDATE diplomatikes SET katastasi = "energi" WHERE id = ?';
connection.query(q, [id], (err) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json({ success: true });
});
} else if (apofasi === 'aporripsi') {
const q = 'DELETE FROM diplomatikes WHERE id = ?';
connection.query(q, [id], (err) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json({ success: true });
});
} else {
res.status(400).json({ error: 'Μη έγκυρη απόφαση' });
}
});


// 3. Proskliseis didaskonta
app.get(`${API_BASE}/didaskon/:id/proskliseis`, (req, res) => {
const { id } = req.params;
const q = `
SELECT p.id AS id_prosklisis, p.katastasi, t.titlos,
xf.onoma AS onoma_foititi, xf.epitheto AS epitheto_foititi, xf.email AS email_foititi
FROM proskliseis p
JOIN diplomatikes d ON p.id_diplomatikis = d.id
JOIN themata t ON d.id_thematos = t.id
JOIN xristes xf ON d.id_foititi = xf.id
WHERE p.id_didaskonta = ?
ORDER BY p.id DESC
`;
connection.query(q, [id], (err, results) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json(results);
});
});

  //apantisi gia prosklisi
app.post(`${API_BASE}/proskliseis/:id/apantisi`, (req, res) => {
const { id } = req.params;
const { katastasi } = req.body;
const q = 'UPDATE proskliseis SET katastasi = ?, hmerominia_apantisis = NOW() WHERE id = ?';
connection.query(q, [katastasi, id], (err) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json({ success: true });
});
});


// 4. Diplomatikes pou epivlepei o didaskon
app.get(`${API_BASE}/didaskon/:id/diplwmatikes`, (req, res) => {
const { id } = req.params;
const q = `
SELECT d.id, d.katastasi, d.hmerominia_anathesis, d.final_bathmos,
d.praktiko_link, d.nimertis_link,
t.titlos, x.onoma, x.epitheto, x.email
FROM diplomatikes d
JOIN themata t ON d.id_thematos = t.id
JOIN xristes x ON d.id_foititi = x.id
WHERE t.id_didaskonta = ?
ORDER BY d.id DESC
`;
connection.query(q, [id], (err, results) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json(results);
});
});


// 5. Epitropes pou symmetexei o didaskon
app.get(`${API_BASE}/didaskon/:id/epitropes`, (req, res) => {
const { id } = req.params;
const q = `
SELECT d.id AS id_diplomatikis, d.katastasi, t.titlos,
xf.onoma, xf.epitheto, xf.email
FROM trimeloys tr
JOIN diplomatikes d ON tr.id_diplomatikis = d.id
JOIN themata t ON d.id_thematos = t.id
JOIN xristes xf ON d.id_foititi = xf.id
WHERE tr.id_melous = ?
ORDER BY d.id DESC
`;
connection.query(q, [id], (err, results) => {
if (err) return res.status(500).json({ error: 'DB error' });
res.json(results);
});
});


// Submit vathmos + kritiki
app.post(`${API_BASE}/diplomatikes/:id/vathmos`, (req, res) => {
const { id } = req.params;
const { id_didaskonta, bathmos, kritiki } = req.body;


// Vriskei to antistoixo melos apo trimeloys
const qFind = 'SELECT id FROM trimeloys WHERE id_diplomatikis = ? AND id_melous = ? LIMIT 1';
connection.query(qFind, [id, id_didaskonta], (err, rows) => {
if (err) return res.status(500).json({ error: 'DB error' });
if (!rows.length) return res.status(404).json({ error: 'Δεν βρέθηκε συμμετοχή στην επιτροπή' });


const id_trimelous = rows[0].id;
const qIns = `
INSERT INTO kritiki_aksiologisis (id_trimelous, analytiki_kritiki, analytiki_vathmologia)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE analytiki_kritiki = VALUES(analytiki_kritiki), analytiki_vathmologia = VALUES(analytiki_vathmologia)
`;
connection.query(qIns, [id_trimelous, kritiki || '', bathmos], (err2) => {
if (err2) return res.status(500).json({ error: 'DB error saving grade' });
res.json({ success: true });
});
});
});

/* ---------------------------
   ENDPOINTS Πίνακα Γραμματείας
   --------------------------- */

/* 1) Lista diplomatikwn gia grammateia (Filtered & Expanded) */
app.get(`${API_BASE}/grammateia/diplwmatikes`, (req, res) => {
  const query = `
    SELECT 
      d.id AS diplomatiki_id, 
      t.titlos, 
      d.katastasi, 
      t.perigrafi, 
      d.hmerominia_anathesis,
      GROUP_CONCAT(CONCAT(x.onoma, ' ', x.epitheto) SEPARATOR ', ') AS trimelis_epitropi
    FROM diplomatikes d
    JOIN themata t ON d.id_thematos = t.id
    LEFT JOIN trimeloys tr ON d.id = tr.id_diplomatikis
    LEFT JOIN xristes x ON tr.id_melous = x.id
    WHERE d.katastasi IN ('energi', 'ypo_exetasi')
    GROUP BY d.id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα κατά τη φόρτωση των διπλωματικών.' });
    }
    res.json(results);
  });
});

/* 2) Dimiourgia xristi apo grammateia */
app.post(`${API_BASE}/grammateia/users/bulk`, async (req, res) => {
  const { users } = req.body;

  if (!users || !Array.isArray(users)) {
    return res.status(400).json({ error: 'Μη έγκυρη μορφή δεδομένων. Απαιτείται πίνακας χρηστών.' });
  }

  let successCount = 0;
  const errors = [];

  for (const user of users) {
    const { onoma, epitheto, email, password, rolos, am } = user;

    try {
      // Validation
      if (!onoma || !epitheto || !email || !password || !rolos) continue;

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into xristes (username is generated by DB)
      const [userResult] = await connection.promise().query(
        'INSERT INTO xristes (onoma, epitheto, email, password, rolos) VALUES (?, ?, ?, ?, ?)',
        [onoma, epitheto, email, hashedPassword, rolos]
      );

      const newUserId = userResult.insertId;

      // Role-specific inserts
      if (rolos === 'foititis') {
        await connection.promise().query('INSERT INTO foititis (id, AM) VALUES (?, ?)', [newUserId, am || null]);
      } else if (rolos === 'didaskon') {
        await connection.promise().query('INSERT INTO didaskon (id) VALUES (?)', [newUserId]);
      } else if (rolos === 'grammateia') {
        await connection.promise().query('INSERT INTO grammateia (id) VALUES (?)', [newUserId]);
      }

      successCount++;
    } catch (err) {
      console.error(`Error inserting user ${email}:`, err.message);
      errors.push(`${email}: ${err.message}`);
    }
  }

  if (successCount === 0 && errors.length > 0) {
    return res.status(500).json({ error: 'Αποτυχία εισαγωγής χρηστών.', details: errors });
  }

  res.json({ success: true, count: successCount, errors: errors.length > 0 ? errors : null });
});

/* 3) akyrwsh diplomatikis */
app.post(`${API_BASE}/grammateia/akyrosi_diplwmatikis`, (req, res) => {
  const { id_diplomatikis, logos, arithmos_gs, etos_gs } = req.body;

  const query = `
    UPDATE diplomatikes 
    SET katastasi = 'akyromeni', 
        logos_akyrosis = ?, 
        arithmos_protokollou_akyrwshs = ?, 
        etos_genikis_syneleusis_akyrwshs = ? 
    WHERE id = ?
  `;

  connection.query(query, [logos, arithmos_gs, etos_gs, id_diplomatikis], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα κατά την ακύρωση της διπλωματικής.' });
    }
    res.json({ message: 'Η διπλωματική ακυρώθηκε.' });
  });
});

/* 4) kataxorisi arithmou protokollou egkrisis */
app.post(`${API_BASE}/grammateia/kataxorisi_ap_egkrisis`, (req, res) => {
  const { id_diplomatikis, arithmos_ap } = req.body;

  const query = `
    UPDATE diplomatikes 
    SET arithmos_protokollou_egkrisis = ? 
    WHERE id = ? AND katastasi = 'energi'
  `;

  connection.query(query, [arithmos_ap, id_diplomatikis], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση στη βάση δεδομένων.' });
    }

    if (results.affectedRows === 0) {
      return res.status(400).json({ 
        error: 'Η καταχώρηση απέτυχε. Η διπλωματική πρέπει να είναι "Ενεργή" ή το ID δεν υπάρχει.' 
      });
    }

    res.json({ message: 'Επιτυχής καταχώρηση Α.Π. έγκρισης.' });
  });
});

/* 5) peratosi diplomatikis */
app.post(`${API_BASE}/grammateia/peratosi_diplomatikis`, (req, res) => {
  const { id_diplomatikis } = req.body;

  const query = `
    UPDATE diplomatikes 
    SET katastasi = 'peratomeni' 
    WHERE id = ? 
      AND katastasi = 'ypo_exetasi' 
      AND final_bathmos IS NOT NULL 
      AND nimertis_link IS NOT NULL
  `;

  connection.query(query, [id_diplomatikis], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα διακομιστή κατά την περάτωση.' });
    }

    if (results.affectedRows === 0) {
      return res.status(400).json({ 
        error: 'Η περάτωση απέτυχε. Βεβαιωθείτε ότι η διπλωματική είναι "Υπό Εξέταση" και ότι έχουν συμπληρωθεί ο τελικός βαθμός και το link Νημερτής.' 
      });
    }

    res.json({ message: 'Η διπλωματική περατώθηκε με επιτυχία.' });
  });
});

/* ---------------------------
   ENDPOINTS Πίνακα Φοιτητή
   --------------------------- */

/* themata lista & single */
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

/* anathesi thematos se foititi */
app.post(`${API_BASE}/diplomatikes/anathesi`, (req, res) => {
  const { id_thematos, id_foititi } = req.body;
  if (!id_thematos || !id_foititi) return res.status(400).json({ error: 'Απαιτούνται id_thematos και id_foititi.' });

  // error an o foititis exei idi diplomatiki
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

/* Get trexousa diplomatiki foititi (by student id) */
app.get(`${API_BASE}/diplomatiki/byFoititis/:id`, (req, res) => {
    const { id } = req.params;
    const q = `
        SELECT
            d.*,
            t.titlos,
            t.perigrafi,
            t.arxeio AS perigrafi_arxeio,
            GROUP_CONCAT(CONCAT(x.onoma, ' ', x.epitheto) SEPARATOR ', ') AS melh_trimelous
        FROM diplomatikes AS d
        JOIN themata AS t ON d.id_thematos = t.id
        LEFT JOIN trimeloys AS tr ON d.id = tr.id_diplomatikis
        LEFT JOIN xristes AS x ON tr.id_melous = x.id
        WHERE d.id_foititi = ?
        GROUP BY d.id
    `;
    connection.query(q, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Δεν βρέθηκε διπλωματική εργασία για αυτόν τον φοιτητή.' });
        }
        res.json(results[0]);
    });
  });


/* provoli kai epeksergasia profil */
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

/* dimiourgia prosklisis trimelous kai lista prosklisewn gia diplomatiki */
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
  const { id } = req.params; // id diplomatikis
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

/* anevasma arxeiou - to form periexei id_diplomatikis kai proairetika pedio gia link */
app.post(`${API_BASE}/diplomatiki/upload_draft`, upload.single('arxeio'), (req, res) => {
  const id_diplomatikis = req.body.id_diplomatikis;
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

/* dimiourgia anakoinwshs gia parousiasi apo foititi  */
app.post('/api/foititis/orismos_parousiasis', (req, res) => {
  const { id_diplomatikis, imerominia, wra, tropos, topothesia } = req.body;

  if (!id_diplomatikis || !imerominia || !wra || !tropos || !topothesia) {
    return res.status(400).json({ error: 'Όλα τα πεδία είναι υποχρεωτικά.' });
  }

  const troposDB = (tropos === 'Δια ζώσης') ? 'di_zosis' : 'online';

  const insertExam = `
    INSERT INTO anakoinoseis (id_diplomatikis, titlos, imerominia_parousiasis, ora_parousiasis, tropo_parousiasis, topothesia)
    VALUES (?, 'Παρουσίαση Διπλωματικής', ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      imerominia_parousiasis = VALUES(imerominia_parousiasis),
      ora_parousiasis = VALUES(ora_parousiasis),
      tropo_parousiasis = VALUES(tropo_parousiasis),
      topothesia = VALUES(topothesia)
  `;
  connection.query(insertExam, [id_diplomatikis, imerominia, wra, troposDB, topothesia], err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα αποθήκευσης ημερομηνίας εξέτασης.' });
    }
    res.json({ success: true });
  });
});

/* Get praktiko link*/
app.get(`${API_BASE}/diplomatiki/:id/praktiko`, (req, res) => {
  const { id } = req.params;
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

/* Get logs gia diplomatiki */
app.get(`${API_BASE}/diplomatiki/:id/logs`, (req, res) => {
  const { id } = req.params;
  const q = `
    SELECT 'prosklisi' AS typ, p.id, p.katastasi, p.imerominia_prosklisis AS imerominia
    FROM proskliseis p
    WHERE p.id_diplomatikis = ?
    ORDER BY p.imerominia_prosklisis DESC
  `;
  connection.query(q, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    return res.json(results || []);
  });
});


/* ---------------------------
        Δημόσιο ENDPOINT
   --------------------------- */

app.get('/api/public/anakoinoseis', (req, res) => {
  const { start_date, end_date, format } = req.query;

  let query = 'SELECT * FROM anakoinoseis';
  const params = [];

  // parametropoihsh se euros xronou
  if (start_date && end_date) {
    query += ' WHERE imerominia_parousiasis BETWEEN ? AND ?';
    params.push(start_date, end_date);
  } else if (start_date) {
    query += ' WHERE imerominia_parousiasis >= ?';
    params.push(start_date);
  } else if (end_date) {
    query += ' WHERE imerominia_parousiasis <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY imerominia_parousiasis ASC';

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB error fetching announcements.' });
    }

    // morfi arxeiou
    if (format && format.toLowerCase() === 'xml') {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<anakoinoseis>\n';
      results.forEach(row => {
        xml += '  <anakoinosi>\n';
        for (const key in row) {
          if (row.hasOwnProperty(key)) {
            xml += `    <${key}>${row[key]}</${key}>\n`;
          }
        }
        xml += '  </anakoinosi>\n';
      });
      xml += '</anakoinoseis>';
      res.set('Content-Type', 'text/xml');
      res.send(xml);
    } else {
      // JSON ws proepilogi
      res.json(results);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
