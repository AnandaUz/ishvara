import "../_base/server/config.js";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function backup() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_BASE_NAME;

  if (!uri || !dbName) {
    console.error("MONGODB_URI or MONGODB_BASE_NAME not set in .env");
    process.exit(1);
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  const backupDir = path.resolve(process.cwd(), "backups", `backup_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`Starting mongodump for db "${dbName}"...`);
  console.log(`Target directory: ${backupDir}`);

  const cmd = `mongodump --uri="${uri}" --db="${dbName}" --out="${backupDir}"`;

  const t0 = Date.now();
  execSync(cmd, { stdio: "inherit" });
  const duration = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\nBackup successfully created in ${duration}s at:\n${backupDir}`);
}

backup().catch(console.error);
