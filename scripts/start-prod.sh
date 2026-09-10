#!/bin/sh
set -e

# Start WebSocket server in background
node dist-server/server/websocket.js &
WS_PID=$!

# Start Next.js in foreground
npx next dev --port 3001 --hostname 0.0.0.0 &
NEXT_PID=$!

# Trap SIGTERM and forward to both
trap "kill $WS_PID $NEXT_PID 2>/dev/null; exit 0" SIGTERM SIGINT

# Wait for either process to exit
wait
