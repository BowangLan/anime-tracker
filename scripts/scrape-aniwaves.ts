import { resolve } from "node:path";
import { scrapeAniwaves } from "../src/lib/aniwaves/scraper";
import type { ScrapeOptions } from "../src/lib/aniwaves/types";

const DEFAULT_USER_AGENT = "AiringCatalogBot/1.0 (+https://github.com/BowangLan/anime-tracker)";

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  console.log(`[aniwaves] database: ${options.databasePath}`);
  console.log(`[aniwaves] source: ${options.baseUrl}; concurrency=${options.concurrency}; delay=${options.delayMs}ms`);
  const summary = await scrapeAniwaves(options);
  console.log(`[aniwaves] run ${summary.runId}: discovered=${summary.discovered} queued=${summary.queued} succeeded=${summary.succeeded} failed=${summary.failed} skipped=${summary.skipped}`);
  if (summary.failed > 0) process.exitCode = 1;
}

function parseArguments(args: string[]): ScrapeOptions {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      printHelp();
      process.exit(0);
    }
    if (argument === "--force") {
      flags.add(argument);
      continue;
    }
    if (!argument.startsWith("--") || !args[index + 1] || args[index + 1].startsWith("--")) {
      throw new Error(`Invalid argument: ${argument}`);
    }
    values.set(argument, args[++index]);
  }

  const concurrency = integer(values.get("--concurrency") ?? "2", "concurrency", 1, 8);
  const delayMs = integer(values.get("--delay-ms") ?? "1000", "delay-ms", 250, 60_000);
  const limitValue = values.get("--limit");
  return {
    baseUrl: values.get("--base-url") ?? "https://aniwaves.ru",
    databasePath: resolve(values.get("--database") ?? process.env.ANIWAVES_DB_PATH ?? "data/aniwaves.sqlite"),
    concurrency,
    delayMs,
    limit: limitValue == null ? undefined : integer(limitValue, "limit", 1, 1_000_000),
    force: flags.has("--force"),
    userAgent: process.env.ANIWAVES_USER_AGENT || DEFAULT_USER_AGENT,
  };
}

function integer(value: string, name: string, minimum: number, maximum: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`--${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return parsed;
}

function printHelp(): void {
  console.log(`Usage: bun run scrape:aniwaves -- [options]

Options:
  --database <path>     SQLite database path (default: data/aniwaves.sqlite)
  --base-url <url>      Source origin (default: https://aniwaves.ru)
  --limit <count>       Process at most this many stale records
  --concurrency <count> Worker count, 1-8 (default: 2)
  --delay-ms <ms>       Global delay between requests, minimum 250 (default: 1000)
  --force               Refresh records even when source timestamps are unchanged
  --help                 Show this message

Environment:
  ANIWAVES_DB_PATH       Default database path
  ANIWAVES_USER_AGENT    Identifiable crawler user agent with contact information`);
}

main().catch((error) => {
  console.error("[aniwaves] fatal:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
