import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserFactory } from "../../../../_lib/testSupport/factories/userFactory.js";
import {
  type RouteTest,
  setupRouteTest,
} from "../../../../_lib/testSupport/setupRouteTest.js";
import {
  type User,
  UserRole,
  UserStatus,
} from "../../../../infrastructure/database/models/user.js";

describe("PATCH /users/:id/demote", () => {
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

  describe("when authenticated as an admin", () => {
    let currentUser: User;
    let token: string;

    beforeEach(async () => {
      const password = faker.internet.password();
      currentUser = await UserFactory.create({
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        password,
      });
      token = await routeTest.authenticate({
        username: currentUser.username,
        password: password,
      });
    });

    describe("when the user exists and can be demoted", () => {
      it("demotes the user", async () => {
        const user = await UserFactory.create({ role: UserRole.ADMIN });

        const input = { id: user.id };

        const response = await routeTest.server.inject({
          method: "PATCH",
          url: `/users/${input.id}/demote`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchObject({
          id: user.id,
          username: user.username,
          role: "USER",
          status: user.status,
          createdAt: user.createdAt.toISOString(),
          updatedAt: expect.any(String),
        });
      });
    });

    describe("when the user is already a user", () => {
      it("returns unprocessable entity", async () => {
        const user = await UserFactory.create({ role: UserRole.USER });

        const input = { id: user.id };

        const response = await routeTest.server.inject({
          method: "PATCH",
          url: `/users/${input.id}/demote`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(422);
        expect(response.json()).toMatchObject({
          error: 'User already has the "USER" role',
        });
      });
    });

    describe("when the user is the authenticated user", () => {
      it("returns forbidden", async () => {
        const input = { id: currentUser.id };

        const response = await routeTest.server.inject({
          method: "PATCH",
          url: `/users/${input.id}/demote`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(403);
        expect(response.json()).toMatchObject({
          error: "Cannot demote your own account",
        });
      });
    });

    describe("when the user does not exist", () => {
      it("returns not found", async () => {
        const input = { id: 1 };

        const response = await routeTest.server.inject({
          method: "PATCH",
          url: `/users/${input.id}/demote`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toMatchObject({
          error: "User not found",
        });
      });
    });
  });

  describe("when authenticated as a user", () => {
    let currentUser: User;
    let token: string;

    beforeEach(async () => {
      const password = faker.internet.password();
      currentUser = await UserFactory.create({
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        password,
      });
      token = await routeTest.authenticate({
        username: currentUser.username,
        password: password,
      });
    });

    describe("when the user exists and can be demoted", () => {
      it("returns forbidden", async () => {
        const user = await UserFactory.create({ role: UserRole.ADMIN });

        const input = { id: user.id };

        const response = await routeTest.server.inject({
          method: "PATCH",
          url: `/users/${input.id}/demote`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(403);
        expect(response.json()).toMatchObject({
          error: "Only admins can demote users",
        });
      });
    });
  });

  describe("when not authenticated", () => {
    it("returns unauthorized", async () => {
      const input = { id: 1 };

      const response = await routeTest.server.inject({
        method: "PATCH",
        url: `/users/${input.id}/demote`,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        error: "Unauthorized",
      });
    });
  });
});
