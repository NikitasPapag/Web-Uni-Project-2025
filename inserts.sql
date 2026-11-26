USE diplomatikes_db;

-- 1. Εισαγωγή 20 Φοιτητών
INSERT INTO xristes (onoma, epitheto, email, password, rolos) VALUES
('Αλέξανδρος', 'Παπαδόπουλος', 'alexandros.p@example.com', 'password123', 'foititis'),
('Ελένη', 'Βασιλείου', 'eleni.v@example.com', 'password123', 'foititis'),
('Νικόλαος', 'Γεωργίου', 'nikolaos.g@example.com', 'password123', 'foititis'),
('Μαρία', 'Δημητρίου', 'maria.d@example.com', 'password123', 'foititis'),
('Γεώργιος', 'Ευαγγέλου', 'georgios.e@example.com', 'password123', 'foititis'),
('Αικατερίνη', 'Ζαχαρίου', 'aikaterini.z@example.com', 'password123', 'foititis'),
('Δημήτρης', 'Θεοδώρου', 'dimitris.th@example.com', 'password123', 'foititis'),
('Ιωάννα', 'Ιωάννου', 'ioanna.i@example.com', 'password123', 'foititis'),
('Κωνσταντίνος', 'Καραγιάννης', 'konstantinos.k@example.com', 'password123', 'foititis'),
('Λουκία', 'Λαμπροπούλου', 'loukia.l@example.com', 'password123', 'foititis'),
('Μιχάλης', 'Μαρίνου', 'michalis.m@example.com', 'password123', 'foititis'),
('Νεφέλη', 'Νικολάου', 'nefeli.n@example.com', 'password123', 'foititis'),
('Ξένια', 'Ξανθοπούλου', 'xenia.x@example.com', 'password123', 'foititis'),
('Οδυσσέας', 'Οικονομίδης', 'odysseas.o@example.com', 'password123', 'foititis'),
('Πέτρος', 'Παύλου', 'petros.p@example.com', 'password123', 'foititis'),
('Ραφαέλα', 'Ρούσσου', 'rafaela.r@example.com', 'password123', 'foititis'),
('Στέφανος', 'Στεφάνου', 'stefanos.s@example.com', 'password123', 'foititis'),
('Τάνια', 'Τσαλδάρη', 'tania.ts@example.com', 'password123', 'foititis'),
('Υβόννη', 'Υφαντή', 'yvonni.y@example.com', 'password123', 'foititis'),
('Φώτης', 'Φωτίου', 'fotis.f@example.com', 'password123', 'foititis');

INSERT INTO foititis (id, AM, tilefono_kinhto) VALUES
((SELECT id FROM xristes WHERE email = 'alexandros.p@example.com'), '2020001', '6901234501'),
((SELECT id FROM xristes WHERE email = 'eleni.v@example.com'), '2020002', '6901234502'),
((SELECT id FROM xristes WHERE email = 'nikolaos.g@example.com'), '2020003', '6901234503'),
((SELECT id FROM xristes WHERE email = 'maria.d@example.com'), '2020004', '6901234504'),
((SELECT id FROM xristes WHERE email = 'georgios.e@example.com'), '2020005', '6901234505'),
((SELECT id FROM xristes WHERE email = 'aikaterini.z@example.com'), '2020006', '6901234506'),
((SELECT id FROM xristes WHERE email = 'dimitris.th@example.com'), '2020007', '6901234507'),
((SELECT id FROM xristes WHERE email = 'ioanna.i@example.com'), '2020008', '6901234508'),
((SELECT id FROM xristes WHERE email = 'konstantinos.k@example.com'), '2020009', '6901234509'),
((SELECT id FROM xristes WHERE email = 'loukia.l@example.com'), '2020010', '6901234510'),
((SELECT id FROM xristes WHERE email = 'michalis.m@example.com'), '2020011', '6901234511'),
((SELECT id FROM xristes WHERE email = 'nefeli.n@example.com'), '2020012', '6901234512'),
((SELECT id FROM xristes WHERE email = 'xenia.x@example.com'), '2020013', '6901234513'),
((SELECT id FROM xristes WHERE email = 'odysseas.o@example.com'), '2020014', '6901234514'),
((SELECT id FROM xristes WHERE email = 'petros.p@example.com'), '2020015', '6901234515'),
((SELECT id FROM xristes WHERE email = 'rafaela.r@example.com'), '2020016', '6901234516'),
((SELECT id FROM xristes WHERE email = 'stefanos.s@example.com'), '2020017', '6901234517'),
((SELECT id FROM xristes WHERE email = 'tania.ts@example.com'), '2020018', '6901234518'),
((SELECT id FROM xristes WHERE email = 'yvonni.y@example.com'), '2020019', '6901234519'),
((SELECT id FROM xristes WHERE email = 'fotis.f@example.com'), '2020020', '6901234520');


