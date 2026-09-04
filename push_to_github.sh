#!/bin/bash
export PATH="/c/Program Files/GitHub CLI:$PATH"

echo "=== CAPTURE DEVICE CODE ==="
CODE=$(timeout 5 gh auth login --hostname github.com --scopes repo --web 2>&1 | grep -oP '!\s*First copy your one-time code:\s*\K\S+' || echo "")
echo "CODE=$CODE"

if [ -z "$CODE" ]; then
  echo "Starting auth fresh..."
  gh auth login --hostname github.com --scopes repo --web 2>/dev/null &
  sleep 3
  CODE=$(grep -oP '!\s*First copy your one-time code:\s*\K\S+' /tmp/gh-auth-out.txt 2>/dev/null || echo "")
fi

if [ -z "$CODE" ]; then
  echo "FATAL: No device code captured"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  DEVICE CODE: $CODE                      ║"
echo "║  Open: https://github.com/login/device  ║"
echo "║  Enter code + Approve access            ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Waiting for approval (polling every 5s, max 5 min)..."

for i in $(seq 1 60); do
  if gh auth status 2>/dev/null | grep -q "logged in"; then
    echo "✓ AUTH SUCCESS at poll $i"
    break
  fi
  sleep 5
done

echo ""
echo "=== AUTH STATUS ==="
gh auth status 2>&1 || { echo "AUTH FAILED"; exit 1; }

echo ""
echo "=== CREATE + PUSH REPO ==="
cd "C:/Users/hp/KingdomTradeX"
git branch -M master 2>/dev/null || true

gh repo create KTX \
  --public \
  --source=. \
  --description="KingdomTradeX AI Trading Platform - Faith-aligned AI trading across crypto, stocks, commodities" \
  --push 2>&1

echo ""
echo "=== VERIFY ==="
gh repo view KTX --json name,description,url,isPrivate,defaultBranchRef,pushedAt 2>&1

echo ""
echo "=== DONE ==="
