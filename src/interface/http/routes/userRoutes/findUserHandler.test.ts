import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserFactory } from "../../../../_lib/testSupport/factories/userFactory.js";
import {
  type RouteTest,
  setupRouteTest,
} from "../../../../_lib/testSupport/setupRouteTest.js";

describe("GET /users/:id", () => {
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

  describe("when the user exists", () => {
    it("returns the user", async () => {
      const user = await UserFactory.create();
      const input = { id: user.id };

      const response = await routeTest.server.inject({
        method: "GET",
        url: `/users/${input.id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    });
  });

  describe("when the user does not exist", () => {
    it("returns not found", async () => {
      const input = { id: 1 };

      const response = await routeTest.server.inject({
        method: "GET",
        url: `/users/${input.id}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ error: "User not found" });
    });
  });
});
