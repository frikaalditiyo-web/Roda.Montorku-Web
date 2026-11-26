import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const action = process.argv[2] || "status";
if (!["start", "stop", "status"].includes(action)) {
  console.error("Usage: node scripts/db_ctl.mjs <start|stop|status>");
  process.exit(1);
}

const pgCtl =
  process.env.PG_CTL_PATH ||
  "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_ctl.exe";
const pgData =
  process.env.PG_DATA_DIR ||
  "C:\\Program Files\\PostgreSQL\\17\\data";
// Store pg_ctl startup log outside PGDATA to avoid Windows sharing violations during crash-recovery fsync
const pgLog = path.join(os.tmpdir(), "rodamotorku-pg17.log");

if (!fs.existsSync(pgCtl)) {
  console.error(`pg_ctl binary tidak ditemukan di: ${pgCtl}`);
  process.exit(1);
}

const args = ["-D", pgData];
if (action === "start") {
  args.push("-l", pgLog, "start");
} else {
  args.push(action);
}

try {
  execFileSync(pgCtl, args, { stdio: "inherit" });
} catch (err) {
  const code = typeof err?.status === "number" ? err.status : 1;
  process.exit(code);
}
