import { ApolloServer } from '@apollo/server';
import { requestProxy, responseProxy, startServer } from '@as-integrations/google-cloud-functions';
import { schema } from './schema';

import type { Request, Response } from '@google-cloud/functions-framework';

const apolloServer = new ApolloServer({
  schema,
});

const server = startServer(apolloServer, {
  context: async (req, res) => {
    return {
      req,
      res,
    }
  }
});

export async function handler(req: Request, res: Response) {
  const graphQLReponse = await requestProxy({ req, res, server });
  await responseProxy(res, graphQLReponse);
}
