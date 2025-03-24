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

describe("GET /tasks/:id", () => {
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

    describe("when the task exists", () => {
      describe("and belongs to the logged user", () => {
        it("returns the task", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            ownerId: currentUser.id,
          });
          const input = { id: task.id };

          const response = await routeTest.server.inject({
            method: "GET",
            url: `/tasks/${input.id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(200);
          expect(response.json()).toMatchObject({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: "NONE",
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
            collaborators: [],
          });
        });
      });

      describe("and is shared to the logged user", () => {
        it("returns the task", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            collaborators: [currentUser],
          });
          const input = { id: task.id };

          const response = await routeTest.server.inject({
            method: "GET",
            url: `/tasks/${input.id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(200);
          expect(response.json()).toMatchObject({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: "NONE",
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
          });
        });
      });

      describe("and does not belong and it is not shared with the logged user", () => {
        it("returns forbidden", async () => {
          const task = await TaskFactory.create();
          const input = { id: task.id };

          const response = await routeTest.server.inject({
            method: "GET",
            url: `/tasks/${input.id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(403);
          expect(response.json()).toMatchObject({
            error: "User is not owner or collaborator of this task",
          });
        });
      });
    });

    describe("when the task does not exist", () => {
      it("returns not found", async () => {
        const input = { id: 1 };

        const response = await routeTest.server.inject({
          method: "GET",
          url: `/tasks/${input.id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toMatchObject({ error: "Task not found" });
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
