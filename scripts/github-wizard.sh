#!/usr/bin/env bash
# =============================================================================
# Wizard: enlazar este proyecto con tu repo existente en GitHub
# Repo por defecto: kebara23/MI.Lady.Agota
# Uso:  npm run github   ó   bash scripts/github-wizard.sh
# =============================================================================

set -e
GITHUB_USER="${GITHUB_USER:-kebara23}"
DEFAULT_REPO="${DEFAULT_REPO:-MI.Lady.Agota}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Wizard GitHub — MI Lady Agota / Oracle of Freedom"
echo "  Cuenta: ${GITHUB_USER}  ·  repo sugerido: ${DEFAULT_REPO}"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if ! command -v git &>/dev/null; then
  echo "❌ Git no está instalado. https://git-scm.com"
  exit 1
fi

if [ ! -d .git ]; then
  echo "→ Inicializando git…"
  git init
  git branch -M main
  echo "✓ Rama main lista."
else
  echo "✓ Ya hay carpeta .git"
fi

echo ""
echo "Si ya creaste el repo en GitHub (con README, etc.), solo confirma el nombre."
echo "(GitHub respeta mayúsculas y puntos: MI.Lady.Agota)"
echo ""
read -r -p "Nombre del repositorio [${DEFAULT_REPO}]: " REPO_NAME
REPO_NAME="${REPO_NAME:-$DEFAULT_REPO}"
# Quitar espacios laterales; espacios internos → guion (no forzar minúsculas)
REPO_NAME="$(echo "$REPO_NAME" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr ' ' '-')"

if [ -z "$REPO_NAME" ]; then
  echo "❌ Nombre vacío."
  exit 1
fi

REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
SSH_URL="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo "Remoto:"
echo "  HTTPS: $REMOTE_URL"
echo "  SSH:   $SSH_URL"
echo ""
read -r -p "¿Usar SSH? (s/N): " USE_SSH
if [[ "$USE_SSH" =~ ^[sS]$ ]]; then
  TARGET_URL="$SSH_URL"
else
  TARGET_URL="$REMOTE_URL"
fi

if git remote get-url origin &>/dev/null; then
  CUR="$(git remote get-url origin)"
  if [ "$CUR" = "$TARGET_URL" ]; then
    echo "✓ origin ya apunta a este URL."
  else
    echo "origin actual: $CUR"
    read -r -p "¿Cambiar origin al URL de arriba? (S/n): " OW
    OW="${OW:-S}"
    if [[ ! "$OW" =~ ^[nN]$ ]]; then
      git remote set-url origin "$TARGET_URL"
      echo "✓ origin actualizado."
    fi
  fi
else
  git remote add origin "$TARGET_URL"
  echo "✓ origin añadido."
fi

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "  Repo existente en GitHub"
echo "  · Si ya hay commits allí (README, etc.), el wizard hará"
echo "    pull con --allow-unrelated-histories y luego push."
echo "  · Abre el repo: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo "───────────────────────────────────────────────────────────────"
echo ""

read -r -p "¿Commitear todos los cambios locales ahora? (S/n): " DO
DO="${DO:-S}"
if [[ "$DO" =~ ^[nN]$ ]]; then
  echo "Puedes hacerlo luego:"
  echo "  git add -A && git commit -m \"feat: site\" && git push -u origin main"
  exit 0
fi

git add -A
if git diff --cached --quiet; then
  echo "(staging vacío — nada nuevo que commitear)"
else
  git commit -m "feat: site, admin, site.json y assets"
  echo "✓ Commit local creado."
fi

echo ""
read -r -p "¿Fetch + fusionar con GitHub y hacer push? (S/n): " PUSH
PUSH="${PUSH:-S}"
if [[ "$PUSH" =~ ^[nN]$ ]]; then
  echo "Manual:"
  echo "  git fetch origin"
  echo "  git pull origin main --allow-unrelated-histories --no-edit"
  echo "  git push -u origin main"
  exit 0
fi

set +e
git fetch origin 2>/dev/null
FETCH_OK=$?
set -e

if [ "$FETCH_OK" -ne 0 ]; then
  echo "⚠️  git fetch falló (¿autenticación? ¿repo existe?)."
  echo "   Prueba: gh auth login   HTTPS: token en https://github.com/settings/tokens"
  exit 1
fi

if git show-ref --verify --quiet refs/remotes/origin/main; then
  echo "→ Rama origin/main encontrada. Uniendo historiales con tu copia local…"
  set +e
  git pull origin main --allow-unrelated-histories --no-rebase --no-edit
  PULL_OK=$?
  set -e
  if [ "$PULL_OK" -ne 0 ]; then
    echo "⚠️  Conflicto en el merge. Abre los archivos marcados, resuelve, luego:"
    echo "    git add -A && git commit && git push -u origin main"
    exit 1
  fi
  echo "✓ Historial unido."
else
  echo "→ No hay main remoto aún (repo vacío). Se hará push directo."
fi

set +e
git push -u origin main
PNE=$?
set -e
if [ "$PNE" -ne 0 ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  Push falló — suele ser cuenta GitHub equivocada (403)"
  echo "═══════════════════════════════════════════════════════════════"
  echo "Tu mensaje dijo algo como: denied to AWAKECR pero el repo es Kebara23."
  echo ""
  echo "Opción A — GitHub CLI (recomendado):"
  echo "  gh auth logout"
  echo "  gh auth login   # elige GitHub.com, HTTPS, inicia sesión como Kebara23"
  echo "  git push -u origin main"
  echo ""
  echo "Opción B — Quitar credenciales HTTPS guardadas (macOS):"
  echo "  Abre \"Acceso a llaveros\" → busca github.com → borra la entrada"
  echo "  o: git credential-osxkeychain erase"
  echo "      host=github.com"
  echo "      protocol=https"
  echo "      (línea en blanco y Enter)"
  echo "  Luego: git push -u origin main  (te pedirá usuario + PAT de Kebara23)"
  echo ""
  echo "Opción C — SSH con la clave de Kebara23:"
  echo "  git remote set-url origin git@github.com:Kebara23/mi.lady.agota.git"
  echo "  ssh -T git@github.com   # debe saludar como Kebara23"
  echo "  git push -u origin main"
  echo "═══════════════════════════════════════════════════════════════"
  exit 1
fi

echo ""
echo "✓ Push hecho. Repo: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "Listo."
