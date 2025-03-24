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

describe("POST /tasks/:id/share", () => {
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
        it("shares the task", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            ownerId: currentUser.id,
          });
          const collaborator = await UserFactory.create();

          const input = { sharedWithId: collaborator.id };

          const response = await routeTest.server.inject({
            method: "POST",
            url: `/tasks/${task.id}/share`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(201);
          expect(response.json()).toMatchObject({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: "NONE",
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
            collaborators: [
              {
                id: collaborator.id,
                role: collaborator.role,
                status: collaborator.status,
                username: collaborator.username,
                createdAt: collaborator.createdAt.toISOString(),
                updatedAt: collaborator.updatedAt.toISOString(),
              },
            ],
          });
        });
      });

      describe("and is shared to the logged user", () => {
        it("shares task", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            collaborators: [currentUser],
          });
          const collaborator = await UserFactory.create();

          const input = { sharedWithId: collaborator.id };

          const response = await routeTest.server.inject({
            method: "POST",
            url: `/tasks/${task.id}/share`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(201);
          expect(response.json()).toMatchObject({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: "NONE",
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
                id: collaborator.id,
                role: collaborator.role,
                status: collaborator.status,
                username: collaborator.username,
                createdAt: collaborator.createdAt.toISOString(),
                updatedAt: collaborator.updatedAt.toISOString(),
              },
            ]),
          });
        });
      });

      describe("and is already shared to the user", () => {
        it("returns unprocessable entity", async () => {
          const collaborator = await UserFactory.create();
          const task = await TaskFactory.create({
            priority: 0,
            ownerId: currentUser.id,
            collaborators: [collaborator],
          });

          const input = { sharedWithId: collaborator.id };

          const response = await routeTest.server.inject({
            method: "POST",
            url: `/tasks/${task.id}/share`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(422);
          expect(response.json()).toMatchObject({
            error: "Task already shared with this user",
          });
        });
      });

      describe("and is trying to share with the owner", () => {
        it("returns unprocessable entity", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            ownerId: currentUser.id,
          });

          const input = { sharedWithId: currentUser.id };

          const response = await routeTest.server.inject({
            method: "POST",
            url: `/tasks/${task.id}/share`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(422);
          expect(response.json()).toMatchObject({
            error: "Task cannot be shared with owner",
          });
        });
      });

      describe("and is trying to share with a user that does not exist", () => {
        it("returns unprocessable entity", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            ownerId: currentUser.id,
          });

          const input = { sharedWithId: 100 };

          const response = await routeTest.server.inject({
            method: "POST",
            url: `/tasks/${task.id}/share`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(422);
          expect(response.json()).toMatchObject({
            error: "User to be shared with not found",
          });
        });
      });

      describe("and task is already completed", () => {
        it("returns unprocessable entity", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            completedAt: new Date(),
            ownerId: currentUser.id,
          });
          const collaborator = await UserFactory.create();

          const input = { sharedWithId: collaborator.id };

          const response = await routeTest.server.inject({
            method: "POST",
            url: `/tasks/${task.id}/share`,
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

      describe("and task is already shared with 5 users", () => {
        it("returns unprocessable entity", async () => {
          const task = await TaskFactory.create({
            priority: 0,
            ownerId: currentUser.id,
            collaborators: await UserFactory.createList(5),
          });
          const collaborator = await UserFactory.create();

          const input = { sharedWithId: collaborator.id };

          const response = await routeTest.server.inject({
            method: "POST",
            url: `/tasks/${task.id}/share`,
            body: input,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          expect(response.statusCode).toBe(422);
          expect(response.json()).toMatchObject({
            error: "Task cannot be shared with more than 5 users",
          });
        });
      });

      describe("and does not belong and it is not shared with the logged user", () => {
        it("returns forbidden", async () => {
          const task = await TaskFactory.create();

          const input = { sharedWithId: 1 };

          const response = await routeTest.server.inject({
            method: "POST",
            url: `/tasks/${task.id}/share`,
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
        const input = { sharedWithId: 1 };

        const response = await routeTest.server.inject({
          method: "POST",
          url: "/tasks/1/share",
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
      const input = { sharedWithId: 1 };

      const response = await routeTest.server.inject({
        method: "POST",
        url: "/tasks/1/share",
        body: input,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        error: "Unauthorized",
      });
    });
  });
});
