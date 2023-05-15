import { ApolloServer, HeaderMap, ContextFunction, BaseContext } from '@apollo/server';
import { WithRequired } from '@apollo/utils.withrequired';
import { parse } from 'url';

import { Request, Response, HttpFunction } from '@google-cloud/functions-framework';

interface Options<Context extends BaseContext> {
  context?: ContextFunction<Parameters<HttpFunction>, Context>;
}

const defaultContext: ContextFunction<[], any> = async () => ({});

export function startServer<Context extends BaseContext>(
  server: ApolloServer<Context> | ApolloServer<Context>,
  options: Options<BaseContext> | Options<Context> | WithRequired<Options<Context>, 'context'>,
) {
  server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

  const contextFunction = options?.context || defaultContext;

  return {
    server,
    contextFunction,
  };
}

type StartServerFunction = typeof startServer;
export type InternalServerStarter = ReturnType<StartServerFunction>;

/** Takes an Express compliant `Request` object and an Apollo Server instance
 * and returns an processed GraphQL response.
 */
export async function requestProxy({
  req,
  res,
  server,
}: {
  req: Request;
  res: Response;
  server: InternalServerStarter;
}) {
  const headers = new HeaderMap();
  const requestMethod = req.method || 'POST';
  const search = req.url ? parse(req.url).search || '' : '';

  const { server: apolloServer, contextFunction } = server;

  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  }

  const httpGraphQLResponse = await apolloServer.executeHTTPGraphQLRequest({
    context: async () => contextFunction(req, res),
    httpGraphQLRequest: {
      body: req.body,
      headers,
      method: requestMethod,
      search,
    },
  });

  return httpGraphQLResponse;
}

type RequestProxyFunction = typeof requestProxy;
export type RequestProxy = Awaited<ReturnType<RequestProxyFunction>>;

/** Takes an Express compliant `Response` object and the result of a `requestProxy()` call
 * And processes the response for the function handler;
 */
export async function responseProxy(res: Response, httpGraphQLResponse: RequestProxy) {
  res.statusCode = httpGraphQLResponse.status || 200;

  if (httpGraphQLResponse.body.kind === 'complete') {
    res.send(httpGraphQLResponse.body.string);
  } else {
    for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
      res.write(chunk);
    }
    res.end();
  }
}

type ResponseProxyFunction = typeof responseProxy;
export type ResponseProxy = ResponseProxyFunction;
