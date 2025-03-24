import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TaskFactory } from "../../../../_lib/testSupport/factories/taskFactory.js";
import { UserFactory } from "../../../../_lib/testSupport/factories/userFactory.js";
import {
  type RouteTest,
  setupRouteTest,
} from "../../../../_lib/testSupport/setupRouteTest.js";
import {
  type User,
  UserStatus,
} from "../../../../infrastructure/database/models/user.js";

describe("GET /tasks", () => {
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
      it("returns tasks page", async () => {
        // Tasks from the logged user that does not match the input.
        await TaskFactory.create({
          ownerId: currentUser.id,
          completedAt: new Date(),
          priority: 0,
        });
        await TaskFactory.create({
          ownerId: currentUser.id,
          completedAt: null,
          priority: 0,
        });

        // Not shared task from another user
        await TaskFactory.create({
          completedAt: null,
          priority: 3,
        });

        // Shared task from another user that does not match the input.
        await TaskFactory.create({
          completedAt: new Date(),
          priority: 0,
          collaborators: [currentUser],
        });

        const expectedTasks = [
          ...(await TaskFactory.createList(2, {
            ownerId: currentUser.id,
            completedAt: null,
            priority: 3,
          })),
          // Shared task from another user that matches the input.
          await TaskFactory.create({
            completedAt: null,
            priority: 3,
            collaborators: [currentUser],
          }),
        ];

        const input = {
          completed: false,
          priority: "HIGH",
          page: 1,
          pageSize: 2,
        };

        const response = await routeTest.server.inject({
          method: "GET",
          url: "/tasks",
          query: Object.entries(input)
            .map(([key, value]) => `${key}=${value}`)
            .join("&"),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const jsonResponse = response.json();

        expect(response.statusCode).toBe(200);
        expect(jsonResponse).toMatchObject({
          results: expect.arrayContaining([
            expect.toBeOneOf(
              expectedTasks.map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                priority: input.priority,
                dueDate: task.dueDate?.toISOString() || null,
                completedAt: null,
                createdAt: task.createdAt.toISOString(),
                updatedAt: task.updatedAt.toISOString(),
                owner: {
                  id: task.owner.id,
                  role: task.owner.role,
                  status: task.owner.status,
                  username: task.owner.username,
                  createdAt: task.owner.createdAt.toISOString(),
                  updatedAt: task.owner.updatedAt.toISOString(),
                },
                collaborators: task.collaborators.map((collaborator) => ({
                  id: collaborator.id,
                  role: collaborator.role,
                  status: collaborator.status,
                  username: collaborator.username,
                  createdAt: collaborator.createdAt.toISOString(),
                  updatedAt: collaborator.updatedAt.toISOString(),
                })),
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
          url: "/tasks",
          query: Object.entries(input)
            .map(([key, value]) => `${key}=${value}`)
            .join("&"),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchObject({ error: "Invalid input" });
      });
    });
  });

  describe("when not authenticated", () => {
    it("returns unauthorized", async () => {
      const response = await routeTest.server.inject({
        method: "GET",
        url: "/tasks",
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        error: "Unauthorized",
      });
    });
  });
});
