import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
export const dirnamePath = dirname(fileURLToPath(import.meta.url));
