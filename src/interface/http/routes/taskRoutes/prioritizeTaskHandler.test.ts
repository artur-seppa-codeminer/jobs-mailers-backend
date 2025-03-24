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

describe("PATCH /tasks/:id/prioritize", () => {
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
        it("prioritizes the task", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            ownerId: currentUser.id,
            dueDate: new Date(),
          });

          const input = {
            priority: "MEDIUM",
          };

          const response = await routeTest.server.inject({
            method: "PATCH",
            url: `/tasks/${task.id}/prioritize`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(200);
          expect(response.json()).toMatchObject({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: input.priority,
            dueDate: task.dueDate?.toISOString() || null,
            completedAt: null,
            createdAt: task.createdAt.toISOString(),
            updatedAt: expect.any(String),
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
        it("prioritizes task", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            collaborators: [currentUser],
            dueDate: new Date(),
          });

          const input = {
            priority: "MEDIUM",
          };

          const response = await routeTest.server.inject({
            method: "PATCH",
            url: `/tasks/${task.id}/prioritize`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(200);
          expect(response.json()).toMatchObject({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: input.priority,
            dueDate: task.dueDate?.toISOString() || null,
            completedAt: null,
            createdAt: task.createdAt.toISOString(),
            updatedAt: expect.any(String),
            owner: {
              id: task.owner.id,
              role: task.owner.role,
              status: task.owner.status,
              username: task.owner.username,
              createdAt: task.owner.createdAt.toISOString(),
              updatedAt: task.owner.updatedAt.toISOString(),
            },
            collaborators: expect.arrayContaining([
              {
                id: currentUser.id,
                role: currentUser.role,
                status: currentUser.status,
                username: currentUser.username,
                createdAt: currentUser.createdAt.toISOString(),
                updatedAt: currentUser.updatedAt.toISOString(),
              },
            ]),
          });
        });
      });

      describe("and is already completed", () => {
        it("returns unprocessable entity", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            ownerId: currentUser.id,
            dueDate: new Date(),
            completedAt: new Date(),
          });

          const input = {
            priority: "MEDIUM",
          };

          const response = await routeTest.server.inject({
            method: "PATCH",
            url: `/tasks/${task.id}/prioritize`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(422);
          expect(response.json()).toMatchObject({
            error: "Task is already completed",
          });
        });
      });

      describe("and dueDate is soon and is lowering the priority", () => {
        it("returns unprocessable entity", async () => {
          const task = await TaskFactory.create({
            priority: 3,
            ownerId: currentUser.id,
            dueDate: faker.date.soon(),
          });

          const input = {
            priority: "MEDIUM",
          };

          const response = await routeTest.server.inject({
            method: "PATCH",
            url: `/tasks/${task.id}/prioritize`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(422);
          expect(response.json()).toMatchObject({
            error: "Cannot lower priority if due within 24 hours",
          });
        });
      });

      describe("and does not belong and it is not shared with the logged user", () => {
        it("returns forbidden", async () => {
          const task = await TaskFactory.create();

          const input = {
            priority: "MEDIUM",
          };

          const response = await routeTest.server.inject({
            method: "PATCH",
            url: `/tasks/${task.id}/prioritize`,
            body: input,
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
        const input = {
          priority: "MEDIUM",
        };

        const response = await routeTest.server.inject({
          method: "PATCH",
          url: "/tasks/1/prioritize",
          body: input,
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
      const input = {
        priority: "MEDIUM",
      };

      const response = await routeTest.server.inject({
        method: "PATCH",
        url: "/tasks/1/prioritize",
        body: input,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        error: "Unauthorized",
      });
    });
  });
});
