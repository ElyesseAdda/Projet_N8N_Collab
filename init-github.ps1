# Script PowerShell pour initialiser Git et pousser sur GitHub
# Usage: .\init-github.ps1

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  INITIALISATION GIT ET PUSH SUR GITHUB                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git détecté : $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé !" -ForegroundColor Red
    Write-Host "   Téléchargez Git depuis : https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# Vérifier si déjà un dépôt Git
if (Test-Path .git) {
    Write-Host "⚠️  Un dépôt Git existe déjà" -ForegroundColor Yellow
    $continue = Read-Host "Continuer quand même ? (O/N)"
    if ($continue -ne "O" -and $continue -ne "o") {
        exit 0
    }
} else {
    Write-Host "📦 Initialisation du dépôt Git..." -ForegroundColor Cyan
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'initialisation Git" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dépôt Git initialisé" -ForegroundColor Green
}

# Vérifier la configuration Git
Write-Host ""
Write-Host "📋 Configuration Git actuelle :" -ForegroundColor Cyan
$gitUser = git config user.name
$gitEmail = git config user.email

if ([string]::IsNullOrWhiteSpace($gitUser)) {
    Write-Host "⚠️  Nom d'utilisateur Git non configuré" -ForegroundColor Yellow
    $userName = Read-Host "Entrez votre nom"
    git config user.name $userName
}

if ([string]::IsNullOrWhiteSpace($gitEmail)) {
    Write-Host "⚠️  Email Git non configuré" -ForegroundColor Yellow
    $userEmail = Read-Host "Entrez votre email"
    git config user.email $userEmail
}

Write-Host "   Nom : $(git config user.name)" -ForegroundColor Gray
Write-Host "   Email : $(git config user.email)" -ForegroundColor Gray

# Vérifier .gitignore
Write-Host ""
Write-Host "📝 Vérification du fichier .gitignore..." -ForegroundColor Cyan
if (Test-Path .gitignore) {
    Write-Host "✅ Fichier .gitignore trouvé" -ForegroundColor Green
} else {
    Write-Host "⚠️  Fichier .gitignore non trouvé" -ForegroundColor Yellow
    Write-Host "   Créez-en un pour exclure les fichiers sensibles !" -ForegroundColor Yellow
}

# Ajouter les fichiers
Write-Host ""
Write-Host "📦 Ajout des fichiers au dépôt..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'ajout des fichiers" -ForegroundColor Red
    exit 1
}

# Afficher ce qui sera committé
Write-Host ""
Write-Host "📋 Fichiers à committer :" -ForegroundColor Cyan
git status --short

# Faire le commit
Write-Host ""
$commitMessage = Read-Host "Message du commit (ou Entrée pour utiliser le message par défaut)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Initial commit: Projet N8N Collaboratif avec portail"
}

git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Commit créé : $commitMessage" -ForegroundColor Green

# Demander l'URL du dépôt GitHub
Write-Host ""
Write-Host "🔗 Configuration du dépôt GitHub" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous devez avoir créé le dépôt sur GitHub.com d'abord !" -ForegroundColor Yellow
Write-Host "1. Allez sur https://github.com/new" -ForegroundColor Gray
Write-Host "2. Créez un nouveau dépôt (PRIVATE recommandé)" -ForegroundColor Gray
Write-Host "3. NE cochez PAS 'Initialize with README'" -ForegroundColor Gray
Write-Host ""
$repoUrl = Read-Host "Entrez l'URL de votre dépôt GitHub (ex: https://github.com/USERNAME/Projet_N8N_Collab.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "⚠️  URL non fournie, configuration du remote ignorée" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Pour terminer manuellement, exécutez :" -ForegroundColor Cyan
    Write-Host "   git remote add origin VOTRE_URL_GITHUB" -ForegroundColor White
    Write-Host "   git branch -M main" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
    exit 0
}

# Ajouter le remote
Write-Host ""
Write-Host "🔗 Ajout du remote GitHub..." -ForegroundColor Cyan
git remote add origin $repoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    # Peut-être que le remote existe déjà
    Write-Host "⚠️  Le remote existe peut-être déjà, tentative de mise à jour..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
}

# Changer le nom de branche en main
git branch -M main

# Pousser vers GitHub
Write-Host ""
Write-Host "🚀 Poussage vers GitHub..." -ForegroundColor Cyan
Write-Host "   (Vous devrez peut-être vous authentifier)" -ForegroundColor Yellow

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Succès ! Votre projet est maintenant sur GitHub !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Votre dépôt : $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Erreur lors du push" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Solutions possibles :" -ForegroundColor Cyan
    Write-Host "1. Vérifiez que le dépôt existe sur GitHub" -ForegroundColor Gray
    Write-Host "2. Configurez SSH pour GitHub" -ForegroundColor Gray
    Write-Host "3. Utilisez un Personal Access Token si HTTPS" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pour réessayer manuellement :" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor White
}

Write-Host ""

