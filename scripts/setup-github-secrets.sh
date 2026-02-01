#!/bin/bash

# Configuration des secrets pour le projet chronos-alchemy-kfv
# Nécessite l'installation de la CLI GitHub (gh) et d'être connecté (gh auth login)

REPO="KevFet/chronos-alchemy"

echo "🚀 Configuration des secrets pour $REPO..."

# Lecture du fichier Service Account sur le bureau
SA_FILE="$HOME/Desktop/chronos-alchemy-kfv-firebase-adminsdk-fbsvc-0d81db81e3.json"

if [ -f "$SA_FILE" ]; then
    echo "✅ Fichier Service Account trouvé."
    gh secret set FIREBASE_SERVICE_ACCOUNT_CHRONOS_ALCHEMY_KFV < "$SA_FILE" --repo "$REPO"
else
    echo "❌ Erreur : Fichier Service Account non trouvé sur le bureau."
fi

# Variables publiques Firebase
gh secret set NEXT_PUBLIC_FIREBASE_API_KEY --body "AIzaSyCdWhPYqqzOMGSEVW3nZG9quE3bEL_ez0U" --repo "$REPO"
gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --body "chronos-alchemy-kfv.firebaseapp.com" --repo "$REPO"
gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID --body "chronos-alchemy-kfv" --repo "$REPO"
gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --body "chronos-alchemy-kfv.firebasestorage.app" --repo "$REPO"
gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --body "891217927246" --repo "$REPO"
gh secret set NEXT_PUBLIC_FIREBASE_APP_ID --body "1:891217927246:web:d3d153fae001ecaf09f71f" --repo "$REPO"

echo "✨ Terminé ! Relancez maintenant le Workflow GitHub Actions pour déployer avec les bonnes clés."
