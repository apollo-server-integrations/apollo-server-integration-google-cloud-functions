import { ApolloServer } from '@apollo/server';
import type { Request, Response } from '@google-cloud/functions-framework';
import { requestProxy, responseProxy, httpGraphQLResponse } from '@as-integrations/google-cloud-functions';

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
];

const typeDefs = `#graphql
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books: () => books,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.start();

export async function handler(req: Request, res: Response) {
  const httpGraphQLRequest = requestProxy(req);
  const graphQLResponse = await httpGraphQLResponse(server, httpGraphQLRequest);
  await responseProxy(res, graphQLResponse);
}