-- 2. Εισαγωγή 10 Διδασκόντων
INSERT INTO xristes (onoma, epitheto, email, password, rolos) VALUES
('Κωνσταντίνος', 'Παπαδάκης', 'k.papadakis@example.com', 'password123', 'didaskon'),
('Αντωνία', 'Σταυροπούλου', 'a.stavropoulou@example.com', 'password123', 'didaskon'),
('Παναγιώτης', 'Λάππας', 'p.lappas@example.com', 'password123', 'didaskon'),
('Σοφία', 'Κυριακίδου', 's.kyriakidou@example.com', 'password123', 'didaskon'),
('Χρήστος', 'Μιχαλόπουλος', 'ch.michalopoulos@example.com', 'password123', 'didaskon'),
('Φωτεινή', 'Κωνσταντίνου', 'f.konstantinou@example.com', 'password123', 'didaskon'),
('Γρηγόρης', 'Δημητριάδης', 'g.dimitriadis@example.com', 'password123', 'didaskon'),
('Αφροδίτη', 'Πετρίδου', 'a.petridou@example.com', 'password123', 'didaskon'),
('Θωμάς', 'Βλάχος', 'th.vlachos@example.com', 'password123', 'didaskon'),
('Βασιλική', 'Παππά', 'v.pappa@example.com', 'password123', 'didaskon');

INSERT INTO didaskon (id, tilefono) VALUES
((SELECT id FROM xristes WHERE email = 'k.papadakis@example.com'), '2101000101'),
((SELECT id FROM xristes WHERE email = 'a.stavropoulou@example.com'), '2101000102'),
((SELECT id FROM xristes WHERE email = 'p.lappas@example.com'), '2101000103'),
((SELECT id FROM xristes WHERE email = 's.kyriakidou@example.com'), '2101000104'),
((SELECT id FROM xristes WHERE email = 'ch.michalopoulos@example.com'), '2101000105'),
((SELECT id FROM xristes WHERE email = 'f.konstantinou@example.com'), '2101000106'),
((SELECT id FROM xristes WHERE email = 'g.dimitriadis@example.com'), '2101000107'),
((SELECT id FROM xristes WHERE email = 'a.petridou@example.com'), '2101000108'),
((SELECT id FROM xristes WHERE email = 'th.vlachos@example.com'), '2101000109'),
((SELECT id FROM xristes WHERE email = 'v.pappa@example.com'), '2101000110');


-- 3. Εισαγωγή 2 Μελών Γραμματείας
INSERT INTO xristes (onoma, epitheto, email, password, rolos) VALUES
('Ευγενία', 'Καρατζά', 'e.karatza@example.com', 'password123', 'grammateia'),
('Γιάννης', 'Φιλίππου', 'g.filippou@example.com', 'password123', 'grammateia');

INSERT INTO grammateia (id, tilefono) VALUES
((SELECT id FROM xristes WHERE email = 'e.karatza@example.com'), '2102000201'),
((SELECT id FROM xristes WHERE email = 'g.filippou@example.com'), '2102000202');


-- IDs για εύκολη χρήση στα παρακάτω INSERTS
SET @papadakis_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 'k.papadakis@example.com'));
SET @stavropoulou_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 'a.stavropoulou@example.com'));
SET @lappas_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 'p.lappas@example.com'));
SET @kyriakidou_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 's.kyriakidou@example.com'));
SET @michalopoulos_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 'ch.michalopoulos@example.com'));
SET @konstantinou_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 'f.konstantinou@example.com'));
SET @dimitriadis_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 'g.dimitriadis@example.com'));
SET @petridou_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 'a.petridou@example.com'));
SET @vlachos_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 'th.vlachos@example.com'));
SET @pappa_id = (SELECT id FROM didaskon WHERE id = (SELECT id FROM xristes WHERE email = 'v.pappa@example.com'));

