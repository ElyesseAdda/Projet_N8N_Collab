import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Liste des utilisateurs avec leurs mots de passe en clair
// ⚠️ IMPORTANT : Changez ces mots de passe en production !
const users = [
  { username: 'yacineAA', password: 'Ayla220223@@', displayName: 'Yacine AA' },
  { username: 'KevinD', password: 'Chovylafraude@@', displayName: 'Kevin D' },
  { username: 'ElyesseAA', password: 'Ayla220223@@', displayName: 'Elyesse AA' }
];

async function hashPasswords() {
  console.log('🔐 Génération des hashs de mots de passe...\n');
  
  const hashedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      console.log(`✅ ${user.username} - Mot de passe hashé`);
      return {
        username: user.username,
        password: hashedPassword,
        displayName: user.displayName
      };
    })
  );

  const filePath = path.join(__dirname, '..', 'users.json');
  fs.writeFileSync(filePath, JSON.stringify(hashedUsers, null, 2));
  
  console.log(`\n✅ Fichier users.json créé avec ${hashedUsers.length} utilisateur(s)`);
  console.log(`📁 Emplacement: ${filePath}\n`);
}

hashPasswords().catch((error) => {
  console.error('❌ Erreur lors de la génération des hashs:', error);
  process.exit(1);
});

