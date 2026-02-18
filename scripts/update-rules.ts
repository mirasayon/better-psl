import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { dirnamePath } from "./dirname.ts";

/** Download URL and path to rules.js file. */
const src = "https://publicsuffix.org/list/effective_tld_names.dat";
const dest = join(dirnamePath, "..", "src", "rules.ts");

/** Parse line (trim and ignore empty lines and comments). */
const parseLine = (line: string): string | null => {
    const trimmed = line.trim();
    // Ignore empty lines and comments.
    if (!trimmed || (trimmed.charAt(0) === "/" && trimmed.charAt(1) === "/")) {
        return null;
    }
    /** Only read up to first whitespace char. */
    const rule = trimmed.split(" ")[0];
    return rule;
};
/** Download rules and create rules.ts file. */
const main = async () => {
    const res = await fetch(src, { method: "GET" });
    const text = await res.text();
    const rules = text.split("\n").reduce((memo: string[], line) => {
        const parsed = parseLine(line);
        if (!parsed) {
            return memo;
        }
        return memo.concat(parsed);
    }, [] as string[]);
    const jsonStr = JSON.stringify(rules, null, 2);
    return await writeFile(dest, `/** rules from publicsuffix.org */\nexport const rules: string[] = ${jsonStr};`);
};

await main();
console.log("Update completed");
