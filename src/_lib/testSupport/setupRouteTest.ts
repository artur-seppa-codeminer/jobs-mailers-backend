import { clean } from "knex-cleaner";
import { makeDatabase } from "../../infrastructure/database/database.js";
import { makeServer } from "../../interface/http/server.js";

export const setupRouteTest = async () => {
  const server = await makeServer();
  const database = makeDatabase();

  await database.connect({ log: false });

  return {
    server,
    cleanDatabase: () => clean(database.connection),
    tearDown: () => database.disconnect({ log: false }),
    authenticate: async (input: { username: string; password: string }) => {
      const response = await server.inject({
        method: "POST",
        url: "/login",
        body: input,
      });

      return String(response.json().token);
    },
  };
};

export type RouteTest = Awaited<ReturnType<typeof setupRouteTest>>;
