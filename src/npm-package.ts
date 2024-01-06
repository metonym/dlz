import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { createExports } from "./create-exports";

const dir = "./package";
const src = "./src";
const pkg_json = join(dir, "package.json");

export function npmPackage() {
  console.time("package");

  if (existsSync(dir)) {
    rmSync(dir, { recursive: true });
  }

  mkdirSync(dir);

  ["./package.json", "./README.md", "./LICENSE"].forEach((file) => {
    copyFileSync(file, join(dir, file));
  });

  cpSync(src, dir, { recursive: true });

  const pkgJson = JSON.parse(readFileSync(pkg_json, "utf8"));

  delete pkgJson.scripts;
  delete pkgJson.devDependencies;

  pkgJson.exports = createExports(dir);

  writeFileSync(pkg_json, JSON.stringify(pkgJson, null, 2));

  console.timeEnd("package");
}
