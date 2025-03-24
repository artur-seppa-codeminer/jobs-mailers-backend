import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserFactory } from "../../../../_lib/testSupport/factories/userFactory.js";
import {
  type RouteTest,
  setupRouteTest,
} from "../../../../_lib/testSupport/setupRouteTest.js";
import {
  type User,
  UserStatus,
} from "../../../../infrastructure/database/models/user.js";

describe("POST /tasks", () => {
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

  describe("when user is authenticated", () => {
    let currentUser: User;
    let token: string;

    beforeEach(async () => {
      const password = faker.internet.password();
      currentUser = await UserFactory.create({
        status: UserStatus.ACTIVE,
        password,
      });
      token = await routeTest.authenticate({
        username: currentUser.username,
        password: password,
      });
    });

    describe("when the input is valid", () => {
      it("creates a new task", async () => {
        const input = {
          title: faker.lorem.words(),
          description: faker.lorem.sentence(),
          priority: "HIGH",
          dueDate: faker.date.future(),
        };

        const response = await routeTest.server.inject({
          method: "POST",
          url: "/tasks",
          body: input,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toMatchObject({
          id: expect.any(Number),
          title: input.title,
          description: input.description,
          priority: "HIGH",
          dueDate: input.dueDate.toISOString(),
          completedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          owner: {
            id: currentUser.id,
            role: currentUser.role,
            status: currentUser.status,
            username: currentUser.username,
            createdAt: currentUser.createdAt.toISOString(),
            updatedAt: currentUser.updatedAt.toISOString(),
          },
          collaborators: [],
        });
      });
    });

    describe("when the input is invalid", () => {
      it("returns bad request", async () => {
        const input = {
          title: "",
          description: faker.lorem.sentence(),
          priority: "NONE",
          dueDate: faker.date.future(),
        };

        const response = await routeTest.server.inject({
          method: "POST",
          url: "/tasks",
          body: input,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchObject({
          error: "Invalid input",
        });
      });
    });
  });

  describe("when not authenticated", () => {
    it("returns unauthorized", async () => {
      const input = {
        title: faker.lorem.words(),
        description: faker.lorem.sentence(),
        priority: "HIGH",
        dueDate: faker.date.future(),
      };

      const response = await routeTest.server.inject({
        method: "POST",
        url: "/tasks",
        body: input,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        error: "Unauthorized",
      });
    });
  });
});
