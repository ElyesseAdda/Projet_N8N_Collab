/**
 * Script pour obtenir un refresh token Google OAuth2
 * 
 * Usage:
 * 1. Remplissez CLIENT_ID et CLIENT_SECRET ci-dessous
 * 2. Exécutez: node scripts/get-google-token.mjs
 * 3. Votre navigateur s'ouvrira automatiquement
 * 4. Connectez-vous avec votre compte Google
 * 5. Le refresh_token sera affiché dans le terminal
 */

import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';
import open from 'open';

// ============================================
// REMPLISSEZ CES VALEURS DEPUIS GOOGLE CLOUD
// ============================================
const CLIENT_ID = '1041219821152-rnl2qsen2ib6s8gp71t800dstg99r805.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
// ============================================

const PORT = 3333;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Créer un serveur HTTP temporaire pour recevoir le callback
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      
      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>❌ Erreur: ${error}</h1><p>Fermez cette fenêtre.</p>`);
        console.error(`\n❌ Erreur d'autorisation: ${error}`);
        server.close();
        process.exit(1);
      }
      
      if (code) {
        // Échanger le code contre les tokens
        const { tokens } = await oauth2Client.getToken(code);
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: green;">✅ Autorisation réussie !</h1>
              <p>Vous pouvez fermer cette fenêtre et retourner au terminal.</p>
            </body>
          </html>
        `);
        
        console.log('\n========================================');
        console.log('✅ SUCCÈS! Voici vos tokens:');
        console.log('========================================\n');
        
        console.log('🔑 REFRESH TOKEN (à mettre dans .env):');
        console.log(tokens.refresh_token);
        
        console.log('\n========================================');
        console.log('COPIEZ CES LIGNES DANS VOTRE .env:');
        console.log('========================================\n');
        console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
        console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\n========================================\n');
        
        server.close();
        process.exit(0);
      }
    }
    
    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    console.error('Erreur:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>❌ Erreur: ${err.message}</h1>`);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, async () => {
  // Générer l'URL d'autorisation
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  
  console.log('\n========================================');
  console.log('🔐 Authentification Google Drive OAuth2');
  console.log('========================================\n');
  console.log('Ouverture du navigateur...\n');
  console.log('Si le navigateur ne s\'ouvre pas, copiez cette URL:');
  console.log(authUrl);
  console.log('\n⏳ En attente de l\'autorisation...\n');
  
  // Ouvrir le navigateur
  try {
    await open(authUrl);
  } catch (e) {
    console.log('⚠️ Impossible d\'ouvrir le navigateur automatiquement.');
    console.log('Veuillez copier l\'URL ci-dessus manuellement.\n');
  }
});

// Timeout après 5 minutes
setTimeout(() => {
  console.log('\n❌ Timeout: Aucune autorisation reçue après 5 minutes.');
  server.close();
  process.exit(1);
}, 5 * 60 * 1000);
