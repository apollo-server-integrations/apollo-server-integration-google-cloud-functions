import { ApolloServer, type ApolloServerOptions, type BaseContext } from '@apollo/server';
import {
  defineIntegrationTestSuite,
  type CreateServerForIntegrationTestsOptions,
} from '@apollo/server-integration-testsuite';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { format } from 'url';
import { startServerAndCreateGoogleCloudFunctionsHandler } from '..';

const { getTestServer } = require('@google-cloud/functions-framework/testing');

describe('cloud functions handler', () => {
  defineIntegrationTestSuite(
    async function (
      serverOptions: ApolloServerOptions<BaseContext>,
      testOptions?: CreateServerForIntegrationTestsOptions,
    ) {
      const apolloServer = new ApolloServer({
        ...serverOptions,
      });

      startServerAndCreateGoogleCloudFunctionsHandler(apolloServer, {
        functionTarget: 'apolloServer',
        context: testOptions?.context,
      });

      const testServer = getTestServer('apolloServer');
      await new Promise<void>((resolve) => {
        testServer.listen({ port: 0 }, resolve);
      });

      return {
        server: apolloServer,
        url: urlForHttpServer(testServer),
        async extraCleanup() {
          await new Promise<void>((resolve) => {
            testServer.close(() => resolve());
          });
        },
      };
    },
    {
      serverIsStartedInBackground: true,
      noIncrementalDelivery: true,
    },
  );
});

// Stolen from apollo server integration tests
export function urlForHttpServer(httpServer: Server): string {
  const { address, port } = httpServer.address() as AddressInfo;

  // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
  // corresponding loopback ip. Note that the url field we're setting is
  // primarily for consumption by our test suite. If this heuristic is wrong for
  // your use case, explicitly specify a frontend host (in the `host` option
  // when listening).
  const hostname = address === '' || address === '::' ? 'localhost' : address;

  return format({
    protocol: 'http',
    hostname,
    port,
    pathname: '/',
  });
}
