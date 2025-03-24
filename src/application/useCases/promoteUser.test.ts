import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserFactory } from "../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import {
  type User,
  UserRole,
  UserStatus,
} from "../../infrastructure/database/models/user.js";
import { promoteUser } from "./promoteUser.js";

describe("PromoteUser", () => {
  let integrationTest: IntegrationTest;

  beforeAll(async () => {
    integrationTest = await setupIntegrationTest();
  });

  beforeEach(async () => {
    await integrationTest.cleanDatabase();
  });

  afterAll(async () => {
    await integrationTest.tearDown();
  });

  describe("when currentUser is an admin", () => {
    let currentUser: User;

    beforeEach(async () => {
      currentUser = await UserFactory.create({
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      });
    });

    describe("when the user exists and can be promoted", () => {
      it("promotes the user", async () => {
        const user = await UserFactory.create({ role: UserRole.USER });

        const result = await promoteUser({
          id: user.id,
          currentUser,
        });

        expect(result).toMatchObject({
          success: true,
          data: {
            ...user,
            role: "ADMIN",
            updatedAt: expect.any(Date),
          },
        });
      });
    });

    describe("when the user is already an admin", () => {
      it("returns invalid failure", async () => {
        const user = await UserFactory.create({ role: UserRole.ADMIN });

        const result = await promoteUser({
          id: user.id,
          currentUser,
        });

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: 'User already has the "ADMIN" role',
          },
        });
      });
    });

    describe("when the user is the currentUser", () => {
      it("returns forbidden failure", async () => {
        const result = await promoteUser({
          id: currentUser.id,
          currentUser,
        });

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot promote your own account",
          },
        });
      });
    });

    describe("when the user does not exist", () => {
      it("returns not found failure", async () => {
        const result = await promoteUser({
          id: 100,
          currentUser,
        });

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "User not found",
          },
        });
      });
    });
  });

  describe("when currentUser is a user", () => {
    let currentUser: User;

    beforeEach(async () => {
      currentUser = await UserFactory.create({
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });
    });

    describe("when the user exists and can be promoted", () => {
      it("returns forbidden result", async () => {
        const user = await UserFactory.create({ role: UserRole.USER });

        const result = await promoteUser({
          id: user.id,
          currentUser,
        });

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only admins can promote users",
          },
        });
      });
    });
  });
});
