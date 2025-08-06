import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

/** Download URL and path to rules.js file. */
const src = "https://publicsuffix.org/list/effective_tld_names.dat";
const dest = path.join(_dirname, "..", "data", "rules.ts");

/** Parse line (trim and ignore empty lines and comments). */
const parseLine = (line: string): string | undefined => {
    const trimmed = line.trim();
    /** Ignore empty lines and comments. */
    if (!trimmed || (trimmed.charAt(0) === "/" && trimmed.charAt(1) === "/")) {
        return;
    }
    /** Only read up to first whitespace char. */
    const rule = trimmed.split(" ")[0];
    return rule;
};
/** Download rules and create rules.js file. */
async function main() {
    const res = await fetch(src, { method: "GET" });
    const text = await res.text();
    const rules = text.split("\n").reduce((memo: string[], line) => {
        const parsed = parseLine(line);
        if (!parsed) {
            return memo;
        }
        return memo.concat(parsed);
    }, [] as string[]);

    await writeFile(
        dest,
        `export const rules: string[] = ${JSON.stringify(rules, null, 2)};`,
    );
}

main();
