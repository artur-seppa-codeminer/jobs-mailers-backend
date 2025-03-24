import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserFactory } from "../../../../_lib/testSupport/factories/userFactory.js";
import {
  type RouteTest,
  setupRouteTest,
} from "../../../../_lib/testSupport/setupRouteTest.js";

describe("POST /users", () => {
  let routeTest: RouteTest;

  beforeAll(async () => {
    routeTest = await setupRouteTest();
  });

  beforeEach(async () => {
    await routeTest.cleanDatabase();
  });

  afterAll(async () => {
    await routeTest.tearDown();
  });

  describe("when the input is valid", () => {
    it("creates a new user", async () => {
      const input = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };

      const response = await routeTest.server.inject({
        method: "POST",
        url: "/users",
        body: input,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        id: expect.any(Number),
        username: input.username,
        role: "USER",
        status: "INACTIVE",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe("when the username already exists", () => {
    it("returns unprocessable entity", async () => {
      const input = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };

      await UserFactory.create({ username: input.username });

      const response = await routeTest.server.inject({
        method: "POST",
        url: "/users",
        body: input,
      });

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({
        error: "Username already exists",
      });
    });
  });
});
