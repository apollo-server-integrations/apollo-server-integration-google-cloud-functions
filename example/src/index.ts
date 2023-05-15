import { ApolloServer } from '@apollo/server';
import type { Request, Response } from '@google-cloud/functions-framework';
import { requestProxy, responseProxy, startServer } from '@as-integrations/google-cloud-functions';
import type {  } from '@as-integrations/google-cloud-functions';

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

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const server = startServer(apolloServer, {});

export async function handler(req: Request, res: Response) {
  const graphQLReponse = await requestProxy({ req, res, server });
  await responseProxy(res, graphQLReponse);
}
