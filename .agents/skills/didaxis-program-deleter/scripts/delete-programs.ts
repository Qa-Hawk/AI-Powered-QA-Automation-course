import {
  deletePrograms,
  fetchPrograms,
  type DeleteResult,
  type Program,
} from '../../../../support/delete-program';

interface CliOptions {
  dryRun: boolean;
  ids: string[];
}

function parseArgs(argv: string[]): CliOptions {
  const dryRun = argv.includes('--dry-run');
  const ids: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--id') {
      const id = argv[++i];
      if (!id || id.startsWith('--')) {
        throw new Error('--id requires a program UUID');
      }
      ids.push(id);
    } else if (arg === '--all' || arg === '--dry-run') {
      continue;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return { dryRun, ids };
}

function printSummary(scope: string, found: number, programs: Program[]) {
  console.log(`**Scope:** ${scope}`);
  console.log(`**Found via GET:** ${found}`);

  if (programs.length > 0) {
    for (const program of programs) {
      const label = program.name ? `${program.id} (${program.name})` : program.id;
      console.log(`  - ${label}`);
    }
  }
}

function printResults(deleted: DeleteResult[], failed: DeleteResult[]) {
  if (deleted.length === 0) {
    console.log('**Deleted:** none');
  } else {
    console.log(`**Deleted:** ${deleted.map((result) => result.id).join(', ')}`);
  }

  if (failed.length === 0) {
    console.log('**Failed:** none');
    return;
  }

  for (const result of failed) {
    const detail = [result.status, result.message].filter(Boolean).join(' ');
    console.log(`**Failed:** ${result.id} ${detail}`.trim());
  }
}

async function main() {
  const { dryRun, ids } = parseArgs(process.argv.slice(2));

  let scope: string;
  let programs: Program[];

  if (ids.length > 0) {
    scope = 'specific UUID(s)';
    programs = ids.map((id) => ({ id, name: '' }));
  } else {
    scope = 'all programs';
    programs = await fetchPrograms();
  }

  printSummary(scope, programs.length, programs);

  if (dryRun) {
    console.log('**Dry run:** no programs deleted');
    return;
  }

  const results = await deletePrograms(programs.map((program) => program.id));
  const deleted = results.filter((result) => result.success);
  const failed = results.filter((result) => !result.success);

  printResults(deleted, failed);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
