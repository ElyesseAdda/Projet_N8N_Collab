// Script de test pour vérifier la configuration email
import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('🧪 Test de configuration email Gmail\n');

// Vérification des variables d'environnement
const gmailUser = process.env.GMAIL_USER || 'zonia.ai.pro@gmail.com';
const gmailPassword = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD;

console.log('📋 Variables d\'environnement:');
console.log('  - GMAIL_USER:', gmailUser);
console.log('  - GMAIL_APP_PASSWORD:', gmailPassword ? `✅ Configuré (${gmailPassword.length} caractères)` : '❌ Non défini');
console.log('  - GMAIL_PASSWORD:', process.env.GMAIL_PASSWORD ? '✅ Configuré' : '❌ Non défini');
console.log('');

if (!gmailPassword) {
    console.error('❌ ERREUR: GMAIL_APP_PASSWORD ou GMAIL_PASSWORD doit être défini dans le fichier .env');
    process.exit(1);
}

// Configuration du transporteur
console.log('📧 Configuration du transporteur email...');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailUser,
        pass: gmailPassword
    }
});

// Test de connexion
console.log('🔌 Test de connexion au serveur SMTP Gmail...');
transporter.verify()
    .then(() => {
        console.log('✅ Connexion SMTP réussie !');
        console.log('\n📤 Test d\'envoi d\'email...');
        
        const mailOptions = {
            from: gmailUser,
            to: 'zonia.ai.pro@gmail.com',
            subject: 'Test d\'envoi email - Zonia',
            html: `
                <h2>Test d'envoi d'email</h2>
                <p>Ceci est un email de test pour vérifier la configuration.</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
            `,
            text: `Test d'envoi d'email - ${new Date().toLocaleString('fr-FR')}`
        };
        
        return transporter.sendMail(mailOptions);
    })
    .then((info) => {
        console.log('✅ Email envoyé avec succès !');
        console.log('📧 Détails:', {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected
        });
        console.log('\n✅ Configuration email fonctionnelle !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ ERREUR:', error.message);
        console.error('📋 Détails:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        console.error('\n💡 Solutions possibles:');
        console.error('  1. Vérifiez que GMAIL_APP_PASSWORD est correct dans .env');
        console.error('  2. Vérifiez qu\'il n\'y a pas d\'espaces dans le mot de passe');
        console.error('  3. Vérifiez que la validation en 2 étapes est activée');
        console.error('  4. Vérifiez que le mot de passe d\'application n\'a pas été révoqué');
        process.exit(1);
    });
