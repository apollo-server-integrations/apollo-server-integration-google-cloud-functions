import { ApolloServer, BaseContext, ContextFunction, HeaderMap } from '@apollo/server';
import { parse } from 'url';
import { http } from '@google-cloud/functions-framework';

import type { Request, Response, HttpFunction } from '@google-cloud/functions-framework';
import type { WithRequired } from '@apollo/utils.withrequired';

interface Options<Context extends BaseContext> {
  context?: ContextFunction<Parameters<HttpFunction>, Context>;
  functionTarget: string;
}

type GoogleCloudApiHandler = (req: Request, res: Response) => Promise<unknown> | unknown;

const defaultContext: ContextFunction<[], any> = async () => ({});

export function startServerAndCreateGoogleCloudFunctionsHandler(
  server: ApolloServer<BaseContext>,
  options: Options<BaseContext>,
): void;
export function startServerAndCreateGoogleCloudFunctionsHandler<Context extends BaseContext>(
  server: ApolloServer<Context>,
  options: WithRequired<Options<Context>, 'context'>,
): void;
export function startServerAndCreateGoogleCloudFunctionsHandler<Context extends BaseContext>(
  server: ApolloServer<Context>,
  options: Options<Context>,
) {
  server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

  const contextFunction = options?.context || defaultContext;

  const handler: GoogleCloudApiHandler = async (req, res) => {
    const headers = new HeaderMap();

    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      }
    }

    const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
      context: () => contextFunction(req, res),
      httpGraphQLRequest: {
        body: req.body,
        headers,
        method: req.method || 'POST',
        search: req.url ? parse(req.url).search || '' : '',
      },
    });

    res.statusCode = httpGraphQLResponse.status || 200;

    if (httpGraphQLResponse.body.kind === 'complete') {
      res.send(httpGraphQLResponse.body.string);
    } else {
      for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
        res.write(chunk);
      }
      res.end();
    }
  };

  return http(options.functionTarget, handler);
}
