import { ApolloServer, HeaderMap } from '@apollo/server';
import { parse } from 'url';

import { Request, Response } from '@google-cloud/functions-framework';
// import type { WithRequired } from '@apollo/utils.withrequired';

export function requestProxy(req: Request) {
  const headers = new HeaderMap();
  const requestMethod = req.method || 'POST';
  const search = req.url ? parse(req.url).search || '' : '';

  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  }

  return {
    body: req.body,
    headers,
    method: requestMethod,
    search,
  };
}

type RequestProxyFunction = typeof requestProxy;
export type RequestProxy = ReturnType<RequestProxyFunction>;

export async function httpGraphQLResponse(server: ApolloServer, request: RequestProxy) {
  const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
    context: async () => ({}),
    httpGraphQLRequest: request,
  });

  return httpGraphQLResponse;
}

type HttpGraphQLResponseFunction = typeof httpGraphQLResponse;
export type HttpGraphQLResponse = Awaited<ReturnType<HttpGraphQLResponseFunction>>;

export async function responseProxy(res: Response, httpGraphQLResponse: HttpGraphQLResponse) {
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

// interface Options<Context extends BaseContext> {
//   context?: ContextFunction<Parameters<HttpFunction>, Context>;
// }

// const defaultContext: ContextFunction<[], any> = async () => ({});

// export function startServerAndCreateGoogleCloudFunctionsHandler(
//   server: ApolloServer<BaseContext>,
//   options: Options<BaseContext>,
// ): void;
// export function startServerAndCreateGoogleCloudFunctionsHandler<Context extends BaseContext>(
//   server: ApolloServer<Context>,
//   options: WithRequired<Options<Context>, 'context'>,
// ): void;
// export function startServerAndCreateGoogleCloudFunctionsHandler<Context extends BaseContext>(
//   server: ApolloServer<Context>,
//   options: Options<Context>,
// ) {
  // server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

  // const contextFunction = options?.context || defaultContext;

  // return async function (req: Request, res: Response) {
  //   const httpGraphQLRequest = requestProxy(req);

  //   const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
  //     context: async () => contextFunction(req, res),
  //     httpGraphQLRequest,
  //   });

  //   res.statusCode = httpGraphQLResponse.status || 200;

  //   if (httpGraphQLResponse.body.kind === 'complete') {
  //     res.send(httpGraphQLResponse.body.string);
  //   } else {
  //     for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
  //       res.write(chunk);
  //     }
  //     res.end();
  //   }

  //   return httpGraphQLResponse;
  // };
// }
