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
  password: '',
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
app.post(`${API_BASE}/themata`, upload.single('arxeio'), (req, res) => {
  const { titlos, perigrafi, id_didaskonta } = req.body;
  
  const arxeioName = req.file ? req.file.filename : null;

  if (!titlos || !id_didaskonta) return res.status(400).json({ error: 'Λείπουν πεδία' });
  
  const q = 'INSERT INTO themata (titlos, perigrafi, arxeio, id_didaskonta) VALUES (?, ?, ?, ?)';
  
  connection.query(q, [titlos, perigrafi || null, arxeioName, id_didaskonta], (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true, id: result.insertId });
  });
});


// Update thema
app.post(`${API_BASE}/themata/update/:id`, upload.single('arxeio'), (req, res) => {
  const id = req.params.id;
  const { titlos, perigrafi } = req.body;
  
  let q = 'UPDATE themata SET titlos=?, perigrafi=?';
  let params = [titlos, perigrafi];

  if (req.file) {
      q += ', arxeio=?';
      params.push(req.file.filename);
  }

  q += ' WHERE id=?';
  params.push(id);

  connection.query(q, params, (err) => {
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

// anazhtisi foititwn
app.get(`${API_BASE}/foitites/anazitisi`, (req, res) => {
    const term = req.query.q;
    if (!term || term.length < 2) return res.json([]); // toulaxiston 2 xaraktires

    const wild = `%${term}%`;
    const q = `
        SELECT x.id, x.onoma, x.epitheto, f.AM 
        FROM xristes x
        JOIN foititis f ON x.id = f.id
        WHERE (x.onoma LIKE ? OR x.epitheto LIKE ? OR f.AM LIKE ?)
        LIMIT 10
    `;
    
    connection.query(q, [wild, wild, wild], (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json(results);
    });
});

// anathesi thematos kai allagi katastasis se ypo_anathesi
app.post(`${API_BASE}/anathesi`, (req, res) => {
    const { id_thematos, id_foititi } = req.body;

    if (!id_thematos || !id_foititi) {
        return res.status(400).json({ error: 'Missing topic or student' });
    }

    // elegxos an o foititis exei hdh diplomatiki
    const checkQ = 'SELECT id FROM diplomatikes WHERE id_foititi = ?';
    connection.query(checkQ, [id_foititi], (err, results) => {
        if (err) return res.status(500).json({ error: 'DB check error' });
        if (results.length > 0) {
            return res.status(400).json({ error: 'Ο φοιτητής έχει ήδη αναλάβει διπλωματική.' });
        }

        // eisagwgh neas diplomatikis sth bash
        const insertQ = `
            INSERT INTO diplomatikes (id_thematos, id_foititi, hmerominia_anathesis, katastasi) 
            VALUES (?, ?, NOW(), 'ypo_anathesi')
        `;
        
        connection.query(insertQ, [id_thematos, id_foititi], (err2) => {
            if (err2) return res.status(500).json({ error: 'DB Insert error' });
                        
            res.json({ success: true });
        });
    });
});

// anairesh anathesis
app.delete(`${API_BASE}/anathesi/:id`, (req, res) => {
    const id_diplomatikis = req.params.id;

        const delQ = 'DELETE FROM diplomatikes WHERE id = ?';
        connection.query(delQ, [id_diplomatikis], (err2) => {
            if (err2) return res.status(500).json({ error: 'DB Delete error' });
        });
    });

// Proskliseis didaskonta (Fetch the list of invitations)
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

// Apantisi se prosklisi
app.post(`${API_BASE}/proskliseis/:id/apantisi`, (req, res) => {
    const { id } = req.params;       
    const { katastasi } = req.body;

    // enhmerwsh katastasis prosklisis
    const qUpdate = 'UPDATE proskliseis SET katastasi = ?, hmerominia_apantisis = NOW() WHERE id = ?';

    connection.query(qUpdate, [katastasi, id], (err, result) => {
        if (err) {
            console.error("DB Error updating invitation:", err);
            return res.status(500).json({ error: 'Database update failed' });
        }
        
        // an apporifthi
        if (katastasi !== 'apodexti') {
            return res.json({ success: true, message: 'Η πρόσκληση απορρίφθηκε.' });
        }

        // mihanismos apodexti prosklhsh
        
        // plhrofories apo prosklhsh
        const qGetDetails = 'SELECT id_diplomatikis, id_didaskonta FROM proskliseis WHERE id = ?';
        connection.query(qGetDetails, [id], (err2, rows) => {
            if (err2 || rows.length === 0) return res.status(500).json({ error: 'Error fetching details' });

            const { id_diplomatikis, id_didaskonta } = rows[0];

            // prosthiki didaskonta ws melos
            const qInsertMember = 'INSERT INTO trimeloys (id_diplomatikis, id_melous, rolos) VALUES (?, ?, "melos")';
            
            connection.query(qInsertMember, [id_diplomatikis, id_didaskonta], (err3) => {
                if (err3) console.error("Error adding member:", err3.message);

                // plhthos appodextwn prosklisewn
                const qCount = 'SELECT COUNT(*) as count FROM proskliseis WHERE id_diplomatikis = ? AND katastasi = "apodexti"';
                
                connection.query(qCount, [id_diplomatikis], (err4, countResult) => {
                    if (err4) return res.status(500).json({ error: 'Error counting members' });

                    const acceptedCount = countResult[0].count;

                    // 2 melh apodexthkan
                    if (acceptedCount >= 2) {
                        console.log(`🎓 Thesis ${id_diplomatikis}: 2 members found. Activating...`);

                        // allagh katastasis diplomatikis se energi
                        const qActivate = "UPDATE diplomatikes SET katastasi = 'energi' WHERE id = ?";
                        connection.query(qActivate, [id_diplomatikis], (err5) => {
                            if (err5) console.error("Error activating thesis:", err5);
                        });

                        // akyrwsh ekremwn prosklisewn
                        const qCancelOthers = "UPDATE proskliseis SET katastasi = 'akyrosi' WHERE id_diplomatikis = ? AND katastasi = 'ekremis'";
                        connection.query(qCancelOthers, [id_diplomatikis], (err6) => {
                            if (err6) console.error("Error cancelling Proskliseis:", err6);
                        });

                        // prosthhkhg epivleponta sthn trimeloys
                        const qFindSupervisor = `
                            SELECT t.id_didaskonta 
                            FROM diplomatikes d 
                            JOIN themata t ON d.id_thematos = t.id 
                            WHERE d.id = ?`;
                            
                        connection.query(qFindSupervisor, [id_diplomatikis], (err7, superRows) => {
                            if (!err7 && superRows.length > 0) {
                                const supervisorId = superRows[0].id_didaskonta;
                                const qAddSupervisor = 'INSERT INTO trimeloys (id_diplomatikis, id_melous, rolos) VALUES (?, ?, "epivlepontas")';
                                connection.query(qAddSupervisor, [id_diplomatikis, supervisorId], (err8) => {
                                    if(err8) console.error("Supervisor insert error:", err8.message);
                                });
                            }
                        });

                        return res.json({ success: true, message: 'Η επιτροπή συμπληρώθηκε και η διπλωματική ενεργοποιήθηκε!' });
                    }

                    // an den exoun apodextei 2 melh
                    return res.json({ success: true, message: `Η πρόσκληση έγινε δεκτή. (${acceptedCount}/2 μέλη)` });
                });
            });
        });
    });
});

// diplomatikes pou symmetexei o didaskon
app.get(`${API_BASE}/didaskon/:id/diplwmatikes`, (req, res) => {
    const { id } = req.params;
    const q = `
    SELECT 
        d.id, 
        t.id_didaskonta, /* <--- THIS WAS MISSING */
        d.katastasi, 
        d.hmerominia_anathesis, 
        d.final_bathmos,
        d.praktiko_link, 
        d.nimertis_link,
        t.titlos, 
        xf.onoma AS foititis_onoma, 
        xf.epitheto AS foititis_epitheto, 
        xf.email AS foititis_email,
        GROUP_CONCAT(CONCAT(x.onoma, ' ', x.epitheto) SEPARATOR ', ') AS trimelis_epitropi
    FROM diplomatikes d
    JOIN themata t ON d.id_thematos = t.id
    JOIN xristes xf ON d.id_foititi = xf.id

    -- Join gia ta melh trimeloys
    LEFT JOIN trimeloys all_tr ON d.id = all_tr.id_diplomatikis
    LEFT JOIN xristes x ON all_tr.id_melous = x.id

    -- Join gia sygkekrimeno didaskon
    LEFT JOIN trimeloys check_tr ON d.id = check_tr.id_diplomatikis AND check_tr.id_melous = ?
    
    -- filtro epivlepontas h melos
    WHERE t.id_didaskonta = ? OR check_tr.id_melous IS NOT NULL
    
    GROUP BY d.id
    ORDER BY d.id DESC
    `;
    
    connection.query(q, [id, id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'DB error fetching theses.' });
        }
        res.json(results);
    });
});

// akyrwsh anathesis
app.post(`${API_BASE}/didaskon/akyrosi_anathesis`, (req, res) => {
    const { id_diplomatikis, id_didaskonta } = req.body;

    // alyrwsh mono apo epivleponta
    const qVerify = `
        SELECT d.id 
        FROM diplomatikes d 
        JOIN themata t ON d.id_thematos = t.id 
        WHERE d.id = ? AND t.id_didaskonta = ?`;

    connection.query(qVerify, [id_diplomatikis, id_didaskonta], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(403).json({ error: 'Δεν έχετε δικαίωμα ακύρωσης ή η διπλωματική δεν βρέθηκε.' });
        }

        // allagh katastasis se akyromeni
        const qUpdate = "UPDATE diplomatikes SET katastasi = 'akyromeni' WHERE id = ?";
        connection.query(qUpdate, [id_diplomatikis], (err2) => {
            if (err2) return res.status(500).json({ error: 'DB Error updating status' });

            // diagrafh trimeloys kai prosklisewn
            const qDelTri = "DELETE FROM trimeloys WHERE id_diplomatikis = ?";
            const qDelPros = "DELETE FROM proskliseis WHERE id_diplomatikis = ?";

            connection.query(qDelTri, [id_diplomatikis], () => {
                connection.query(qDelPros, [id_diplomatikis], () => {
                    res.json({ success: true, message: 'Η ανάθεση ακυρώθηκε επιτυχώς.' });
                });
            });
        });
    });
});