SET @alexandros_p_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'alexandros.p@example.com'));
SET @eleni_v_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'eleni.v@example.com'));
SET @nikolaos_g_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'nikolaos.g@example.com'));
SET @maria_d_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'maria.d@example.com'));
SET @georgios_e_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'georgios.e@example.com'));
SET @aikaterini_z_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'aikaterini.z@example.com'));
SET @dimitris_th_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'dimitris.th@example.com'));
SET @ioanna_i_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'ioanna.i@example.com'));
SET @konstantinos_k_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'konstantinos.k@example.com'));
SET @loukia_l_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'loukia.l@example.com'));
SET @michalis_m_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'michalis.m@example.com'));
SET @nefeli_n_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'nefeli.n@example.com'));
SET @xenia_x_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'xenia.x@example.com'));
SET @odysseas_o_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'odysseas.o@example.com'));
SET @petros_p_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'petros.p@example.com'));
SET @rafaela_r_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'rafaela.r@example.com'));
SET @stefanos_s_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'stefanos.s@example.com'));
SET @tania_ts_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'tania.ts@example.com'));
SET @yvonni_y_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'yvonni.y@example.com'));
SET @fotis_f_id = (SELECT id FROM foititis WHERE id = (SELECT id FROM xristes WHERE email = 'fotis.f@example.com'));

SET @karatza_id = (SELECT id FROM grammateia WHERE id = (SELECT id FROM xristes WHERE email = 'e.karatza@example.com'));
SET @filippou_id = (SELECT id FROM grammateia WHERE id = (SELECT id FROM xristes WHERE email = 'g.filippou@example.com'));


-- 4. Εισαγωγή Θεμάτων (περίπου 15-20 θέματα)
INSERT INTO themata (titlos, perigrafi, id_didaskonta) VALUES
('Ανάπτυξη Εφαρμογών Κινητών με React Native', 'Εκπόνηση εφαρμογής για iOS/Android.', @papadakis_id), -- t1
('Μηχανική Μάθηση στην Υγεία', 'Εφαρμογές ML σε ιατρικά δεδομένα.', @stavropoulou_id), -- t2
('Ασφάλεια Δικτύων και Πληροφοριών', 'Μελέτη και ανάπτυξη συστημάτων ασφάλειας.', @lappas_id), -- t3
('Εξόρυξη Γνώσης από Μεγάλα Δεδομένα', 'Big Data Analytics και Data Mining.', @kyriakidou_id), -- t4
('Ανάπτυξη Web Services με RESTful API', 'Σχεδιασμός και υλοποίηση RESTful APIs.', @michalopoulos_id), -- t5
('Εικονική Πραγματικότητα στην Εκπαίδευση', 'Δημιουργία VR εφαρμογών για εκπαιδευτικούς σκοπούς.', @konstantinou_id), -- t6
('Επεξεργασία Φυσικής Γλώσσας (NLP) σε Ελληνικά', 'Εφαρμογές NLP για την ελληνική γλώσσα.', @dimitriadis_id), -- t7
('Blockchain Technologies και Cryptocurrencies', 'Ανάλυση και υλοποίηση blockchain λύσεων.', @petridou_id), -- t8
('Cloud Computing και DevOps Πρακτικές', 'Μελέτη και εφαρμογή εργαλείων Cloud/DevOps.', @vlachos_id), -- t9
('Internet of Things (IoT) στην Έξυπνη Πόλη', 'Ανάπτυξη εφαρμογών IoT για αστικές υποδομές.', @pappa_id), -- t10
('Ανάλυση Δεδομένων με Python και Pandas', 'Χρήση Python για στατιστική ανάλυση δεδομένων.', @papadakis_id), -- t11
('Βελτιστοποίηση Αλγορίθμων με Γενετικούς Αλγορίθμους', 'Εφαρμογή γενετικών αλγορίθμων σε προβλήματα βελτιστοποίησης.', @stavropoulou_id), -- t12
('Κρυπτογραφία και Κβαντικοί Υπολογιστές', 'Εισαγωγή στην κβαντική κρυπτογραφία.', @lappas_id), -- t13
('Διαχείριση Βάσεων Δεδομένων NoSQL', 'Σύγκριση και χρήση NoSQL βάσεων δεδομένων.', @kyriakidou_id), -- t14
('Mobile Game Development με Unity', 'Ανάπτυξη παιχνιδιών για κινητά.', @michalopoulos_id), -- t15
('Ανάπτυξη Progressive Web Apps (PWAs)', 'Δημιουργία PWAs για βελτιωμένη εμπειρία χρήστη.', @konstantinou_id), -- t16
('Τεχνητή Νοημοσύνη και Ηθική', 'Οι ηθικές προεκτάσεις της Τεχνητής Νοημοσύνης.', @dimitriadis_id), -- t17
('Εφαρμογές Επαυξημένης Πραγματικότητας (AR)', 'Ανάπτυξη AR εφαρμογών για κινητές συσκευές.', @petridou_id), -- t18
('Δίκτυα Αισθητήρων και Εφαρμογές τους', 'Μελέτη και υλοποίηση δικτύων αισθητήρων.', @vlachos_id), -- t19
('Συστήματα Υποστήριξης Αποφάσεων', 'Ανάπτυξη DSS για επιχειρηματικά προβλήματα.', @pappa_id); -- t20


