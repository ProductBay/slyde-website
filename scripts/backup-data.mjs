import "dotenv/config";
import { cp, mkdir, access } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const dataDir = path.join(cwd, ".data");
const backupRoot = path.join(cwd, process.env.BACKUP_OUTPUT_DIR || "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = path.join(backupRoot, `data-backup-${timestamp}`);

async function main() {
  await access(dataDir);
  await mkdir(outputDir, { recursive: true });
  await cp(dataDir, outputDir, { recursive: true });

  console.log(
    JSON.stringify(
      {
        ok: true,
        source: dataDir,
        output: outputDir,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Backup failed.",
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
