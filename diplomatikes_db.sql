CREATE DATABASE  IF NOT EXISTS `diplomatikes_db`;

USE `diplomatikes_db`;

CREATE TABLE xristes (
    id INT AUTO_INCREMENT PRIMARY KEY,  /* Id,unique gia kathe xrhsth */
    onoma VARCHAR(100) NOT NULL,         
    epitheto VARCHAR(100) NOT NULL,      
    email VARCHAR(100) NOT NULL UNIQUE,  /* Email pou tha einai kai username */
    password VARCHAR(100) NOT NULL,       /* kwodikos (hashed) */ 
    rolos ENUM('foititis', 'didaskon', 'grammateia') NOT NULL  /* typos xrhsth */
);

CREATE TABLE themata (
    id INT AUTO_INCREMENT PRIMARY KEY,   
    titlos VARCHAR(200) NOT NULL,        
    perigrafi TEXT,                      
    arxeio VARCHAR(255),                 /* onoma arxeioy PDF */
    id_didaskonta INT NOT NULL,          /* Id didaskonta poy to dimioyrgise */
    FOREIGN KEY (id_didaskonta) REFERENCES xristes(id)
);

CREATE TABLE diplomatikes (
    id INT AUTO_INCREMENT PRIMARY KEY,           
    id_thematos INT NOT NULL,                    /* Id thematos p antistoixei */
    id_foititi INT NOT NULL,                     /* Id foititi poy thn exei analavei */
    katastasi ENUM('ypo_anathesi', 'energi', 'ypo_exetasi', 'peratomeni', 'akyromeni') NOT NULL DEFAULT 'ypo_anathesi',  
    hmerominia_anathesis DATE,                   
    praktiko_link VARCHAR(255),                  /* syntethimeno link praktikoy */
    nimertis_link VARCHAR(255),                  /* syntethimeno link nimertis */
    FOREIGN KEY (id_thematos) REFERENCES themata(id),
    FOREIGN KEY (id_foititi) REFERENCES xristes(id)
);

CREATE TABLE trimeloys (
    id INT AUTO_INCREMENT PRIMARY KEY,        /* monadiko id eggrafis */
    id_diplomatikis INT NOT NULL,             
    id_melous INT NOT NULL,                   /* Id didaskonta poy einai melos */
    rolos ENUM('epivlepontas', 'melos') NOT NULL,  /* rolos sthn epitroph */
    epidosi FLOAT,                            /* bathmos poy ebale o didaskon */
    FOREIGN KEY (id_diplomatikis) REFERENCES diplomatikes(id),
    FOREIGN KEY (id_melous) REFERENCES xristes(id)
);

CREATE TABLE simioseis (
    id INT AUTO_INCREMENT PRIMARY KEY,        
    id_diplomatikis INT NOT NULL,             
    id_didaskonta INT NOT NULL,               /* Id didaskonta poy thn kataxorise */
    keimeno VARCHAR(300),                     /* keimeno simiosis */
    hmerominia DATETIME DEFAULT CURRENT_TIMESTAMP, /* hmerominia kataxwrisis */
    FOREIGN KEY (id_diplomatikis) REFERENCES diplomatikes(id),
    FOREIGN KEY (id_didaskonta) REFERENCES xristes(id)
);

CREATE TABLE arxeia (
    id INT AUTO_INCREMENT PRIMARY KEY,        
    id_diplomatikis INT NOT NULL,             
    typos ENUM('keimeno', 'ypostiriktiko', 'link') NOT NULL, /* typos arxeioy */
    onoma_arxeiou VARCHAR(255),               
    link VARCHAR(255),                        /* sindesmos gia ekswterika arxeia */
    hmerominia DATETIME DEFAULT CURRENT_TIMESTAMP, /* hmerominia kataxwrisis */
    FOREIGN KEY (id_diplomatikis) REFERENCES diplomatikes(id)
);

