import { rmSync, cpSync, copyFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const DEPLOY = "D:/_sites/worked/ishvara";
const SOURCE = "D:/_sites/ishvara";

// execSync("npm run build", { cwd: `${SOURCE}/client`, stdio: "inherit" });
// execSync("npm run build", { cwd: `${SOURCE}/server`, stdio: "inherit" });

// // копирование клиента
rmSync(`${DEPLOY}/client`, { recursive: true, force: true });
cpSync(`${SOURCE}/client/dist`, `${DEPLOY}/client`, { recursive: true });

// // копирование сервера
rmSync(`${DEPLOY}/server`, { recursive: true, force: true });
cpSync(`${SOURCE}/server/dist`, `${DEPLOY}/server`, { recursive: true });
copyFileSync(`${SOURCE}/server/package.json`, `${DEPLOY}/server/package.json`);
copyFileSync(`${SOURCE}/.env`, `${DEPLOY}/server/.env`);

// // установка зависимостей
execSync("npm install --omit=dev", {
  cwd: join(DEPLOY, "server"),
  stdio: "inherit", // выводит логи npm в консоль
});
