export PATH="/c/Program Files/GitHub CLI:$PATH"

echo "=== STEP 1: Auth status ==="
gh auth status 2>&1 || true
echo ""

echo "=== STEP 2: Start device auth (with code capture) ==="
# Run gh auth login, capture the device code, then background the polling
CODE=""
{
  gh auth login --hostname github.com --scopes repo --web 2>&1 | tee /tmp/gh-auth-out.txt
} &
GH_PID=$!

# Extract device code
sleep 2
if [ -f /tmp/gh-auth-out.txt ]; then
  CODE=$(grep -oP '!\s*First copy your one-time code:\s*\K\S+' /tmp/gh-auth-out.txt 2>/dev/null || true)
fi

if [ -n "$CODE" ]; then
  echo ""
  echo "============================================"
  echo "  DEVICE CODE: $CODE"
  echo "  Open https://github.com/login/device"
  echo "  Enter the code and approve access"
  echo "============================================"
  echo ""
fi

echo "=== STEP 3: Poll until auth completes (max 60 tries, 5s each) ==="
for i in $(seq 1 60); do
  if gh auth status 2>/dev/null | grep -q "logged in"; then
    echo "AUTH SUCCESS at poll $i"
    break
  fi
  # Check if gh process is still running
  if ! kill -0 $GH_PID 2>/dev/null; then
    echo "gh exited early. Last output:"
    tail -5 /tmp/gh-auth-out.txt 2>/dev/null || true
    break
  fi
  sleep 5
done

echo ""
echo "=== STEP 4: Final auth status ==="
gh auth status 2>&1 || true
echo ""

if ! gh auth status 2>/dev/null | grep -q "logged in"; then
  echo "ERROR: Auth did not complete. Please run: gh auth login --web"
  exit 1
fi

echo ""
echo "=== STEP 5: Create and push repo KTX ==="
cd "C:/Users/hp/KingdomTradeX"

# Try create + push in one command
gh repo create KTX --public --source=. --description="KingdomTradeX AI Trading Platform - Faith-aligned AI trading across crypto, stocks, commodities" --push 2>&1 || {
  echo "Direct push failed, trying step by step..."
  gh repo create KTX --public --description="KingdomTradeX AI Trading Platform" 2>&1
  git remote add origin https://github.com/davidganton1-alt/KTX.git 2>&1 || true
  git branch -M master 2>&1 || true
  git push -u origin master 2>&1
}

echo ""
echo "=== STEP 6: Verify repo ==="
gh repo view KTX --json name,description,url,isPrivate,defaultBranchRef,pushedAt 2>&1

echo ""
echo "=== COMPLETE ==="
