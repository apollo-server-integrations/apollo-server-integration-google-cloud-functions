# Apollo Server Integration for Google Cloud Functions

## Introduction
A simple Apollo Server integration for use with Google Cloud Functions

## Requirements
- **[Node.js v14](https://nodejs.org/)** or later.
- **[GraphQL.js v16](https://graphql.org/graphql-js/)** or later.
- **[Apollo Server v4](https://www.apollographql.com/docs/apollo-server/)** or later.
- **[Google Cloud Functions Framework v3]()** or later.
- **[Google Cloud CLI Tool](https://cloud.google.com/sdk/gcloud)** (for deployments from a local machine).

## Installation
```bash
npm install @as-integrations/google-cloud-functions @google-cloud/functions-framework @apollo/server graphql
```

## Usage
In the root of your project, create an Apollo Server instance and pass it to `startServerAndCreateGoogleCloudFunctionsHandler`, imported from `@as-integrations/google-cloud-functions`:

Google Cloud Functions requires you to name the function entry point. In this example, we name it `apollo-graphql`. Take note the the name you give to the function is the name you will use when deploying to Google Cloud Functions:

```ts
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateGoogleCloudFunctionsHandler } from "@as-integrations/google-cloud-functions";

const resolvers = {
  Query: {
    hello: () => 'world',
  },
};


const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

startServerAndCreateGoogleCloudFunctionsHandler(server, { functionTarget: "apollo-graphql" });
```

## Example project 
To develop, test and deploy your function, you will need to setup proper tooling to bundle your function and its dependencies.

We highly recommend taking a look at the [the project example](/example), which gives you an good starting point and sane defaults on how you can correctly bundle your function using `esbuild` and setup scripts for common development tasks.

>**Note**
> ### Why do I need to bundle my function?
> You're probably writing your function in TypeScript, and you're probably using modern syntax from ES Modules like `import` and `export`. Google Cloud Functions Framework for Node.js does not support TypeScript, and it does not understand ES Modules.
>
> Futhermore, Google Cloud Functions works by having an entry point signature supplied to the function handler. This means that the final bundle of code that gets uploaded to Google Cloud Functions needs to visibly have the function entry point, otherwise it will fail with the error: `Function <function-name> is not defined in the provided module...`.


