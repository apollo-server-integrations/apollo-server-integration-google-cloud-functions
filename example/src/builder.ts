import SchemaBuilder from '@pothos/core';
import type { Request, Response } from '@google-cloud/functions-framework';

export const builder = new SchemaBuilder<{
  Context: {
    request: Request;
    response: Response;
  };
}>({});

builder.queryType();
