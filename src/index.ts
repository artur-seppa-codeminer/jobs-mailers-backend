import { makeDatabase } from "./infrastructure/database/database.js";
import { makeServer } from "./interface/http/server.js";

const database = makeDatabase();

database
  .connect()
  .then(async () => {
    const server = await makeServer();

    await server.listen({ port: 3000 });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
