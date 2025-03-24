import "dotenv/config";
import type { Knex } from "knex";
import { pino } from "pino";
import { Env, type EnvType } from "./_lib/env.js";

const env = Env.getString<EnvType>("NODE_ENV", "development");

const loggerConfig = {
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  },
};

const dbLogger = pino({ ...loggerConfig, level: "debug" });

const db = {
  development: {
    client: "postgresql",
    debug: true,
    log: {
      warn: (message) => dbLogger.warn(message, "Knex"),
      error: (message) => dbLogger.error(message, "Knex"),
      debug: (message) => dbLogger.debug(message, "Knex"),
      inspectionDepth: Number.POSITIVE_INFINITY,
      enableColors: true,
    },
    connection: {
      database: Env.getString("DATABASE_DB", "dundertasks_development"),
      port: Env.getNumber("DATABASE_PORT", 5432),
      user: Env.getString("DATABASE_USER", "postgres"),
      password: Env.getString("DATABASE_PASSWORD", "postgres"),
      host: Env.getString("DATABASE_HOST", "127.0.0.1"),
    },
  } satisfies Knex.Config,
  test: {
    client: "postgresql",
    debug: false,
    connection: {
      database: Env.getString("TEST_DATABASE_DB", "dundertasks_test"),
      port: Env.getNumber("TEST_DATABASE_PORT", 5432),
      user: Env.getString("TEST_DATABASE_USER", "postgres"),
      password: Env.getString("TEST_DATABASE_PASSWORD", "postgres"),
      host: Env.getString("TEST_DATABASE_HOST", "127.0.0.1"),
    },
  } satisfies Knex.Config,
} as const;

const http = {
  port: Env.getNumber("PORT", 3000),
  logger: {
    development: loggerConfig,
    production: true,
    test: false,
  },
};

const secrets = {
  jwtSecret: Env.getString("JWT_SECRET", "dundertasks-secret"),
};

export const config = { env, db, http, secrets };

export type Config = typeof config;