CREATE TABLE proskliseis (
    id INT AUTO_INCREMENT PRIMARY KEY,        
    id_diplomatikis INT NOT NULL,             
    id_didaskonta INT NOT NULL,               /* Id didaskonta poy prosklithike */
    katastasi ENUM('ekremis', 'apodexti', 'aporrifthi') DEFAULT 'ekremis', 
    hmerominia_prosklisis DATETIME DEFAULT CURRENT_TIMESTAMP, 
    hmerominia_apantisis DATETIME,              
    FOREIGN KEY (id_diplomatikis) REFERENCES diplomatikes(id),
    FOREIGN KEY (id_didaskonta) REFERENCES xristes(id)
);

CREATE TABLE anakoinoseis (
    id INT AUTO_INCREMENT PRIMARY KEY,       
    id_diplomatikis INT NOT NULL,            
    titlos VARCHAR(200) NOT NULL,            
    imerominia_parousiasis DATE NOT NULL,    
    ora_parousiasis TIME NOT NULL,           
    tropo_parousiasis ENUM('di_zosis', 'online') NOT NULL,  
    topothesia VARCHAR(200),                  /* aithoysa h link */
    FOREIGN KEY (id_diplomatikis) REFERENCES diplomatikes(id)
);


/* pinakas foititwn ,epektash toy pinaka xristes */
CREATE TABLE foititis (
    id INT PRIMARY KEY,  /* to id apton pinaka xristes */
    AM VARCHAR(20) UNIQUE NOT NULL, 
    tilefono_kinhto VARCHAR(20), 
    tilefono_stathero VARCHAR(20), 
    dieythinsi_odo VARCHAR(100), 
    dieythinsi_arithmos VARCHAR(10),  
    dieythinsi_polh VARCHAR(50), 
    dieythinsi_tk VARCHAR(10), 
    FOREIGN KEY (id) REFERENCES xristes(id) ON DELETE CASCADE /* otan diagrafei xristis diagrafonte kai ta stoixeia toy foititi */
);

/* pinakas gia didaskontes epektash toy pinaka xrhstes */
CREATE TABLE didaskon (
    id INT PRIMARY KEY, /* id apton pinaka xristes */
    tilefono VARCHAR(20), 
    FOREIGN KEY (id) REFERENCES xristes(id) ON DELETE CASCADE
);

/* pinakas gia grammateia epektash toy pinaka xrhstes */
CREATE TABLE grammateia (
    id INT PRIMARY KEY, /* id apton pinaka xristes */
    tilefono VARCHAR(20), 
    FOREIGN KEY (id) REFERENCES xristes(id) ON DELETE CASCADE
);


/* ALTER TABLE gia ton pinaka trimeloys
   Afairesh tou yparxontos FOREIGN KEY pou anaferetai sto xristes.id */
ALTER TABLE trimeloys
DROP FOREIGN KEY trimeloys_ibfk_2;  


/* Prosthiki tou neou FOREIGN KEY pou anaferetai sto didaskon.id */
ALTER TABLE trimeloys
ADD CONSTRAINT fk_trimeloys_didaskon
FOREIGN KEY (id_melous) REFERENCES didaskon(id) ON DELETE CASCADE;


/* ALTER TABLE gia ton pinaka simioseis
   Afairesh tou yparxontos FOREIGN KEY pou anaferetai sto xristes.id */
ALTER TABLE simioseis
DROP FOREIGN KEY  simioseis_ibfk_2; 

/* Prosthiki tou neou FOREIGN KEY pou anaferetai sto didaskon.id */
ALTER TABLE simioseis
ADD CONSTRAINT fk_simioseis_didaskon
FOREIGN KEY (id_didaskonta) REFERENCES didaskon(id) ON DELETE CASCADE;


/* ALTER TABLE gia ton pinaka proskliseis
   Afairesh tou yparxontos FOREIGN KEY pou anaferetai sto xristes.id */
ALTER TABLE proskliseis
DROP FOREIGN KEY  proskliseis_ibfk_2; 

/* Prosthiki tou neou FOREIGN KEY pou anaferetai sto didaskon.id */
ALTER TABLE proskliseis
ADD CONSTRAINT fk_proskliseis_didaskon
FOREIGN KEY (id_didaskonta) REFERENCES didaskon(id) ON DELETE CASCADE;

