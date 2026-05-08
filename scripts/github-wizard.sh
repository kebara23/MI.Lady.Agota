#!/usr/bin/env bash
# =============================================================================
# Wizard: conectar este proyecto con GitHub (usuario Kebara23)
# Uso: desde la raíz del proyecto →  bash scripts/github-wizard.sh
# =============================================================================

set -e
GITHUB_USER="${GITHUB_USER:-Kebara23}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Wizard GitHub — Oracle of Freedom / MI Lady Agota"
echo "  Usuario GitHub: $GITHUB_USER"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if ! command -v git &>/dev/null; then
  echo "❌ Git no está instalado. Instálalo desde https://git-scm.com"
  exit 1
fi

if [ ! -d .git ]; then
  echo "→ Inicializando repositorio git…"
  git init
  git branch -M main
  echo "✓ Repositorio creado (rama main)."
else
  echo "✓ Ya existe .git"
fi

echo ""
read -r -p "Nombre del repositorio en GitHub (ej. mi-lady-agota): " REPO_NAME
REPO_NAME="$(echo "$REPO_NAME" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"
if [ -z "$REPO_NAME" ]; then
  echo "❌ Necesitas un nombre de repo."
  exit 1
fi

REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
SSH_URL="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo "El remoto será:"
echo "  HTTPS: $REMOTE_URL"
echo "  SSH:   $SSH_URL"
echo ""
read -r -p "¿Usar SSH en lugar de HTTPS? (s/N): " USE_SSH
if [[ "$USE_SSH" =~ ^[sS]$ ]]; then
  TARGET_URL="$SSH_URL"
else
  TARGET_URL="$REMOTE_URL"
fi

if git remote get-url origin &>/dev/null; then
  echo ""
  read -r -p "Ya existe 'origin'. ¿Sobrescribir? (s/N): " OW
  if [[ "$OW" =~ ^[sS]$ ]]; then
    git remote remove origin
    git remote add origin "$TARGET_URL"
    echo "✓ origin actualizado."
  else
    echo "Se mantiene el remoto actual."
  fi
else
  git remote add origin "$TARGET_URL"
  echo "✓ Remoto origin añadido."
fi

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "  PASOS EN GITHUB (hazlo antes del primer push si aplica)"
echo "───────────────────────────────────────────────────────────────"
echo "  1. Entra en https://github.com/new"
echo "  2. Owner: $GITHUB_USER"
echo "  3. Repository name: $REPO_NAME"
echo "  4. Deja el repo VACÍO (sin README, sin .gitignore) si ya tienes commit aquí."
echo ""
echo "  Opción rápida con GitHub CLI (si tienes 'gh' instalado):"
echo "    gh auth login"
echo "    gh repo create $GITHUB_USER/$REPO_NAME --private --source=. --remote=origin --push"
echo "    (omite los siguientes comandos si --push ya subió el código)"
echo "───────────────────────────────────────────────────────────────"
echo ""

read -r -p "¿Hacer commit de todos los cambios locales ahora? (S/n): " DO
DO="${DO:-S}"
if [[ "$DO" =~ ^[nN]$ ]]; then
  echo "Saltando commit. Cuando quieras:"
  echo "  git add -A && git commit -m \"Initial commit\" && git push -u origin main"
  exit 0
fi

git add -A
if git diff --cached --quiet; then
  echo "No hay cambios nuevos para commitear."
else
  git commit -m "chore: initial site + admin + site.json content"
  echo "✓ Commit creado."
fi

echo ""
read -r -p "¿Hacer push a origin main ahora? (s/N): " PUSH
if [[ "$PUSH" =~ ^[sS]$ ]]; then
  git push -u origin main
  echo "✓ Push completado."
else
  echo "Cuando estés autenticado en GitHub:"
  echo "  git push -u origin main"
  echo ""
  echo "Autenticación HTTPS: usa un Personal Access Token como contraseña"
  echo "  https://github.com/settings/tokens"
  echo "Autenticación SSH: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
fi

echo ""
echo "Listo."
