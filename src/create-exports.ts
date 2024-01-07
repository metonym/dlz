import { join, parse, sep } from "node:path";
import { totalist } from "totalist/sync";
import { essential_files } from "./npm-package";

interface ExportsMap {
  [key: string]: {
    types?: string | undefined;
    svelte?: string;
    import?: string;
  };
}

const removeJs = (name: string) => name.replace(/\.js$/, "");

const extTs = (name: string) => removeJs(name) + ".d.ts";

function isIndexFile(name: string): name is `${string}index.js` {
  return parse(name).base === "index.js";
}

function isTsOrTypeDef(name: string): name is `./${string}.ts` {
  return /(.*\.d\.ts$)|(.*\.ts$)/.test(name);
}

function extHasTypes(ext: string): ext is ".js" | ".svelte" {
  return [".js", ".svelte"].includes(ext);
}

function prefixRelative<T extends string>(name: T): `./${T}` {
  return `./${name}`;
}

const getExports = (filename: string) => {
  let file = filename;
  let folder = "";

  if (filename.includes(sep)) {
    folder = parse(filename).dir;
  }

  const is_root = !folder;
  const file_path = prefixRelative(file);

  if (isIndexFile(file)) {
    return {
      [is_root ? "." : prefixRelative(folder)]: {
        types: extTs(file_path),
        import: file_path,
        svelte: is_root ? file_path : undefined,
      },
    };
  } else {
    if (!isTsOrTypeDef(file)) {
      const ext = parse(file).ext;
      const import_path = prefixRelative(join(folder, `*${ext}`));
      const import_path_wildcard = prefixRelative(join(folder, "*"));

      const map = {
        [import_path]: {
          types: extHasTypes(ext) ? extTs(import_path) : undefined,
          import: import_path,
        },
      };

      // To support extension-less imports, each JS file should have an explicit mapping.
      if (ext === ".js") {
        if (is_root) {
          map[removeJs(file_path)] = {
            types: extTs(file_path),
            import: file_path,
          };
        } else {
          map[import_path_wildcard] = {
            types: extHasTypes(ext) ? extTs(import_path) : undefined,
            import: import_path,
          };
        }
      }

      return map;
    }
  }
};

export function createExports(dir: string) {
  const exports_map: ExportsMap = {};

  totalist(dir, (name) => {
    if (essential_files.includes(name)) return;
    Object.assign(exports_map, getExports(name));
  });

  return exports_map;
}