-- 5. Αναθέσεις και Καταστάσεις Διπλωματικών Εργασιών (ώστε να καλύπτονται όλες οι περιπτώσεις)

-- Διπλωματικές με Κατάσταση: 'energi'
INSERT INTO diplomatikes (id_thematos, id_foititi, katastasi, hmerominia_anathesis) VALUES
((SELECT id FROM themata WHERE titlos = 'Ανάπτυξη Εφαρμογών Κινητών με React Native'), @alexandros_p_id, 'energi', '2024-11-15'), -- d1
((SELECT id FROM themata WHERE titlos = 'Μηχανική Μάθηση στην Υγεία'), @eleni_v_id, 'energi', '2024-11-20'), -- d2
((SELECT id FROM themata WHERE titlos = 'Ασφάλεια Δικτύων και Πληροφοριών'), @nikolaos_g_id, 'energi', '2024-11-25'), -- d3
((SELECT id FROM themata WHERE titlos = 'Εξόρυξη Γνώσης από Μεγάλα Δεδομένα'), @maria_d_id, 'energi', '2024-12-01'), -- d4
((SELECT id FROM themata WHERE titlos = 'Ανάπτυξη Web Services με RESTful API'), @georgios_e_id, 'energi', '2024-12-05'); -- d5

-- Διπλωματικές με Κατάσταση: 'ypo_exetasi'
INSERT INTO diplomatikes (id_thematos, id_foititi, katastasi, hmerominia_anathesis, praktiko_link) VALUES
((SELECT id FROM themata WHERE titlos = 'Εικονική Πραγματικότητα στην Εκπαίδευση'), @aikaterini_z_id, 'ypo_exetasi', '2024-03-10', 'http://example.com/praktiko_aikaterini_z.pdf'), -- d6
((SELECT id FROM themata WHERE titlos = 'Επεξεργασία Φυσικής Γλώσσας (NLP) σε Ελληνικά'), @dimitris_th_id, 'ypo_exetasi', '2024-03-15', 'http://example.com/praktiko_dimitris_th.pdf'), -- d7
((SELECT id FROM themata WHERE titlos = 'Blockchain Technologies και Cryptocurrencies'), @ioanna_i_id, 'ypo_exetasi', '2024-03-20', 'http://example.com/praktiko_ioanna_i.pdf'); -- d8

-- Διπλωματικές με Κατάσταση: 'peratomeni'
INSERT INTO diplomatikes (id_thematos, id_foititi, katastasi, hmerominia_anathesis, praktiko_link, nimertis_link, final_bathmos, hmerominia_katathesis_bathmou_grammateia, id_grammateias_pou_dexthike_bathmo) VALUES
((SELECT id FROM themata WHERE titlos = 'Cloud Computing και DevOps Πρακτικές'), @konstantinos_k_id, 'peratomeni', '2023-09-01', 'http://example.com/praktiko_konstantinos_k.pdf', 'http://nimertis.gr/thesis/konstantinos_k', 8.5, '2024-07-01', @karatza_id), -- d9
((SELECT id FROM themata WHERE titlos = 'Internet of Things (IoT) στην Έξυπνη Πόλη'), @loukia_l_id, 'peratomeni', '2023-09-05', 'http://example.com/praktiko_loukia_l.pdf', 'http://nimertis.gr/thesis/loukia_l', 9.0, '2024-07-05', @filippou_id); -- d10

