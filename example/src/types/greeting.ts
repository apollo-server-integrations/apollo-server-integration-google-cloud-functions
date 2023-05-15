import { builder } from "../builder";

builder.queryField("greeting", (t) =>
  t.field({
    type: "String",
    resolve: async (_query, _args, ctx) => {
      console.log(ctx);

      return "Hello from GraphQl";
    },
  }),
);
