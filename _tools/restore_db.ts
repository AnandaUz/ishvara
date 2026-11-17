import "../_base/server/config.js";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function restore() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_BASE_NAME;

  if (!uri || !dbName) {
    console.error("MONGODB_URI or MONGODB_BASE_NAME not set in .env");
    process.exit(1);
  }

  const backupsRoot = path.resolve(process.cwd(), "backups");
  if (!fs.existsSync(backupsRoot)) {
    console.error("No backups directory found at:", backupsRoot);
    process.exit(1);
  }

  const subdirs = fs
    .readdirSync(backupsRoot)
    .filter((d) => fs.statSync(path.join(backupsRoot, d)).isDirectory())
    .sort()
    .reverse();

  if (subdirs.length === 0) {
    console.error("No backup folders found in:", backupsRoot);
    process.exit(1);
  }

  // Use provided arg or latest backup
  const targetFolder = process.argv[2] || subdirs[0];
  const dumpPath = path.join(backupsRoot, targetFolder, dbName);

  if (!fs.existsSync(dumpPath)) {
    console.error(`Dump path not found: ${dumpPath}`);
    process.exit(1);
  }

  console.log(`Restoring database "${dbName}" from:\n${dumpPath}`);
  const cmd = `mongorestore --uri="${uri}" --nsInclude="${dbName}.*" "${dumpPath}" --drop`;

  const t0 = Date.now();
  execSync(cmd, { stdio: "inherit" });
  const duration = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\nDatabase restored successfully in ${duration}s from ${targetFolder}`);
}

restore().catch(console.error);
