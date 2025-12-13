#!/bin/bash
# Script pour créer le fichier users.json sur le serveur

cat > ~/projets/Projet_N8N_Collab/mon-portail/users.json << 'EOF'
[
  {
    "username": "yacineAA",
    "password": "$2b$10$sc1bByCWsaOgGb3YxpC9Ouxg7pBrFVF3JWrkEWeBRyYXcm8pEMQtO",
    "displayName": "Yacine AA"
  },
  {
    "username": "KevinD",
    "password": "$2b$10$wzzoTaIdsfS0oRRrZ1BeGedp1Mh7j.4h7v/rMnW7eHWmS2TOjZGOO",
    "displayName": "Kevin D"
  },
  {
    "username": "ElyesseAA",
    "password": "$2b$10$HjjCFRuQ/HLxNmo5tlmGMOAxDmTh3.JgNs.S/psqGCpATJB4wnxiq",
    "displayName": "Elyesse AA"
  }
]
EOF

echo "✅ Fichier users.json créé avec succès"
echo "📁 Emplacement: ~/projets/Projet_N8N_Collab/mon-portail/users.json"
