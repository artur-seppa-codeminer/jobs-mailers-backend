import { clean } from "knex-cleaner";
import { makeDatabase } from "../../infrastructure/database/database.js";

export const setupIntegrationTest = async () => {
  const database = makeDatabase();

  await database.connect({ log: false });

  return {
    cleanDatabase: () => clean(database.connection),
    tearDown: () => database.disconnect({ log: false }),
  };
};

export type IntegrationTest = Awaited<ReturnType<typeof setupIntegrationTest>>;
