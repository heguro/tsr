#!/usr/bin/env node

import { cac } from 'cac';
import { execute } from './execute.js';
import { createRequire } from 'node:module';
const cli = cac('ts-remove-unused');

cli
  .command('', 'There are no subcommands. Simply execute ts-remove-unused')
  .option('--project <file>', 'Path to your tsconfig.json')
  .option(
    '--skip <regexp_pattern>',
    'Specify the regexp pattern to match files that should be skipped from transforming',
  )
  .option('--include-d-ts', 'Include .d.ts files in target for transformation')
  .action((options) => {
    const skip =
      options.skip && Array.isArray(options.skip)
        ? options.skip
        : typeof options.skip === 'string'
        ? [options.skip]
        : [];
    if (!options['includeD-ts']) {
      skip.push('\\.d\\.ts');
    }
    execute({
      tsConfigFilePath: options.project || './tsconfig.json',
      skip,
    });
  });

cli.help();

const { version } = createRequire(import.meta.url)('../package.json');

cli.version(`v${version}`);
cli.parse();
