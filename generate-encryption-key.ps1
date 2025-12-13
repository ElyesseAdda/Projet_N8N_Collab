# Script pour générer une clé de chiffrement n8n sécurisée
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$key = [Convert]::ToBase64String($bytes)
Write-Host ""
Write-Host "Clé générée :" -ForegroundColor Green
Write-Host $key -ForegroundColor Yellow
Write-Host ""
Write-Host "Copiez cette clé et collez-la dans docker-compose.yml pour N8N_ENCRYPTION_KEY" -ForegroundColor Cyan
Write-Host ""

