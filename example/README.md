# Boilerplate for Apollo Server projects using `@as-integrations/google-cloud-functions` for Google Cloud Function deployments

This example project comes pre-configured with sane defaults for tooling that you can use to deploy Apollo Server on Google Cloud Functions.

## Quickstart

Install dependencies with the package manager of your choice:

```bash
npm install
```

Copy the `.env.example` file and set the environment variables:

```bash
# Copy the example .env file to your local .env
cp .env.example .env
```

Edit the `FUNCTION_TARGET` on the `.env` file to match the name of your function. This is used to name both your function entry point on the bundled output, and the deployment.

Start and test the development server:

On a terminal instance, start the bundler on watch mode for your project:
```bash
npm run watch
```

On another terminal instance, start the Google Cloud Functions Framework CLI tool:
```bash
npm run start
```

> **Warning**
> While the bundler can watch for file changes on your project and rebuild accordingly, Google Cloud Functions Framework unfortunately doesn't support hot reloading. You will need to restart the CLI tool every time you make a change to the project.

The start script will build the project into a bundle usable by Google Cloud Functions and start a local development server using the `@google-cloud/functions-framework` package provided for Node.js runtimes. The server will be available at `http://localhost:8080`, and will run with an Apollo Server Playground where you can test your queries.

## Deployment

> **Warning**
> Before making your first deployment, it's highly recommeded that you understand the difference between Cloud Functions 1st and 2nd generation. While Google recommends that you create new functions on 2nd gen whenever possible, they do not yet support deploying from source repositories, or have a published action for GitHub Actions, You can find more information [here](https://cloud.google.com/functions/docs/concepts/version-comparison).

### Local deployment

The project is configured to be deployed to Google Cloud Functions trough the Google Cloud CLI Tool. To deploy the project, run the following command:

```bash
npm run deploy
```

To use the provided deploy script, you need to have the Google Cloud CLI Tool installed and configured on your machine. You can find more information about the CLI Tool [here](https://cloud.google.com/sdk/gcloud).

The script will use the bundled output from the `/dist` directory, and name your function using the provided string on the `FUNCTION_TARGET` environment variable.

> **Note**
> The deploy script currently uses POSIX compliant commands, and **will not work on Windows** (I encourage you to file an issue and/or open a pull request if you can help me solve this). If you're using Windows, you can use the `gcloud` CLI tool directly to deploy your function, and change the correct flags accordingly.
>
> Run the `build` command to generate the `/dist` output. Then run the GCloud CLI Tool with the following command:
>
> ```powershell
> gcloud functions deploy <function-name> --runtime nodejs16 --trigger-http --allow-unauthenticated --entry-point=<function-name> --source=./dist
> ```
>
> Beware that the `--entry-point` flag should match the name provided in the `FUNCTION_TARGET` environment variable.

## FAQ

### I got an error `Expected value for define "process.env.FUNCTION_TARGET" to be a string, got undefined instead` when trying to build my function:

This error is caused by the absence of the `FUNCTION_TARGET` environment variable. Make sure you have the `FUNCTION_TARGET` environment variable set on your `.env`, or otherwise, supplied to your running Node process.

### I got an error `Provided code is not a loadable module` when trying to run the `start` command:

You'll get this error when there is no bundled output on the `/dist` directory. Make sure to run the `build` or `watch` command before running the `start` command.

### I got an error `Function <function-name> is not defined in the provided module...` when trying to run/deploy my function:

This will usually happen when the bundled code does not include `@as-integrations/google-cloud-functions` source code on the final bundle. **It is important to have the source-code for the integration bundled *within* your function** because of how Google Cloud Functions reads the function entry point.

In `scripts/buildConfig.mjs`, make sure that the `external` array **does not** include `@as-integrations/google-cloud-functions`. Every other direct dependency that can be normally resolved by package.json should be included on the `external` array.

### I got an error `Provided source directory does not have file [package.json]…`

The quick workaround for this is to add a soft link in the `dist` directory to the `package.json` file here (in the `example` directory).
```
$ ln package.json dist/package.json
```
