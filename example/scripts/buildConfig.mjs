/**
 * When bundling your function, this will inject the FUNCTION_TARGET environment
 * variable supplied to the functionTarget parameter directly on the bundled code,
 * while keeping all process.env references intact.
 *
 * This is useful because Google Cloud Function needs to actually "see" the string
 * value supplied during deployment. If you're not using environment variables to
 * supply the functionTarget parameter, this can be safely removed.
 */
const define = {};
for (const _k in process.env) {
  define[`process.env.FUNCTION_TARGET`] = JSON.stringify(process.env.FUNCTION_TARGET);
}

const commonConfig = {
  /**
   * This should point to the root of your project, where you define the ApolloServer instance.
   */
  entryPoints: ['src/index.ts'],

  /**
   * The output directory and file for the bundled code.
   */
  outfile: 'dist/index.js',

  /**
   * Inlines imported dependencies into the file itself.
   */
  bundle: true,

  /**
   * Mark packages as external to exclude from bundle output.
   *
   *
   * With the exception of `@as-integrations/google-cloud-functions`, this should
   * be used to remove any packages that can be resolved by package.json when deployed
   * to Google Cloud Functions, because you don't want to include their source-code in
   * the final bundle.
   */
  external: ['@apollo/server', '@google-cloud/functions-framework', 'graphql'],

  /**
   * By default, ESBuild bundles for browser environments.
   * This is here to make sure it bundles for Node environments.
   */
  platform: 'node',

  /**
   * Match this to the --runtime flag during deployment.
   */
  target: 'node16',

  /**
   * When in development mode, this log level will print bundle changes in the terminal.
   */
  logLevel: 'info',

  define,
};

export const buildConfig = {
  ...commonConfig,
  minify: true,
};

export const watchConfig = {
  ...commonConfig,
  minify: false,
};
