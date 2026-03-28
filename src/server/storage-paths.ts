import { tmpdir } from "node:os";
import path from "node:path";

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

export function getDataDirectory() {
  if (process.env.SLYDE_DATA_DIRECTORY) {
    return process.env.SLYDE_DATA_DIRECTORY;
  }

  if (isProductionRuntime()) {
    return path.join(tmpdir(), "slyde-data");
  }

  return path.join(process.cwd(), ".data");
}

export function getUploadsDirectory() {
  return path.join(getDataDirectory(), "uploads");
}
