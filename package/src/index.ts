import { type ApolloServer, type BaseContext, type ContextFunction, HeaderMap } from '@apollo/server';
import { parse } from 'url';
import { http } from '@google-cloud/functions-framework';

import type { Request, Response, HttpFunction } from '@google-cloud/functions-framework';
import type { WithRequired } from '@apollo/utils.withrequired';

interface Options<Context extends BaseContext> {
  context?: ContextFunction<Parameters<HttpFunction>, Context>;
  functionTarget: string;
}

// eslint-disable-next-line
export type GoogleCloudApiHandler = (req: Request, res: Response) => Promise<unknown> | unknown;

// eslint-disable-next-line
const defaultContext: ContextFunction<[], any> = async () => ({});

/**
 * Creates a Google Cloud Functions handler for an `ApolloServer` instance.
 *
 * `startServerAndCreateGoogleCloudFunctionsHandler` requires a `functionTarget` string to be passed on the options object. The value of this string will be used to name the function entry point on Google Cloud Functions.
 *
 * @example
 *
 * startServerAndCreateGoogleCloudFunctionsHandler(server, {
 *   functionTarget: 'my-function-name',
 * });
 */
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

    for (const [key, value] of httpGraphQLResponse.headers) {
      res.setHeader(key, value);
    }

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
