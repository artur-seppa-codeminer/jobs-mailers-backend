import bcrypt from "bcrypt";
import type { ModelOptions, Pojo } from "objection";
import { Result } from "../../../_lib/result.js";
import BaseModel from "./baseModel.js";
import { Task } from "./task.js";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export class User extends BaseModel {
  static tableName = "users";

  id!: number;
  role!: UserRole;
  status!: UserStatus;
  username!: string;
  password!: string;
  encryptedPassword!: string;

  static get jsonSchema() {
    return {
      type: "object",
      required: ["username", "encryptedPassword"],
      properties: {
        id: { type: "integer" },
        role: { type: "string", enum: Object.values(UserRole) },
        status: { type: "string", enum: Object.values(UserStatus) },
        username: { type: "string" },
        encryptedPassword: { type: "string" },
      },
    };
  }

  $parseJson(json: Pojo, options?: ModelOptions | undefined): Pojo {
    const { password, ...actualJson } = json;

    const parsedJson = {
      ...super.$parseJson(actualJson, options),
      encryptedPassword: password
        ? bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        : null,
    };

    return parsedJson;
  }

  static get relationMappings() {
    return {
      tasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: Task,
        join: {
          from: "users.id",
          to: "tasks.ownerId",
        },
      },
    };
  }

  static async authenticate({ username, password }: AuthenticateInput) {
    return User.query()
      .findOne({ username })
      .then(async (user) => {
        if (!user) {
          return null;
        }

        const matchesPassword = await user?.matchesPassword(password);
        if (!matchesPassword) {
          return null;
        }

        return user;
      });
  }

  isTheSameAs(user: User) {
    return this.id === user.id;
  }

  promote() {
    if (this.role === UserRole.ADMIN) {
      return Result.fail<User>({
        code: "INVALID",
        message: 'User already has the "ADMIN" role',
      });
    }

    this.role = UserRole.ADMIN;

    return Result.succeed(this);
  }

  private matchesPassword(password: string) {
    return bcrypt.compare(password, this.encryptedPassword);
  }
}

type AuthenticateInput = {
  username: string;
  password: string;
};