// get bathmous gia diplomatiki
app.get(`${API_BASE}/diplomatiki/:id/vathmologia`, (req, res) => {
    const { id } = req.params;
    
    const q = `
        SELECT 
            t.id_melous, 
            t.epidosi, 
            t.rolos,
            x.onoma, 
            x.epitheto 
        FROM trimeloys t
        JOIN xristes x ON t.id_melous = x.id
        WHERE t.id_diplomatikis = ?
    `;

    connection.query(q, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'DB Error fetching grades' });
        res.json(results);
    });
});

// apothikeysh bathmou kai ypologismos telikou bathmou
app.post(`${API_BASE}/diplomatiki/vathmologia`, (req, res) => {
    const { id_diplomatikis, id_didaskonta, vathmos } = req.body;

    // egkyres times
    if (vathmos === '' || vathmos === null || vathmos < 0 || vathmos > 10) {
        return res.status(400).json({ error: 'Μη έγκυρος βαθμός (0-10).' });
    }

    // ananewsh bathmou gia melos
    const qUpdate = `
        UPDATE trimeloys 
        SET epidosi = ? 
        WHERE id_diplomatikis = ? AND id_melous = ?
    `;

    connection.query(qUpdate, [vathmos, id_diplomatikis, id_didaskonta], (err, result) => {
        if (err) return res.status(500).json({ error: 'DB Error updating grade' });

        // elegxos an ola ta melh exoun vathmologisei
        const qCheck = `SELECT epidosi FROM trimeloys WHERE id_diplomatikis = ?`;
        
        connection.query(qCheck, [id_diplomatikis], (err2, rows) => {
            if (err2) return res.status(500).json({ error: 'DB Error checking grades' });

            // elegxos gia 3 melh
            if (rows.length === 3) {
                const grades = rows.map(r => r.epidosi);
                
                // elegxow an yparxei kenos bathmos
                const allGraded = grades.every(g => g !== null && g !== undefined);

                if (allGraded) {
                    // ypologismos mesos orou
                    const sum = grades.reduce((a, b) => a + parseFloat(b), 0);
                    const avg = (sum / 3).toFixed(2); 

                    // telikos bathmos kai allagi katastasis se peratomeni
                    const qFinal = `UPDATE diplomatikes SET final_bathmos = ?, katastasi = 'peratomeni' WHERE id = ?`;
                    
                    connection.query(qFinal, [avg, id_diplomatikis], (err3) => {
                        if (err3) console.error("Error updating final grade:", err3);
                        
                        return res.json({ 
                            success: true, 
                            message: `Ο βαθμός καταχωρήθηκε. Η τελική βαθμολογία (${avg}) υπολογίστηκε!`,
                            diplomatiki_peratomeni: true // shmaia gia allagh sto frontend
                        });
                    });
                } else {
                    res.json({ 
                        success: true, 
                        message: 'Ο βαθμός καταχωρήθηκε. Αναμονή για τα υπόλοιπα μέλη.',
                        diplomatiki_peratomeni: false
                    });
                }
            } else {
                res.json({ success: true, message: 'Ο βαθμός καταχωρήθηκε.' });
            }
        });
    });
});


