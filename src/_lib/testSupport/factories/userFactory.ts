import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { Factory } from "fishery";
import type { ModelObject } from "objection";
import {
  User,
  UserRole,
  UserStatus,
} from "../../../infrastructure/database/models/user.js";

const UserFactory = Factory.define<ModelObject<User>, never, User>(
  ({ onCreate, sequence, params }) => {
    onCreate(async (user) => {
      return await User.query().insertAndFetch(user);
    });

    const {
      username = faker.internet.username(),
      password = faker.internet.password(),
      role = UserRole.USER,
      status = UserStatus.INACTIVE,
    } = params;

    return {
      id: sequence,
      username,
      password,
      encryptedPassword: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      role,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
);

export { UserFactory };
