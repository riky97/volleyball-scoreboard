// PostToolUse: run eslint --fix on the edited TS/TSX file; report remaining errors back to Claude.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const file = input.tool_input?.file_path ?? "";
if (!/\.(ts|tsx)$/.test(file) || file.includes("node_modules")) process.exit(0);

try {
    execFileSync("npx", ["eslint", "--fix", file], { cwd: process.env.CLAUDE_PROJECT_DIR, stdio: "pipe" });
} catch (e) {
    process.stderr.write(`ESLint errors in ${file}:\n${e.stdout?.toString() ?? e.message}`);
    process.exit(2);
}
