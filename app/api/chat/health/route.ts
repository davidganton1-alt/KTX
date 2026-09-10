import { NextResponse } from "next/server";
import WebSocket from "ws";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ws = new WebSocket("ws://localhost:3002");
    const connected = await new Promise<boolean>((resolve) => {
      ws.on("open", () => { ws.close(); resolve(true); });
      ws.on("error", () => resolve(false));
      setTimeout(() => resolve(false), 2000);
    });
    return NextResponse.json({ ws: connected, port: 3002 });
  } catch (e: any) {
    return NextResponse.json({ ws: false, error: e.message });
  }
}
