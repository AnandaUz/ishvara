import { rmSync, cpSync, copyFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const DEPLOY = "D:/_sites/worked/ishvara";
const SOURCE = "D:/_sites/ishvara";

console.log("Starting build client");

execSync("npm run build", { cwd: `${SOURCE}/client`, stdio: "inherit" });
console.log("Starting build server");

execSync("npm run build", { cwd: `${SOURCE}/server`, stdio: "inherit" });

console.log("Starting removing old client");

// // копирование клиента
rmSync(`${DEPLOY}/client`, { recursive: true, force: true });
console.log("Starting copying new client");
cpSync(`${SOURCE}/client/dist`, `${DEPLOY}/client`, { recursive: true });
console.log("Starting removing old server");

// // копирование сервера
rmSync(`${DEPLOY}/server`, { recursive: true, force: true });
console.log("Starting copying new server");
cpSync(`${SOURCE}/server/dist`, `${DEPLOY}/server`, { recursive: true });
console.log("Starting copying package.json");
copyFileSync(`${SOURCE}/server/package.json`, `${DEPLOY}/server/package.json`);
copyFileSync(`${SOURCE}/.env`, `${DEPLOY}/server/.env`);

// // установка зависимостей
console.log("Starting installing dependencies");
execSync("npm install --omit=dev", {
  cwd: join(DEPLOY, "server"),
  stdio: "inherit", // выводит логи npm в консоль
});

console.log(`

!!! Deployment finished ------------------------


`);
