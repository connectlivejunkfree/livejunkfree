/**
 * npm run check:content — runs claims-lint and page-lint on the built site (run `npm run build` first).
 * Fails (exit 1) if either finds a problem on one of the 50 Batch 1 pages.
 */
import { spawnSync } from "node:child_process";

let code = 0;
for (const script of ["scripts/checks/claims-lint.mjs", "scripts/checks/page-lint.mjs"]) {
  const r = spawnSync(process.execPath, [script, ...process.argv.slice(2)], { stdio: "inherit" });
  code ||= r.status ?? 1;
}
process.exit(code);
