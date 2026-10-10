import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LIMIT_KB = 350; // per JS chunk, gzip not applied: tune with real measurements
const dir = join(process.cwd(), 'dist', 'assets');
let failed = false;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.js'))) {
  const kb = statSync(join(dir, f)).size / 1024;
  if (kb > LIMIT_KB) { console.error(`${f}: ${kb.toFixed(0)} KB exceeds ${LIMIT_KB} KB`); failed = true; }
}
process.exit(failed ? 1 : 0);
