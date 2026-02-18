import { existsSync } from "node:fs";
import { stat, rm, mkdir } from "node:fs/promises";
export async function clearFolder(folder: string): Promise<void> {
    if (existsSync(folder)) {
        const pathStat = await stat(folder);
        if (!pathStat.isDirectory()) {
            return console.error(`Error: path ${folder} is not a directory`);
        }
        await rm(folder, { recursive: true, force: true });
        await mkdir(folder, { recursive: true });
    }
}