-- Διπλωματικές με Κατάσταση: 'akyromeni'
INSERT INTO diplomatikes (id_thematos, id_foititi, katastasi, hmerominia_anathesis, hmerominia_akyrwshs, arithmos_protokollou_akyrwshs, etos_genikis_syneleusis_akyrwshs, logos_akyrwshs, id_grammateias_pou_akyrwse) VALUES
((SELECT id FROM themata WHERE titlos = 'Ανάλυση Δεδομένων με Python και Pandas'), @michalis_m_id, 'akyromeni', '2024-01-10', '2024-06-20', 'ΓΣ123/2024', 2024, 'Κατόπιν αίτησης φοιτητή', @karatza_id); -- d11

-- Διπλωματικές με Κατάσταση: 'ypo_anathesi' (θέμα χωρίς ανάθεση σε φοιτητή, αλλά για φοιτητή που ψάχνει)
-- Αυτές δεν εισάγονται στον πίνακα diplomatikes, καθώς είναι "θέματα" που περιμένουν να ανατεθούν.
-- Τα θέματα 12-20 είναι αυτής της κατηγορίας από τον πίνακα themata.

-- Άλλες ενεργές διπλωματικές
INSERT INTO diplomatikes (id_thematos, id_foititi, katastasi, hmerominia_anathesis) VALUES
((SELECT id FROM themata WHERE titlos = 'Βελτιστοποίηση Αλγορίθμων με Γενετικούς Αλγορίθμους'), @nefeli_n_id, 'energi', '2024-12-10'), -- d12
((SELECT id FROM themata WHERE titlos = 'Κρυπτογραφία και Κβαντικοί Υπολογιστές'), @xenia_x_id, 'energi', '2025-01-15'), -- d13
((SELECT id FROM themata WHERE titlos = 'Διαχείριση Βάσεων Δεδομένων NoSQL'), @odysseas_o_id, 'energi', '2025-02-01'), -- d14
((SELECT id FROM themata WHERE titlos = 'Mobile Game Development με Unity'), @petros_p_id, 'energi', '2025-02-10'); -- d15


-- 6. Εισαγωγή Δεδομένων στον πίνακα aitiseis_analipsis (μόνο για διπλωματικές σε 'energi' και 'peratomeni' κατάσταση)
INSERT INTO aitiseis_analipsis (id_diplomatikis, hmerominia_katathesis, id_grammateias, arxeio_aitisis, arithmos_protokollou_egkrisis, etos_genikis_syneleusis_egkrisis) VALUES
((SELECT id FROM diplomatikes WHERE id_foititi = @alexandros_p_id), '2024-11-18', @karatza_id, 'aitisi_alexandros_p.pdf', 'ΓΣ001/2024', 2024),
((SELECT id FROM diplomatikes WHERE id_foititi = @eleni_v_id), '2024-11-22', @filippou_id, 'aitisi_eleni_v.pdf', 'ΓΣ002/2024', 2024),
((SELECT id FROM diplomatikes WHERE id_foititi = @nikolaos_g_id), '2024-11-28', @karatza_id, 'aitisi_nikolaos_g.pdf', 'ΓΣ003/2024', 2024),
((SELECT id FROM diplomatikes WHERE id_foititi = @maria_d_id), '2024-12-03', @filippou_id, 'aitisi_maria_d.pdf', 'ΓΣ004/2024', 2024),
((SELECT id FROM diplomatikes WHERE id_foititi = @georgios_e_id), '2024-12-07', @karatza_id, 'aitisi_georgios_e.pdf', 'ΓΣ005/2024', 2024),
((SELECT id FROM diplomatikes WHERE id_foititi = @konstantinos_k_id), '2023-09-03', @karatza_id, 'aitisi_konstantinos_k.pdf', 'ΓΣ010/2023', 2023), -- Περατωμένη
((SELECT id FROM diplomatikes WHERE id_foititi = @loukia_l_id), '2023-09-07', @filippou_id, 'aitisi_loukia_l.pdf', 'ΓΣ011/2023', 2023), -- Περατωμένη
((SELECT id FROM diplomatikes WHERE id_foititi = @nefeli_n_id), '2024-12-12', @filippou_id, 'aitisi_nefeli_n.pdf', 'ΓΣ006/2024', 2024),
((SELECT id FROM diplomatikes WHERE id_foititi = @xenia_x_id), '2025-01-18', @karatza_id, 'aitisi_xenia_x.pdf', 'ΓΣ007/2025', 2025),
((SELECT id FROM diplomatikes WHERE id_foititi = @odysseas_o_id), '2025-02-03', @filippou_id, 'aitisi_odysseas_o.pdf', 'ΓΣ008/2025', 2025),
((SELECT id FROM diplomatikes WHERE id_foititi = @petros_p_id), '2025-02-12', @karatza_id, 'aitisi_petros_p.pdf', 'ΓΣ009/2025', 2025);


