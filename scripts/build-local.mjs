import { spawnSync } from "node:child_process";
import { copyFileSync, cpSync, mkdirSync, realpathSync } from "node:fs";
import { join } from "node:path";

copyFileSync(join(process.cwd(), "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs"), join(process.cwd(), "public", "pdf.worker.min.mjs"));
mkdirSync(join(process.cwd(), "public", "tesseract", "lang"), { recursive: true });
mkdirSync(join(process.cwd(), "public", "tesseract", "core"), { recursive: true });
copyFileSync(join(process.cwd(), "node_modules", "tesseract.js", "dist", "worker.min.js"), join(process.cwd(), "public", "tesseract", "worker.min.js"));
copyFileSync(join(process.cwd(), "node_modules", "@tesseract.js-data", "chi_sim", "4.0.0", "chi_sim.traineddata.gz"), join(process.cwd(), "public", "tesseract", "lang", "chi_sim.traineddata.gz"));
copyFileSync(join(process.cwd(), "node_modules", "@tesseract.js-data", "eng", "4.0.0", "eng.traineddata.gz"), join(process.cwd(), "public", "tesseract", "lang", "eng.traineddata.gz"));
cpSync(realpathSync(join(process.cwd(), "node_modules", "tesseract.js-core")), join(process.cwd(), "public", "tesseract", "core"), { recursive: true, force: true });

const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_PEOPLEFLOW_MODE: "local" },
});
process.exit(result.status ?? 1);
