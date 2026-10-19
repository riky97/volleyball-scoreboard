// PreToolUse: lockfiles must only change through npm/cargo, never by direct edit.
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const name = basename(input.tool_input?.file_path ?? "");
if (["package-lock.json", "Cargo.lock"].includes(name)) {
    process.stderr.write(`${name} is generated: run npm install / cargo instead of editing it.`);
    process.exit(2);
}
