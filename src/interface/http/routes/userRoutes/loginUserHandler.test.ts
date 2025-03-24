import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserFactory } from "../../../../_lib/testSupport/factories/userFactory.js";
import {
  type RouteTest,
  setupRouteTest,
} from "../../../../_lib/testSupport/setupRouteTest.js";
import { UserStatus } from "../../../../infrastructure/database/models/user.js";

describe("POST /login", () => {
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

  describe("when the username and password are valid", () => {
    describe("when the user is active", () => {
      it("returns a token", async () => {
        const password = faker.internet.password();
        const user = await UserFactory.create({
          password,
          status: UserStatus.ACTIVE,
        });

        const input = {
          username: user.username,
          password,
        };

        const response = await routeTest.server.inject({
          method: "POST",
          url: "/login",
          body: input,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchObject({
          token: expect.any(String),
        });
      });
    });

    describe("when the user is inactive", () => {
      it("returns unauthorized", async () => {
        const password = faker.internet.password();
        const user = await UserFactory.create({
          password,
          status: UserStatus.INACTIVE,
        });

        const input = {
          username: user.username,
          password,
        };

        const response = await routeTest.server.inject({
          method: "POST",
          url: "/login",
          body: input,
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toMatchObject({
          error: "User is not active",
        });
      });
    });
  });

  describe("when user does not exist", () => {
    it("returns unauthorized", async () => {
      const input = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };

      const response = await routeTest.server.inject({
        method: "POST",
        url: "/login",
        body: input,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        error: "Invalid username or password",
      });
    });
  });

  describe("when the password is wrong", () => {
    it("returns unauthorized", async () => {
      const user = await UserFactory.create({ status: UserStatus.ACTIVE });

      const input = {
        username: user.username,
        password: "wrongpassword",
      };

      const response = await routeTest.server.inject({
        method: "POST",
        url: "/login",
        body: input,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        error: "Invalid username or password",
      });
    });
  });
});
