import { build } from 'esbuild';

/* When bundling your function, this will inject the FUNCTION_TARGET environment variable supplied to the functionTarget parameter directly on the bundled code, while keeping all process.env references intact. This is useful because Google Cloud Function needs to actually "see" the string value supplied during deployment. If you're not using environment variables to supply the functionTarget parameter, this can be safely removed. */
const define = {};
for (const _k in process.env) {
  define[`process.env.FUNCTION_TARGET`] = JSON.stringify(
    process.env.FUNCTION_TARGET,
  );
}

build({
  // This should point to the root of your project, where you define the ApolloServer instance.
  entryPoints: ['src/index.ts'],

  // The output directory and file for the bundled code.
  outfile: 'dist/index.js',

  // Inlines imported dependencies into the file itself.
  bundle: true,

  // Mark packages as external to exclude from bundle output. This should be used to remove any packages that can be resolved by package.json when deployed to Google Cloud Functions from the final bundle.
  external: ['@apollo/server', '@google-cloud/functions-framework', 'graphql'],

  // Turned off for debugging, turn it on for production environments to result in smaller bundle sizes.
  minify: false,

  // By default, ESBuild bundles for browser environments. This is here to make sure it bundles for Node environments.
  platform: 'node',

  // Match this to the --runtime flag during deployment.
  target: 'node16',

  watch: process.env.NODE_ENV === 'development' ? true : false,

  define,
});
