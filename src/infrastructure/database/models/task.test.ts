import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { TaskFactory } from "../../../_lib/testSupport/factories/taskFactory.js";
import { UserFactory } from "../../../_lib/testSupport/factories/userFactory.js";
import { Task } from "./task.js";
import { User } from "./user.js";

describe("Task", () => {
  describe("canBeViewedBy", () => {
    describe("when input user is the task owner", () => {
      it("returns true", () => {
        const owner = UserFactory.build() as User;
        const task = Task.fromJson(TaskFactory.build({ ownerId: owner.id }));

        const result = task.canBeViewedBy(owner);

        expect(result).toBe(true);
      });
    });

    describe("when input user is a collaborator", () => {
      it("returns true", () => {
        const collaborator = UserFactory.build() as User;
        const task = Task.fromJson(
          TaskFactory.build({ collaborators: [collaborator] }),
        );

        const result = task.canBeViewedBy(collaborator);

        expect(result).toBe(true);
      });
    });

    describe("when input user is not the task owner or a collaborator", () => {
      it("returns false", () => {
        const user = UserFactory.build() as User;
        const task = Task.fromJson(TaskFactory.build());

        const result = task.canBeViewedBy(user);

        expect(result).toBe(false);
      });
    });
  });

  describe("canBeCompletedBy", () => {
    describe("when input user is the task owner", () => {
      it("returns true", () => {
        const owner = UserFactory.build() as User;
        const task = Task.fromJson(TaskFactory.build({ ownerId: owner.id }));

        const result = task.canBeCompletedBy(owner);

        expect(result).toBe(true);
      });
    });

    describe("when input user is a collaborator", () => {
      it("returns true", () => {
        const collaborator = UserFactory.build() as User;
        const task = Task.fromJson(
          TaskFactory.build({ collaborators: [collaborator] }),
        );

        const result = task.canBeCompletedBy(collaborator);

        expect(result).toBe(true);
      });
    });

    describe("when input user is not the task owner or a collaborator", () => {
      it("returns false", () => {
        const user = UserFactory.build() as User;
        const task = Task.fromJson(TaskFactory.build());

        const result = task.canBeCompletedBy(user);

        expect(result).toBe(false);
      });
    });
  });

  describe("canBePrioritizedBy", () => {
    describe("when input user is the task owner", () => {
      it("returns true", () => {
        const owner = UserFactory.build() as User;
        const task = Task.fromJson(TaskFactory.build({ ownerId: owner.id }));

        const result = task.canBePrioritizedBy(owner);

        expect(result).toBe(true);
      });
    });

    describe("when input user is a collaborator", () => {
      it("returns true", () => {
        const collaborator = UserFactory.build() as User;
        const task = Task.fromJson(
          TaskFactory.build({ collaborators: [collaborator] }),
        );

        const result = task.canBePrioritizedBy(collaborator);

        expect(result).toBe(true);
      });
    });

    describe("when input user is not the task owner or a collaborator", () => {
      it("returns false", () => {
        const user = UserFactory.build() as User;
        const task = Task.fromJson(TaskFactory.build());

        const result = task.canBePrioritizedBy(user);

        expect(result).toBe(false);
      });
    });
  });

  describe("canBeSharedBy", () => {
    describe("when input user is the task owner", () => {
      it("returns true", () => {
        const owner = UserFactory.build() as User;

        const task = Task.fromJson(TaskFactory.build({ ownerId: owner.id }));

        const result = task.canBeSharedBy(owner);

        expect(result).toBe(true);
      });
    });

    describe("when input user is a collaborator", () => {
      it("returns true", () => {
        const collaborator = UserFactory.build() as User;

        const task = Task.fromJson(
          TaskFactory.build({ collaborators: [collaborator] }),
        );

        const result = task.canBeSharedBy(collaborator);

        expect(result).toBe(true);
      });
    });

    describe("when input user is not the task owner or a collaborator", () => {
      it("returns false", () => {
        const user = UserFactory.build() as User;

        const task = Task.fromJson(TaskFactory.build());

        const result = task.canBeSharedBy(user);

        expect(result).toBe(false);
      });
    });
  });

  describe("complete", () => {
    describe("when the task is not already completed", () => {
      it("completes the task", () => {
        const task = Task.fromJson(
          TaskFactory.build({ dueDate: new Date(), completedAt: null }),
        );

        const result = task.complete();

        expect(result).toMatchObject({
          success: true,
          data: expect.objectContaining({
            ...task,
            completedAt: expect.any(Date),
          }),
        });
      });
    });

    describe("when the task is already completed", () => {
      it("returns invalid failure", () => {
        const task = Task.fromJson(
          TaskFactory.build({ dueDate: new Date(), completedAt: new Date() }),
        );

        const result = task.complete();

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task is already completed",
          },
        });
        expect(task.completedAt).not.toBeNull();
      });
    });

    describe("and dueDate is in the future", () => {
      it("returns invalid failure", () => {
        const task = Task.fromJson(
          TaskFactory.build({
            dueDate: faker.date.future(),
            completedAt: null,
          }),
        );
        const result = task.complete();

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task cannot be completed before the due date",
          },
        });
        expect(task.completedAt).toBeNull();
      });
    });
  });

  describe("prioritize", () => {
    describe("when the task can be prioritized", () => {
      it("prioritizes the task", () => {
        const task = Task.fromJson(
          TaskFactory.build({ priority: 1, completedAt: null }),
        );

        const result = task.prioritize(2);

        expect(result).toMatchObject({
          success: true,
          data: expect.objectContaining({
            ...task,
            priority: 2,
          }),
        });
      });
    });

    describe("when the task is already completed", () => {
      it("returns invalid failure", () => {
        const task = Task.fromJson(
          TaskFactory.build({ priority: 1, completedAt: new Date() }),
        );

        const result = task.prioritize(2);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task is already completed",
          },
        });
        expect(task.priority).toBe(1);
      });
    });

    describe("and dueDate is soon and is trying to lower the priority", () => {
      it("returns invalid failure", () => {
        const task = Task.fromJson(
          TaskFactory.build({
            dueDate: faker.date.soon(),
            priority: 3,
            completedAt: null,
          }),
        );
        const result = task.prioritize(2);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Cannot lower priority if due within 24 hours",
          },
        });
        expect(task.priority).toBe(3);
      });
    });
  });

  describe("shareWith", () => {
    describe("when the task can be shared with the user", () => {
      it("adds the user as a collaborator", () => {
        const user = User.fromJson(UserFactory.build());

        const task = Task.fromJson(TaskFactory.build({ completedAt: null }));

        const result = task.shareWith(user);

        expect(result).toMatchObject({
          success: true,

          data: expect.objectContaining({
            ...task,

            collaborators: expect.arrayContaining([user]),
          }),
        });
      });
    });

    describe("when the task is not already completed", () => {
      it("returns invalid failure", () => {
        const user = User.fromJson(UserFactory.build());

        const task = Task.fromJson(
          TaskFactory.build({ completedAt: new Date() }),
        );

        const result = task.shareWith(user);

        expect(result).toMatchObject({
          success: false,

          error: {
            code: "INVALID",

            message: "Task is already completed",
          },
        });
      });
    });

    describe("when the user is the owner of the task", () => {
      it("returns invalid failure", () => {
        const user = User.fromJson(UserFactory.build());

        const task = Task.fromJson(
          TaskFactory.build({ completedAt: null, ownerId: user.id }),
        );

        const result = task.shareWith(user);

        expect(result).toMatchObject({
          success: false,

          error: {
            code: "INVALID",

            message: "Task cannot be shared with owner",
          },
        });
      });
    });

    describe("when the task is already shared with the user", () => {
      it("returns invalid failure", () => {
        const user = User.fromJson(UserFactory.build());

        const task = Task.fromJson(
          TaskFactory.build({ completedAt: null, collaborators: [user] }),
        );

        const result = task.shareWith(user);

        expect(result).toMatchObject({
          success: false,

          error: {
            code: "INVALID",

            message: "Task already shared with this user",
          },
        });
      });
    });

    describe("when the task is already shared with 5 collaborators", () => {
      it("returns invalid failure", () => {
        const collaborators = UserFactory.buildList(5).map((u) =>
          User.fromJson(u),
        );

        const user = User.fromJson(UserFactory.build());

        const task = Task.fromJson(
          TaskFactory.build({ completedAt: null, collaborators }),
        );

        const result = task.shareWith(user);

        expect(result).toMatchObject({
          success: false,

          error: {
            code: "INVALID",

            message: "Task cannot be shared with more than 5 users",
          },
        });
      });
    });
  });
});
