const { spawn } = require("child_process");
const path = require("path");
const { prepareTrainingEnvironment } = require("./training-env");

const root = prepareTrainingEnvironment();
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
// El entorno local del proyecto utiliza siempre el puerto 3000. Al declararlo
// explícitamente, Next.js no podrá cambiar silenciosamente al 3001 u otro puerto.
const child = spawn(process.execPath, [nextBin, "dev", "--port", "3000"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