-- 7. Εισαγωγή Δεδομένων στον πίνακα trimeloys (Επιτροπές)
INSERT INTO trimeloys (id_diplomatikis, id_melous, rolos, epidosi) VALUES
-- d1: Αλέξανδρος Παπαδόπουλος, Επιβλέπων: Παπαδάκης
((SELECT id FROM diplomatikes WHERE id_foititi = @alexandros_p_id), @papadakis_id, 'epivlepontas', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @alexandros_p_id), @stavropoulou_id, 'melos', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @alexandros_p_id), @lappas_id, 'melos', NULL),

-- d2: Ελένη Βασιλείου, Επιβλέπων: Σταυροπούλου
((SELECT id FROM diplomatikes WHERE id_foititi = @eleni_v_id), @stavropoulou_id, 'epivlepontas', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @eleni_v_id), @kyriakidou_id, 'melos', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @eleni_v_id), @michalopoulos_id, 'melos', NULL),

-- d3: Νικόλαος Γεωργίου, Επιβλέπων: Λάππας
((SELECT id FROM diplomatikes WHERE id_foititi = @nikolaos_g_id), @lappas_id, 'epivlepontas', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @nikolaos_g_id), @konstantinou_id, 'melos', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @nikolaos_g_id), @dimitriadis_id, 'melos', NULL),

-- d6: Αικατερίνη Ζαχαρίου (Υπό Εξέταση), Επιβλέπων: Κωνσταντίνου
((SELECT id FROM diplomatikes WHERE id_foititi = @aikaterini_z_id), @konstantinou_id, 'epivlepontas', 7.5),
((SELECT id FROM diplomatikes WHERE id_foititi = @aikaterini_z_id), @petridou_id, 'melos', 8.0),
((SELECT id FROM diplomatikes WHERE id_foititi = @aikaterini_z_id), @vlachos_id, 'melos', 7.0),

-- d9: Κωνσταντίνος Καραγιάννης (Περατωμένη), Επιβλέπων: Βλάχος
((SELECT id FROM diplomatikes WHERE id_foititi = @konstantinos_k_id), @vlachos_id, 'epivlepontas', 8.5),
((SELECT id FROM diplomatikes WHERE id_foititi = @konstantinos_k_id), @papadakis_id, 'melos', 8.0),
((SELECT id FROM diplomatikes WHERE id_foititi = @konstantinos_k_id), @stavropoulou_id, 'melos', 9.0);


-- 8. Εισαγωγή Δεδομένων στον πίνακα anakoinoseis (για διπλωματικές 'Υπό Εξέταση')
INSERT INTO anakoinoseis (id_diplomatikis, titlos, imerominia_parousiasis, ora_parousiasis, tropo_parousiasis, topothesia) VALUES
((SELECT id FROM diplomatikes WHERE id_foititi = @aikaterini_z_id), 'Παρουσίαση Διπλωματικής: Εικονική Πραγματικότητα', '2025-08-10', '10:00:00', 'di_zosis', 'Αίθουσα Α201'),
((SELECT id FROM diplomatikes WHERE id_foititi = @dimitris_th_id), 'Παρουσίαση Διπλωματικής: NLP σε Ελληνικά', '2025-08-12', '11:30:00', 'online', 'https://meet.google.com/xyzabc'),
((SELECT id FROM diplomatikes WHERE id_foititi = @ioanna_i_id), 'Παρουσίαση Διπλωματικής: Blockchain Technologies', '2025-08-15', '09:00:00', 'di_zosis', 'Αίθουσα Α202');


