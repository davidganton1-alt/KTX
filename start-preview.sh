#!/bin/sh
set -e

REPO_URL="https://github.com/davidganton1-alt/KTX.git"
APP_DIR="/app"
REPO_DIR="/repo"

export GIT_ASKPASS="/app/git-askpass.sh"
export GIT_TERMINAL_PROMPT=0
export GIT_AUTHOR_NAME="davidganton1-alt"
export GIT_COMMITTER_NAME="davidganton1-alt"

echo "=== KTX Preview Container Starting ==="
echo "App dir: $APP_DIR (image, has node_modules)"
echo "Repo dir: $REPO_DIR (volume, has git + source)"
echo ""

# --- Step 1: Ensure source code is in /repo (persistent volume) ---
if [ -d "$REPO_DIR/.git" ] && [ "$(ls -A $REPO_DIR/.git/objects 2>/dev/null)" ]; then
    echo "Repository exists in $REPO_DIR — pulling latest..."
    cd "$REPO_DIR"
    git pull origin master 2>&1
    echo "Pull complete."
else
    echo "First run — cloning repository into $REPO_DIR..."
    mkdir -p "$REPO_DIR"
    git clone "$REPO_URL" "$REPO_DIR" 2>&1
    echo "Clone complete."
fi

# --- Step 2: Sync source files from /repo to /app (preserves node_modules) ---
echo "Syncing source files from $REPO_DIR to $APP_DIR..."
cd "$REPO_DIR"
# Copy all source files (excluding .git and node_modules) to /app
rsync -a --exclude='.git' --exclude='node_modules' --exclude='.next' \
    "$REPO_DIR/" "$APP_DIR/"
echo "Sync complete."

# --- Step 3: Start dev server ---
echo ""
echo "=== Starting Next.js dev server on port 3001 ==="
cd "$APP_DIR"
exec npm run dev -- --port 3001 --hostname 0.0.0.0
