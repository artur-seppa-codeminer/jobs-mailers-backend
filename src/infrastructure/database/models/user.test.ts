import { describe, expect, it } from "vitest";
import { UserFactory } from "../../../_lib/testSupport/factories/userFactory.js";
import { User, UserRole } from "./user.js";

describe("User", () => {
  describe("isTheSameAs", () => {
    describe("when the user has the same id as the input user", () => {
      it("returns true", () => {
        const id = 1;
        const user = User.fromJson(UserFactory.build({ id }));
        const inputUser = User.fromJson(UserFactory.build({ id }));

        const result = user.isTheSameAs(inputUser);

        expect(result).toBe(true);
      });
    });

    describe("when the user has a different id than the input user", () => {
      it("returns false", () => {
        const user = User.fromJson(UserFactory.build());
        const inputUser = User.fromJson(UserFactory.build());

        const result = user.isTheSameAs(inputUser);

        expect(result).toBe(false);
      });
    });
  });

  describe("promote", () => {
    describe("when the user is already an admin", () => {
      it("returns an invalid failure", () => {
        const user = User.fromJson(UserFactory.build({ role: UserRole.ADMIN }));

        const result = user.promote();

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: 'User already has the "ADMIN" role',
          },
        });
      });
    });

    describe("when the user is not an admin", () => {
      it("promotes the user to an admin", () => {
        const user = User.fromJson(UserFactory.build({ role: UserRole.USER }));

        const result = user.promote();

        expect(result).toMatchObject({
          success: true,
          data: {
            ...user,
            role: UserRole.ADMIN,
          },
        });
      });
    });
  });
});
