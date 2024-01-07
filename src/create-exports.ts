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

const extTs = (name: string) => name.replace(/\.js$/, "") + ".d.ts";

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

  if (isIndexFile(file)) {
    const index_path = prefixRelative(file);

    return {
      [is_root ? "." : prefixRelative(folder)]: {
        types: extTs(index_path),
        import: index_path,
        svelte: is_root ? index_path : undefined,
      },
    };
  } else {
    if (!isTsOrTypeDef(file)) {
      const ext = parse(file).ext;
      const wildcard = `*${ext}`;
      const import_path = prefixRelative(join(folder, wildcard));

      return {
        [import_path]: {
          types: extHasTypes(ext) ? extTs(import_path) : undefined,
          import: import_path,
        },
      };
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
