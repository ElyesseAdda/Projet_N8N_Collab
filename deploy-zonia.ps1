# Met a jour uniquement Zonia sur le VPS partage.
# Ne touche pas a Nginx, OnlyOffice, ni aux autres sites.
# Ne lance pas docker-compose.yml ni docker-compose.prod.yml.
# Ne fait jamais docker compose down.
#
# Usage, depuis le depot, une fois le commit pousse sur main :
#   powershell -ExecutionPolicy Bypass -File .\deploy-zonia.ps1
#   powershell -ExecutionPolicy Bypass -File .\deploy-zonia.ps1 -Yes
#   powershell -ExecutionPolicy Bypass -File .\deploy-zonia.ps1 -DryRun

param(
    [switch]$Yes,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$Vps = "root@72.60.90.127"
$RemoteDir = "/opt/zonia"
$ComposeFile = "docker-compose.vps.yml"
$Project = "zonia"

function Fail([string]$Message) {
    Write-Host $Message -ForegroundColor Red
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Fail "git est introuvable."
}
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Fail "ssh est introuvable. Installe le client OpenSSH de Windows."
}
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Fail "scp est introuvable. Installe le client OpenSSH de Windows."
}
if (-not (Test-Path "mon-portail\package.json")) {
    Fail "Lance ce script depuis la racine du depot Projet_N8N_Collab."
}

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -ne "main") {
    Fail "La branche courante est '$branch'. Passe sur main avant de deployer."
}

$dirty = git status --porcelain
if ($dirty) {
    Fail "Il reste des modifications non commitees. Commit, puis git push origin main."
}

Write-Host "Verification de origin/main..."
git fetch origin main
if ($LASTEXITCODE -ne 0) {
    Fail "Impossible de joindre origin. Verifie ta connexion et ton acces GitHub."
}

$local = (git rev-parse HEAD).Trim()
$remote = (git rev-parse "origin/main").Trim()
if ($local -ne $remote) {
    Fail "main local ($($local.Substring(0, 7))) n'est pas origin/main ($($remote.Substring(0, 7))). Fais git pull ou git push avant de deployer."
}

$subject = (git log -1 --format="%s").Trim()
$short = $local.Substring(0, 7)

Write-Host ""
Write-Host "Commit a deployer : $short  $subject"
Write-Host "Cible             : ${Vps}:${RemoteDir}"
Write-Host "Action            : remplacer le code Zonia, puis recreer seulement mon-portail"
Write-Host "Conserve          : .env, mon-portail/users.json, docker-compose.vps.yml"
Write-Host "Ne touche pas     : n8n, postgres, Nginx, les autres sites du VPS"
Write-Host ""

if ($DryRun) {
    Write-Host "Dry run : aucune copie et aucun redemarrage."
    exit 0
}

if (-not $Yes) {
    $answer = Read-Host "Continuer ? (o/N)"
    if ($answer -notmatch "^[oOyY]$") {
        Write-Host "Deploiement annule."
        exit 0
    }
}

$tar = Join-Path $env:TEMP "zonia-deploy.tar"
if (Test-Path $tar) {
    Remove-Item $tar -Force
}

Write-Host "Creation de l'archive du commit $short..."
git archive --format=tar -o $tar HEAD
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $tar)) {
    Fail "git archive a echoue."
}

