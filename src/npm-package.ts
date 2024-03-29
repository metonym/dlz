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

export const essential_files = ["package.json", "README.md", "LICENSE"];

const legacy_mappings = {
  svelte: "./index.js",
  main: "./index.js",
  types: "./index.d.ts",
};

const pkg_allowlist = [
  "repository",
  "keywords",
  "author",
  "license",
  "bugs",
  "homepage",
  "name",
  "version",
  "description",
  "type",
  "dependencies",
  "peerDependencies",
  "engines",
];

export function npmPackage() {
  console.time("package");

  if (existsSync(dir)) {
    rmSync(dir, { recursive: true });
  }

  mkdirSync(dir);

  essential_files.forEach((file) => {
    copyFileSync(file, join(dir, file));
  });

  cpSync(src, dir, { recursive: true });

  const pkgJson = JSON.parse(readFileSync(pkg_json, "utf8"));

  Object.keys(pkgJson).forEach((key) => {
    if (!pkg_allowlist.includes(key)) {
      delete pkgJson[key];
    }
  });

  pkgJson.exports = createExports(dir);

  Object.entries(legacy_mappings).forEach(([key, value]) => {
    pkgJson[key] = value;
  });

  writeFileSync(pkg_json, JSON.stringify(pkgJson, null, 2));

  console.timeEnd("package");
}
