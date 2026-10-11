import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const cwd = resolve(import.meta.dirname, "..");
const port = Number(process.env.PORT ?? 5195);
try {
  const response = await fetch(`http://127.0.0.1:${port}`);
  if (response) {
    console.error(
      `Port ${port} already has a server. No process was replaced.`,
    );
    process.exit(1);
  }
} catch {}
const log = openSync(resolve(cwd, "server.log"), "a");
const child = spawn(process.execPath, [resolve(cwd, "scripts/serve.mjs")], {
  cwd,
  detached: true,
  stdio: ["ignore", log, log],
  env: { ...process.env, PORT: String(port) },
});
child.unref();
writeFileSync(resolve(cwd, ".server.pid"), String(child.pid));
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 100));
  try {
    const response = await fetch(`http://127.0.0.1:${port}`);
    if (response.status === 200) {
      console.log(
        `Detached session server ready: http://127.0.0.1:${port} (PID ${child.pid})`,
      );
      process.exit(0);
    }
  } catch {}
}
console.error("Server did not respond; inspect server.log.");
process.exit(1);
