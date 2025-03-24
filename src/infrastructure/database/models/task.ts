import { Result } from "../../../_lib/result.js";
import BaseModel from "./baseModel.js";
import { User } from "./user.js";

export enum TaskPriority {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

enum TaskStatus {
  DONE = 'DONE',
  LATE = 'LATE'
}

export class Task extends BaseModel {
  static tableName = "tasks";

  id!: number;
  ownerId!: number;
  title!: string;
  description!: string | null;
  priority!: number;
  dueDate!: Date | null;
  completedAt!: Date | null;
  owner!: User;
  collaborators!: User[];
  status!: string;

  static get jsonSchema() {
    return {
      type: "object",
      required: ["ownerId", "title"],
      properties: {
        id: { type: "integer" },
        ownerId: { type: "integer" },
        title: { type: "string" },
        description: { type: ["string", "null"] },
        priority: { type: "integer", enum: Object.values(TaskPriority) },
        status: { type: ["string", "null"], enum: Object.values(TaskStatus) },
        dueDate: { type: ["object", "null"] },
        completedAt: { type: ["object", "null"] }
      },
    };
  }

  static get relationMappings() {
    return {
      owner: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tasks.ownerId",
          to: "users.id",
        },
      },
      collaborators: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: User,
        join: {
          from: "users.id",
          through: {
            from: "task_shares.taskId",
            to: "task_shares.sharedWithId",
          },
          to: "tasks.id",
        },
      },
    };
  }

  canBeViewedBy(user: User) {
    const isOwner = this.ownerId === user.id;

    if (!isOwner) {
      const isCollaborator = Boolean(
        this.collaborators.find((c) => c.id === user.id),
      );

      if (!isCollaborator) {
        return false;
      }
    }

    return true;
  }

  canBeCompletedBy(user: User) {
    return this.canBeViewedBy(user);
  }

  canBePrioritizedBy(user: User) {
    return this.canBeViewedBy(user);
  }

  canBeSharedBy(user: User) {
    return this.canBeViewedBy(user);
  }

  complete() {
    if (this.completedAt) {
      return Result.fail<this>({
        code: "INVALID",
        message: "Task is already completed",
      });
    }

    const now = new Date();
    if (this.dueDate && this.dueDate > now) {
      return Result.fail<this>({
        code: "INVALID",
        message: "Task cannot be completed before the due date",
      });
    }

    this.completedAt = now;

    return Result.succeed(this);
  }

  prioritize(priority: TaskPriority) {
    if (this.completedAt) {
      return Result.fail<this>({
        code: "INVALID",
        message: "Task is already completed",
      });
    }

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (
      this.dueDate &&
      this.dueDate >= now &&
      this.dueDate <= tomorrow &&
      this.priority > priority
    ) {
      return Result.fail<this>({
        code: "INVALID",
        message: "Cannot lower priority if due within 24 hours",
      });
    }

    this.priority = priority;

    return Result.succeed(this);
  }

  shareWith(user: User) {
    if (this.completedAt) {
      return Result.fail<this>({
        code: "INVALID",

        message: "Task is already completed",
      });
    }

    if (this.ownerId === user.id) {
      return Result.fail<this>({
        code: "INVALID",

        message: "Task cannot be shared with owner",
      });
    }

    if (this.collaborators.find((c) => c.id === user.id)) {
      return Result.fail<this>({
        code: "INVALID",

        message: "Task already shared with this user",
      });
    }

    if (this.collaborators.length >= 5) {
      return Result.fail<this>({
        code: "INVALID",

        message: "Task cannot be shared with more than 5 users",
      });
    }

    this.collaborators.push(user);

    return Result.succeed(this);
  }
}
