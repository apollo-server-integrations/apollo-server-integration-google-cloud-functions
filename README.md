# Apollo Server Integration for Google Cloud Functions

## Introduction
A simple Apollo Server integration for use with Google Cloud Functions

## Requirements
- **[Node.js v14](https://nodejs.org/)** or later.
- **[GraphQL.js v16](https://graphql.org/graphql-js/)** or later.
- **[Apollo Server v4](https://www.apollographql.com/docs/apollo-server/)** or later.
- **[Google Cloud Functions Framework v3]()** or later.

## Installation
```bash
npm install @as-integrations/google-cloud-functions @google-cloud/functions/framework @apollo/server graphql
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
To develop, test and deploy your function, we recommend that you setup proper tooling to bundle your function and its dependencies. [The project example]() gives you an starting point on how you can correctly bundle your function using esbuild and setup scripts for common tasks.

>**Note**
> ### Why do I need to bundle my function?
> You're probably writing your function in TypeScript, and you're probably using modern syntax from ES Modules like `import` and `export`. Google Cloud Functions Framework for Node.js does not support TypeScript, and it does not understand ES Modules, which is why they need to be properly bundled and transformed to CommonJS before they can be deployed on Google Cloud Functions. The example above gives you good defaults that you can adopt for your project.


