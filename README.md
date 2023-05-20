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
npm install @as-integrations/google-cloud-functions @google-cloud/functions/framework @apollo/server graphql
```

## Usage
In the root of your project, create an Apollo Server instance and pass it to `startServer`, imported from `@as-integrations/google-cloud-functions`. This will start a single instance of the Apollo Server once per container.

Afterwards, define and export a named `async` function that will be your Cloud Function handler, and use `requestProxy` and `responseProxy` to compose your function.

```typescript
import { ApolloServer } from '@apollo/server';
import { requestProxy, responseProxy, startServer } from '@as-integrations/google-cloud-functions';
import { gql } from 'graphql-tag';

import type { Request, Response } from '@google-cloud/functions-framework';

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

const apolloServer = new ApolloServer({
  schema,
});

const server = startServer(apolloServer, {
  context: async (req, res) => {
    return { req, res }
  }
});

export async function handler(req: Request, res: Response) {
  const graphQLReponse = await requestProxy({ req, res, server });
  await responseProxy(res, graphQLReponse);
}
```

## Example project 
To develop, test and deploy your function, you will need to setup proper tooling to compile your function and its dependencies.

We highly recommend taking a look at the [project example](/example), which gives you a good starting point and sane defaults on how you can correctly bundle your function and setup scripts for common development tasks.

>**Note**
> ### Why do I need to bundle my function?
> You're probably writing your function in TypeScript, and you're probably using modern syntax from ES Modules like `import` and `export`. Google Cloud Functions Framework for Node.js does not support TypeScript, and it does not understand ES Modules.
