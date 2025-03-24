import { describe, expect, it } from "vitest";
import { UserFactory } from "../../../_lib/testSupport/factories/userFactory.js";
import { User } from "../../../infrastructure/database/models/user.js";
import { UserSerializer } from "./userSerializer.js";

describe("UserSerializer", () => {
  describe("serialize", () => {
    it("returns the serialized user", () => {
      const user = User.fromJson(UserFactory.build());

      const result = UserSerializer.serialize(user);

      expect(result).toMatchObject({
        id: user.id,
        role: user.role,
        status: user.status,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });
  });

  describe("serializeList", () => {
    it("returns the serialized list of users", () => {
      const users = UserFactory.buildList(3).map((userProps) =>
        User.fromJson(userProps),
      );

      const result = UserSerializer.serializeList(users);

      expect(result).toStrictEqual(
        users.map((user) => ({
          id: user.id,
          role: user.role,
          status: user.status,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      );
    });
  });
});
