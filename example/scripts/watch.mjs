import { context } from "esbuild";
import { watchConfig } from './buildConfig.mjs';

let ctx = await context(watchConfig);
await ctx.watch();
