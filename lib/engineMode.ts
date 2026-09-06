import fs from "fs";
import path from "path";

export type EngineMode = "demo" | "live";
const FILE = path.join(process.cwd(), "data", "engine-mode.json");

function read(): EngineMode {
  try {
    if (!fs.existsSync(FILE)) return "demo";
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return raw.mode === "live" ? "live" : "demo";
  } catch {
    return "demo";
  }
}

function write(mode: EngineMode): void {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ mode, updatedAt: Date.now() }, null, 2));
  } catch (e) {
    console.error("engineMode write failed:", e);
  }
}

export function getEngineMode(): EngineMode {
  return read();
}

export function setEngineMode(mode: EngineMode): EngineMode {
  write(mode);
  return mode;
}
