const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Change these to your database credentials
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Replace with your MySQL password
  database: 'diplomatikes_db',
  multipleStatements: false,
});

async function hashAllPasswords() {
  console.log('Starting password hashing...');

  try {
    await connection.promise().connect();
    console.log('✅ Connected to MySQL.');

    // 1. Get all users with plaintext passwords
    const [users] = await connection.promise().query('SELECT id, password FROM xristes WHERE CHAR_LENGTH(password) < 60');

    if (users.length === 0) {
      console.log('✅ All passwords appear to be hashed. No action needed.');
      connection.end();
      return;
    }

    console.log(`Found ${users.length} users with plaintext passwords. Hashing now...`);

    // 2. Loop through users and hash each password
    for (const user of users) {
      const plaintextPassword = user.password;
      const hashedPassword = await bcrypt.hash(plaintextPassword, 10);
      
      // 3. Update the database with the new hashed password
      await connection.promise().query('UPDATE xristes SET password = ? WHERE id = ?', [hashedPassword, user.id]);
    }

    console.log('✅ All passwords have been successfully hashed!');

  } catch (error) {
    console.error('❌ An error occurred during the hashing process:', error);
  } finally {
    connection.end();
    console.log('Connection to database closed.');
  }
}

// Run the function
hashAllPasswords();
