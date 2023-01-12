# Boilerplate for Apollo Server projects using `@as-integrations/google-cloud-functions` for Google Cloud Function deployments

This example project comes pre-configured with sane defaults for tooling and that you can use to deploy Apollo Server on Google Cloud Functions.

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

Edit the `FUNCTION_TARGET` on the `.env` file to match the name of your function. This is used to name both your function entrypoint on the compiled output, and the deployment. The name you choose here will be used on the bundled output and on the `start` and `gcp-deploy` scripts to name your function, as required by Google Cloud Functions.

Start and test the development server:

```bash
pnpm run start
```

The start script will build the project into a bundle usable by Google Cloud Functions and start a local development server using the `@google-cloud/functions-framework` package provided for Node.js runtimes. The server will be available at `http://localhost:8080`, and will run with an Apollo Server Playground where you can test your queries.

## Deployment

> **Warning**
> Before making your first deployment, it's highly recommeded that you understand the difference between Cloud Functions 1st and 2nd generation. While Google recommends that you create new functions on 2nd gen whenever possible, they do not yet support deploying from source repositories, or have a published action for GitHub Actions, You can find more information [here](https://cloud.google.com/functions/docs/concepts/version-comparison).

### Local deployment

The project is configured to be deployed to Google Cloud Functions trough the Google Cloud CLI Tool. To deploy the project, run the following command:

```bash
pnpm run gcp:deploy
```

To use the provided deploy script, you need to have the Google Cloud CLI Tool installed and configured on your machine. You can find more information about the CLI Tool [here](https://cloud.google.com/sdk/gcloud).

The script will use the bundled output from the `/dist` directory, and name your function using the provided string on the `FUNCTION_TARGET` environment variable.

> **Note**
> The deploy script currently uses POSIX compliant commands, and **will not work on Windows** (I encourage you to file an issue and/or open a pull request if you can help me solve this). If you're using Windows, you can use the `gcloud` CLI tool directly to deploy your function, and change the correct flags accordingly.
>
> Run the `prepack` command to generate the `/dist` output. Then run the GCloud CLI Tool with the following command:
>
> ```powershell
> gcloud functions deploy <function-name> --runtime nodejs16 --trigger-http --allow-unauthenticated --entry-point=<function-name> --source=./dist
> ```
>
> Beware that the `--entry-point` flag should match the name provided in the `FUNCTION_TARGET` environment variable.


