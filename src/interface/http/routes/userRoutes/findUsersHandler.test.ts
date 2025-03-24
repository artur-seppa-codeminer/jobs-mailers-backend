import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserFactory } from "../../../../_lib/testSupport/factories/userFactory.js";
import {
  type RouteTest,
  setupRouteTest,
} from "../../../../_lib/testSupport/setupRouteTest.js";
import {
  UserRole,
  UserStatus,
} from "../../../../infrastructure/database/models/user.js";

describe("GET /users", () => {
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
    it("returns users page", async () => {
      await UserFactory.create({
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      });
      await UserFactory.create({
        role: UserRole.ADMIN,
        status: UserStatus.INACTIVE,
      });
      await UserFactory.create({
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });
      const expectedUsers = await UserFactory.createList(3, {
        role: UserRole.USER,
        status: UserStatus.INACTIVE,
      });

      const input = {
        role: UserRole.USER,
        status: UserStatus.INACTIVE,
        page: 1,
        pageSize: 2,
      };

      const response = await routeTest.server.inject({
        method: "GET",
        url: "/users",
        query: Object.entries(input)
          .map(([key, value]) => `${key}=${value}`)
          .join("&"),
      });

      const jsonResponse = response.json();

      expect(response.statusCode).toBe(200);
      expect(jsonResponse).toMatchObject({
        results: expect.arrayContaining([
          expect.toBeOneOf(
            expectedUsers.map((user) => ({
              id: user.id,
              username: user.username,
              role: user.role,
              status: user.status,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            })),
          ),
        ]),
        total: 3,
      });
      expect(jsonResponse.results).toHaveLength(input.pageSize);
    });
  });

  describe("when the input is invalid", () => {
    it("returns bad request", async () => {
      const input = { page: 0 };

      const response = await routeTest.server.inject({
        method: "GET",
        url: "/users",
        query: Object.entries(input)
          .map(([key, value]) => `${key}=${value}`)
          .join("&"),
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ error: "Invalid input" });
    });
  });
});