/* allagh katastasis se ypo_exetasi */
app.post(`${API_BASE}/didaskon/set_ypo_exetasi`, (req, res) => {
    const { id_diplomatikis, id_didaskonta } = req.body;

    // elegxos an didaskon einai epivlepontas
    const qVerify = `
        SELECT d.id 
        FROM diplomatikes d 
        JOIN themata t ON d.id_thematos = t.id 
        WHERE d.id = ? AND t.id_didaskonta = ?`;

    connection.query(qVerify, [id_diplomatikis, id_didaskonta], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(403).json({ error: 'Δεν έχετε δικαίωμα αλλαγής κατάστασης.' });
        }

        // allagh katastasis
        const qUpdate = "UPDATE diplomatikes SET katastasi = 'ypo_exetasi' WHERE id = ?";
        connection.query(qUpdate, [id_diplomatikis], (err2) => {
            if (err2) return res.status(500).json({ error: 'DB Error updating status' });
            res.json({ success: true, message: 'Η διπλωματική τέθηκε σε κατάσταση Υπό Εξέταση.' });
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
      // elegxos pediwn
      if (!onoma || !epitheto || !email || !password || !rolos) continue;

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into xristes
      const [userResult] = await connection.promise().query(
        'INSERT INTO xristes (onoma, epitheto, email, password, rolos) VALUES (?, ?, ?, ?, ?)',
        [onoma, epitheto, email, hashedPassword, rolos]
      );

      const newUserId = userResult.insertId;

      // instert analoga me rolo
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

/* akyrwsh diplomatikis */
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

/* kataxorisi arithmou protokollou egkrisis */
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

/* peratosi diplomatikis */
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

/* Get trexousa diplomatiki foititi apo id */
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
        LEFT JOIN themata AS t ON d.id_thematos = t.id  /* Changed to LEFT JOIN for safety */
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
    // ananewsh foititis table
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
      payload.dieythinsi_arithmos || null,
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

// anazitisi gia prosklisi
app.get(`${API_BASE}/didaskontes/anazitisi`, (req, res) => {
    const term = req.query.q;
    if (!term || term.length < 2) return res.json([]); // toylaxiston 2 xaraktires

    const wild = `%${term}%`;
    const q = `
        SELECT id, onoma, epitheto, email 
        FROM xristes 
        WHERE rolos = 'didaskon' 
        AND (onoma LIKE ? OR epitheto LIKE ?)
        LIMIT 10
    `;
    
    connection.query(q, [wild, wild], (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json(results);
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
    SELECT p.*, x.onoma, x.epitheto, x.email, p.katastasi AS katastasi_prosklisis
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

/* anevasma arxeiou kai pedio gia link */
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

  const troposDB = (tropos === 'di_zosis') ? 'di_zosis' : 'online';

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

/* apothikeysh nimertis link */
app.post(`${API_BASE}/diplomatiki/nimertis`, (req, res) => {
  const { id_diplomatikis, nimertis_link } = req.body;
  if (!id_diplomatikis || !nimertis_link) return res.status(400).json({ error: 'Missing fields' });
  const q = 'UPDATE diplomatikes SET nimertis_link = ? WHERE id = ?';
  connection.query(q, [nimertis_link, id_diplomatikis], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    return res.json({ success: true });
  });
});

// get arxeia diplomatikis
app.get(`${API_BASE}/diplomatiki/:id/arxeia`, (req, res) => {
  const { id } = req.params;
  const q = 'SELECT * FROM arxeia WHERE id_diplomatikis = ? ORDER BY hmerominia DESC';
  
  connection.query(q, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα βάσης δεδομένων.' });
    }
    res.json(results);
  });
});

// upload arxeiou i link
app.post(`${API_BASE}/diplomatiki/arxeia`, upload.single('file'), (req, res) => {
  const { id_diplomatikis, typos, link } = req.body;
  
  // an  einai arxeio, apothikeuoume to path sto pedio link kai to onoma sto onoma_arxeiou
  let filePath = link || null;
  let fileName = req.body.onoma_arxeiou || null;

  if (req.file) {
    filePath = `/uploads/${req.file.filename}`;
    fileName = req.file.originalname;
  } else if (typos === 'link' && link) {
    if (!fileName) fileName = 'Εξωτερικός Σύνδεσμος';
  }

  if (!id_diplomatikis || !typos) {
    return res.status(400).json({ error: 'Λείπουν απαραίτητα στοιχεία.' });
  }

  const q = `
    INSERT INTO arxeia (id_diplomatikis, typos, onoma_arxeiou, link)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(q, [id_diplomatikis, typos, fileName, filePath], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Σφάλμα κατά την αποθήκευση.' });
    }
    res.json({ success: true, message: 'Το αρχείο/σύνδεσμος αποθηκεύτηκε.' });
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