/* ALTER TABLE gia ton pinaka themata
   Afairesh tou yparxontos FOREIGN KEY gia to id_didaskonta pou anaferetai sto xristes.id */
ALTER TABLE themata
DROP FOREIGN KEY themata_ibfk_1; 

/* Prosthiki tou neou FOREIGN KEY pou anaferetai pleon sto didaskon.id */
ALTER TABLE themata
ADD CONSTRAINT fk_themata_didaskon
FOREIGN KEY (id_didaskonta) REFERENCES didaskon(id) ON DELETE CASCADE;

/* ALTER TABLE gia ton pinaka diplomatikes
  Afairesh tou yparxontos FOREIGN KEY gia to id_foititi pou anaferetai sto xristes.id */
ALTER TABLE diplomatikes
DROP FOREIGN KEY diplomatikes_ibfk_2; 

/* Prostiki tou neou FOREIGN KEY gia to id_foititi pou anaferetai pleon sto foititis.id */
ALTER TABLE diplomatikes
ADD CONSTRAINT fk_diplomatikes_foititis
FOREIGN KEY (id_foititi) REFERENCES foititis(id) ON DELETE CASCADE;


/* Ylopoihsh gia thn aitisi analipsis thematos (katathesi sth grammateia),periexei thn episimi
katathesi ths aitisis analipsis thematos sth grammateia + arithmo prwtokoloy klp */
CREATE TABLE aitiseis_analipsis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_diplomatikis INT NOT NULL UNIQUE, 
    hmerominia_katathesis DATE NOT NULL,  /* hmerominia katathesis aitisis sth grammateia */
    id_grammateias INT NOT NULL,          
    arxeio_aitisis VARCHAR(255),          /* path gia to arxeio aitisis */
    arithmos_protokollou_egkrisis VARCHAR(50), 
    etos_genikis_syneleusis_egkrisis INT,      
    FOREIGN KEY (id_diplomatikis) REFERENCES diplomatikes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_grammateias) REFERENCES grammateia(id) ON DELETE RESTRICT /* restrict gt de diagrafetai o ypallhlos ths grammateias*/
);


/* Ylopoihsh gia thn katathesi bathmologias diplwmatikis toy foititi sth grammateia +telikos bathmos*/
ALTER TABLE diplomatikes
ADD COLUMN final_bathmos FLOAT, 
ADD COLUMN hmerominia_katathesis_bathmou_grammateia DATE, 
ADD COLUMN id_grammateias_pou_dexthike_bathmo INT, 
ADD CONSTRAINT fk_diplomatikes_grammateia_bathmos
FOREIGN KEY (id_grammateias_pou_dexthike_bathmo) REFERENCES grammateia(id) ON DELETE SET NULL;


/* periptwsh akyrwshs diplwmatikis ergasias apth grammateia */
ALTER TABLE diplomatikes
ADD COLUMN hmerominia_akyrwshs DATE, 
ADD COLUMN arithmos_protokollou_akyrwshs VARCHAR(50), 
ADD COLUMN etos_genikis_syneleusis_akyrwshs INT, 
ADD COLUMN logos_akyrwshs TEXT, 
ADD COLUMN id_grammateias_pou_akyrwse INT, 
ADD CONSTRAINT fk_diplomatikes_grammateia_akyrosi
FOREIGN KEY (id_grammateias_pou_akyrwse) REFERENCES grammateia(id) ON DELETE SET NULL;

/* H ekfwnhsh zhta  xronologio energeiwn to opoio to ylopoioyme parakatw */

CREATE TABLE diplomatiki_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_diplomatikis INT NOT NULL,
    palia_katastasi ENUM('ypo_anathesi', 'energi', 'ypo_exetasi', 'peratomeni', 'akyromeni'),
    nea_katastasi ENUM('ypo_anathesi', 'energi', 'ypo_exetasi', 'peratomeni', 'akyromeni'),
    hmerominia_allagis DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_diplomatikis) REFERENCES diplomatikes(id)
);

