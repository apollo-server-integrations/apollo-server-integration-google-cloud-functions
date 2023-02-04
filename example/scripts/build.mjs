import { build } from 'esbuild';
import { buildConfig } from './buildConfig.mjs';

await build(buildConfig);
