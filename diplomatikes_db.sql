CREATE DATABASE diplomatikes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci; /* gia xrisi
ellhnikwn*/

USE diplomatikes_db;

CREATE TABLE xristes (
    id INT AUTO_INCREMENT PRIMARY KEY,  /* Id,unique gia kathe xrhsth */
    onoma VARCHAR(100) NOT NULL,         
    epitheto VARCHAR(100) NOT NULL,      
    email VARCHAR(100) NOT NULL UNIQUE,  /* Email pou tha einai kai username */
    kodikos VARCHAR(100) NOT NULL,       /* kwodikos (hashed) */ 
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
    hmerominia_apantis DATETIME,              
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
    topo_thea VARCHAR(200),                  /* aithoysa h link */
    FOREIGN KEY (id_diplomatikis) REFERENCES diplomatikes(id)
);

/* pinakas foititwn ,epektash toy pinaka xristes */
CREATE TABLE foititis (
    id INT PRIMARY KEY,  / to id apton pinaka xristes /
    AM VARCHAR(20) UNIQUE NOT NULL, 
    tilefono_kinhto VARCHAR(20), 
    tilefono_stathero VARCHAR(20), 
    dieythinsi_odo VARCHAR(100), 
    dieythinsi_arithmos VARCHAR(10),
    dieythinsi_polh VARCHAR(50), 
    dieythinsi_tk VARCHAR(10), 
    FOREIGN KEY (id) REFERENCES xristes(id) ON DELETE CASCADE / otan diagrafei xristis diagrafonte kai ta stoixeia toy foititi /
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

/*Προαιρετικό αλλά χρήσιμο!!! Δημιουργήσαμε τα παρακάτω indexes για καλύτερη απόδοση σε μεγάλα datasets*/
CREATE INDEX idx_id_didaskonta ON themata(id_didaskonta);
CREATE INDEX idx_id_thematos ON diplomatikes(id_thematos);
CREATE INDEX idx_id_foititi ON diplomatikes(id_foititi);
CREATE INDEX idx_id_diplomatikis ON trimeloys(id_diplomatikis);
CREATE INDEX idx_id_diplomatikis_arxeia ON arxeia(id_diplomatikis);