-- 9. Εισαγωγή Δεδομένων στον πίνακα kritiki_aksiologisis (για περατωμένες διπλωματικές)
INSERT INTO kritiki_aksiologisis (id_trimelous, analytiki_kritiki, analytiki_vathmologia) VALUES
((SELECT id FROM trimeloys WHERE id_diplomatikis = (SELECT id FROM diplomatikes WHERE id_foititi = @konstantinos_k_id) AND id_melous = @vlachos_id), 'Εξαιρετική υλοποίηση και καλή κατανόηση', 8.5),
((SELECT id FROM trimeloys WHERE id_diplomatikis = (SELECT id FROM diplomatikes WHERE id_foititi = @konstantinos_k_id) AND id_melous = @papadakis_id), 'Σαφής παρουσίαση, με μικρές αδυναμίες στη βιβλιογραφία', 8.0),
((SELECT id FROM trimeloys WHERE id_diplomatikis = (SELECT id FROM diplomatikes WHERE id_foititi = @konstantinos_k_id) AND id_melous = @stavropoulou_id), 'Πολύ καλή έρευνα, άριστη απόδοση', 9.0);

-- 10. Εισαγωγή Δεδομένων στον πίνακα simioseis
INSERT INTO simioseis (id_diplomatikis, id_didaskonta, keimeno) VALUES
((SELECT id FROM diplomatikes WHERE id_foititi = @alexandros_p_id), @papadakis_id, 'Καλή πρόοδος στο React Native project.'),
((SELECT id FROM diplomatikes WHERE id_foititi = @eleni_v_id), @stavropoulou_id, 'Χρειάζεται περισσότερη βιβλιογραφία.'),
((SELECT id FROM diplomatikes WHERE id_foititi = @nikolaos_g_id), @lappas_id, 'Να ενισχυθεί το κεφάλαιο ασφάλειας.'),
((SELECT id FROM diplomatikes WHERE id_foititi = @maria_d_id), @kyriakidou_id, 'Πολύ καλή δουλειά μέχρι τώρα.'),
((SELECT id FROM diplomatikes WHERE id_foititi = @georgios_e_id), @michalopoulos_id, 'Σαφήνεια στον κώδικα REST API.');

-- 11. Εισαγωγή Δεδομένων στον πίνακα arxeia
INSERT INTO arxeia (id_diplomatikis, typos, onoma_arxeiou, link) VALUES
((SELECT id FROM diplomatikes WHERE id_foititi = @alexandros_p_id), 'keimeno', 'react_native_doc.pdf', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @eleni_v_id), 'ypostiriktiko', 'medical_ml_dataset.zip', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @nikolaos_g_id), 'keimeno', 'network_security.pdf', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @maria_d_id), 'link', NULL, 'http://github.com/maria_d/bigdata'),
((SELECT id FROM diplomatikes WHERE id_foititi = @georgios_e_id), 'keimeno', 'rest_api_doc.pdf', NULL);

-- 12. Εισαγωγή Δεδομένων στον πίνακα proskliseis
INSERT INTO proskliseis (id_diplomatikis, id_didaskonta, katastasi, hmerominia_apantisis) VALUES
((SELECT id FROM diplomatikes WHERE id_foititi = @alexandros_p_id), @stavropoulou_id, 'apodexti', '2024-11-18'),
((SELECT id FROM diplomatikes WHERE id_foititi = @eleni_v_id), @kyriakidou_id, 'apodexti', '2024-11-25'),
((SELECT id FROM diplomatikes WHERE id_foititi = @nikolaos_g_id), @dimitriadis_id, 'aporrifthi', '2024-11-30'),
((SELECT id FROM diplomatikes WHERE id_foititi = @maria_d_id), @petridou_id, 'ekremis', NULL),
((SELECT id FROM diplomatikes WHERE id_foititi = @georgios_e_id), @vlachos_id, 'apodexti', '2024-12-10');

-- 13. Εισαγωγή Δεδομένων στον πίνακα diplomatiki_logs
INSERT INTO diplomatiki_logs (id_diplomatikis, palia_katastasi, nea_katastasi, hmerominia_allagis) VALUES
((SELECT id FROM diplomatikes WHERE id_foititi = @alexandros_p_id), 'ypo_anathesi', 'energi', '2024-11-15 10:00:00'),
((SELECT id FROM diplomatikes WHERE id_foititi = @eleni_v_id), 'ypo_anathesi', 'energi', '2024-11-20 11:00:00'),
((SELECT id FROM diplomatikes WHERE id_foititi = @nikolaos_g_id), 'ypo_anathesi', 'energi', '2024-11-25 09:30:00'),
((SELECT id FROM diplomatikes WHERE id_foititi = @maria_d_id), 'ypo_anathesi', 'energi', '2024-12-01 14:00:00'),
((SELECT id FROM diplomatikes WHERE id_foititi = @georgios_e_id), 'ypo_anathesi', 'energi', '2024-12-05 16:30:00');