/* Kai ksexwristos pinakas gia tis analytikes bathmologies twn kathigitwn + sxolia opws zhteitai sthn ekfwnhsh */
CREATE TABLE kritiki_aksiologisis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_trimelous INT NOT NULL,
    analytiki_kritiki VARCHAR(100) NOT NULL,
    analytiki_vathmologia FLOAT NOT NULL,
    FOREIGN KEY (id_trimelous) REFERENCES trimeloys(id) ON DELETE CASCADE
    
);

/* Allagh,anti na xei username to email ,bazoyme to parakatw ws username */
ALTER TABLE xristes 
ADD COLUMN username VARCHAR(200) 
GENERATED ALWAYS AS (LOWER(CONCAT(onoma, '.', epitheto))) STORED UNIQUE;

DELIMITER $$

CREATE TRIGGER trg_log_katastasi_allagi
BEFORE UPDATE ON diplomatikes
FOR EACH ROW
BEGIN
    IF NOT NEW.katastasi <=> OLD.katastasi THEN
        INSERT INTO diplomatiki_logs (id_diplomatikis, palia_katastasi, nea_katastasi)
        VALUES (OLD.id, OLD.katastasi, NEW.katastasi);
    END IF;
END$$

DELIMITER ;


ALTER TABLE xristes DROP COLUMN username;

ALTER TABLE xristes 
ADD COLUMN username VARCHAR(100)
GENERATED ALWAYS AS (SUBSTRING_INDEX(email, '@', 1)) STORED UNIQUE;

ALTER TABLE trimeloys
ADD CONSTRAINT chk_epidosi_range
CHECK (epidosi >= 0 AND epidosi <= 10);

ALTER TABLE kritiki_aksiologisis
ADD CONSTRAINT chk_analytiki_vathmologia_range
CHECK (analytiki_vathmologia >= 0 AND analytiki_vathmologia <= 10);

ALTER TABLE diplomatikes 
ADD COLUMN arithmos_protokollou_egkrisis VARCHAR(100);

CREATE INDEX idx_id_didaskonta ON themata(id_didaskonta);
CREATE INDEX idx_id_thematos ON diplomatikes(id_thematos);
CREATE INDEX idx_id_foititi ON diplomatikes(id_foititi);
CREATE INDEX idx_id_diplomatikis ON trimeloys(id_diplomatikis);
CREATE INDEX idx_id_diplomatikis_arxeia ON arxeia(id_diplomatikis);

-- Kai epipleon ta parakatw 
-- DIPLOMATIKES
CREATE INDEX idx_diplomatikes_katastasi ON diplomatikes(katastasi);
CREATE INDEX idx_diplomatikes_foititis_katastasi ON diplomatikes(id_foititi, katastasi);

-- TRIMELOYS
CREATE INDEX idx_trimeloys_diplomatikis_melos ON trimeloys(id_diplomatikis, id_melous);

-- ARXEIA
CREATE INDEX idx_arxeia_diplomatikis_typos ON arxeia(id_diplomatikis, typos);

-- PROSKLISEIS
CREATE INDEX idx_proskliseis_diplomatikis_didaskon ON proskliseis(id_diplomatikis, id_didaskonta);

-- ANAKOINOSEIS
CREATE INDEX idx_anakoinoseis_diplomatikis ON anakoinoseis(id_diplomatikis);

-- KRITIKI AKSIOLOGISI
CREATE INDEX idx_kritiki_aksiologisis_trimelous ON kritiki_aksiologisis(id_trimelous);

-- SIMIOSEIS
CREATE INDEX idx_simioseis_diplomatikis ON simioseis(id_diplomatikis);

-- AITISEIS ANALIPSIS
CREATE INDEX idx_aitiseis_analipsis_diplomatikis ON aitiseis_analipsis(id_diplomatikis);

-- LOGS
CREATE INDEX idx_logs_diplomatikis ON diplomatiki_logs(id_diplomatikis);

-- FOITITIS
CREATE INDEX idx_foititis_am ON foititis(AM);

-- XRISTES
CREATE INDEX idx_xristes_username ON xristes(username);
CREATE INDEX idx_xristes_email ON xristes(email);