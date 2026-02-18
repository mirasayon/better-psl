import { join } from "node:path";
import { dirnamePath } from "./dirname.ts";
import { clearFolder } from "./clear-folder.ts";
await clearFolder(join(dirnamePath, "..", "dist"));
