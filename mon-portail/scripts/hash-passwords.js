const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const users = [
  { username: 'yacineAA', password: 'Ayla220223@@', displayName: 'Yacine AA' },
  { username: 'KevinD', password: 'Chovylafraude@@', displayName: 'Kevin D' },
  { username: 'ElyesseAA', password: 'Ayla220223@@', displayName: 'Elyesse AA' }
];

async function hashPasswords() {
  const hashedUsers = await Promise.all(
    users.map(async (user) => ({
      username: user.username,
      password: await bcrypt.hash(user.password, 10),
      displayName: user.displayName
    }))
  );

  const filePath = path.join(__dirname, '..', 'users.json');
  fs.writeFileSync(filePath, JSON.stringify(hashedUsers, null, 2));
  console.log('✅ Mots de passe hashés et sauvegardés dans users.json');
}

hashPasswords().catch(console.error);

