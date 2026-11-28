import { rmSync, cpSync, copyFileSync, readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const projectName = "ishvara";
const CONFIG_FILE = "A:/pProd/projects.json";

if (!existsSync(CONFIG_FILE)) {
  throw new Error(`Central config not found: ${CONFIG_FILE}`);
}
const allProjects = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
const projectConfig = allProjects[projectName];
if (!projectConfig) {
  throw new Error(`Project "${projectName}" not found in ${CONFIG_FILE}`);
}

const SERVER_PORT = String(projectConfig.serverPort);
const CLIENT_PORT = String(projectConfig.clientPort);

const DEPLOY = process.env.DEPLOY_TARGET_DIR || `A:/pProd/${projectName}`;
const SOURCE = (import.meta.dirname || __dirname).replace(/\\/g, "/");

function stopCurrentProject() {
  const runner = "A:/pProd/pProd_start.js";
  if (existsSync(runner)) {
    execSync(`node "${runner}" --stop ${projectName}`, { stdio: "inherit" });
  } else {
    for (const port of [CLIENT_PORT, SERVER_PORT]) {
      try {
        execSync(
          `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"`,
          { stdio: "ignore" }
        );
      } catch {}
    }
  }
}

function startCurrentProject() {
  const runner = "A:/pProd/pProd_start.js";
  if (existsSync(runner)) {
    execSync(`node "${runner}" --start ${projectName}`, { stdio: "inherit" });
  }
}

console.log("Starting build client");
execSync("npm run build", { cwd: `${SOURCE}/client`, stdio: "inherit" });

console.log("Starting build server");
execSync("npm run build", { cwd: `${SOURCE}/server`, stdio: "inherit" });

console.log(`Stopping old processes for ${projectName} (Client: ${CLIENT_PORT}, Server: ${SERVER_PORT})...`);
stopCurrentProject();

console.log("Starting removing old client");
rmSync(`${DEPLOY}/client`, { recursive: true, force: true });
console.log("Starting copying new client");
cpSync(`${SOURCE}/client/dist`, `${DEPLOY}/client`, { recursive: true });

console.log("Starting removing old server");
rmSync(`${DEPLOY}/server`, { recursive: true, force: true });
console.log("Starting copying new server");
cpSync(`${SOURCE}/server/dist`, `${DEPLOY}/server`, { recursive: true });
console.log("Starting copying package.json");
copyFileSync(`${SOURCE}/server/package.json`, `${DEPLOY}/server/package.json`);
copyFileSync(`${SOURCE}/.env`, `${DEPLOY}/server/.env`);

// заменяю порт для локалки
const envPath = `${DEPLOY}/server/.env`;
if (existsSync(envPath)) {
  let envContent = readFileSync(envPath, "utf-8");
  envContent = envContent.replace(/^PORT=.*/m, `PORT=${SERVER_PORT}`);
  if (!/^CLIENT_URL=/m.test(envContent)) {
    envContent += `\nCLIENT_URL=http://localhost:${CLIENT_PORT}\n`;
  } else {
    envContent = envContent.replace(/^CLIENT_URL=.*/m, `CLIENT_URL=http://localhost:${CLIENT_PORT}`);
  }
  writeFileSync(envPath, envContent);
}

// установка зависимостей
console.log("Starting installing dependencies");
execSync("npm install --omit=dev", {
  cwd: join(DEPLOY, "server"),
  stdio: "inherit",
});

console.log(`Starting ${projectName} (Client: ${CLIENT_PORT}, Server: ${SERVER_PORT})...`);
startCurrentProject();

console.log(`

!!! Deployment finished successfully on http://localhost:${CLIENT_PORT} !!!
`);