try {
    Write-Host "Envoi vers le VPS..."
    scp $tar "${Vps}:/tmp/zonia-deploy.tar"
    if ($LASTEXITCODE -ne 0) {
        Fail "scp a echoue. Verifie l'acces SSH a $Vps."
    }

    $remoteScript = @'
set -euo pipefail

REMOTE_DIR="/opt/zonia"
COMPOSE_FILE="docker-compose.vps.yml"
ARCHIVE="/tmp/zonia-deploy.tar"
BACKUP="/tmp/zonia-deploy-backup"

if [ ! -d "$REMOTE_DIR" ]; then
  echo "ERREUR: $REMOTE_DIR est introuvable. Rien n'a ete modifie."
  exit 1
fi
if [ ! -f "$REMOTE_DIR/$COMPOSE_FILE" ]; then
  echo "ERREUR: $COMPOSE_FILE est absent. Arret pour ne pas lancer un autre compose."
  exit 1
fi
if [ ! -f "$REMOTE_DIR/.env" ]; then
  echo "ERREUR: $REMOTE_DIR/.env est absent. Arret pour ne pas deployer sans secrets."
  exit 1
fi
if [ ! -f "$REMOTE_DIR/mon-portail/users.json" ]; then
  echo "ERREUR: users.json est absent. Arret pour ne pas perdre les comptes."
  exit 1
fi

rm -rf "$BACKUP"
mkdir -p "$BACKUP/mon-portail"
cp -a "$REMOTE_DIR/.env" "$BACKUP/.env"
cp -a "$REMOTE_DIR/mon-portail/users.json" "$BACKUP/mon-portail/users.json"
cp -a "$REMOTE_DIR/$COMPOSE_FILE" "$BACKUP/$COMPOSE_FILE"

tar -xf "$ARCHIVE" -C "$REMOTE_DIR"

cp -a "$BACKUP/.env" "$REMOTE_DIR/.env"
cp -a "$BACKUP/mon-portail/users.json" "$REMOTE_DIR/mon-portail/users.json"
cp -a "$BACKUP/$COMPOSE_FILE" "$REMOTE_DIR/$COMPOSE_FILE"
rm -rf "$BACKUP" "$ARCHIVE"

cd "$REMOTE_DIR"
docker compose -p zonia -f "$COMPOSE_FILE" up -d --force-recreate mon-portail

echo "Attente du demarrage du portail..."
ready=0
for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 \
         21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 \
         41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60; do
  logs="$(docker compose -p zonia -f "$COMPOSE_FILE" logs --tail 80 mon-portail 2>&1 || true)"
  if printf "%s" "$logs" | grep -q "Serveur démarré avec succès"; then
    ready=1
    break
  fi
  cid="$(docker compose -p zonia -f "$COMPOSE_FILE" ps -q mon-portail || true)"
  if [ -n "$cid" ]; then
    state="$(docker inspect -f "{{.State.Status}}" "$cid" 2>/dev/null || true)"
    if [ "$state" = "exited" ] || [ "$state" = "dead" ]; then
      echo "ERREUR: le portail s'est arrete."
      printf "%s\n" "$logs"
      exit 1
    fi
  fi
  sleep 3
done

docker compose -p zonia -f "$COMPOSE_FILE" ps mon-portail
if [ "$ready" -ne 1 ]; then
  echo "ERREUR: le portail n'a pas affiche 'Serveur démarré avec succès' a temps."
  docker compose -p zonia -f "$COMPOSE_FILE" logs --tail 80 mon-portail
  exit 1
fi
echo "Portail demarre."
'@

    $remoteScript = $remoteScript -replace "`r", ""
    $remoteFile = Join-Path $env:TEMP "zonia-remote.sh"
    $utf8 = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($remoteFile, $remoteScript, $utf8)

    Write-Host "Mise a jour de Zonia et reconstruction du portail..."
    scp $remoteFile "${Vps}:/tmp/zonia-remote.sh"
    if ($LASTEXITCODE -ne 0) {
        Fail "Impossible d'envoyer le script de mise a jour."
    }
    ssh $Vps "bash /tmp/zonia-remote.sh; code=`$?; rm -f /tmp/zonia-remote.sh; exit `$code"
    if ($LASTEXITCODE -ne 0) {
        Fail "La mise a jour sur le VPS a echoue. n8n, postgres et les autres sites n'ont pas ete relances par ce script."
    }
}
finally {
    if (Test-Path $tar) {
        Remove-Item $tar -Force
    }
    $remoteFile = Join-Path $env:TEMP "zonia-remote.sh"
    if (Test-Path $remoteFile) {
        Remove-Item $remoteFile -Force
    }
}

Write-Host ""
Write-Host "Zonia est a jour sur $short." -ForegroundColor Green
Write-Host "Verifie https://zoniahub.fr"
