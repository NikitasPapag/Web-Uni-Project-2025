const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises; // async file ops for praktika
const mysql = require('mysql2/promise'); // unified async MySQL
const multer = require('multer'); // file uploads
const session = require('express-session'); // login/session handling


const app = express();
const PORT = 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'diplomatikes_db',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});

// helper: run query safely
async function q(sql, params = {}) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// API: login endpoint (username + password)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Όνομα χρήστη και κωδικός απαιτούνται.' });
  }

  try {
    const rows = await q(
      `SELECT * FROM xristes WHERE username=:username AND password=:password`,
      { username, password }
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Λανθασμένο όνομα χρήστη ή κωδικός.' });
    }

    const user = rows[0];
    res.json({
      username: user.username,
      rolos: user.rolos
    });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Σφάλμα βάσης δεδομένων.' });
  }
});

// Themata didaskonta
// GET: ta themata tou didaskonta
app.get('/api/didaskon/:idDidaskonta/themata', async (req, res) => {
  const { idDidaskonta } = req.params;
  try {
    const rows = await q(
      `SELECT id, titlos, perigrafi, arxeio
       FROM themata
       WHERE id_didaskonta = :idDidaskonta
       ORDER BY id DESC`,
      { idDidaskonta }
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα βάσης.' });
  }
});

// POST: neo thema (titlos, perigrafi, id_didaskonta)
app.post('/api/themata', async (req, res) => {
  const { titlos, perigrafi, id_didaskonta } = req.body;
  if (!titlos || !id_didaskonta) {
    return res.status(400).json({ error: 'Απαιτείται τίτλος και διδάσκων.' });
  }
  try {
    await q(
      `INSERT INTO themata (titlos, perigrafi, id_didaskonta)
       VALUES (:titlos, :perigrafi, :id_didaskonta)`,
      { titlos, perigrafi: perigrafi || null, id_didaskonta }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα εισαγωγής θέματος.' });
  }
});

// PUT: enimerwsi thematos
app.put('/api/themata/:id', async (req, res) => {
  const { id } = req.params;
  const { titlos, perigrafi } = req.body;
  if (!titlos) return res.status(400).json({ error: 'Απαιτείται τίτλος.' });
  try {
    await q(
      `UPDATE themata SET titlos=:titlos, perigrafi=:perigrafi WHERE id=:id`,
      { id, titlos, perigrafi: perigrafi || null }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα ενημέρωσης θέματος.' });
  }
});

// DELETE: diagrafi thematos (mono an den sindeetai me active diplwmatikes)
app.delete('/api/themata/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const usage = await q(
      `SELECT COUNT(*) AS cnt
       FROM diplomatikes
       WHERE id_thematos=:id
         AND katastasi IN ('ypo_anathesi','energi','ypo_exetasi','peratomeni')`,
      { id }
    );
    if (usage[0].cnt > 0) {
      return res.status(409).json({ error: 'Υπάρχουν σχετικές διπλωματικές. Δεν γίνεται διαγραφή.' });
    }
    await q(`DELETE FROM themata WHERE id=:id`, { id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα διαγραφής θέματος.' });
  }
});


// Aitiseis foititwn gia thema (katastasi = 'ypo_anathesi')
// GET: aitiseis gia themata tou didaskonta
app.get('/api/didaskon/:idDidaskonta/aitiseis', async (req, res) => {
  const { idDidaskonta } = req.params;
  try {
    const rows = await q(
      `SELECT d.id AS id_diplomatikis, d.id_thematos, d.id_foititi, d.katastasi,
              t.titlos,
              xf.onoma, xf.epitheto, xf.email
       FROM diplomatikes d
       JOIN themata t ON t.id = d.id_thematos
       JOIN foititis f ON f.id = d.id_foititi
       JOIN xristes xf ON xf.id = f.id
       WHERE t.id_didaskonta = :idDidaskonta
         AND d.katastasi = 'ypo_anathesi'
       ORDER BY d.id DESC`,
      { idDidaskonta }
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα ανάκτησης αιτήσεων.' });
  }
});

// POST: apofasi didaskonta gia aitisi foititi (apodoxi/aporripsi)
app.post('/api/diplomatikes/:id/apofasi', async (req, res) => {
  const { id } = req.params;
  const { apofasi } = req.body; // 'apodoxi' | 'aporripsi'
  if (!['apodoxi', 'aporripsi'].includes(apofasi)) {
    return res.status(400).json({ error: 'Μη έγκυρη απόφαση.' });
  }
  try {
    // elegxos yparxis
    const rows = await q(
      `SELECT d.id, d.katastasi
       FROM diplomatikes d
       WHERE d.id=:id`,
      { id }
    );
    if (!rows.length) return res.status(404).json({ error: 'Δεν βρέθηκε διπλωματική.' });

    if (apofasi === 'aporripsi') {
      await q(`UPDATE diplomatikes SET katastasi='akyromeni' WHERE id=:id`, { id });
      return res.json({ ok: true, msg: 'Απόρριψη ολοκληρώθηκε.' });
    }
    // apodoxi: den allazoume kati edw—i diplwmatiki tha ginei 'energi' otan apodextoun 2 melh trimerous.
    res.json({ ok: true, msg: 'Αποδοχή καταχωρήθηκε (εκκρεμεί συγκρότηση τριμελούς).' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα επεξεργασίας απόφασης.' });
  }
});


// Proskliseis trimelous (gia to melos-didaskonta)
// GET: proskliseis (pending & istoriko) gia didaskonta
app.get('/api/didaskon/:idDidaskonta/proskliseis', async (req, res) => {
  const { idDidaskonta } = req.params;
  try {
    const rows = await q(
      `SELECT p.id AS id_prosklisis, p.katastasi, p.hmerominia_prosklisis, p.hmerominia_apantis,
              d.id AS id_diplomatikis, d.katastasi AS kat_diplomatikis,
              t.titlos,
              xf.onoma AS onoma_foititi, xf.epitheto AS epitheto_foititi, xf.email AS email_foititi
       FROM proskliseis p
       JOIN diplomatikes d ON d.id=p.id_diplomatikis
       JOIN themata t ON t.id=d.id_thematos
       JOIN foititis f ON f.id=d.id_foititi
       JOIN xristes xf ON xf.id=f.id
       WHERE p.id_didaskonta=:idDidaskonta
       ORDER BY p.hmerominia_prosklisis DESC`,
      { idDidaskonta }
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα ανάκτησης προσκλήσεων.' });
  }
});

// POST: apantisi se prosklisi ('apodexti' h 'aporrifthi')
// An ginei 'apodexti' -> kataxwrisi sto trimeloys kai elegxos gia 2 melh -> metaptwsi se 'energi'
app.post('/api/proskliseis/:id/apantisi', async (req, res) => {
  const { id } = req.params;
  const { katastasi } = req.body; // 'apodexti' | 'aporrifthi'
  if (!['apodexti', 'aporrifthi'].includes(katastasi)) {
    return res.status(400).json({ error: 'Μη έγκυρη κατάσταση.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT p.id, p.id_diplomatikis, p.id_didaskonta, p.katastasi,
              d.id AS id_dipl
       FROM proskliseis p
       JOIN diplomatikes d ON d.id=p.id_diplomatikis
       WHERE p.id=? FOR UPDATE`,
      [id]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Δεν βρέθηκε πρόσκληση.' });
    }
    const row = rows[0];

    await conn.query(
      `UPDATE proskliseis
       SET katastasi=?, hmerominia_apantis=NOW()
       WHERE id=?`,
      [katastasi, id]
    );

    if (katastasi === 'apodexti') {
      // prosthiki sto trimeloys (ws melos)
      await conn.query(
        `INSERT INTO trimeloys (id_diplomatikis, id_melous, rolos)
         VALUES (?, ?, 'melos')
         ON DUPLICATE KEY UPDATE rolos='melos'`,
        [row.id_diplomatikis, row.id_didaskonta]
      );

      // posa apodexta melh yparxoun?
      const [mcount] = await conn.query(
        `SELECT COUNT(*) AS cnt
         FROM proskliseis
         WHERE id_diplomatikis=? AND katastasi='apodexti'`,
        [row.id_diplomatikis]
      );
      const melh = mcount[0].cnt;

      // an exoume 2 apodexta melh -> metaptwsi se 'energi' + hmerominia_anathesis
      if (melh >= 2) {
        await conn.query(
          `UPDATE diplomatikes
           SET katastasi='energi', hmerominia_anathesis=CURDATE()
           WHERE id=?`,
          [row.id_diplomatikis]
        );
      }
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα απάντησης πρόσκλησης.' });
  } finally {
    conn.release();
  }
});


// Listes diplwmatikwn gia didaskonta
// GET: diplwmatikes pou epivlepei (owner tou thematos)
app.get('/api/didaskon/:idDidaskonta/diplwmatikes', async (req, res) => {
  const { idDidaskonta } = req.params;
  try {
    const rows = await q(
      `SELECT d.id AS id_diplomatikis, d.katastasi, d.hmerominia_anathesis,
              d.nimertis_link, d.praktiko_link, d.final_bathmos,
              t.titlos,
              xf.onoma, xf.epitheto, xf.email
       FROM diplomatikes d
       JOIN themata t ON t.id=d.id_thematos
       JOIN foititis f ON f.id=d.id_foititi
       JOIN xristes xf ON xf.id=f.id
       WHERE t.id_didaskonta=:idDidaskonta
       ORDER BY d.id DESC`,
      { idDidaskonta }
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα ανάκτησης διπλωματικών.' });
  }
});

// GET: diplwmatikes pou einai melos trimerous (gia vathmologisi)
app.get('/api/didaskon/:idDidaskonta/epitropes', async (req, res) => {
  const { idDidaskonta } = req.params;
  try {
    const rows = await q(
      `SELECT d.id AS id_diplomatikis, d.katastasi,
              t.titlos,
              xf.onoma, xf.epitheto, xf.email
       FROM trimeloys tr
       JOIN diplomatikes d ON d.id=tr.id_diplomatikis
       JOIN themata t ON t.id=d.id_thematos
       JOIN foititis f ON f.id=d.id_foititi
       JOIN xristes xf ON xf.id=f.id
       WHERE tr.id_melous=:idDidaskonta
       ORDER BY d.id DESC`,
      { idDidaskonta }
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα ανάκτησης λίστας επιτροπών.' });
  }
});


// Vathmologia/kritiki apo melos trimelous
//    + Auto-ypologismos telikou bathmou (mesos oros 3 melwn)
//    + Auto-dimiourgia praktikou HTML otan yparxoun 3 vathmoi


app.post('/api/diplomatikes/:id/vathmos', async (req, res) => {
  // perimenei: { id_didaskonta, bathmos, kritiki }
  const { id } = req.params;
  const { id_didaskonta, bathmos, kritiki } = req.body;

  if (!id_didaskonta || typeof bathmos !== 'number')
    return res.status(400).json({ error: 'Απαιτούνται id μέλους και αριθμητικός βαθμός.' });
  if (bathmos < 0 || bathmos > 10)
    return res.status(400).json({ error: 'Ο βαθμός πρέπει να είναι 0–10.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // elegxos oti einai melos trimerous
    const [rows] = await conn.query(
      `SELECT id FROM trimeloys WHERE id_diplomatikis=? AND id_melous=? FOR UPDATE`,
      [id, id_didaskonta]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(403).json({ error: 'Δεν είστε μέλος της τριμελούς.' });
    }
    const id_trimelous = rows[0].id;

    // update epidosi sto trimeloys
    await conn.query(
      `UPDATE trimeloys SET epidosi=? WHERE id=?`,
      [bathmos, id_trimelous]
    );

    // upsert kritiki_aksiologisis
    const [kRows] = await conn.query(
      `SELECT id FROM kritiki_aksiologisis WHERE id_trimelous=?`,
      [id_trimelous]
    );
    if (!kRows.length) {
      await conn.query(
        `INSERT INTO kritiki_aksiologisis (id_trimelous, analytiki_kritiki, analytiki_vathmologia)
         VALUES (?, ?, ?)`,
        [id_trimelous, kritiki || '', bathmos]
      );
    } else {
      await conn.query(
        `UPDATE kritiki_aksiologisis
         SET analytiki_kritiki=?, analytiki_vathmologia=?
         WHERE id=?`,
        [kritiki || '', bathmos, kRows[0].id]
      );
    }

    // elegxos: exoume 3 vathmous? an nai -> ypologise teliko meso oro kai dimiourghse praktiko
    const [gRows] = await conn.query(
      `SELECT epidosi FROM trimeloys
       WHERE id_diplomatikis=? AND epidosi IS NOT NULL`,
      [id]
    );
    if (gRows.length >= 3) {
      const grades = gRows.map(r => Number(r.epidosi)).filter(v => !Number.isNaN(v));
      if (grades.length >= 3) {
        const sum = grades.reduce((a,b)=>a+b,0);
        const avg = Math.round((sum / grades.length) * 10) / 10; // 1 dekadiko

        // apothikeusi telikou bathmou
        await conn.query(
          `UPDATE diplomatikes SET final_bathmos=? WHERE id=?`,
          [avg, id]
        );

        // dimiourgia praktikou HTML arxeiou (aplo demo)
        const [info] = await conn.query(
          `SELECT d.id, d.final_bathmos, d.hmerominia_anathesis, t.titlos,
                  xf.onoma, xf.epitheto, xf.email
           FROM diplomatikes d
           JOIN themata t ON t.id=d.id_thematos
           JOIN foititis f ON f.id=d.id_foititi
           JOIN xristes xf ON xf.id=f.id
           WHERE d.id=?`,
          [id]
        );

        const [melhRows] = await conn.query(
          `SELECT tr.id_melous, tr.epidosi, xr.onoma, xr.epitheto, xr.email,
                  ka.analytiki_kritiki
           FROM trimeloys tr
           JOIN xristes xr ON xr.id=tr.id_melous
           LEFT JOIN kritiki_aksiologisis ka ON ka.id_trimelous=tr.id
           WHERE tr.id_diplomatikis=?`,
          [id]
        );

        const praktikaDir = path.join(__dirname, 'public', 'praktika');
        try { await fs.mkdir(praktikaDir, { recursive: true }); } catch {}

        const praktikoPath = path.join(praktikaDir, `dipl_${id}.html`);
        const praktikoLink = `/praktika/dipl_${id}.html`;
        const now = new Date().toISOString().slice(0,16).replace('T',' ');

        const praktikoHtml = `<!doctype html>
<html lang="el"><head><meta charset="utf-8">
<title>Πρακτικό Εξέτασης ΔΕ #${info[0].id}</title>
<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 12px}
h1{margin:0 0 8px} .muted{color:#555}</style></head>
<body>
<h1>Πρακτικό Εξέτασης</h1>
<p class="muted">Ημερομηνία δημιουργίας: ${now}</p>
<h2>${info[0].titlos}</h2>
<p><strong>Φοιτητής:</strong> ${info[0].onoma} ${info[0].epitheto} (${info[0].email})</p>
<p><strong>Ημερ. Ανάθεσης:</strong> ${info[0].hmerominia_anathesis || '-'}</p>
<h3>Βαθμολογίες Μελών</h3>
<ul>
  ${melhRows.map(m=>`<li>${m.onoma} ${m.epitheto} (${m.email}) — Βαθμός: <strong>${m.epidosi ?? '-'}</strong><br>
  <em>${(m.analytiki_kritiki || '').replace(/</g,'&lt;')}</em></li>`).join('')}
</ul>
<p><strong>Τελικός Βαθμός:</strong> ${avg}</p>
</body></html>`;

        await fs.writeFile(praktikoPath, praktikoHtml, 'utf8');

        await conn.query(
          `UPDATE diplomatikes SET praktiko_link=? WHERE id=?`,
          [praktikoLink, id]
        );
      }
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Σφάλμα καταχώρησης βαθμού.' });
  } finally {
    conn.release();
  }
});

// Middleware gia elegxo authentication & rolo foititi
const checkAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Den eiste syndedemenos.' });
  }
  next();
};

const checkStudent = (req, res, next) => {
  if (req.session.userRole !== 'foititis') {
    return res.status(403).json({ error: 'Den exete dikaiwmata foititi.' });
  }
  next();
};

// Endpoints sindesis
app.post('/api/login', (req, res) => {
  const { email, kodikos } = req.body;
  const query = 'SELECT id, onoma, rolos FROM xristes WHERE email = ? AND kodikos = ?';
  connection.query(query, [email, kodikos], (err, results) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB.' });
    if (!results.length) return res.status(401).json({ error: 'Μη έγκυρα στοιχεία.' });

    const user = results[0];
    req.session.userId = user.id;
    req.session.userRole = user.rolos;
    req.session.username = user.onoma;
    res.json({ user_id: user.id, username: user.onoma, rolos: user.rolos });
  });
});


// Endpoints foititi

// Lista thematwn
app.get('/api/themata', checkAuth, checkStudent, (req, res) => {
  const q = 'SELECT id, titlos, perigrafi, arxeio FROM themata WHERE katastasi = "diathesimo"';
  connection.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB' });
    res.json(results);
  });
});

// Leptomereies kathe thematos
app.get('/api/themata/:id', checkAuth, checkStudent, (req, res) => {
  const { id } = req.params;
  const q = 'SELECT * FROM themata WHERE id = ?';
  connection.query(q, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB' });
    if (!results.length) return res.status(404).json({ error: 'Δεν βρέθηκε θέμα.' });
    res.json(results[0]);
  });
});

// Aitisi anathesis
app.post('/api/diplomatikes/anathesi', checkAuth, checkStudent, (req, res) => {
  const { id_thematos, id_foititi } = req.body;
  const qCheck = 'SELECT COUNT(*) AS c FROM diplomatikes WHERE id_foititi = ?';
  connection.query(qCheck, [id_foititi], (err, r) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB' });
    if (r[0].c > 0) return res.status(409).json({ error: 'Έχετε ήδη διπλωματική.' });

    const qIns = 'INSERT INTO diplomatikes (id_thematos, id_foititi, katastasi, hmerominia_anathesis) VALUES (?, ?, "ypo_anathesi", NOW())';
    connection.query(qIns, [id_thematos, id_foititi], err2 => {
      if (err2) return res.status(500).json({ error: 'Σφάλμα DB' });
      res.json({ message: 'Η αίτηση υποβλήθηκε.' });
    });
  });
});

// Provoli diplwmatikis me ola ta dedomena
app.get('/api/diplomatiki/byFoititis/:idFoititi', checkAuth, checkStudent, (req, res) => {
  const { idFoititi } = req.params;
  const q = `
    SELECT d.id, t.titlos, t.perigrafi, t.arxeio AS perigrafi_arxeio,
          d.katastasi, d.hmerominia_anathesis, d.arxeio_draft, d.link_extra,
          d.imerominia_parousiasis, d.ora_parousiasis, d.tropo_parousiasis, d.topo_thea, d.link_nimertis,
          GROUP_CONCAT(CONCAT(x.onoma, ' ', x.epitheto) SEPARATOR ', ') AS melh_trimelous
    FROM diplomatikes d
    JOIN themata t ON d.id_thematos = t.id
    LEFT JOIN trimeloys tr ON d.id = tr.id_diplomatikis AND tr.katastasi_prosklisis = 'apodekti'
    LEFT JOIN xristes x ON tr.id_melous = x.id
    WHERE d.id_foititi = ?
    GROUP BY d.id
  `;
  connection.query(q, [idFoititi], (err, results) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB' });
    if (!results.length) return res.status(404).json({ error: 'Δεν βρέθηκε διπλωματική.' });
    res.json(results[0]);
  });
});

// Profil
app.get('/api/profil/:idFoititi', checkAuth, checkStudent, (req, res) => {
  const q = 'SELECT * FROM xristes WHERE id = ?';
  connection.query(q, [req.params.idFoititi], (err, results) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB' });
    if (!results.length) return res.status(404).json({ error: 'Δεν βρέθηκε.' });
    res.json(results[0]);
  });
});

// ananewsi profil
app.put('/api/profil/:idFoititi', checkAuth, checkStudent, (req, res) => {
  const { idFoititi } = req.params;
  const { onoma, epitheto, email, dieythinsi_odo, dieythinsi_arithmos, dieythinsi_polh, dieythinsi_tk, tilefono_kinhto, tilefono_stathero, AM } = req.body;
  const q = `
    UPDATE xristes
    SET onoma = ?, epitheto = ?, email = ?, dieythinsi_odo = ?, dieythinsi_arithmos = ?, dieythinsi_polh = ?, dieythinsi_tk = ?, tilefono_kinhto = ?, tilefono_stathero = ?, AM = ?
    WHERE id = ?
  `;
  connection.query(q, [onoma, epitheto, email, dieythinsi_odo, dieythinsi_arithmos, dieythinsi_polh, dieythinsi_tk, tilefono_kinhto, tilefono_stathero, AM, idFoititi], (err) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα ενημέρωσης.' });
    res.json({ message: 'Το προφίλ ενημερώθηκε.' });
  });
});

// Aitisi anathesis melous trimelous
app.post('/api/trimelis/prosklisi', checkAuth, checkStudent, (req, res) => {
  const { id_diplomatikis, id_didaskonta } = req.body;
  const q = 'INSERT INTO trimeloys (id_diplomatikis, id_melous, katastasi_prosklisis) VALUES (?, ?, "ekremmhs")';
  connection.query(q, [id_diplomatikis, id_didaskonta], (err) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB. Pi8anon o didaskon den yparxei i exei idi prosklithi.' });
    res.json({ message: 'Η πρόσκληση στάλθηκε.' });
  });
});

// Provoli prosklisewn
app.get('/api/trimelis/proskliseis/:idDiplomatikis', checkAuth, checkStudent, (req, res) => {
  const { idDiplomatikis } = req.params;
  const q = `
    SELECT t.katastasi_prosklisis, x.onoma, x.epitheto
    FROM trimeloys t
    JOIN xristes x ON t.id_melous = x.id
    WHERE t.id_diplomatikis = ?
  `;
  connection.query(q, [idDiplomatikis], (err, results) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB' });
    res.json(results);
  });
});

// Upload arxeiou draft
const upload = multer({ dest: 'uploads/' });
app.post('/api/diplomatiki/upload_draft', checkAuth, checkStudent, upload.single('arxeio'), (req, res) => {
  const { id_diplomatikis, link } = req.body;
  const filename = req.file ? req.file.filename : null;

  const q = `
    UPDATE diplomatikes
    SET arxeio_draft = COALESCE(?, arxeio_draft),
        link_extra = COALESCE(?, link_extra)
    WHERE id = ?
  `;
  connection.query(q, [filename, link, id_diplomatikis], (err) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB.' });
    res.json({ message: 'Το πρόχειρο καταχωρήθηκε.' });
  });
});

// Anakoinwsi parousiasis
app.post('/api/diplomatiki/anakoinwsi', checkAuth, checkStudent, (req, res) => {
  const { id_diplomatikis, imerominia_parousiasis, ora_parousiasis, tropo_parousiasis, topo_thea } = req.body;
  const q = `
    UPDATE diplomatikes
    SET imerominia_parousiasis = ?,
        ora_parousiasis = ?,
        tropo_parousiasis = ?,
        topo_thea = ?
    WHERE id = ?
  `;
  connection.query(q, [imerominia_parousiasis, ora_parousiasis, tropo_parousiasis, topo_thea, id_diplomatikis], (err) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB.' });
    res.json({ message: 'Η παρουσίαση καταχωρήθηκε.' });
  });
});

// Link nimertis
app.post('/api/diplomatiki/nimertis', checkAuth, checkStudent, (req, res) => {
  const { id_diplomatikis, link_nimertis } = req.body;
  const q = `
    UPDATE diplomatikes
    SET link_nimertis = ?
    WHERE id = ?
  `;
  connection.query(q, [link_nimertis, id_diplomatikis], (err) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB.' });
    res.json({ message: 'Ο σύνδεσμος Νημερτής καταχωρήθηκε.' });
  });
});

// Provoli praktiko exetasis
app.get('/api/diplomatiki/:idDiplomatikis/praktiko', checkAuth, checkStudent, (req, res) => {
  const { idDiplomatikis } = req.params;
  const q = `
    SELECT ka.analytiki_kritiki, ka.analytiki_vathmologia, x.onoma, x.epitheto
    FROM kritiki_aksiologisis ka
    JOIN trimeloys tr ON ka.id_trimelous = tr.id
    JOIN xristes x ON tr.id_melous = x.id
    WHERE tr.id_diplomatikis = ?
  `;
  connection.query(q, [idDiplomatikis], (err, results) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB.' });
    if (results.length === 0) {
      return res.json({ html: '<span class="muted">Δεν είναι ακόμη διαθέσιμο.</span>' });
    }
    let html = '<h3>Αξιολογήσεις Επιτροπής</h3>';
    results.forEach(result => {
      html += `<div class="card">
        <p><strong>Διδάσκων:</strong> ${result.onoma} ${result.epitheto}</p>
        <p><strong>Βαθμολογία:</strong> ${result.analytiki_vathmologia}</p>
        <p><strong>Κριτική:</strong> ${result.analytiki_kritiki}</p>
      </div>`;
    });
    res.json({ html });
  });
});

// Logs allagon katastasis
app.get('/api/diplomatiki/:idDiplomatikis/logs', checkAuth, checkStudent, (req, res) => {
  const { idDiplomatikis } = req.params;
  const q = 'SELECT * FROM log_katastasis WHERE id_diplomatikis = ? ORDER BY hmerominia_allagis DESC';
  connection.query(q, [idDiplomatikis], (err, results) => {
    if (err) return res.status(500).json({ error: 'Σφάλμα DB.' });
    res.json(results);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
